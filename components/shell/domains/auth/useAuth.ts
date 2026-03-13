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

  async function changeStudentPassword(currentPassword: string, newPassword: string) {
    if (user?.role !== UserRole.STUDENT) {
      return { ok: false, message: 'Student session not found. Please sign in again.' };
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        return {
          ok: false,
          message: payload.error || `Failed to update password (${response.status}).`,
        };
      }

      return {
        ok: true,
        message: payload.message || 'Password updated successfully.',
      };
    } catch (error) {
      console.error('[AUTH] Failed to change password from useAuth:', error);
      return {
        ok: false,
        message: 'Unable to update password right now. Please try again.',
      };
    }
  }

  return {
    user,
    changeStudentPassword,
    isHydrated: status !== 'loading',
  };
}
