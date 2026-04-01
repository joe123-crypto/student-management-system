import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import {
  ChangePasswordValidationError,
  changePassword,
} from '@/lib/auth/change-password';
import { takeRateLimitToken } from '@/lib/security/rate-limit';
import { getClientIp } from '@/lib/security/request';

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientIp = getClientIp(request.headers) ?? 'unknown';
  const rateLimit = await takeRateLimitToken({
    bucket: 'change-password',
    key: `${session.user.id}:${clientIp}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many password change attempts. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  try {
    const body = (await request.json()) as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };

    const currentPassword =
      typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    await changePassword({
      userId: session.user.id,
      currentPassword,
      newPassword,
      ip: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ message: 'Password updated successfully.' });
  } catch (error) {
    if (error instanceof ChangePasswordValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('[AUTH] Failed to change password:', error);
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }
}
