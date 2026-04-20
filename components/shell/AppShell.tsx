'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAppError } from '@/components/providers/AppErrorProvider';
import { clearCacheByPrefix, getRuntimeCachePrefix } from '@/components/shell/shared/browser-cache';
import type { AppRoute } from '@/components/shell/routes';
import AppLoadingScreen from '@/components/shell/AppLoadingScreen';
import LogoutConfirmationDialog from '@/components/shell/LogoutConfirmationDialog';
import { useAnnouncements } from '@/components/shell/domains/announcements/useAnnouncements';
import { useAuth } from '@/components/shell/domains/auth/useAuth';
import { usePermissionRequests } from '@/components/shell/domains/permissions/usePermissionRequests';
import { useStudents } from '@/components/shell/domains/students/useStudents';
import AttacheAppRouter from '@/components/shell/routers/AttacheAppRouter';
import PublicAppRouter from '@/components/shell/routers/PublicAppRouter';
import StudentAppRouter from '@/components/shell/routers/StudentAppRouter';
import type { Announcement } from '@/types';
import type { PermissionRequest, StudentProfile, User } from '@/types';

const EMPTY_ANNOUNCEMENTS: Announcement[] = [];
const EMPTY_PERMISSION_REQUESTS: PermissionRequest[] = [];
const EMPTY_STUDENTS: StudentProfile[] = [];

export default function AppShell({
  route,
  latestAnnouncement = null,
  initialAnnouncements = EMPTY_ANNOUNCEMENTS,
  initialCurrentStudent = null,
  initialDataSource = 'client',
  initialPermissionRequests = EMPTY_PERMISSION_REQUESTS,
  initialStudents = EMPTY_STUDENTS,
  initialUser = null,
}: {
  route: AppRoute;
  latestAnnouncement?: Announcement | null;
  initialAnnouncements?: Announcement[];
  initialCurrentStudent?: StudentProfile | null;
  initialDataSource?: 'layout-ssr' | 'client';
  initialPermissionRequests?: PermissionRequest[];
  initialStudents?: StudentProfile[];
  initialUser?: User | null;
}) {
  const router = useRouter();
  const { reportError } = useAppError();
  const [isLogoutPromptOpen, setIsLogoutPromptOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, changeStudentPassword, isHydrated: isAuthHydrated } = useAuth();
  const effectiveUser = user ?? initialUser;
  const initialUserKey = initialUser
    ? `${initialUser.role}:${initialUser.id}:${initialUser.loginId}`
    : null;
  const effectiveUserKey = effectiveUser
    ? `${effectiveUser.role}:${effectiveUser.id}:${effectiveUser.loginId}`
    : null;
  const shouldSkipInitialClientRefresh = Boolean(
    initialDataSource === 'layout-ssr' && initialUserKey && initialUserKey === effectiveUserKey,
  );
  const {
    students,
    currentStudent,
    updateStudent,
    deleteStudents,
    importStudents,
    isHydrated: isStudentsHydrated,
  } = useStudents(effectiveUser, {
    students: initialStudents,
    currentStudent: initialCurrentStudent,
  }, {
    skipInitialRefresh: shouldSkipInitialClientRefresh,
  });
  const {
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    isHydrated: isAnnouncementsHydrated,
  } = useAnnouncements(effectiveUser, initialAnnouncements, {
    skipInitialRefresh: shouldSkipInitialClientRefresh,
  });
  const {
    permissionRequests,
    submitPermissionRequest,
    updatePermissionRequestStatus,
    isHydrated: isPermissionRequestsHydrated,
  } = usePermissionRequests(effectiveUser, initialPermissionRequests, {
    skipInitialRefresh: shouldSkipInitialClientRefresh,
  });
  const isProtectedRoute =
    route === '/onboarding' ||
    route === '/student/dashboard' ||
    route === '/student/settings' ||
    route === '/attache/dashboard' ||
    route === '/attache/settings';

  const handleLogout = useCallback(() => {
    if (isLoggingOut) return;
    setIsLogoutPromptOpen(true);
  }, [isLoggingOut]);

  const handleCancelLogout = useCallback(() => {
    setIsLogoutPromptOpen(false);
  }, []);

  const handleConfirmLogout = useCallback(() => {
    setIsLogoutPromptOpen(false);
    setIsLoggingOut(true);

    void (async () => {
      try {
        if (effectiveUser) {
          await clearCacheByPrefix(getRuntimeCachePrefix(effectiveUser));
        }
      } catch (error) {
        console.error('[CACHE] Failed to clear runtime browser cache during logout:', error);
        reportError(error, {
          title: 'Logout completed with a warning',
          fallback: 'You were signed out, but we could not clear local cached data.',
        });
      }

      try {
        await signOut({ callbackUrl: '/login' });
      } catch (error) {
        console.error('[AUTH] Failed to complete logout:', error);
        reportError(error, {
          title: 'Logout failed',
          fallback: 'We could not sign you out. Please try again.',
        });
        setIsLoggingOut(false);
      }
    })();
  }, [effectiveUser, reportError]);

  if (isLoggingOut) {
    return <AppLoadingScreen label="Good Bye" />;
  }

  if (isProtectedRoute && !isAuthHydrated && !initialUser) {
    return <AppLoadingScreen label="Loading your application..." />;
  }

  const routeContent = (() => {
    switch (route) {
    case '/':
    case '/login':
    case '/request-permission':
      return (
        <PublicAppRouter
          route={route}
          latestAnnouncement={latestAnnouncement}
          onSubmitPermissionRequest={submitPermissionRequest}
        />
      );
    case '/onboarding':
    case '/student/dashboard':
    case '/student/settings':
      return (
        <StudentAppRouter
          route={route}
          user={effectiveUser}
          currentStudent={currentStudent}
          announcements={announcements}
          isStudentLoading={!isStudentsHydrated}
          isAnnouncementsLoading={!isAnnouncementsHydrated}
          onUpdateStudent={async (id, profile) => {
            try {
              await updateStudent(id, profile);
            } catch (error) {
              console.error('[STUDENTS] Failed to update student from AppShell:', error);
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
          user={effectiveUser}
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
              console.error('[STUDENTS] Failed to delete students from AppShell:', error);
              reportError(error, {
                title: 'Could not delete student records',
                fallback: 'The selected student records could not be deleted.',
              });
            });
          }}
          onUpdateStudent={async (id, profile) => {
            try {
              await updateStudent(id, profile);
            } catch (error) {
              console.error('[STUDENTS] Failed to update student from Attache AppShell:', error);
              throw error;
            }
          }}
          onUpdatePermissionRequestStatus={updatePermissionRequestStatus}
          onImportStudents={async (records, mode) => {
            try {
              await importStudents(records, mode);
            } catch (error) {
              console.error('[STUDENTS] Failed to import students from AppShell:', error);
              throw error;
            }
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
  })();

  return (
    <>
      {routeContent}
      <LogoutConfirmationDialog
        open={isLogoutPromptOpen}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
