import type { NextAuthOptions } from 'next-auth';
import { authCallbacks } from '@/lib/auth/callbacks';
import { credentialsProvider } from '@/lib/auth/credentials-provider';

const authConfig: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [credentialsProvider],
  callbacks: authCallbacks,
};

export default authConfig;
