'use client';

import { useEffect, useMemo, useState } from 'react';
import type { StudentProfile, User } from '@/types';
import { UserRole } from '@/types';
import { MOCK_AUTH_PASSWORD } from '@/data/prototypeDatabase';
import { getFromStorage } from '@/components/app/hooks/storage';

const AUTH_PASSWORDS_STORAGE_KEY = 'auth_passwords_v1';

type AuthPasswordStore = Record<string, string>;

function normalizeStoredUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;

  const entry = raw as Partial<User> & { email?: string };
  const role = entry.role;
  if (role !== UserRole.STUDENT && role !== UserRole.ATTACHE) return null;

  const legacyEmail = typeof entry.legacyEmail === 'string' ? entry.legacyEmail : entry.email;
  const loginId =
    typeof entry.loginId === 'string' && entry.loginId
      ? entry.loginId
      : typeof entry.email === 'string'
        ? entry.email
        : '';
  const authProvider =
    entry.authProvider === 'student_inscription' || entry.authProvider === 'attache_email'
      ? entry.authProvider
      : role === UserRole.STUDENT
        ? 'student_inscription'
        : 'attache_email';

  return {
    id: typeof entry.id === 'string' && entry.id ? entry.id : Math.random().toString(36).slice(2, 11),
    subject:
      typeof entry.subject === 'string' && entry.subject
        ? entry.subject
        : role === UserRole.STUDENT
          ? `student:${loginId || 'unknown'}`
          : 'attache:default',
    loginId,
    authProvider,
    legacyEmail: legacyEmail || undefined,
    role,
  };
}

function normalizeStoredAuthPasswords(raw: unknown): AuthPasswordStore {
  if (!raw || typeof raw !== 'object') return {};
  return Object.entries(raw as Record<string, unknown>).reduce<AuthPasswordStore>((acc, [key, value]) => {
    if (typeof value === 'string' && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function useAuth(students: StudentProfile[]) {
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
        acc[inscription] = authPasswords[key] || MOCK_AUTH_PASSWORD;
        return acc;
      }, {}),
    [students, authPasswords],
  );

  useEffect(() => {
    setUser(normalizeStoredUser(getFromStorage<unknown>('user', null)));
    setAuthPasswords(normalizeStoredAuthPasswords(getFromStorage<unknown>(AUTH_PASSWORDS_STORAGE_KEY, {})));
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

    window.localStorage.setItem('user', JSON.stringify(user));
  }, [user, isHydrated, currentStudent]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(AUTH_PASSWORDS_STORAGE_KEY, JSON.stringify(authPasswords));
  }, [authPasswords, isHydrated]);

  const changeStudentPassword = (currentPassword: string, newPassword: string) => {
    if (!currentStudent) {
      return { ok: false, message: 'Student session not found. Please sign in again.' };
    }

    const inscription = currentStudent.student.inscriptionNumber.toUpperCase();
    const subjectKey = `student:${inscription}`;
    const expectedPassword = authPasswords[subjectKey] || MOCK_AUTH_PASSWORD;
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
