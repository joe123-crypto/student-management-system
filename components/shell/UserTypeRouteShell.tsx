'use client';

import { usePathname } from 'next/navigation';
import AppShell from '@/components/shell/AppShell';

interface UserTypeRouteShellProps {
  userType: 'student' | 'attache';
}

export default function UserTypeRouteShell({ userType }: UserTypeRouteShellProps) {
  const pathname = usePathname();
  const section = pathname?.split('/')[2];

  if (section !== 'dashboard' && section !== 'settings') {
    return null;
  }

  if (userType === 'student') {
    return <AppShell route={section === 'settings' ? '/student/settings' : '/student/dashboard'} />;
  }

  return <AppShell route={section === 'settings' ? '/attache/settings' : '/attache/dashboard'} />;
}



