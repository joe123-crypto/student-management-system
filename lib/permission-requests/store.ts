import {
  AuthProvider,
  PermissionRequestStatus,
  Prisma,
  UserRole as PrismaUserRole,
} from '@prisma/client';
import { prisma } from '@/lib/db';
import { PASSWORD_REQUIREMENTS_MESSAGE, isStrongPassword } from '@/lib/auth/password-policy';
import { hashPassword } from '@/lib/auth/passwords';
import { recordAuditLog } from '@/lib/auth/store';
import {
  normalizePermissionRequestInput,
  toPermissionRequest,
} from '@/lib/permission-requests/serializers';
import { findStudentProfileByInscriptionNumber } from '@/lib/students/store';
import type { PermissionRequest, PermissionRequestStatusUpdateResult } from '@/types';

type DbTx = Prisma.TransactionClient;

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

export class PermissionRequestNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionRequestNotFoundError';
  }
}

export const GENERIC_PERMISSION_REQUEST_MESSAGE =
  'If the details match an eligible student record, the request will be reviewed.';

function normalizeStudentLoginId(inscriptionNumber: string): string {
  return inscriptionNumber.trim().toUpperCase();
}

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

async function provisionStudentCredentialsTx(
  tx: DbTx,
  params: {
    inscriptionNumber: string;
    passwordHash: string;
  },
): Promise<{ authUserId: string; loginId: string }> {
  const loginId = normalizeStudentLoginId(params.inscriptionNumber);

  const authUser = await tx.authUser.upsert({
    where: {
      role_loginId: {
        role: PrismaUserRole.STUDENT,
        loginId,
      },
    },
    create: {
      role: PrismaUserRole.STUDENT,
      loginId,
      authProvider: AuthProvider.student_inscription,
      passwordHash: params.passwordHash,
      isActive: true,
    },
    update: {
      authProvider: AuthProvider.student_inscription,
      passwordHash: params.passwordHash,
      isActive: true,
      failedSignInCount: 0,
      lockedUntil: null,
      sessionVersion: {
        increment: 1,
      },
    },
    select: {
      id: true,
      loginId: true,
      passwordHash: true,
    },
  });

  if (authUser.passwordHash !== params.passwordHash) {
    throw new Error('Failed to replace the stored student password hash.');
  }

  return {
    authUserId: authUser.id,
    loginId: authUser.loginId,
  };
}

export async function updatePermissionRequestStatus(params: {
  id: string;
  status: PermissionRequestStatus;
  reviewedById: string;
  password?: string;
}): Promise<PermissionRequestStatusUpdateResult> {
  const existing = await prisma.permissionRequest.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    throw new PermissionRequestNotFoundError('Permission request not found.');
  }

  const normalizedPassword = params.password?.trim() ?? '';
  const isApproving = params.status === PermissionRequestStatus.APPROVED;
  if (isApproving && !normalizedPassword) {
    throw new PermissionRequestValidationError('A password is required to approve this request.');
  }

  if (isApproving && !isStrongPassword(normalizedPassword)) {
    throw new PermissionRequestValidationError(PASSWORD_REQUIREMENTS_MESSAGE);
  }

  const normalizedLoginId = normalizeStudentLoginId(existing.inscriptionNumber);
  if (isApproving) {
    const matchingStudent = await findStudentProfileByInscriptionNumber(normalizedLoginId);
    if (!matchingStudent) {
      throw new PermissionRequestValidationError(
        'This request can no longer be approved because the student record was not found.',
      );
    }
  }

  const passwordHash = isApproving ? await hashPassword(normalizedPassword) : null;
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.permissionRequest.update({
      where: { id: params.id },
      data: {
        status: params.status,
        reviewedAt: params.status === PermissionRequestStatus.PENDING ? null : new Date(),
        reviewedById: params.status === PermissionRequestStatus.PENDING ? null : params.reviewedById,
      },
    });

    const provisionedAuthUser =
      isApproving && passwordHash
        ? await provisionStudentCredentialsTx(tx, {
            inscriptionNumber: normalizedLoginId,
            passwordHash,
          })
        : undefined;

    return {
      updated,
      authUserId: provisionedAuthUser?.authUserId,
      authUserLoginId: provisionedAuthUser?.loginId,
    };
  });

  await recordAuditLog({
    userId: params.reviewedById,
    event: 'permission_request_status_updated',
    metadata: {
      permissionRequestId: result.updated.id,
      status: result.updated.status,
      authUserId: result.authUserId,
      authUserLoginId: result.authUserLoginId,
    },
  });

  return {
    permissionRequest: toPermissionRequest(result.updated),
    authUserLoginId: result.authUserLoginId,
  };
}
