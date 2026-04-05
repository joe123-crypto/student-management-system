import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import {
  GENERIC_PERMISSION_REQUEST_MESSAGE,
  listPermissionRequests,
  submitPermissionRequest,
} from '@/lib/permission-requests/store';
import { normalizePermissionRequestInput } from '@/lib/permission-requests/serializers';
import { takeRateLimitToken } from '@/lib/security/rate-limit';
import { getClientIp } from '@/lib/security/request';
import { UserRole } from '@/types';

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== UserRole.ATTACHE) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const requests = await listPermissionRequests();
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('[PERMISSION_REQUESTS] Failed to list permission requests:', error);
    return NextResponse.json({ error: 'Failed to load permission requests.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      inscriptionNumber?: unknown;
      fullName?: unknown;
      passportNumber?: unknown;
    };

    const inscriptionNumber =
      typeof body.inscriptionNumber === 'string' ? body.inscriptionNumber : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName : '';
    const passportNumber =
      typeof body.passportNumber === 'string' ? body.passportNumber : '';

    if (!inscriptionNumber.trim() || !fullName.trim() || !passportNumber.trim()) {
      return NextResponse.json({ error: 'Full name, passport number, and inscription number are required.' }, { status: 400 });
    }

    const normalized = normalizePermissionRequestInput({
      inscriptionNumber,
      fullName,
      passportNumber,
    });
    const clientIp = getClientIp(request.headers);
    const rateLimitKey =
      clientIp ??
      `identity:${normalized.inscriptionNumber}:${normalized.passportNumber}`;
    const rateLimit = await takeRateLimitToken({
      bucket: 'permission-request',
      key: rateLimitKey,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many permission requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    await submitPermissionRequest({
      inscriptionNumber: normalized.inscriptionNumber,
      fullName: normalized.fullName,
      passportNumber: normalized.passportNumber,
    });

    return NextResponse.json(
      { message: GENERIC_PERMISSION_REQUEST_MESSAGE },
      { status: 202 },
    );
  } catch (error) {
    console.error('[PERMISSION_REQUESTS] Failed to create permission request:', error);
    return NextResponse.json({ error: 'Failed to submit permission request.' }, { status: 500 });
  }
}
