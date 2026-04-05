'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { clearCacheByPrefix, getRuntimeCachePrefix } from '@/components/shell/shared/browser-cache';
import type { AppRoute } from '@/components/shell/routes';
import AppLoadingScreen from '@/components/shell/AppLoadingScreen';
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
  initialPermissionRequests = EMPTY_PERMISSION_REQUESTS,
  initialStudents = EMPTY_STUDENTS,
  initialUser = null,
}: {
  route: AppRoute;
  latestAnnouncement?: Announcement | null;
  initialAnnouncements?: Announcement[];
  initialCurrentStudent?: StudentProfile | null;
  initialPermissionRequests?: PermissionRequest[];
  initialStudents?: StudentProfile[];
  initialUser?: User | null;
}) {
  const router = useRouter();
  const { user, changeStudentPassword, isHydrated: isAuthHydrated } = useAuth();
  const effectiveUser = user ?? initialUser;
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
  });
  const {
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    isHydrated: isAnnouncementsHydrated,
  } = useAnnouncements(effectiveUser, initialAnnouncements);
  const {
    permissionRequests,
    submitPermissionRequest,
    updatePermissionRequestStatus,
    isHydrated: isPermissionRequestsHydrated,
  } = usePermissionRequests(effectiveUser, initialPermissionRequests);
  const isProtectedRoute =
    route === '/onboarding' ||
    route === '/student/dashboard' ||
    route === '/student/settings' ||
    route === '/attache/dashboard' ||
    route === '/attache/settings';

  const handleLogout = useCallback(() => {
    void (async () => {
      try {
        if (effectiveUser) {
          await clearCacheByPrefix(getRuntimeCachePrefix(effectiveUser));
        }
      } catch (error) {
        console.error('[CACHE] Failed to clear runtime browser cache during logout:', error);
      } finally {
        await signOut({ callbackUrl: '/login' });
      }
    })();
  }, [effectiveUser]);

  if (isProtectedRoute && !isAuthHydrated && !initialUser) {
    return <AppLoadingScreen label="Loading your application..." />;
  }

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
