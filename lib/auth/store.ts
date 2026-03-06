import { AuthProvider, UserRole, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export type AuthUserRecord = {
  id: string;
  role: UserRole;
  loginId: string;
  subject: string;
  authProvider: AuthProvider;
  passwordHash: string;
  failedSignInCount: number;
  lockedUntil: Date | null;
  isActive: boolean;
};

export async function findAuthUser(role: UserRole, loginId: string): Promise<AuthUserRecord | null> {
  return prisma.authUser.findUnique({
    where: {
      role_loginId: {
        role,
        loginId,
      },
    },
  });
}

export async function recordAuditLog(params: {
  userId?: string;
  event: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      event: params.event,
      metadata: params.metadata ? (params.metadata as Prisma.InputJsonValue) : undefined,
      ip: params.ip,
      userAgent: params.userAgent,
    },
  });
}

export async function onFailedSignIn(userId: string, maxAttempts: number, lockMinutes: number): Promise<void> {
  const user = await prisma.authUser.findUnique({ where: { id: userId } });
  if (!user) return;

  const nextFailCount = user.failedSignInCount + 1;
  const lockThresholdReached = nextFailCount >= maxAttempts;
  const lockedUntil = lockThresholdReached ? new Date(Date.now() + lockMinutes * 60 * 1000) : null;

  await prisma.authUser.update({
    where: { id: userId },
    data: {
      failedSignInCount: nextFailCount,
      lockedUntil,
    },
  });
}

export async function onSuccessfulSignIn(userId: string): Promise<void> {
  await prisma.authUser.update({
    where: { id: userId },
    data: {
      failedSignInCount: 0,
      lockedUntil: null,
    },
  });
}

export async function updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
  await prisma.authUser.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
