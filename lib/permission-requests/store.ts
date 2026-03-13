import { PermissionRequestStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auth/store';
import {
  normalizePermissionRequestInput,
  toPermissionRequest,
} from '@/lib/permission-requests/serializers';
import { lookupStudentInscription } from '@/lib/students/store';
import type { PermissionRequest } from '@/types';

export class PermissionRequestConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionRequestConflictError';
  }
}

export class PermissionRequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionRequestValidationError';
  }
}

export async function listPermissionRequests(): Promise<PermissionRequest[]> {
  const requests = await prisma.permissionRequest.findMany({
    orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
  });

  return requests.map(toPermissionRequest);
}

export async function createPermissionRequest(input: {
  inscriptionNumber: string;
  fullName: string;
  passportNumber: string;
}): Promise<PermissionRequest> {
  const normalized = normalizePermissionRequestInput(input);

  const studentExists = await lookupStudentInscription(normalized.inscriptionNumber);
  if (!studentExists) {
    throw new PermissionRequestValidationError('No student record found for this inscription number.');
  }

  const existingPendingRequest = await prisma.permissionRequest.findFirst({
    where: {
      inscriptionNumber: normalized.inscriptionNumber,
      status: PermissionRequestStatus.PENDING,
    },
    orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
  });

  if (existingPendingRequest) {
    throw new PermissionRequestConflictError('A request for this inscription number is already pending.');
  }

  const created = await prisma.permissionRequest.create({
    data: {
      inscriptionNumber: normalized.inscriptionNumber,
      fullName: normalized.fullName,
      passportNumber: normalized.passportNumber,
      status: PermissionRequestStatus.PENDING,
    },
  });

  return toPermissionRequest(created);
}

export async function updatePermissionRequestStatus(params: {
  id: string;
  status: PermissionRequestStatus;
  reviewedById: string;
}): Promise<PermissionRequest> {
  const existing = await prisma.permissionRequest.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    throw new PermissionRequestValidationError('Permission request not found.');
  }

  const updated = await prisma.permissionRequest.update({
    where: { id: params.id },
    data: {
      status: params.status,
      reviewedAt: params.status === PermissionRequestStatus.PENDING ? null : new Date(),
      reviewedById: params.status === PermissionRequestStatus.PENDING ? null : params.reviewedById,
    },
  });

  await recordAuditLog({
    userId: params.reviewedById,
    event: 'permission_request_status_updated',
    metadata: {
      permissionRequestId: updated.id,
      status: updated.status,
    },
  });

  return toPermissionRequest(updated);
}
