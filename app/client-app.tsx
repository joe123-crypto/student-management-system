'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Announcement, StudentProfile, User, UserRole } from '../types';
import { MOCK_ANNOUNCEMENTS, MOCK_STUDENTS } from '../constants';

import LandingPage from '../views/LandingPage';
import LoginPage from '../views/LoginPage';
import OnboardingPage from '../views/OnboardingPage';
import StudentDashboard from '../views/StudentDashboard';
import AttacheDashboard from '../views/AttacheeDashboard';

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

export default function ClientApp() {
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(() => getFromStorage<User | null>('user', null));
  const [students, setStudents] = useState<StudentProfile[]>(() => getFromStorage<StudentProfile[]>('students', MOCK_STUDENTS));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    getFromStorage<Announcement[]>('announcements', MOCK_ANNOUNCEMENTS),
  );

  useEffect(() => {
    window.localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    window.localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    window.localStorage.setItem('announcements', JSON.stringify(announcements));
  }, [announcements]);

  const currentPath = useMemo(() => pathname || '/', [pathname]);

  const handleLogout = () => setUser(null);
  const addStudent = (profile: StudentProfile) => setStudents((prev) => [...prev, profile]);
  const updateStudent = (id: string, profile: Partial<StudentProfile>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...profile } : s)));
  };
  const addAnnouncement = (a: Announcement) => setAnnouncements((prev) => [a, ...prev]);

  if (currentPath === '/') {
    return <LandingPage />;
  }

  if (currentPath === '/login') {
    return <LoginPage onLogin={setUser} />;
  }

  if (currentPath === '/onboarding') {
    if (user?.role !== UserRole.STUDENT) {
      return <Redirect to="/login" />;
    }

    return <OnboardingPage user={user} onComplete={addStudent} />;
  }

  if (currentPath === '/student-dashboard') {
    if (user?.role !== UserRole.STUDENT) {
      return <Redirect to="/login" />;
    }

    return (
      <StudentDashboard
        user={user}
        student={students.find((s) => s.contact.email === user.email) || null}
        announcements={announcements}
        onUpdate={updateStudent}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPath === '/attache-dashboard') {
    if (user?.role !== UserRole.ATTACHE) {
      return <Redirect to="/login" />;
    }

    return (
      <AttacheDashboard
        user={user}
        students={students}
        announcements={announcements}
        onAddAnnouncement={addAnnouncement}
        onLogout={handleLogout}
      />
    );
  }

  return <Redirect to="/" />;
}

