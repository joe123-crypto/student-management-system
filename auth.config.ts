import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { UserRole } from '@/types';

const DEMO_AUTH_PASSWORD = 'jean';
const DEMO_ATTACHE_EMAIL = 'attache@example.com';

type RawCredentials = {
  role?: string;
  loginId?: string;
  password?: string;
};

function parseStudentCredentialMap(): Record<string, string> {
  const raw = process.env.AUTH_STUDENT_CREDENTIALS_JSON?.trim();
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(parsed).reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        acc[key.toUpperCase()] = value;
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
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
      authorize(rawCredentials) {
        const credentials = (rawCredentials ?? {}) as RawCredentials;
        const role = credentials.role === UserRole.ATTACHE ? UserRole.ATTACHE : UserRole.STUDENT;
        const password = credentials.password?.trim() ?? '';
        const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

        if (!password) return null;

        if (role === UserRole.ATTACHE) {
          const loginId = (credentials.loginId?.trim().toLowerCase() || process.env.AUTH_ATTACHE_EMAIL?.toLowerCase() || DEMO_ATTACHE_EMAIL);
          const expectedPassword = process.env.AUTH_ATTACHE_PASSWORD?.trim() || (demoMode ? DEMO_AUTH_PASSWORD : '');
          if (!expectedPassword || password !== expectedPassword) return null;

          return {
            id: `attache:${loginId}`,
            role: UserRole.ATTACHE,
            loginId,
            subject: 'attache:default',
            authProvider: 'attache_email',
          };
        }

        const normalizedInscription = credentials.loginId?.trim().toUpperCase() ?? '';
        if (!normalizedInscription) return null;

        const configuredMap = parseStudentCredentialMap();
        const expectedPassword = configuredMap[normalizedInscription] || (demoMode ? DEMO_AUTH_PASSWORD : '');
        if (!expectedPassword || password !== expectedPassword) return null;

        return {
          id: `student:${normalizedInscription}`,
          role: UserRole.STUDENT,
          loginId: normalizedInscription,
          subject: `student:${normalizedInscription}`,
          authProvider: 'student_inscription',
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
