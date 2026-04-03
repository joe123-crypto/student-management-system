'use client';

import { usePathname } from 'next/navigation';
import ProtectedAppShell from '@/components/shell/ProtectedAppShell';

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
    return <ProtectedAppShell route={section === 'settings' ? '/student/settings' : '/student/dashboard'} />;
  }

  return <ProtectedAppShell route={section === 'settings' ? '/attache/settings' : '/attache/dashboard'} />;
}



