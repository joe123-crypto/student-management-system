'use client';

import Layout from '@/components/layout/Layout';
import StudentPasswordSettings from '@/components/features/student/dashboard/StudentPasswordSettings';
import { STUDENT_NAV_ITEMS } from './constants';
import { UserRole } from '@/types';

interface StudentSettingsPageProps {
  profilePicture?: string;
  onChangePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; message: string }>;
  onNavigateSection: (section: 'dashboard' | 'settings') => void;
  onLogout: () => void;
}

const INPUT_CLASS =
  'theme-input w-full rounded-2xl border px-5 py-3.5 outline-none transition-all';

export default function StudentSettingsPage({
  profilePicture,
  onChangePassword,
  onNavigateSection,
  onLogout,
}: StudentSettingsPageProps) {
  const handleTabChange = (tab: string) => {
    if (tab === 'settings') {
      onNavigateSection('settings');
    } else if (STUDENT_NAV_ITEMS.some((item) => item.id === tab)) {
      onNavigateSection('dashboard');
    }
  };

  return (
    <Layout
      role={UserRole.STUDENT}
      title="Settings"
      onLogout={onLogout}
      activeTab="settings"
      setActiveTab={handleTabChange}
      profilePicture={profilePicture}
      showSettingsMenu
      sidebarNavItems={STUDENT_NAV_ITEMS}
    >
      <StudentPasswordSettings
        onChangePassword={onChangePassword}
        inputClassName={INPUT_CLASS}
      />
    </Layout>
  );
}
