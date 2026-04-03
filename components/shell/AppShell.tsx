'use client';

import { usePermissionRequests } from '@/components/shell/domains/permissions/usePermissionRequests';
import PublicAppRouter from '@/components/shell/routers/PublicAppRouter';
import type { Announcement } from '@/types';

export default function AppShell({
  route,
  latestAnnouncement = null,
}: {
  route: '/' | '/login' | '/request-permission';
  latestAnnouncement?: Announcement | null;
}) {
  const { submitPermissionRequest } = usePermissionRequests(null);

  return (
    <PublicAppRouter
      route={route}
      latestAnnouncement={latestAnnouncement}
      onSubmitPermissionRequest={submitPermissionRequest}
    />
  );
}
