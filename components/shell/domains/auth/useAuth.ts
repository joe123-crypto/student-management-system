'use client';

import { useEffect, useMemo, useState } from 'react';
import type { StudentProfile, User } from '@/types';
import { UserRole } from '@/types';
import { services } from '@/services';
import type { AuthPasswordStore } from '@/services/contracts';

const DEMO_AUTH_PASSWORD = 'jean';

export function useAuth(students: StudentProfile[], demoMode = false) {
  const [user, setUser] = useState<User | null>(null);
  const [authPasswords, setAuthPasswords] = useState<AuthPasswordStore>({});
  const [isHydrated, setIsHydrated] = useState(false);

  const currentStudent = useMemo(() => {
    if (user?.role !== UserRole.STUDENT || !user.loginId) {
      return null;
    }

    const byInscription = students.find(
      (student) => student.student.inscriptionNumber.toUpperCase() === user.loginId.toUpperCase(),
    );
    if (byInscription) return byInscription;

    return students.find((student) => student.contact.email.toLowerCase() === user.loginId.toLowerCase()) || null;
  }, [students, user]);

  const studentPasswordsByInscription = useMemo(
    () =>
      students.reduce<Record<string, string>>((acc, student) => {
        const inscription = student.student.inscriptionNumber.toUpperCase();
        const key = `student:${inscription}`;
        acc[inscription] = authPasswords[key] || (demoMode ? DEMO_AUTH_PASSWORD : '');
        return acc;
      }, {}),
    [students, authPasswords, demoMode],
  );

  useEffect(() => {
    setUser(services.auth.loadUser());
    setAuthPasswords(services.auth.loadPasswordStore());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (user?.role === UserRole.STUDENT && !currentStudent) {
      setUser(null);
      return;
    }

    services.auth.saveUser(user);
  }, [user, isHydrated, currentStudent]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    services.auth.savePasswordStore(authPasswords);
  }, [authPasswords, isHydrated]);

  const changeStudentPassword = (currentPassword: string, newPassword: string) => {
    if (!currentStudent) {
      return { ok: false, message: 'Student session not found. Please sign in again.' };
    }

    const inscription = currentStudent.student.inscriptionNumber.toUpperCase();
    const subjectKey = `student:${inscription}`;
    const expectedPassword = authPasswords[subjectKey] || (demoMode ? DEMO_AUTH_PASSWORD : '');
    if (!expectedPassword) {
      return { ok: false, message: 'Password is not configured for this account. Contact administration.' };
    }
    if (currentPassword !== expectedPassword) {
      return { ok: false, message: 'Current password is incorrect.' };
    }

    setAuthPasswords((prev) => ({ ...prev, [subjectKey]: newPassword }));
    return { ok: true, message: 'Password changed successfully.' };
  };

  return {
    user,
    setUser,
    currentStudent,
    studentPasswordsByInscription,
    changeStudentPassword,
    isHydrated,
  };
}

