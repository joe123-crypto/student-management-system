import { getFromStorage } from '@/components/shell/shared/storage';
import type { PermissionRequest } from '@/types';
import type { PermissionsService } from '@/services/contracts';

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

export const mockPermissionsService: PermissionsService = {
  loadPermissionRequests() {
    return normalizeStoredPermissionRequests(getFromStorage<unknown>(PERMISSION_REQUESTS_STORAGE_KEY, []));
  },
  savePermissionRequests(permissionRequests) {
    window.localStorage.setItem(PERMISSION_REQUESTS_STORAGE_KEY, JSON.stringify(permissionRequests));
  },
  createPendingRequest(inscriptionNumber) {
    return {
      id: Math.random().toString(36).slice(2, 11),
      inscriptionNumber: inscriptionNumber.toUpperCase(),
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };
  },
};

