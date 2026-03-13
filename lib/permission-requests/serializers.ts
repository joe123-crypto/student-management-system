import { PermissionRequestStatus } from '@prisma/client';
import type { PermissionRequest as PermissionRequestRecord } from '@prisma/client';
import type { PermissionRequest } from '@/types';

const STATUS_MAP: Record<PermissionRequestStatus, PermissionRequest['status']> = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export function normalizePermissionRequestInput(input: {
  inscriptionNumber: string;
  fullName: string;
  passportNumber: string;
}): {
  inscriptionNumber: string;
  fullName: string;
  passportNumber: string;
} {
  return {
    inscriptionNumber: input.inscriptionNumber.trim().toUpperCase(),
    fullName: input.fullName.trim(),
    passportNumber: input.passportNumber.trim().toUpperCase(),
  };
}

export function normalizePermissionRequestStatus(value: unknown): PermissionRequestStatus | null {
  if (value === 'PENDING' || value === 'APPROVED' || value === 'REJECTED') {
    return value;
  }

  return null;
}

export function toPermissionRequest(record: PermissionRequestRecord): PermissionRequest {
  return {
    id: record.id,
    inscriptionNumber: record.inscriptionNumber,
    fullName: record.fullName,
    passportNumber: record.passportNumber,
    status: STATUS_MAP[record.status],
    submittedAt: record.submittedAt.toISOString(),
  };
}
