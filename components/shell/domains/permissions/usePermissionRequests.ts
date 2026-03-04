'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PermissionRequest } from '@/types';
import { services } from '@/services';

export function usePermissionRequests() {
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setPermissionRequests(services.permissions.loadPermissionRequests());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    services.permissions.savePermissionRequests(permissionRequests);
  }, [permissionRequests, isHydrated]);

  const submitPermissionRequest = (inscriptionNumber: string, fullName: string, passportNumber: string) => {
    setPermissionRequests((prev) => [
      services.permissions.createPendingRequest(inscriptionNumber, fullName, passportNumber),
      ...prev,
    ]);
  };

  const existingPendingRequests = useMemo(
    () =>
      permissionRequests
        .filter((request) => request.status === 'PENDING')
        .map((request) => request.inscriptionNumber.toUpperCase()),
    [permissionRequests],
  );

  return {
    permissionRequests,
    existingPendingRequests,
    submitPermissionRequest,
    isHydrated,
  };
}

