import React, { useEffect, useState } from 'react';
import {
  Announcement,
  AttacheAgentContext,
  PermissionRequest,
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
  onImportStudents: (records: StudentProfile[], mode: 'append' | 'replace') => void;
  onUpdatePermissionRequestStatus: (
    requestId: string,
    status: Exclude<PermissionRequest['status'], 'PENDING'>,
  ) => Promise<void>;
  section: 'dashboard' | 'settings';
  onNavigateSection: (section: 'dashboard' | 'settings') => void;
  onLogout: () => void;
}

const tabItems = [
  { id: 'students', label: 'Student Records' },
  { id: 'announcements', label: 'Communication Center' },
  { id: 'permission-requests', label: 'Permission Requests' },
] as const;

const communicationTabItems = [
  { id: 'announcements', label: 'Announcements' },
  { id: 'messaging', label: 'Direct Messaging' },
] as const;

const makeId = () => Math.random().toString(36).slice(2, 11);

type ActiveView = (typeof tabItems)[number]['id'];
type ActiveCommunicationView = (typeof communicationTabItems)[number]['id'];

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
  const [activeCommunicationView, setActiveCommunicationView] = useState<ActiveCommunicationView>('announcements');
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLogEntry[]>([]);
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
          <Tabs items={tabItems} activeTab={activeView} onChange={(tab) => setActiveView(tab as ActiveView)} className="mb-8" />
          {activeView === 'students' ? (
            <StudentsSection
              students={students}
              isLoading={isStudentsLoading}
              onDeleteStudents={onDeleteStudents}
              onLogCommunication={appendCommunicationLog}
              onAgentContextChange={setAgentContext}
            />
          ) : null}
          {activeView === 'announcements' ? (
            <section className="space-y-6">
              <div className="flex justify-start sm:justify-end">
                <div className="inline-flex w-full max-w-fit rounded-2xl border border-[rgba(220,205,166,0.7)] bg-white/80 p-1 shadow-sm">
                  {communicationTabItems.map((item) => {
                    const active = item.id === activeCommunicationView;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveCommunicationView(item.id)}
                        className={
                          active
                            ? 'rounded-xl bg-[color:var(--theme-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition'
                            : 'rounded-xl px-4 py-2.5 text-sm font-bold text-[color:var(--theme-text-muted)] transition hover:text-[color:var(--theme-primary)]'
                        }
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {activeCommunicationView === 'announcements' ? (
                <AnnouncementsSection
                  announcements={announcements}
                  isLoading={isAnnouncementsLoading}
                  onAddAnnouncement={onAddAnnouncement}
                  onDeleteAnnouncement={onDeleteAnnouncement}
                />
              ) : null}
              {activeCommunicationView === 'messaging' ? (
                <div className="space-y-4">
                  <div className="theme-card-muted max-w-3xl rounded-2xl border p-4">
                    <p className="theme-text-muted text-sm">
                      Use <span className="font-bold text-[color:var(--theme-primary)]">All Filtered</span> to broadcast to the current student directory from this view.
                    </p>
                  </div>
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
                </div>
              ) : null}
            </section>
          ) : null}
          {activeView === 'permission-requests' ? (
            <PermissionRequestsSection
              requests={permissionRequests}
              isLoading={isPermissionRequestsLoading}
              onUpdateStatus={onUpdatePermissionRequestStatus}
            />
          ) : null}
        </>
      ) : (
        <DatabaseImportSection students={students} onImportStudents={onImportStudents} />
      )}
    </Layout>
  );
};

export default AttacheDashboard;
