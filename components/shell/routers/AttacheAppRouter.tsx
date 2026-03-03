'use client';

import type { Announcement, PermissionRequest, StudentProfile, User } from '@/types';
import { UserRole } from '@/types';
import Redirect from '@/components/shell/Redirect';
import AttacheDashboard from '@/components/features/attache/AttacheeDashboard';

interface AttacheAppRouterProps {
  route: '/attache/dashboard' | '/attache/settings';
  user: User | null;
  students: StudentProfile[];
  announcements: Announcement[];
  permissionRequests: PermissionRequest[];
  onAddAnnouncement: (announcement: Announcement) => void;
  onDeleteStudents: (studentIds: string[]) => void;
  onImportStudents: (records: StudentProfile[], mode: 'append' | 'replace') => void;
  onNavigateAttacheSection: (section: 'dashboard' | 'settings') => void;
  onLogout: () => void;
}

export default function AttacheAppRouter({
  route,
  user,
  students,
  announcements,
  permissionRequests,
  onAddAnnouncement,
  onDeleteStudents,
  onImportStudents,
  onNavigateAttacheSection,
  onLogout,
}: AttacheAppRouterProps) {
  if (user?.role !== UserRole.ATTACHE) {
    return <Redirect to="/login" />;
  }

  const section = route === '/attache/settings' ? 'settings' : 'dashboard';
  return (
    <AttacheDashboard
      students={students}
      announcements={announcements}
      permissionRequests={permissionRequests}
      onAddAnnouncement={onAddAnnouncement}
      onDeleteStudents={onDeleteStudents}
      onImportStudents={onImportStudents}
      section={section}
      onNavigateSection={onNavigateAttacheSection}
      onLogout={onLogout}
    />
  );
}

