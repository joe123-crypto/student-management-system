import React, { startTransition, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  { id: 'students', label: 'Student Records', shortLabel: 'Students' },
  { id: 'announcements', label: 'Communication Center', shortLabel: 'Messages' },
  { id: 'permission-requests', label: 'Permission Requests', shortLabel: 'Requests' },
] as const;

const communicationTabItems = [
  { id: 'announcements', label: 'Announcements', shortLabel: 'Announcements' },
  { id: 'messaging', label: 'Direct Messaging', shortLabel: 'Messaging' },
] as const;

const makeId = () => Math.random().toString(36).slice(2, 11);

type ActiveView = (typeof tabItems)[number]['id'];
type ActiveCommunicationView = (typeof communicationTabItems)[number]['id'];

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
  const [activeCommunicationView, setActiveCommunicationView] = useState<ActiveCommunicationView>('announcements');
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLogEntry[]>([]);
  const [agentContext, setAgentContext] = useState<AttacheAgentContext>(() => buildDefaultAgentContext(students));

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
      setActiveView(nextView);
    });
  };

  const handleCommunicationViewChange = (nextView: ActiveCommunicationView) => {
    startTransition(() => {
      setActiveCommunicationView(nextView);
    });
  };

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
        <>
          <Tabs
            items={tabItems}
            activeTab={activeView}
            onChange={(tab) => handleViewChange(tab as ActiveView)}
            className="mb-8"
            mobileLayout="grid"
          />
          <AnimatePresence mode="wait">
            {activeView === 'students' ? (
              <motion.div key="attache-students" {...dashboardPanelMotion}>
                <StudentsSection
                  students={students}
                  isLoading={isStudentsLoading}
                  onDeleteStudents={onDeleteStudents}
                  onImportStudents={onImportStudents}
                  onUpdateStudent={onUpdateStudent}
                  onLogCommunication={appendCommunicationLog}
                  onAgentContextChange={handleAgentContextChange}
                />
              </motion.div>
            ) : null}
            {activeView === 'announcements' ? (
              <motion.section key="attache-communications" {...dashboardPanelMotion} className="space-y-6">
                <div className="flex justify-start sm:justify-end">
                  <Tabs
                    items={communicationTabItems}
                    activeTab={activeCommunicationView}
                    onChange={(tab) => handleCommunicationViewChange(tab as ActiveCommunicationView)}
                    className="w-full sm:w-auto"
                    mobileLayout="grid"
                  />
                </div>
                <AnimatePresence mode="wait">
                  {activeCommunicationView === 'announcements' ? (
                    <motion.div key="attache-announcements-feed" {...dashboardPanelMotion}>
                      <AnnouncementsSection
                        announcements={announcements}
                        isLoading={isAnnouncementsLoading}
                        onAddAnnouncement={onAddAnnouncement}
                        onDeleteAnnouncement={onDeleteAnnouncement}
                      />
                    </motion.div>
                  ) : null}
                  {activeCommunicationView === 'messaging' ? (
                    <motion.div key="attache-direct-messaging" {...dashboardPanelMotion} className="space-y-4">
                      <div className="max-w-3xl">
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
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
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
        </>
      ) : (
        <motion.div {...dashboardPanelMotion}>
          <DatabaseImportSection students={students} onImportStudents={onImportStudents} />
        </motion.div>
      )}
    </Layout>
  );
};

export default AttacheDashboard;
