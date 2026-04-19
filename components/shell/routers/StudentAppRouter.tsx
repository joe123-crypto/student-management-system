'use client';

import type { StudentProfile, User } from '@/types';
import { UserRole } from '@/types';
import Redirect from '@/components/shell/Redirect';
import AppLoadingScreen from '@/components/shell/AppLoadingScreen';
import OnboardingPage from '@/components/features/onboarding/OnboardingPage';
import StudentDashboard from '@/components/features/student/StudentDashboard';
import type { Announcement } from '@/types';
import { requiresStudentOnboarding } from '@/lib/students/profile';
import Button from '@/components/ui/Button';
import Notice from '@/components/ui/Notice';

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

function StudentProfileUnavailableState({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="theme-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="theme-card w-full max-w-xl rounded-[2rem] border p-6 shadow-[0_28px_90px_-36px_rgba(37,79,34,0.32)] sm:p-8">
        <Notice
          tone="warning"
          title="We couldn't open your student workspace"
          message="You're still signed in, but your student record did not finish loading. Refresh to try again, or sign out and sign back in."
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button fullWidth className="rounded-full" onClick={() => window.location.reload()}>
            Try again
          </Button>
          <Button
            variant="secondary"
            fullWidth
            className="rounded-full"
            onClick={onLogout}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
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
  switch (route) {
    case '/onboarding':
      if (user?.role !== UserRole.STUDENT) {
        return <Redirect to="/login" />;
      }
      if (isStudentLoading) {
        return <AppLoadingScreen label="Loading your student record..." />;
      }
      if (!currentStudent) {
        return <StudentProfileUnavailableState onLogout={onLogout} />;
      }
      if (!requiresStudentOnboarding(currentStudent)) {
        return <Redirect to="/student/dashboard" />;
      }

      return (
        <OnboardingPage
          student={currentStudent}
          onComplete={(profilePatch) => onUpdateStudent(currentStudent.id, profilePatch)}
        />
      );
    case '/student/dashboard':
      if (user?.role !== UserRole.STUDENT) {
        return <Redirect to="/login" />;
      }
      if (isStudentLoading) {
        return <AppLoadingScreen label="Loading your student record..." />;
      }
      if (!isStudentLoading && !currentStudent) {
        return <StudentProfileUnavailableState onLogout={onLogout} />;
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
          onUpdate={onUpdateStudent}
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
      if (isStudentLoading) {
        return <AppLoadingScreen label="Loading your student record..." />;
      }
      if (!isStudentLoading && !currentStudent) {
        return <StudentProfileUnavailableState onLogout={onLogout} />;
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
          onUpdate={onUpdateStudent}
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



