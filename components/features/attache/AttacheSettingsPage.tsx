'use client';

import Layout from '@/components/layout/Layout';
import DatabaseImportSection from '@/components/features/attache/components/DatabaseImportSection';
import { ATTACHE_NAV_ITEMS } from './constants';
import type { AttacheAgentContext, StudentProfile, User } from '@/types';
import { UserRole } from '@/types';

interface AttacheSettingsPageProps {
  agentContext: AttacheAgentContext;
  students: StudentProfile[];
  user: User;
  onImportStudents: (records: StudentProfile[], mode: 'append' | 'replace') => Promise<void>;
  onNavigateSection: (section: 'dashboard' | 'settings') => void;
  onLogout: () => void;
}

export default function AttacheSettingsPage({
  agentContext,
  students,
  user,
  onImportStudents,
  onNavigateSection,
  onLogout,
}: AttacheSettingsPageProps) {
  const handleTabChange = (tab: string) => {
    if (tab === 'settings') {
      onNavigateSection('settings');
    } else if (ATTACHE_NAV_ITEMS.some((item) => item.id === tab)) {
      onNavigateSection('dashboard');
    }
  };

  return (
    <Layout
      role={UserRole.ATTACHE}
      user={user}
      title="Settings"
      onLogout={onLogout}
      activeTab="settings"
      setActiveTab={handleTabChange}
      showSettingsMenu
      sidebarNavItems={ATTACHE_NAV_ITEMS}
      sidebarFooterVariant="logout-only"
      agentContext={agentContext}
    >
      <DatabaseImportSection students={students} onImportStudents={onImportStudents} />
    </Layout>
  );
}
