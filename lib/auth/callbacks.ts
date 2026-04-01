import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { findAuthUserById } from '@/lib/auth/store';
import { UserRole } from '@/types';
import type { AppAuthProvider } from '@/lib/auth/shared';

type AppJwt = JWT & {
  authProvider?: AppAuthProvider;
  loginId?: string;
  revoked?: boolean;
  role?: UserRole;
  sessionVersion?: number;
  subject?: string;
};

function revokeToken(token: JWT): AppJwt {
  return {
    sub: typeof token.sub === 'string' ? token.sub : undefined,
    revoked: true,
  };
}

export const authCallbacks: NextAuthOptions['callbacks'] = {
  async jwt({ token, user }) {
    if (!user) {
      const userId = typeof token.sub === 'string' ? token.sub : undefined;
      const sessionVersion =
        typeof (token as AppJwt).sessionVersion === 'number'
          ? (token as AppJwt).sessionVersion
          : undefined;

      if (!userId || sessionVersion === undefined) {
        return token;
      }

      const authUser = await findAuthUserById(userId);
      if (
        !authUser ||
        !authUser.isActive ||
        authUser.sessionVersion !== sessionVersion ||
        authUser.loginId !== (token as AppJwt).loginId
      ) {
        return revokeToken(token);
      }

      return token;
    }

    const { revoked: _revoked, sessionVersion: _existingSessionVersion, ...restToken } =
      token as AppJwt;
    const sessionVersion =
      typeof (user as { sessionVersion?: unknown }).sessionVersion === 'number'
        ? (user as { sessionVersion: number }).sessionVersion
        : undefined;

    return {
      ...restToken,
      role: user.role,
      loginId: user.loginId,
      subject: user.subject,
      authProvider: user.authProvider,
      ...(sessionVersion !== undefined ? { sessionVersion } : {}),
    };
  },
  session({ session, token }) {
    if (!session.user) {
      session.user = {};
    }

    if ((token as AppJwt).revoked) {
      session.user.id = undefined;
      session.user.role = undefined;
      session.user.loginId = undefined;
      session.user.subject = undefined;
      session.user.authProvider = undefined;
      return session;
    }

    session.user.id = typeof token.sub === 'string' ? token.sub : undefined;
    session.user.role = token.role as UserRole | undefined;
    session.user.loginId = typeof token.loginId === 'string' ? token.loginId : undefined;
    session.user.subject = typeof token.subject === 'string' ? token.subject : undefined;
    session.user.authProvider = token.authProvider as AppAuthProvider | undefined;

    return session;
  },
};
