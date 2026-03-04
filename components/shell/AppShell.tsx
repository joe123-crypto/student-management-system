'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { AppRoute } from '@/components/shell/routes';
import { useAnnouncements } from '@/components/shell/domains/announcements/useAnnouncements';
import { useAuth } from '@/components/shell/domains/auth/useAuth';
import { usePermissionRequests } from '@/components/shell/domains/permissions/usePermissionRequests';
import { usePrototypeDatabase } from '@/components/shell/domains/students/usePrototypeDatabase';
import AttacheAppRouter from '@/components/shell/routers/AttacheAppRouter';
import PublicAppRouter from '@/components/shell/routers/PublicAppRouter';
import StudentAppRouter from '@/components/shell/routers/StudentAppRouter';

export default function AppShell({ route }: { route: AppRoute }) {
  const router = useRouter();
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const attachePassword = process.env.NEXT_PUBLIC_ATTACHE_PASSWORD?.trim() ?? '';
  const { students, updateStudent, deleteStudents, importStudents, isHydrated: isDatabaseHydrated } = usePrototypeDatabase();
  const { announcements, addAnnouncement, isHydrated: isAnnouncementsHydrated } = useAnnouncements();
  const {
    permissionRequests,
    existingPendingRequests,
    submitPermissionRequest,
    isHydrated: isPermissionRequestsHydrated,
  } = usePermissionRequests();
  const {
    user,
    setUser,
    currentStudent,
    studentPasswordsByInscription,
    changeStudentPassword,
    isHydrated: isAuthHydrated,
  } = useAuth(students, demoMode);

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

  const isHydrated =
    isDatabaseHydrated && isAnnouncementsHydrated && isPermissionRequestsHydrated && isAuthHydrated;

  const handleLogout = useCallback(() => {
    setUser(null);
    router.replace('/login');
  }, [router, setUser]);

  switch (route) {
    case '/':
    case '/login':
    case '/request-permission':
      return (
        <PublicAppRouter
          route={route}
          onLogin={setUser}
          registeredStudentInscriptions={registeredStudentInscriptions}
          onboardingStudentInscriptions={onboardingStudentInscriptions}
          studentPasswordsByInscription={studentPasswordsByInscription}
          attachePassword={attachePassword}
          demoMode={demoMode}
          existingPendingRequests={existingPendingRequests}
          onSubmitPermissionRequest={submitPermissionRequest}
        />
      );
    case '/onboarding':
    case '/student/dashboard':
    case '/student/settings':
      if (!isHydrated) {
        return null;
      }
      return (
        <StudentAppRouter
          route={route}
          user={user}
          currentStudent={currentStudent}
          announcements={announcements}
          onUpdateStudent={updateStudent}
          onNavigateStudentSection={(section) =>
            router.push(section === 'settings' ? '/student/settings' : '/student/dashboard')
          }
          onChangePassword={changeStudentPassword}
          onLogout={handleLogout}
        />
      );
    case '/attache/dashboard':
    case '/attache/settings':
      if (!isHydrated) {
        return null;
      }
      return (
        <AttacheAppRouter
          route={route}
          user={user}
          students={students}
          announcements={announcements}
          permissionRequests={permissionRequests}
          onAddAnnouncement={addAnnouncement}
          onDeleteStudents={deleteStudents}
          onImportStudents={importStudents}
          onNavigateAttacheSection={(section) =>
            router.push(section === 'settings' ? '/attache/settings' : '/attache/dashboard')
          }
          onLogout={handleLogout}
        />
      );
    default: {
      const unreachable: never = route;
      return unreachable;
    }
  }
}



