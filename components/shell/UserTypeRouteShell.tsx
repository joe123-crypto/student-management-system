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

  if (userType === 'student') {
    return (
      <AppShell
        route={section === 'settings' ? '/student/settings' : '/student/dashboard'}
        initialUser={initialUser}
        initialStudents={initialStudents}
        initialCurrentStudent={initialCurrentStudent}
        initialAnnouncements={initialAnnouncements}
        initialPermissionRequests={initialPermissionRequests}
        initialDataFresh
      />
    );
  }

  return (
    <AppShell
      route={section === 'settings' ? '/attache/settings' : '/attache/dashboard'}
      initialUser={initialUser}
      initialStudents={initialStudents}
      initialCurrentStudent={initialCurrentStudent}
      initialAnnouncements={initialAnnouncements}
      initialPermissionRequests={initialPermissionRequests}
      initialDataFresh
    />
  );
}



