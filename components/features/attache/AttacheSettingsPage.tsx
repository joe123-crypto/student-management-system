'use client';

import Layout from '@/components/layout/Layout';
import DatabaseImportSection from '@/components/features/attache/components/DatabaseImportSection';
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
  return (
    <Layout
      role={UserRole.ATTACHE}
      user={user}
      title="Settings"
      onLogout={onLogout}
      activeTab="settings"
      setActiveTab={(tab: string) =>
        onNavigateSection(tab === 'settings' ? 'settings' : 'dashboard')
      }
      showSettingsMenu
      sidebarFooterVariant="logout-only"
      agentContext={agentContext}
    >
      <DatabaseImportSection students={students} onImportStudents={onImportStudents} />
    </Layout>
  );
}
