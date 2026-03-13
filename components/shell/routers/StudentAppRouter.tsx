'use client';

import type { StudentProfile, User } from '@/types';
import { UserRole } from '@/types';
import Redirect from '@/components/shell/Redirect';
import AppLoadingScreen from '@/components/shell/AppLoadingScreen';
import OnboardingPage from '@/components/features/onboarding/OnboardingPage';
import StudentDashboard from '@/components/features/student/StudentDashboard';
import type { Announcement } from '@/types';
import { requiresStudentOnboarding } from '@/lib/students/profile';

interface StudentAppRouterProps {
  route: '/onboarding' | '/student/dashboard' | '/student/settings';
  user: User | null;
  currentStudent: StudentProfile | null;
  announcements: Announcement[];
  isStudentLoading: boolean;
  isAnnouncementsLoading: boolean;
  onUpdateStudent: (id: string, profile: Partial<StudentProfile>) => Promise<void>;
  onNavigateStudentSection: (section: 'dashboard' | 'settings') => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<{
    ok: boolean;
    message: string;
  }>;
  onLogout: () => void;
}

export default function StudentAppRouter({
  route,
  user,
  currentStudent,
  announcements,
  isStudentLoading,
  isAnnouncementsLoading,
  onUpdateStudent,
  onNavigateStudentSection,
  onChangePassword,
  onLogout,
}: StudentAppRouterProps) {
  const handleDashboardUpdate = (id: string, profile: Partial<StudentProfile>) => {
    void onUpdateStudent(id, profile).catch(() => undefined);
  };

  switch (route) {
    case '/onboarding':
      if (user?.role !== UserRole.STUDENT) {
        return <Redirect to="/login" />;
      }
      if (isStudentLoading) {
        return <AppLoadingScreen label="Loading your student record..." />;
      }
      if (!currentStudent) {
        return <Redirect to="/login" />;
      }
      if (!requiresStudentOnboarding(currentStudent)) {
        return <Redirect to="/student/dashboard" />;
      }

      return (
        <OnboardingPage
          user={user}
          student={currentStudent}
          onComplete={(profilePatch) => onUpdateStudent(currentStudent.id, profilePatch)}
        />
      );
    case '/student/dashboard':
      if (user?.role !== UserRole.STUDENT) {
        return <Redirect to="/login" />;
      }
      if (!isStudentLoading && !currentStudent) {
        return <Redirect to="/login" />;
      }
      if (currentStudent && !isStudentLoading && requiresStudentOnboarding(currentStudent)) {
        return <Redirect to="/onboarding" />;
      }

      return (
        <StudentDashboard
          student={currentStudent}
          announcements={announcements}
          isStudentLoading={isStudentLoading}
          isAnnouncementsLoading={isAnnouncementsLoading}
          onUpdate={handleDashboardUpdate}
          section="dashboard"
          onNavigateSection={onNavigateStudentSection}
          onChangePassword={onChangePassword}
          onLogout={onLogout}
        />
      );
    case '/student/settings':
      if (user?.role !== UserRole.STUDENT) {
        return <Redirect to="/login" />;
      }
      if (!isStudentLoading && !currentStudent) {
        return <Redirect to="/login" />;
      }

      return (
        <StudentDashboard
          student={currentStudent}
          announcements={announcements}
          isStudentLoading={isStudentLoading}
          isAnnouncementsLoading={isAnnouncementsLoading}
          onUpdate={handleDashboardUpdate}
          section="settings"
          onNavigateSection={onNavigateStudentSection}
          onChangePassword={onChangePassword}
          onLogout={onLogout}
        />
      );
    default: {
      const unreachable: never = route;
      return unreachable;
    }
  }
}



