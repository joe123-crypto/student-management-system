import { hashPassword, verifyPassword } from '@/lib/auth/passwords';
import { findAuthUserById, recordAuditLog, updatePasswordHash } from '@/lib/auth/store';

export class ChangePasswordValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChangePasswordValidationError';
  }
}

export async function changePassword(params: {
  userId: string;
  currentPassword: string;
  newPassword: string;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  const currentPassword = params.currentPassword.trim();
  const newPassword = params.newPassword.trim();

  if (!currentPassword || !newPassword) {
    throw new ChangePasswordValidationError('Current password and new password are required.');
  }

  if (newPassword.length < 6) {
    throw new ChangePasswordValidationError('New password must be at least 6 characters long.');
  }

  const authUser = await findAuthUserById(params.userId);
  if (!authUser) {
    throw new ChangePasswordValidationError('Authenticated user not found.');
  }

  const isCurrentPasswordValid = await verifyPassword(currentPassword, authUser.passwordHash);
  if (!isCurrentPasswordValid) {
    await recordAuditLog({
      userId: params.userId,
      event: 'password_change_failed',
      ip: params.ip,
      userAgent: params.userAgent,
      metadata: { reason: 'bad_current_password' },
    });

    throw new ChangePasswordValidationError('Current password is incorrect.');
  }

  const nextPasswordHash = await hashPassword(newPassword);
  await updatePasswordHash(params.userId, nextPasswordHash);
  await recordAuditLog({
    userId: params.userId,
    event: 'password_changed',
    ip: params.ip,
    userAgent: params.userAgent,
  });
}
