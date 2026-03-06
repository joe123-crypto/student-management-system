import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { UserRole as PrismaUserRole } from '@prisma/client';
import { UserRole } from '@/types';
import { findAuthUser, onFailedSignIn, onSuccessfulSignIn, recordAuditLog } from '@/lib/auth/store';
import { verifyPassword } from '@/lib/auth/passwords';

type RawCredentials = {
  role?: string;
  loginId?: string;
  password?: string;
};

function getSigninLimits() {
  const maxAttempts = Number(process.env.AUTH_MAX_FAILED_ATTEMPTS ?? '5');
  const lockMinutes = Number(process.env.AUTH_LOCK_MINUTES ?? '15');
  return {
    maxAttempts: Number.isFinite(maxAttempts) && maxAttempts > 0 ? maxAttempts : 5,
    lockMinutes: Number.isFinite(lockMinutes) && lockMinutes > 0 ? lockMinutes : 15,
  };
}

function toPrismaRole(role: UserRole): PrismaUserRole {
  return role === UserRole.ATTACHE ? PrismaUserRole.ATTACHE : PrismaUserRole.STUDENT;
}

const authConfig: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        role: { label: 'Role', type: 'text' },
        loginId: { label: 'Login ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(rawCredentials, req) {
        const credentials = (rawCredentials ?? {}) as RawCredentials;
        const role = credentials.role === UserRole.ATTACHE ? UserRole.ATTACHE : UserRole.STUDENT;
        const password = credentials.password?.trim() ?? '';
        const rawLoginId = credentials.loginId?.trim() ?? '';
        const loginId = role === UserRole.STUDENT ? rawLoginId.toUpperCase() : rawLoginId.toLowerCase();
        const ip = (req.headers?.['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
        const userAgent = req.headers?.['user-agent'] as string | undefined;
        const { maxAttempts, lockMinutes } = getSigninLimits();

        if (!password || !loginId) {
          return null;
        }

        const useMockDb = process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true';

        if (useMockDb) {
          // If we are in mock mode, bypass Prisma and authorize using the mock seed data
          if (role === UserRole.STUDENT) {
            const { INITIAL_PROTOTYPE_DATABASE } = await import('@/mock/prototypeSeedData');
            const mockStudent = INITIAL_PROTOTYPE_DATABASE.STUDENT.find(
              (s) => s.inscription_no.toUpperCase() === loginId.toUpperCase()
            );
            if (!mockStudent) return null;
            return {
              id: `mock-student-${mockStudent.id}`,
              role: UserRole.STUDENT,
              loginId: mockStudent.inscription_no,
              subject: 'Mock Studies',
              authProvider: 'student_inscription',
            };
          } else {
            return {
              id: `mock-attache-${loginId}`,
              role: UserRole.ATTACHE,
              loginId: loginId,
              subject: 'Administration',
              authProvider: 'attache_email',
            };
          }
        }

        const dbRole = toPrismaRole(role);
        const authUser = await findAuthUser(dbRole, loginId);

        if (!authUser || !authUser.isActive) {
          await recordAuditLog({
            event: 'login_failed',
            ip,
            userAgent,
            metadata: { reason: 'user_not_found_or_inactive', role, loginId },
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

        return {
          id: authUser.id,
          role: authUser.role === PrismaUserRole.ATTACHE ? UserRole.ATTACHE : UserRole.STUDENT,
          loginId: authUser.loginId,
          subject: authUser.subject,
          authProvider: authUser.authProvider,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (!user) return token;

      return {
        ...token,
        role: user.role,
        loginId: user.loginId,
        subject: user.subject,
        authProvider: user.authProvider,
      };
    },
    session({ session, token }) {
      if (!session.user) session.user = {};

      session.user.id = token.sub ?? '';
      session.user.role = (token.role as UserRole | undefined) ?? UserRole.STUDENT;
      session.user.loginId = (token.loginId as string | undefined) ?? '';
      session.user.subject = (token.subject as string | undefined) ?? '';
      session.user.authProvider =
        (token.authProvider as 'student_inscription' | 'attache_email' | undefined) ?? 'student_inscription';

      return session;
    },
  },
};

export default authConfig;
