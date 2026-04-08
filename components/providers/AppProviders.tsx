'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import AppErrorProvider from '@/components/providers/AppErrorProvider';
import NotificationProvider from '@/components/providers/NotificationProvider';

export default function AppProviders({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <NotificationProvider>
        <AppErrorProvider>{children}</AppErrorProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
