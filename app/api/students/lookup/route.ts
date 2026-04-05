import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { lookupStudentInscription } from '@/lib/students/store';
import { takeRateLimitToken } from '@/lib/security/rate-limit';
import { getClientIp } from '@/lib/security/request';
import { UserRole } from '@/types';

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== UserRole.ATTACHE) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const clientKey = session.user.id || getClientIp(request.headers) || 'unknown';
  const rateLimit = await takeRateLimitToken({
    bucket: 'student-lookup',
    key: clientKey,
    limit: 60,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many student lookups. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const url = new URL(request.url);
  const inscriptionNumber = url.searchParams.get('inscriptionNumber')?.trim().toUpperCase() || '';

  if (!inscriptionNumber) {
    return NextResponse.json({ error: 'Missing inscription number.' }, { status: 400 });
  }

  try {
    const exists = await lookupStudentInscription(inscriptionNumber);
    return NextResponse.json({ exists });
  } catch (error) {
    console.error('[STUDENTS] Failed to look up inscription number:', error);
    return NextResponse.json({ error: 'Failed to verify inscription number.' }, { status: 500 });
  }
}
