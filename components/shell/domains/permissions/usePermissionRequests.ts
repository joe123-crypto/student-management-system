'use client';

import { useEffect, useMemo, useState } from 'react';
import { isMockDbEnabled } from '@/test/mock/config';
import { mockPermissionsService } from '@/test/mock/services/permissionsService';
import type { PermissionRequest, User } from '@/types';
import { UserRole } from '@/types';

function upsertPermissionRequest(
  requests: PermissionRequest[],
  nextRequest: PermissionRequest,
): PermissionRequest[] {
  const existingIndex = requests.findIndex((request) => request.id === nextRequest.id);

  if (existingIndex === -1) {
    return [nextRequest, ...requests];
  }

  const nextRequests = [...requests];
  nextRequests[existingIndex] = nextRequest;
  return nextRequests;
}

export function usePermissionRequests(user: User | null) {
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function loadPermissionRequests() {
      if (isMockDbEnabled()) {
        try {
          const storedRequests = mockPermissionsService.loadPermissionRequests();
          if (!isCancelled) {
            setPermissionRequests(storedRequests);
          }
        } catch (error) {
          console.error('[PERMISSION_REQUESTS] Failed to hydrate mock permission requests:', error);
          if (!isCancelled) {
            setPermissionRequests([]);
          }
        } finally {
          if (!isCancelled) {
            setIsHydrated(true);
          }
        }

        return;
      }

      if (user?.role !== UserRole.ATTACHE) {
        if (!isCancelled) {
          setPermissionRequests([]);
          setIsHydrated(true);
        }
        return;
      }

      setIsHydrated(false);

      try {
        const response = await fetch('/api/permission-requests', {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load permission requests (${response.status}).`);
        }

        const payload = (await response.json()) as { requests?: PermissionRequest[] };
        if (!isCancelled) {
          setPermissionRequests(payload.requests || []);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('[PERMISSION_REQUESTS] Failed to hydrate permission requests:', error);
        }

        if (!isCancelled) {
          setPermissionRequests([]);
        }
      } finally {
        if (!isCancelled) {
          setIsHydrated(true);
        }
      }
    }

    void loadPermissionRequests();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [user]);

  async function submitPermissionRequest(
    inscriptionNumber: string,
    fullName: string,
    passportNumber: string,
  ) {
    if (isMockDbEnabled()) {
      const nextRequest = mockPermissionsService.createPendingRequest(
        inscriptionNumber,
        fullName,
        passportNumber,
      );
      const nextRequests = upsertPermissionRequest(permissionRequests, nextRequest);
      mockPermissionsService.savePermissionRequests(nextRequests);
      setPermissionRequests(nextRequests);
      return;
    }

    const response = await fetch('/api/permission-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inscriptionNumber, fullName, passportNumber }),
    });

    const payload = (await response.json()) as {
      permissionRequest?: PermissionRequest;
      error?: string;
    };

    if (!response.ok || !payload.permissionRequest) {
      throw new Error(payload.error || `Failed to submit permission request (${response.status}).`);
    }

    setPermissionRequests((current) => upsertPermissionRequest(current, payload.permissionRequest!));
  }

  async function updatePermissionRequestStatus(
    id: string,
    status: Exclude<PermissionRequest['status'], 'PENDING'>,
  ) {
    if (isMockDbEnabled()) {
      const nextRequests = permissionRequests.map((request) =>
        request.id === id ? { ...request, status } : request,
      );
      mockPermissionsService.savePermissionRequests(nextRequests);
      setPermissionRequests(nextRequests);
      return;
    }

    if (user?.role !== UserRole.ATTACHE) {
      throw new Error('Attache session not found. Please sign in again.');
    }

    const response = await fetch(`/api/permission-requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const payload = (await response.json()) as {
      permissionRequest?: PermissionRequest;
      error?: string;
    };

    if (!response.ok || !payload.permissionRequest) {
      throw new Error(payload.error || `Failed to update permission request (${response.status}).`);
    }

    setPermissionRequests((current) => upsertPermissionRequest(current, payload.permissionRequest!));
  }

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
    updatePermissionRequestStatus,
    isHydrated,
  };
}
