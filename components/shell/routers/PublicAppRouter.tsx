'use client';

import LandingPage from '@/components/features/landing/LandingPage';
import LoginPage from '@/components/features/auth/LoginPage';
import PermissionRequestPage from '@/components/features/auth/PermissionRequestPage';
import type { Announcement } from '@/types';

type PublicRoute = '/' | '/login' | '/request-permission';

interface PublicAppRouterProps {
  route: PublicRoute;
  latestAnnouncement?: Announcement | null;
  existingPendingRequests: string[];
  onSubmitPermissionRequest: (
    inscriptionNumber: string,
    fullName: string,
    passportNumber: string,
  ) => Promise<void>;
}

export default function PublicAppRouter({
  route,
  latestAnnouncement = null,
  existingPendingRequests,
  onSubmitPermissionRequest,
}: PublicAppRouterProps) {
  switch (route) {
    case '/':
      return <LandingPage latestAnnouncement={latestAnnouncement} />;
    case '/login':
      return <LoginPage />;
    case '/request-permission':
      return (
        <PermissionRequestPage
          existingRequests={existingPendingRequests}
          onSubmitRequest={onSubmitPermissionRequest}
        />
      );
    default: {
      const unreachable: never = route;
      return unreachable;
    }
  }
}
