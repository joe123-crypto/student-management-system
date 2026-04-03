'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import AppLoadingScreen from '@/components/shell/AppLoadingScreen';

const NextAuthSessionProvider = dynamic(
  () => import('@/components/providers/NextAuthSessionProvider'),
  {
    ssr: false,
    loading: () => <AppLoadingScreen label="Loading your session..." />,
  },
);

export default function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
