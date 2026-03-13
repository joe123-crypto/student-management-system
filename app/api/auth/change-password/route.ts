import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import {
  ChangePasswordValidationError,
  changePassword,
} from '@/lib/auth/change-password';

function getClientIp(request: Request): string | undefined {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      ip: getClientIp(request),
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
