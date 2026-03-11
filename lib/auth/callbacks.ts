import type { NextAuthOptions } from 'next-auth';
import { UserRole } from '@/types';
import type { AppAuthProvider } from '@/lib/auth/shared';

export const authCallbacks: NextAuthOptions['callbacks'] = {
  jwt({ token, user }) {
    if (!user) {
      return token;
    }

    return {
      ...token,
      role: user.role,
      loginId: user.loginId,
      subject: user.subject,
      authProvider: user.authProvider,
    };
  },
  session({ session, token }) {
    if (!session.user) {
      session.user = {};
    }

    session.user.id = token.sub ?? '';
    session.user.role = (token.role as UserRole | undefined) ?? UserRole.STUDENT;
    session.user.loginId = (token.loginId as string | undefined) ?? '';
    session.user.subject = (token.subject as string | undefined) ?? '';
    session.user.authProvider =
      ((token.authProvider as AppAuthProvider | undefined) ?? 'student_inscription');

    return session;
  },
};
