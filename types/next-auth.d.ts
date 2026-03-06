import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@/types';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id?: string;
      role?: UserRole;
      loginId?: string;
      subject?: string;
      authProvider?: 'student_inscription' | 'attache_email';
    };
  }

  interface User {
    role: UserRole;
    loginId: string;
    subject: string;
    authProvider: 'student_inscription' | 'attache_email';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole;
    loginId?: string;
    subject?: string;
    authProvider?: 'student_inscription' | 'attache_email';
  }
}
