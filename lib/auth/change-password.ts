import { hashPassword, verifyPassword } from '@/lib/auth/passwords';
import { findAuthUserById, recordAuditLog, updatePasswordHash } from '@/lib/auth/store';

const PASSWORD_REQUIREMENTS_MESSAGE =
  'New password must be at least 12 characters long and include uppercase, lowercase, a number, and a symbol.';

function isStrongPassword(password: string) {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

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

  if (!isStrongPassword(newPassword)) {
    throw new ChangePasswordValidationError(PASSWORD_REQUIREMENTS_MESSAGE);
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
