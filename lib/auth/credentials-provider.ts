import Credentials from 'next-auth/providers/credentials';
import { UserRole as PrismaUserRole } from '@prisma/client';
import { deriveAuthSubject, findAuthUser, onFailedSignIn, onSuccessfulSignIn, recordAuditLog } from '@/lib/auth/store';
import { verifyPassword } from '@/lib/auth/passwords';
import {
  AUTH_SERVICE_UNAVAILABLE_ERROR,
  getSigninLimits,
  normalizeLoginId,
  normalizeRole,
  RawCredentials,
  toPrismaRole,
} from '@/lib/auth/shared';
import { takeRateLimitToken } from '@/lib/security/rate-limit';
import { getClientIp } from '@/lib/security/request';
import { UserRole } from '@/types';

function throwAuthServiceUnavailable(context: string, error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[AUTH] ${context}:`, message);
  throw new Error(AUTH_SERVICE_UNAVAILABLE_ERROR);
}

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
    const ip = getClientIp(req.headers ?? {}) ?? undefined;
    const userAgent = req.headers?.['user-agent'] as string | undefined;
    const { maxAttempts, lockMinutes } = getSigninLimits();

    if (!password || !loginId) {
      return null;
    }

    let rateLimit;
    try {
      rateLimit = await takeRateLimitToken({
        bucket: 'signin',
        key: ip || loginId,
        limit: 10,
        windowMs: 15 * 60 * 1000,
      });
    } catch (error: unknown) {
      throwAuthServiceUnavailable('Rate limit check failed during authorize', error);
    }

    if (!rateLimit.allowed) {
      return null;
    }

    let authUser;
    try {
      authUser = await findAuthUser(toPrismaRole(role), loginId);
    } catch (error: unknown) {
      throwAuthServiceUnavailable('Database connection error during authorize', error);
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
      sessionVersion: authUser.sessionVersion,
    };
  },
});
