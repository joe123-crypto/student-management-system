import { UserRole as PrismaUserRole } from '@prisma/client';
import { UserRole } from '@/types';

export type AppAuthProvider = 'student_inscription' | 'attache_email';

export type RawCredentials = {
  role?: string;
  loginId?: string;
  password?: string;
};

export const AUTH_SERVICE_UNAVAILABLE_ERROR = 'AuthServiceUnavailable';

export function getSigninLimits() {
  const maxAttempts = Number(process.env.AUTH_MAX_FAILED_ATTEMPTS ?? '5');
  const lockMinutes = Number(process.env.AUTH_LOCK_MINUTES ?? '15');

  return {
    maxAttempts: Number.isFinite(maxAttempts) && maxAttempts > 0 ? maxAttempts : 5,
    lockMinutes: Number.isFinite(lockMinutes) && lockMinutes > 0 ? lockMinutes : 15,
  };
}

export function toPrismaRole(role: UserRole): PrismaUserRole {
  return role === UserRole.ATTACHE ? PrismaUserRole.ATTACHE : PrismaUserRole.STUDENT;
}

export function normalizeRole(role?: string): UserRole {
  return role === UserRole.ATTACHE ? UserRole.ATTACHE : UserRole.STUDENT;
}

export function normalizeLoginId(role: UserRole, loginId?: string): string {
  const rawLoginId = loginId?.trim() ?? '';
  return role === UserRole.STUDENT ? rawLoginId.toUpperCase() : rawLoginId.toLowerCase();
}
