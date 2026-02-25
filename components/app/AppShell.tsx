'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Announcement, StudentProfile, User, UserRole } from '@/types';
import { MOCK_ANNOUNCEMENTS, MOCK_STUDENTS } from '@/constants';

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
  const [students, setStudents] = useState<StudentProfile[]>(MOCK_STUDENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);

  useEffect(() => {
    setUser(getFromStorage<User | null>('user', null));
    setStudents(getFromStorage<StudentProfile[]>('students', MOCK_STUDENTS));
    setAnnouncements(getFromStorage<Announcement[]>('announcements', MOCK_ANNOUNCEMENTS));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    window.localStorage.setItem('user', JSON.stringify(user));
  }, [user, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    window.localStorage.setItem('students', JSON.stringify(students));
  }, [students, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    window.localStorage.setItem('announcements', JSON.stringify(announcements));
  }, [announcements, isHydrated]);

  const handleLogout = () => setUser(null);
  const addStudent = (profile: StudentProfile) => setStudents((prev) => [...prev, profile]);
  const updateStudent = (id: string, profile: Partial<StudentProfile>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...profile } : s)));
  };
  const addAnnouncement = (a: Announcement) => setAnnouncements((prev) => [a, ...prev]);
  const deleteStudents = (studentIds: string[]) => {
    setStudents((prev) => prev.filter((student) => !studentIds.includes(student.id)));
  };
  const importStudents = (records: StudentProfile[], mode: 'append' | 'replace') => {
    setStudents((prev) => (mode === 'replace' ? records : [...prev, ...records]));
  };

  if (route === '/') {
    return <LandingPage />;
  }

  if (route === '/login') {
    return <LoginPage onLogin={setUser} />;
  }

  if (!isHydrated) {
    return null;
  }

  if (route === '/onboarding') {
    if (user?.role !== UserRole.STUDENT) {
      return <Redirect to="/login" />;
    }

    return <OnboardingPage user={user} onComplete={addStudent} />;
  }

  if (route === '/student/dashboard' || route === '/student/settings') {
    if (user?.role !== UserRole.STUDENT) {
      return <Redirect to="/login" />;
    }
    const studentSection = route === '/student/settings' ? 'settings' : 'dashboard';

    return (
      <StudentDashboard
        student={students.find((s) => s.contact.email === user.email) || null}
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
