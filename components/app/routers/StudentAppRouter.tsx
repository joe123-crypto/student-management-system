'use client';

import type { StudentProfile, User } from '@/types';
import { UserRole } from '@/types';
import Redirect from '@/components/app/Redirect';
import OnboardingPage from '@/components/features/onboarding/OnboardingPage';
import StudentDashboard from '@/components/features/student/StudentDashboard';
import type { Announcement } from '@/types';

interface StudentAppRouterProps {
  route: '/onboarding' | '/student/dashboard' | '/student/settings';
  user: User | null;
  currentStudent: StudentProfile | null;
  announcements: Announcement[];
  onUpdateStudent: (id: string, profile: Partial<StudentProfile>) => void;
  onNavigateStudentSection: (section: 'dashboard' | 'settings') => void;
  onChangePassword: (currentPassword: string, newPassword: string) => {
    ok: boolean;
    message: string;
  };
  onLogout: () => void;
}

export default function StudentAppRouter({
  route,
  user,
  currentStudent,
  announcements,
  onUpdateStudent,
  onNavigateStudentSection,
  onChangePassword,
  onLogout,
}: StudentAppRouterProps) {
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
        onComplete={(profilePatch) => onUpdateStudent(currentStudent.id, profilePatch)}
      />
    );
  }

  if (route === '/student/dashboard' || route === '/student/settings') {
    if (user?.role !== UserRole.STUDENT || !currentStudent) {
      return <Redirect to="/login" />;
    }

    const section = route === '/student/settings' ? 'settings' : 'dashboard';
    return (
      <StudentDashboard
        student={currentStudent}
        announcements={announcements}
        onUpdate={onUpdateStudent}
        section={section}
        onNavigateSection={onNavigateStudentSection}
        onChangePassword={onChangePassword}
        onLogout={onLogout}
      />
    );
  }

  return null;
}
