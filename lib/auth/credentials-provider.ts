import Credentials from 'next-auth/providers/credentials';
import { UserRole as PrismaUserRole } from '@prisma/client';
import { deriveAuthSubject, findAuthUser, onFailedSignIn, onSuccessfulSignIn, recordAuditLog } from '@/lib/auth/store';
import { verifyPassword } from '@/lib/auth/passwords';
import { getSigninLimits, normalizeLoginId, normalizeRole, RawCredentials, toPrismaRole } from '@/lib/auth/shared';
import { UserRole } from '@/types';

export const credentialsProvider = Credentials({
  name: 'credentials',
  credentials: {
    role: { label: 'Role', type: 'text' },
    loginId: { label: 'Login ID', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(rawCredentials, req) {
    const credentials = (rawCredentials ?? {}) as RawCredentials;
    const role = normalizeRole(credentials.role);
    const password = credentials.password?.trim() ?? '';
    const loginId = normalizeLoginId(role, credentials.loginId);
    const ip = (req.headers?.['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
    const userAgent = req.headers?.['user-agent'] as string | undefined;
    const { maxAttempts, lockMinutes } = getSigninLimits();

    if (!password || !loginId) {
      return null;
    }

    let authUser;
    try {
      authUser = await findAuthUser(toPrismaRole(role), loginId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[AUTH] Database connection error during authorize:', message);
      return null;
    }

    if (!authUser) {
      return null;
    }

    if (!authUser.isActive) {
      await recordAuditLog({
        event: 'login_failed',
        ip,
        userAgent,
        metadata: { reason: 'user_inactive', role, loginId },
      });
      return null;
    }

    if (authUser.lockedUntil && authUser.lockedUntil.getTime() > Date.now()) {
      await recordAuditLog({
        userId: authUser.id,
        event: 'login_blocked_locked',
        ip,
        userAgent,
        metadata: { lockedUntil: authUser.lockedUntil.toISOString() },
      });
      return null;
    }

    const isPasswordValid = await verifyPassword(password, authUser.passwordHash);
    if (!isPasswordValid) {
      await onFailedSignIn(authUser.id, maxAttempts, lockMinutes);
      await recordAuditLog({
        userId: authUser.id,
        event: 'login_failed',
        ip,
        userAgent,
        metadata: { reason: 'bad_password', role, loginId },
      });
      return null;
    }

    await onSuccessfulSignIn(authUser.id);
    await recordAuditLog({
      userId: authUser.id,
      event: 'login_success',
      ip,
      userAgent,
      metadata: { role, loginId },
    });

    const subject = await deriveAuthSubject(authUser);

    return {
      id: authUser.id,
      role: authUser.role === PrismaUserRole.ATTACHE ? UserRole.ATTACHE : UserRole.STUDENT,
      loginId: authUser.loginId,
      subject,
      authProvider: authUser.authProvider,
    };
  },
});
