'use client';

import { useEffect, useState } from 'react';
import { useAppError } from '@/components/providers/AppErrorProvider';
import { isAbortError } from '@/lib/errors';
import { isMockDbEnabled } from '@/test/mock/config';
import { mockPermissionsService } from '@/test/mock/services/permissionsService';
import type { PermissionRequest, User } from '@/types';
import { UserRole } from '@/types';

const EMPTY_PERMISSION_REQUESTS: PermissionRequest[] = [];

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

export function usePermissionRequests(
  user: User | null,
  initialPermissionRequests: PermissionRequest[] = EMPTY_PERMISSION_REQUESTS,
) {
  const { reportError } = useAppError();
  const userKey = user ? `${user.role}:${user.id}:${user.loginId}` : 'anonymous';
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>(
    initialPermissionRequests,
  );
  const [hydratedKey, setHydratedKey] = useState<string | null>(
    user?.role === UserRole.ATTACHE ? userKey : initialPermissionRequests.length > 0 ? 'anonymous' : null,
  );
  const isHydrated = hydratedKey === userKey;

  useEffect(() => {
    if (user?.role !== UserRole.ATTACHE) {
      return;
    }

    setPermissionRequests((current) =>
      current.length > 0 ? current : initialPermissionRequests,
    );
    setHydratedKey((current) => current ?? userKey);
  }, [initialPermissionRequests, user, userKey]);

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
            setHydratedKey(userKey);
          }
        }

        return;
      }

      if (user?.role !== UserRole.ATTACHE) {
        if (!isCancelled) {
          setPermissionRequests([]);
          setHydratedKey(userKey);
        }
        return;
      }

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
        if (!isAbortError(error)) {
          console.error('[PERMISSION_REQUESTS] Failed to hydrate permission requests:', error);

          if (!isCancelled) {
            reportError(error, {
              title: 'Could not load permission requests',
              fallback: 'Permission requests are unavailable right now. Please refresh and try again.',
            });
          }
        }

        if (!isCancelled) {
          setPermissionRequests([]);
        }
      } finally {
        if (!isCancelled) {
          setHydratedKey(userKey);
        }
      }
    }

    void loadPermissionRequests();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [reportError, user, userKey]);

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
      message?: string;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(payload.error || `Failed to submit permission request (${response.status}).`);
    }
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

  return {
    permissionRequests,
    submitPermissionRequest,
    updatePermissionRequestStatus,
    isHydrated,
  };
}
