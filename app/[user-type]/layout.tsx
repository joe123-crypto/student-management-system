import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import UserTypeRouteShell from '@/components/shell/UserTypeRouteShell';
import { loadAppShellInitialData } from '@/lib/app-shell/initial-data';

interface UserTypeLayoutProps {
  children: ReactNode;
  params: Promise<{ 'user-type': string }>;
}

const ALLOWED_USER_TYPES = new Set(['student', 'attache']);

export default async function UserTypeLayout({ children, params }: UserTypeLayoutProps) {
  const { 'user-type': userType } = await params;

  if (!ALLOWED_USER_TYPES.has(userType)) {
    notFound();
  }

  const initialData = await loadAppShellInitialData();

  return (
    <>
      <UserTypeRouteShell
        userType={userType as 'student' | 'attache'}
        initialUser={initialData.user}
        initialStudents={initialData.students}
        initialCurrentStudent={initialData.currentStudent}
        initialAnnouncements={initialData.announcements}
        initialPermissionRequests={initialData.permissionRequests}
      />
      {children}
    </>
  );
}

