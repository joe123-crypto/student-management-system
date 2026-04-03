'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import AuthSessionProvider from '@/components/providers/AuthSessionProvider';
import { clearCacheByPrefix, getRuntimeCachePrefix } from '@/components/shell/shared/browser-cache';
import AppLoadingScreen from '@/components/shell/AppLoadingScreen';
import { useAnnouncements } from '@/components/shell/domains/announcements/useAnnouncements';
import { useAuth } from '@/components/shell/domains/auth/useAuth';
import { usePermissionRequests } from '@/components/shell/domains/permissions/usePermissionRequests';
import { useStudents } from '@/components/shell/domains/students/useStudents';
import AttacheAppRouter from '@/components/shell/routers/AttacheAppRouter';
import StudentAppRouter from '@/components/shell/routers/StudentAppRouter';

type ProtectedRoute =
  | '/onboarding'
  | '/student/dashboard'
  | '/student/settings'
  | '/attache/dashboard'
  | '/attache/settings';

function ProtectedAppShellInner({ route }: { route: ProtectedRoute }) {
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
    updatePermissionRequestStatus,
    isHydrated: isPermissionRequestsHydrated,
  } = usePermissionRequests(user);

  const handleLogout = useCallback(() => {
    void (async () => {
      try {
        if (user) {
          await clearCacheByPrefix(getRuntimeCachePrefix(user));
        }
      } catch (error) {
        console.error('[CACHE] Failed to clear runtime browser cache during logout:', error);
      } finally {
        await signOut({ callbackUrl: '/login' });
      }
    })();
  }, [user]);

  if (!isAuthHydrated) {
    return <AppLoadingScreen label="Loading your application..." />;
  }

  switch (route) {
    case '/onboarding':
    case '/student/dashboard':
    case '/student/settings':
      return (
        <StudentAppRouter
          route={route}
          user={user}
          currentStudent={currentStudent}
          announcements={announcements}
          isStudentLoading={!isStudentsHydrated}
          isAnnouncementsLoading={!isAnnouncementsHydrated}
          onUpdateStudent={async (id, profile) => {
            try {
              await updateStudent(id, profile);
            } catch (error) {
              console.error('[STUDENTS] Failed to update student from ProtectedAppShell:', error);
              throw error;
            }
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
      return (
        <AttacheAppRouter
          route={route}
          user={user}
          students={students}
          announcements={announcements}
          permissionRequests={permissionRequests}
          isStudentsLoading={!isStudentsHydrated}
          isAnnouncementsLoading={!isAnnouncementsHydrated}
          isPermissionRequestsLoading={!isPermissionRequestsHydrated}
          onAddAnnouncement={addAnnouncement}
          onDeleteAnnouncement={deleteAnnouncement}
          onDeleteStudents={(studentIds) => {
            void deleteStudents(studentIds).catch((error) => {
              console.error('[STUDENTS] Failed to delete students from ProtectedAppShell:', error);
            });
          }}
          onUpdatePermissionRequestStatus={updatePermissionRequestStatus}
          onImportStudents={(records, mode) => {
            void importStudents(records, mode).catch((error) => {
              console.error('[STUDENTS] Failed to import students from ProtectedAppShell:', error);
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

export default function ProtectedAppShell({ route }: { route: ProtectedRoute }) {
  return (
    <AuthSessionProvider>
      <ProtectedAppShellInner route={route} />
    </AuthSessionProvider>
  );
}
