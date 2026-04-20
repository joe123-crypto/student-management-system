'use client';

import dynamic from 'next/dynamic';
import type {
  Announcement,
  PermissionRequest,
  PermissionRequestStatusUpdateOptions,
  PermissionRequestStatusUpdateResult,
  StudentProfile,
  User,
} from '@/types';
import { UserRole } from '@/types';
import Redirect from '@/components/shell/Redirect';
import AppLoadingScreen from '@/components/shell/AppLoadingScreen';
import AttacheSettingsPage from '@/components/features/attache/AttacheSettingsPage';
import type { AttacheAgentContext } from '@/types';

const AttacheDashboard = dynamic(
  () => import('@/components/features/attache/AttacheeDashboard'),
  {
    loading: () => <AppLoadingScreen label="Loading attache workspace..." />,
  },
);

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
  onImportStudents: (records: StudentProfile[], mode: 'append' | 'replace') => Promise<void>;
  onUpdateStudent: (id: string, profile: Partial<StudentProfile>) => Promise<void>;
  onUpdatePermissionRequestStatus: (
    requestId: string,
    status: Exclude<PermissionRequest['status'], 'PENDING'>,
    options?: PermissionRequestStatusUpdateOptions,
  ) => Promise<PermissionRequestStatusUpdateResult>;
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
  onUpdateStudent,
  onUpdatePermissionRequestStatus,
  onNavigateAttacheSection,
  onLogout,
}: AttacheAppRouterProps) {
  if (user?.role !== UserRole.ATTACHE) {
    return <Redirect to="/login" />;
  }
  const section = route === '/attache/settings' ? 'settings' : 'dashboard';

  if (section === 'dashboard' && isStudentsLoading) {
    return <AppLoadingScreen label="Loading student records..." />;
  }

  const agentContext: AttacheAgentContext = {
    filteredStudentIds: students.map((student) => student.id),
    selectedStudentIds: [],
    searchQuery: '',
    statusFilter: 'ALL',
    university: 'ALL',
    program: 'ALL',
    duplicatesOnly: false,
  };

  if (section === 'settings') {
    return (
      <AttacheSettingsPage
        user={user}
        students={students}
        agentContext={agentContext}
        onImportStudents={onImportStudents}
        onNavigateSection={onNavigateAttacheSection}
        onLogout={onLogout}
      />
    );
  }

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
      onUpdateStudent={onUpdateStudent}
      onUpdatePermissionRequestStatus={onUpdatePermissionRequestStatus}
      section={section}
      onNavigateSection={onNavigateAttacheSection}
      onLogout={onLogout}
    />
  );
}

