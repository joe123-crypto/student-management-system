'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { User } from '@/types';
import { UserRole } from '@/types';

export function useAuth() {
  const { data: session, status } = useSession();

  const user = useMemo<User | null>(() => {
    const sessionUser = session?.user;
    if (!sessionUser?.role || !sessionUser.loginId || !sessionUser.subject || !sessionUser.authProvider) {
      return null;
    }

    if (sessionUser.role !== UserRole.STUDENT && sessionUser.role !== UserRole.ATTACHE) {
      return null;
    }

    return {
      id: sessionUser.id || sessionUser.subject,
      role: sessionUser.role,
      loginId: sessionUser.loginId,
      subject: sessionUser.subject,
      authProvider: sessionUser.authProvider,
    };
  }, [session?.user]);

  const changeStudentPassword = (currentPassword: string, newPassword: string) => {
    void currentPassword;
    void newPassword;
    if (user?.role !== UserRole.STUDENT) {
      return { ok: false, message: 'Student session not found. Please sign in again.' };
    }

    return { ok: false, message: 'Password update endpoint is not implemented yet.' };
  };

  return {
    user,
    changeStudentPassword,
    isHydrated: status !== 'loading',
  };
}

