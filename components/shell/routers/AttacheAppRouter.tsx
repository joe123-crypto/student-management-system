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
  isStudentsLoading: boolean;
  isAnnouncementsLoading: boolean;
  isPermissionRequestsLoading: boolean;
  onAddAnnouncement: (input: { title: string; content: string }) => Promise<void>;
  onDeleteAnnouncement: (announcementId: string) => Promise<void>;
  onDeleteStudents: (studentIds: string[]) => void;
  onImportStudents: (records: StudentProfile[], mode: 'append' | 'replace') => void;
  onUpdatePermissionRequestStatus: (
    requestId: string,
    status: Exclude<PermissionRequest['status'], 'PENDING'>,
  ) => Promise<void>;
  onNavigateAttacheSection: (section: 'dashboard' | 'settings') => void;
  onLogout: () => void;
}

export default function AttacheAppRouter({
  route,
  user,
  students,
  announcements,
  permissionRequests,
  isStudentsLoading,
  isAnnouncementsLoading,
  isPermissionRequestsLoading,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onDeleteStudents,
  onImportStudents,
  onUpdatePermissionRequestStatus,
  onNavigateAttacheSection,
  onLogout,
}: AttacheAppRouterProps) {
  if (user?.role !== UserRole.ATTACHE) {
    return <Redirect to="/login" />;
  }

  const section = route === '/attache/settings' ? 'settings' : 'dashboard';
  return (
    <AttacheDashboard
      user={user}
      students={students}
      announcements={announcements}
      permissionRequests={permissionRequests}
      isStudentsLoading={isStudentsLoading}
      isAnnouncementsLoading={isAnnouncementsLoading}
      isPermissionRequestsLoading={isPermissionRequestsLoading}
      onAddAnnouncement={onAddAnnouncement}
      onDeleteAnnouncement={onDeleteAnnouncement}
      onDeleteStudents={onDeleteStudents}
      onImportStudents={onImportStudents}
      onUpdatePermissionRequestStatus={onUpdatePermissionRequestStatus}
      section={section}
      onNavigateSection={onNavigateAttacheSection}
      onLogout={onLogout}
    />
  );
}

