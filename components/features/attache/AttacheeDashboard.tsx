import React, { useEffect, useState } from 'react';
import {
  Announcement,
  AttacheAgentContext,
  PermissionRequest,
  type PermissionRequestStatusUpdateOptions,
  type PermissionRequestStatusUpdateResult,
  StudentProfile,
  User,
  UserRole,
} from '@/types';
import Layout from '@/components/layout/Layout';
import Tabs from '@/components/ui/Tabs';
import StudentsSection from '@/components/features/attache/components/StudentsSection';
import AnnouncementsSection from '@/components/features/attache/components/AnnouncementsSection';
import DatabaseImportSection from '@/components/features/attache/components/DatabaseImportSection';
import PermissionRequestsSection from '@/components/features/attache/components/PermissionRequestsSection';

interface AttacheDashboardProps {
  user: User;
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
  section: 'dashboard' | 'settings';
  onNavigateSection: (section: 'dashboard' | 'settings') => void;
  onLogout: () => void;
}

const tabItems = [
  { id: 'students', label: 'Students' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'permissions', label: 'Permissions' },
] as const;

type ActiveView = (typeof tabItems)[number]['id'];

const AttacheDashboard: React.FC<AttacheDashboardProps> = ({
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
  section,
  onNavigateSection,
  onLogout,
}) => {
  const [activeView, setActiveView] = useState<ActiveView>('students');
  const [agentContext, setAgentContext] = useState<AttacheAgentContext>({
    filteredStudentIds: students.map((student) => student.id),
    selectedStudentIds: [],
    searchQuery: '',
    statusFilter: 'ALL',
    university: 'ALL',
    program: 'ALL',
    duplicatesOnly: false,
  });

  useEffect(() => {
    setAgentContext((current) => {
      if (current.filteredStudentIds.length > 0 && current.filteredStudentIds.every((id) => students.some((student) => student.id === id))) {
        return current;
      }

      return {
        filteredStudentIds: students.map((student) => student.id),
        selectedStudentIds: [],
        searchQuery: '',
        statusFilter: 'ALL',
        university: 'ALL',
        program: 'ALL',
        duplicatesOnly: false,
      };
    });
  }, [students]);

  return (
    <Layout
      role={UserRole.ATTACHE}
      user={user}
      title={section === 'dashboard' ? 'Attache Dashboard' : 'Settings'}
      onLogout={onLogout}
      activeTab={section === 'dashboard' ? 'home' : 'settings'}
      setActiveTab={(tab: string) => onNavigateSection(tab === 'settings' ? 'settings' : 'dashboard')}
      showSettingsMenu
      sidebarFooterVariant="logout-only"
      agentContext={agentContext}
    >
      {section === 'dashboard' ? (
        <div className="space-y-5">
          <Tabs items={tabItems} activeTab={activeView} onChange={(tab) => setActiveView(tab as ActiveView)} className="sticky top-0 z-30 -mx-1 bg-[var(--theme-page)]/88 px-1 py-1.5 backdrop-blur md:top-0" compact />
          {activeView === 'students' ? (
            <StudentsSection
              students={students}
              isLoading={isStudentsLoading}
              onDeleteStudents={onDeleteStudents}
              onOpenImportSettings={() => onNavigateSection('settings')}
              onAgentContextChange={setAgentContext}
            />
          ) : null}
          {activeView === 'announcements' ? (
            <section className="space-y-6">
              <div>
                <h1 className="theme-heading text-3xl font-bold">Announcements</h1>
                <p className="theme-text-muted mt-2 text-base">Post updates students can see right away.</p>
              </div>
              <AnnouncementsSection
                announcements={announcements}
                isLoading={isAnnouncementsLoading}
                onAddAnnouncement={onAddAnnouncement}
                onDeleteAnnouncement={onDeleteAnnouncement}
              />
            </section>
          ) : null}
          {activeView === 'permissions' ? (
            <section className="space-y-6">
              <div>
                <h1 className="theme-heading text-3xl font-bold">Permissions</h1>
                <p className="theme-text-muted mt-2 text-base">Review student access requests in one place.</p>
              </div>
              <PermissionRequestsSection
                requests={permissionRequests}
                isLoading={isPermissionRequestsLoading}
                onUpdateStatus={async (requestId, status) => {
                  await onUpdatePermissionRequestStatus(requestId, status);
                }}
              />
            </section>
          ) : null}
        </div>
      ) : (
        <DatabaseImportSection students={students} onImportStudents={onImportStudents} />
      )}
    </Layout>
  );
};

export default AttacheDashboard;
