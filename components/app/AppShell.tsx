'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Redirect from '@/components/app/Redirect';
import type { AppRoute } from '@/components/app/routes';
import { useAnnouncements } from '@/components/app/hooks/useAnnouncements';
import { useAuth } from '@/components/app/hooks/useAuth';
import { usePermissionRequests } from '@/components/app/hooks/usePermissionRequests';
import { usePrototypeDatabase } from '@/components/app/hooks/usePrototypeDatabase';
import AttacheAppRouter from '@/components/app/routers/AttacheAppRouter';
import PublicAppRouter from '@/components/app/routers/PublicAppRouter';
import StudentAppRouter from '@/components/app/routers/StudentAppRouter';

export default function AppShell({ route }: { route: AppRoute }) {
  const router = useRouter();
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
  } = useAuth(students);

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

  if (route === '/' || route === '/login' || route === '/request-permission') {
    return (
      <PublicAppRouter
        route={route}
        onLogin={setUser}
        registeredStudentInscriptions={registeredStudentInscriptions}
        onboardingStudentInscriptions={onboardingStudentInscriptions}
        studentPasswordsByInscription={studentPasswordsByInscription}
        attachePassword={attachePassword}
        existingPendingRequests={existingPendingRequests}
        onSubmitPermissionRequest={submitPermissionRequest}
      />
    );
  }

  if (!isHydrated) {
    return null;
  }

  if (route === '/onboarding' || route === '/student/dashboard' || route === '/student/settings') {
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
        onLogout={() => setUser(null)}
      />
    );
  }

  if (route === '/attache/dashboard' || route === '/attache/settings') {
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
        onLogout={() => setUser(null)}
      />
    );
  }

  return <Redirect to="/" />;
}
