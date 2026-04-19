import React, { startTransition, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, ShieldCheck, UsersRound } from 'lucide-react';
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
import StudentsSection from '@/components/features/attache/components/StudentsSection';
import AnnouncementsSection from '@/components/features/attache/components/AnnouncementsSection';
import CommunicationCenter from '@/components/features/attache/components/CommunicationCenter';
import DatabaseImportSection from '@/components/features/attache/components/DatabaseImportSection';
import PermissionRequestsSection from '@/components/features/attache/components/PermissionRequestsSection';
import type { CommunicationLogEntry } from '@/components/features/attache/types';
import {
  isSameAgentContext,
  pruneAgentContextStudentIds,
} from '@/components/features/attache/utils/agentContext';
import { dashboardPanelMotion } from '@/components/ui/motion';

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
  { id: 'students', label: 'Student Records', icon: UsersRound },
  { id: 'announcements', label: 'Communication Center', icon: Mail },
  { id: 'permission-requests', label: 'Permissions', icon: ShieldCheck },
] as const;

const makeId = () => Math.random().toString(36).slice(2, 11);

type ActiveView = (typeof tabItems)[number]['id'];

function buildDefaultAgentContext(students: StudentProfile[]): AttacheAgentContext {
  return {
    filteredStudentIds: students.map((student) => student.id),
    selectedStudentIds: [],
    searchQuery: '',
    statusFilter: 'ALL',
    university: 'ALL',
    program: 'ALL',
    duplicatesOnly: false,
  };
}

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
  onUpdateStudent,
  onUpdatePermissionRequestStatus,
  section,
  onNavigateSection,
  onLogout,
}) => {
  const [activeView, setActiveView] = useState<ActiveView>('students');
  const [managedStudentId, setManagedStudentId] = useState<string | null>(null);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLogEntry[]>([]);
  const [agentContext, setAgentContext] = useState<AttacheAgentContext>(() => buildDefaultAgentContext(students));
  const isDashboardHomeView = section === 'dashboard' && activeView === 'students' && managedStudentId === null;

  useEffect(() => {
    setAgentContext((current) => pruneAgentContextStudentIds(current, students));
  }, [students]);

  const handleAgentContextChange = useCallback((nextContext: AttacheAgentContext) => {
    setAgentContext((current) => (isSameAgentContext(current, nextContext) ? current : nextContext));
  }, []);

  const appendCommunicationLog = ({
    channel,
    template,
    recipientCount,
  }: {
    channel: 'EMAIL' | 'SMS';
    template: string;
    recipientCount: number;
  }) => {
    if (recipientCount === 0) return;

    const entry: CommunicationLogEntry = {
      id: makeId(),
      sentAt: new Date().toLocaleString(),
      recipientCount,
      channel,
      template,
    };

    setCommunicationLogs((prev) => [entry, ...prev]);
  };

  const handleViewChange = (nextView: ActiveView) => {
    startTransition(() => {
      if (nextView !== 'students') {
        setManagedStudentId(null);
      }
      setActiveView(nextView);
    });
  };

  const handleSidebarTabChange = (nextTab: string) => {
    if (nextTab === 'settings') {
      setManagedStudentId(null);
      onNavigateSection('settings');
      return;
    }

    if (tabItems.some((item) => item.id === nextTab)) {
      handleViewChange(nextTab as ActiveView);
      if (section !== 'dashboard') {
        onNavigateSection('dashboard');
      }
    }
  };

  return (
    <Layout
      role={UserRole.ATTACHE}
      user={user}
      title={section === 'dashboard' ? 'Attache Dashboard' : 'Settings'}
      onLogout={onLogout}
      activeTab={section === 'dashboard' ? activeView : 'settings'}
      setActiveTab={handleSidebarTabChange}
      showSettingsMenu
      showPageTitle={section !== 'dashboard'}
      showBreadcrumb={section !== 'dashboard'}
      showFooter={!isDashboardHomeView}
      fitViewport={isDashboardHomeView}
      sidebarNavItems={tabItems}
      sidebarFooterVariant="logout-only"
      agentContext={agentContext}
    >
      {section === 'dashboard' ? (
        <AnimatePresence mode="wait">
          {activeView === 'students' ? (
            <motion.div key="attache-students" {...dashboardPanelMotion} className="h-full min-h-0">
              <StudentsSection
                students={students}
                isLoading={isStudentsLoading}
                onDeleteStudents={onDeleteStudents}
                onImportStudents={onImportStudents}
                onUpdateStudent={onUpdateStudent}
                onLogCommunication={appendCommunicationLog}
                onAgentContextChange={handleAgentContextChange}
                selectedStudentId={managedStudentId}
                onSelectedStudentIdChange={setManagedStudentId}
                fitViewport={isDashboardHomeView}
              />
            </motion.div>
          ) : null}
          {activeView === 'announcements' ? (
            <motion.section key="attache-communications" {...dashboardPanelMotion} className="space-y-6">
              <motion.div {...dashboardPanelMotion}>
                <AnnouncementsSection
                  announcements={announcements}
                  isLoading={isAnnouncementsLoading}
                  onAddAnnouncement={onAddAnnouncement}
                  onDeleteAnnouncement={onDeleteAnnouncement}
                />
              </motion.div>
              <motion.div {...dashboardPanelMotion} className="max-w-3xl">
                <CommunicationCenter
                  selectedCount={0}
                  filteredCount={students.length}
                  onSend={({ channel, template, scope }) =>
                    appendCommunicationLog({
                      channel,
                      template,
                      recipientCount: scope === 'SELECTED' ? 0 : students.length,
                    })
                  }
                  logs={communicationLogs}
                />
              </motion.div>
            </motion.section>
          ) : null}
          {activeView === 'permission-requests' ? (
            <motion.div key="attache-permission-requests" {...dashboardPanelMotion}>
              <PermissionRequestsSection
                requests={permissionRequests}
                isLoading={isPermissionRequestsLoading}
                onUpdateStatus={onUpdatePermissionRequestStatus}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      ) : (
        <motion.div {...dashboardPanelMotion}>
          <DatabaseImportSection students={students} onImportStudents={onImportStudents} />
        </motion.div>
      )}
    </Layout>
  );
};

export default AttacheDashboard;
