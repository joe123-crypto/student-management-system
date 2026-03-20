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

    session.user.id = typeof token.sub === 'string' ? token.sub : undefined;
    session.user.role = token.role as UserRole | undefined;
    session.user.loginId = typeof token.loginId === 'string' ? token.loginId : undefined;
    session.user.subject = typeof token.subject === 'string' ? token.subject : undefined;
    session.user.authProvider = token.authProvider as AppAuthProvider | undefined;

    return session;
  },
};
