'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Announcement, StudentProfile, User, UserRole } from '@/types';
import { MOCK_ANNOUNCEMENTS } from '@/constants';
import {
  createPrototypeDatabase,
  deleteStudentsFromDatabase,
  getStudentProfilesFromDatabase,
  importStudentProfilesToDatabase,
  PROTOTYPE_DATABASE_STORAGE_KEY,
  PrototypeDatabase,
  updateStudentProfileInDatabase,
} from '@/data/prototypeDatabase';

import LandingPage from '@/components/features/landing/LandingPage';
import LoginPage from '@/components/features/auth/LoginPage';
import OnboardingPage from '@/components/features/onboarding/OnboardingPage';
import StudentDashboard from '@/components/features/student/StudentDashboard';
import AttacheDashboard from '@/components/features/attache/AttacheeDashboard';

type AppRoute =
  | '/'
  | '/login'
  | '/onboarding'
  | '/student/dashboard'
  | '/student/settings'
  | '/attache/dashboard'
  | '/attache/settings';

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const saved = window.localStorage.getItem(key);
  if (!saved) {
    return fallback;
  }

  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function normalizeStoredUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;

  const entry = raw as Partial<User> & { email?: string };
  const role = entry.role;
  if (role !== UserRole.STUDENT && role !== UserRole.ATTACHE) return null;

  const legacyEmail = typeof entry.legacyEmail === 'string' ? entry.legacyEmail : entry.email;
  const loginId = typeof entry.loginId === 'string' && entry.loginId
    ? entry.loginId
    : (typeof entry.email === 'string' ? entry.email : '');
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

function Redirect({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return null;
}

export default function AppShell({ route }: { route: AppRoute }) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [database, setDatabase] = useState<PrototypeDatabase>(createPrototypeDatabase());
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const students = useMemo(() => getStudentProfilesFromDatabase(database), [database]);
  const registeredStudentInscriptions = useMemo(
    () => students.map((student) => student.student.inscriptionNumber.toUpperCase()),
    [students],
  );
  const onboardingStudentInscriptions = useMemo(
    () =>
      students
        .filter(
          (student) =>
            !student.bank.bankName ||
            !student.bank.branchCode ||
            !student.bankAccount.accountNumber ||
            !student.bankAccount.iban,
        )
        .map((student) => student.student.inscriptionNumber.toUpperCase()),
    [students],
  );
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

  useEffect(() => {
    setUser(normalizeStoredUser(getFromStorage<unknown>('user', null)));
    setDatabase(getFromStorage<PrototypeDatabase>(PROTOTYPE_DATABASE_STORAGE_KEY, createPrototypeDatabase()));
    setAnnouncements(getFromStorage<Announcement[]>('announcements', MOCK_ANNOUNCEMENTS));
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
    window.localStorage.setItem(PROTOTYPE_DATABASE_STORAGE_KEY, JSON.stringify(database));
  }, [database, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    window.localStorage.setItem('announcements', JSON.stringify(announcements));
  }, [announcements, isHydrated]);

  const handleLogout = () => setUser(null);
  const updateStudent = (id: string, profile: Partial<StudentProfile>) => {
    setDatabase((prev) => updateStudentProfileInDatabase(prev, id, profile));
  };
  const addAnnouncement = (a: Announcement) => setAnnouncements((prev) => [a, ...prev]);
  const deleteStudents = (studentIds: string[]) => {
    setDatabase((prev) => deleteStudentsFromDatabase(prev, studentIds));
  };
  const importStudents = (records: StudentProfile[], mode: 'append' | 'replace') => {
    setDatabase((prev) => importStudentProfilesToDatabase(prev, records, mode));
  };

  if (route === '/') {
    return <LandingPage />;
  }

  if (route === '/login') {
    return (
      <LoginPage
        onLogin={setUser}
        registeredStudentInscriptions={registeredStudentInscriptions}
        onboardingStudentInscriptions={onboardingStudentInscriptions}
      />
    );
  }

  if (!isHydrated) {
    return null;
  }

  if (route === '/onboarding') {
    if (user?.role !== UserRole.STUDENT) {
      return <Redirect to="/login" />;
    }
    if (!currentStudent) {
      return <Redirect to="/login" />;
    }

    return (
      <OnboardingPage
        user={user}
        student={currentStudent}
        onComplete={(profilePatch) => updateStudent(currentStudent.id, profilePatch)}
      />
    );
  }

  if (route === '/student/dashboard' || route === '/student/settings') {
    if (user?.role !== UserRole.STUDENT || !currentStudent) {
      return <Redirect to="/login" />;
    }
    const studentSection = route === '/student/settings' ? 'settings' : 'dashboard';

    return (
        <StudentDashboard
        student={currentStudent}
        announcements={announcements}
        onUpdate={updateStudent}
        section={studentSection}
        onNavigateSection={(section) =>
          router.push(section === 'settings' ? '/student/settings' : '/student/dashboard')
        }
        onLogout={handleLogout}
      />
    );
  }

  if (route === '/attache/dashboard' || route === '/attache/settings') {
    if (user?.role !== UserRole.ATTACHE) {
      return <Redirect to="/login" />;
    }
    const attacheSection = route === '/attache/settings' ? 'settings' : 'dashboard';

    return (
      <AttacheDashboard
        students={students}
        announcements={announcements}
        onAddAnnouncement={addAnnouncement}
        onDeleteStudents={deleteStudents}
        onImportStudents={importStudents}
        section={attacheSection}
        onNavigateSection={(section) =>
          router.push(section === 'settings' ? '/attache/settings' : '/attache/dashboard')
        }
        onLogout={handleLogout}
      />
    );
  }

  return <Redirect to="/" />;
}
