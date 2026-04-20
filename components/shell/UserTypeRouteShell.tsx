'use client';

import { usePathname } from 'next/navigation';
import AppShell from '@/components/shell/AppShell';
import type { Announcement, PermissionRequest, StudentProfile, User } from '@/types';

interface UserTypeRouteShellProps {
  userType: 'student' | 'attache';
  initialAnnouncements: Announcement[];
  initialCurrentStudent: StudentProfile | null;
  initialPermissionRequests: PermissionRequest[];
  initialStudents: StudentProfile[];
  initialUser: User | null;
}

export default function UserTypeRouteShell({
  userType,
  initialAnnouncements,
  initialCurrentStudent,
  initialPermissionRequests,
  initialStudents,
  initialUser,
}: UserTypeRouteShellProps) {
  const pathname = usePathname();
  const section = pathname?.split('/')[2];

  if (section !== 'dashboard' && section !== 'settings') {
    return null;
  }

  const route =
    userType === 'student'
      ? section === 'settings'
        ? '/student/settings'
        : '/student/dashboard'
      : section === 'settings'
        ? '/attache/settings'
        : '/attache/dashboard';

  return (
    <AppShell
      route={route}
      initialUser={initialUser}
      initialStudents={initialStudents}
      initialCurrentStudent={initialCurrentStudent}
      initialAnnouncements={initialAnnouncements}
      initialPermissionRequests={initialPermissionRequests}
      // Set to 'layout-ssr' since this layout fetches fresh server data on navigation.
      // Note: If data fetching here ever becomes conditional or cached differently,
      // this could silently start serving stale data without triggering a refresh.
      initialDataSource="layout-ssr"
    />
  );
}



