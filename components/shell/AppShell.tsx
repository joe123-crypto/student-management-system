'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import type { AppRoute } from '@/components/shell/routes';
import { useAnnouncements } from '@/components/shell/domains/announcements/useAnnouncements';
import { useAuth } from '@/components/shell/domains/auth/useAuth';
import { usePermissionRequests } from '@/components/shell/domains/permissions/usePermissionRequests';
import { useStudents } from '@/components/shell/domains/students/useStudents';
import AttacheAppRouter from '@/components/shell/routers/AttacheAppRouter';
import PublicAppRouter from '@/components/shell/routers/PublicAppRouter';
import StudentAppRouter from '@/components/shell/routers/StudentAppRouter';

export default function AppShell({ route }: { route: AppRoute }) {
  const router = useRouter();
  const { user, changeStudentPassword, isHydrated: isAuthHydrated } = useAuth();
  const {
    students,
    currentStudent,
    updateStudent,
    deleteStudents,
    importStudents,
    isHydrated: isStudentsHydrated,
  } = useStudents(user);
  const {
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    isHydrated: isAnnouncementsHydrated,
  } = useAnnouncements(user);
  const {
    permissionRequests,
    existingPendingRequests,
    submitPermissionRequest,
    updatePermissionRequestStatus,
    isHydrated: isPermissionRequestsHydrated,
  } = usePermissionRequests(user);

  const isHydrated =
    isStudentsHydrated && isAnnouncementsHydrated && isPermissionRequestsHydrated && isAuthHydrated;

  const handleLogout = useCallback(() => {
    void signOut({ callbackUrl: '/login' });
  }, []);

  switch (route) {
    case '/':
    case '/login':
    case '/request-permission':
      return (
        <PublicAppRouter
          route={route}
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
          onUpdateStudent={(id, profile) => {
            void updateStudent(id, profile).catch((error) => {
              console.error('[STUDENTS] Failed to update student from AppShell:', error);
            });
          }}
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
          onDeleteAnnouncement={deleteAnnouncement}
          onDeleteStudents={(studentIds) => {
            void deleteStudents(studentIds).catch((error) => {
              console.error('[STUDENTS] Failed to delete students from AppShell:', error);
            });
          }}
          onUpdatePermissionRequestStatus={updatePermissionRequestStatus}
          onImportStudents={(records, mode) => {
            void importStudents(records, mode).catch((error) => {
              console.error('[STUDENTS] Failed to import students from AppShell:', error);
            });
          }}
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
