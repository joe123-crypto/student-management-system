import { PermissionRequestStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auth/store';
import {
  normalizePermissionRequestInput,
  toPermissionRequest,
} from '@/lib/permission-requests/serializers';
import { findStudentProfileByInscriptionNumber } from '@/lib/students/store';
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

export const GENERIC_PERMISSION_REQUEST_MESSAGE =
  'If the details match an eligible student record, the request will be reviewed.';

function normalizeComparableName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeComparablePassport(value: string): string {
  return value.trim().replace(/\s+/g, '').toUpperCase();
}

async function matchesStudentIdentity(input: {
  inscriptionNumber: string;
  fullName: string;
  passportNumber: string;
}): Promise<boolean> {
  const student = await findStudentProfileByInscriptionNumber(input.inscriptionNumber);
  if (!student) {
    return false;
  }

  const submittedName = normalizeComparableName(input.fullName);
  const storedName = normalizeComparableName(student.student.fullName);
  if (!submittedName || submittedName !== storedName) {
    return false;
  }

  const submittedPassport = normalizeComparablePassport(input.passportNumber);
  const storedPassport = normalizeComparablePassport(student.passport.passportNumber);

  return Boolean(submittedPassport && storedPassport && submittedPassport === storedPassport);
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

  const identityMatches = await matchesStudentIdentity(normalized);
  if (!identityMatches) {
    throw new PermissionRequestValidationError('Submitted identity details do not match our records.');
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

export async function submitPermissionRequest(input: {
  inscriptionNumber: string;
  fullName: string;
  passportNumber: string;
}): Promise<boolean> {
  const normalized = normalizePermissionRequestInput(input);

  const identityMatches = await matchesStudentIdentity(normalized);
  if (!identityMatches) {
    return false;
  }

  const existingPendingRequest = await prisma.permissionRequest.findFirst({
    where: {
      inscriptionNumber: normalized.inscriptionNumber,
      status: PermissionRequestStatus.PENDING,
    },
    orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
  });

  if (existingPendingRequest) {
    return false;
  }

  await prisma.permissionRequest.create({
    data: {
      inscriptionNumber: normalized.inscriptionNumber,
      fullName: normalized.fullName,
      passportNumber: normalized.passportNumber,
      status: PermissionRequestStatus.PENDING,
    },
  });

  return true;
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
