'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PermissionRequest } from '@/types';
import { getFromStorage } from '@/components/shell/shared/storage';

const PERMISSION_REQUESTS_STORAGE_KEY = 'permission_requests_v1';

function normalizeStoredPermissionRequests(raw: unknown): PermissionRequest[] {
  if (!Array.isArray(raw)) return [];

  return raw.reduce<PermissionRequest[]>((acc, entry) => {
    if (!entry || typeof entry !== 'object') return acc;
    const request = entry as Partial<PermissionRequest>;
    if (
      typeof request.id !== 'string' ||
      typeof request.inscriptionNumber !== 'string' ||
      (request.status !== 'PENDING' && request.status !== 'APPROVED' && request.status !== 'REJECTED') ||
      typeof request.submittedAt !== 'string'
    ) {
      return acc;
    }

    acc.push({
      id: request.id,
      inscriptionNumber: request.inscriptionNumber.toUpperCase(),
      status: request.status,
      submittedAt: request.submittedAt,
    });
    return acc;
  }, []);
}

export function usePermissionRequests() {
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setPermissionRequests(
      normalizeStoredPermissionRequests(getFromStorage<unknown>(PERMISSION_REQUESTS_STORAGE_KEY, [])),
    );
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(PERMISSION_REQUESTS_STORAGE_KEY, JSON.stringify(permissionRequests));
  }, [permissionRequests, isHydrated]);

  const submitPermissionRequest = (inscriptionNumber: string) => {
    setPermissionRequests((prev) => [
      {
        id: Math.random().toString(36).slice(2, 11),
        inscriptionNumber,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      },
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

