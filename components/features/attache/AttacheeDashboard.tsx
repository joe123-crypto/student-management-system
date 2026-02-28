import React, { useState } from 'react';
import { Announcement, PermissionRequest, StudentProfile, UserRole } from '@/types';
import Layout from '@/components/layout/Layout';
import Tabs from '@/components/ui/Tabs';
import StudentsSection from '@/components/features/attache/components/StudentsSection';
import AnnouncementsSection from '@/components/features/attache/components/AnnouncementsSection';
import DatabaseImportSection from '@/components/features/attache/components/DatabaseImportSection';
import PermissionRequestsSection from '@/components/features/attache/components/PermissionRequestsSection';

interface AttacheDashboardProps {
  students: StudentProfile[];
  announcements: Announcement[];
  permissionRequests: PermissionRequest[];
  onAddAnnouncement: (a: Announcement) => void;
  onDeleteStudents: (studentIds: string[]) => void;
  onImportStudents: (records: StudentProfile[], mode: 'append' | 'replace') => void;
  section: 'dashboard' | 'settings';
  onNavigateSection: (section: 'dashboard' | 'settings') => void;
  onLogout: () => void;
}

const tabItems = [
  { id: 'students', label: 'Student Records' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'permission-requests', label: 'Permission Requests' },
] as const;

type ActiveView = (typeof tabItems)[number]['id'];

const AttacheDashboard: React.FC<AttacheDashboardProps> = ({
  students,
  announcements,
  permissionRequests,
  onAddAnnouncement,
  onDeleteStudents,
  onImportStudents,
  section,
  onNavigateSection,
  onLogout,
}) => {
  const [activeView, setActiveView] = useState<ActiveView>('students');

  return (
    <Layout
      role={UserRole.ATTACHE}
      title={section === 'dashboard' ? 'Attache Management Console' : 'Settings'}
      onLogout={onLogout}
      activeTab={section === 'dashboard' ? 'home' : 'settings'}
      setActiveTab={(tab: string) => onNavigateSection(tab === 'settings' ? 'settings' : 'dashboard')}
      showSettingsMenu
    >
      {section === 'dashboard' ? (
        <>
          <Tabs items={tabItems} activeTab={activeView} onChange={(tab) => setActiveView(tab as ActiveView)} className="mb-8" />
          {activeView === 'students' ? <StudentsSection students={students} onDeleteStudents={onDeleteStudents} /> : null}
          {activeView === 'announcements' ? (
            <AnnouncementsSection announcements={announcements} onAddAnnouncement={onAddAnnouncement} />
          ) : null}
          {activeView === 'permission-requests' ? <PermissionRequestsSection requests={permissionRequests} /> : null}
        </>
      ) : (
        <DatabaseImportSection students={students} onImportStudents={onImportStudents} />
      )}
    </Layout>
  );
};

export default AttacheDashboard;
