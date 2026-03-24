import { randomUUID } from 'crypto';
import { FilePurpose, FileStatus, FileVisibility, Prisma, StorageProvider } from '@prisma/client';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auth/store';
import { FILE_POLICIES, assertPurposeSupportedForPhaseOne, validateFileInput } from '@/lib/files/policies';
import { buildFileObjectKey, normalizeUploadedFilename } from '@/lib/files/object-key';
import {
  buildFileContentPath,
  buildFileUploadPath,
  extractFileIdFromReference,
} from '@/lib/files/reference';
import { getObjectStorageBucket, getObjectStorageProvider, getSignedUrlTtlSeconds } from '@/lib/storage';
import type { SignedUploadPayload } from '@/lib/storage/provider';
import { UserRole } from '@/types';

export type FileActor = {
  id?: string;
  role?: UserRole;
  loginId?: string;
};

export type RequestAuditMeta = {
  ip?: string;
  userAgent?: string;
};

const ATTACHE_ATTACHMENT_PURPOSE = 'ATTACHE_ATTACHMENT';

type DbLike = typeof prisma | Prisma.TransactionClient;

type StudentTarget = {
  studentId: number;
  personId: number;
};

type FileAssetRow = Awaited<ReturnType<typeof prisma.fileAsset.findUnique>>;

function parseStudentProfileId(value: string | null | undefined): number | null {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }

  const match = /^student-(\d+)$/.exec(normalized);
  if (match?.[1]) {
    return Number(match[1]);
  }

  return /^\d+$/.test(normalized) ? Number(normalized) : null;
}

function serializeFileAsset(file: NonNullable<FileAssetRow>) {
  return {
    id: file.id,
    purpose: file.purpose,
    status: file.status,
    visibility: file.visibility,
    originalFilename: file.originalFilename,
    sanitizedFilename: file.sanitizedFilename,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    studentId: file.studentId,
    enrollmentId: file.enrollmentId,
    progressId: file.progressId,
    contentUrl: buildFileContentPath(file.id),
    createdAt: file.createdAt.toISOString(),
    uploadedAt: file.uploadedAt?.toISOString() || null,
    expiresAt: file.expiresAt?.toISOString() || null,
  };
}

function buildServerUploadPayload(fileId: string, mimeType: string): SignedUploadPayload {
  return {
    method: 'PUT',
    url: buildFileUploadPath(fileId),
    headers: {
      'Content-Type': mimeType,
    },
  };
}

async function resolveStudentForActor(actor: FileActor, db: DbLike = prisma): Promise<StudentTarget | null> {
  if (actor.role !== UserRole.STUDENT || !actor.loginId) {
    return null;
  }

  const student = await db.student.findUnique({
    where: {
      inscriptionNo: actor.loginId.trim().toUpperCase(),
    },
    select: {
      id: true,
      personId: true,
    },
  });

  return student ? { studentId: student.id, personId: student.personId } : null;
}

async function resolveUploadTarget(params: {
  actor: FileActor;
  studentProfileId?: string;
  studentId?: number;
}, db: DbLike = prisma): Promise<StudentTarget> {
  if (params.actor.role === UserRole.STUDENT) {
    const ownedStudent = await resolveStudentForActor(params.actor, db);
    if (!ownedStudent) {
      throw new Error('Student profile not found for this session.');
    }

    const requestedId =
      typeof params.studentId === 'number'
        ? params.studentId
        : parseStudentProfileId(params.studentProfileId);

    if (requestedId && requestedId !== ownedStudent.studentId) {
      throw new Error('Students can only upload files for their own profile.');
    }

    return ownedStudent;
  }

  if (params.actor.role !== UserRole.ATTACHE) {
    throw new Error('Unauthorized');
  }

  const targetStudentId =
    typeof params.studentId === 'number'
      ? params.studentId
      : parseStudentProfileId(params.studentProfileId);

  if (!targetStudentId) {
    throw new Error('A target student is required.');
  }

  const student = await db.student.findUnique({
    where: { id: targetStudentId },
    select: { id: true, personId: true },
  });

  if (!student) {
    throw new Error('Target student not found.');
  }

  return {
    studentId: student.id,
    personId: student.personId,
  };
}

async function canActorAccessFile(file: NonNullable<FileAssetRow>, actor: FileActor): Promise<boolean> {
  if (!actor.role) {
    return false;
  }

  if (actor.role === UserRole.ATTACHE) {
    return true;
  }

  const ownedStudent = await resolveStudentForActor(actor);
  if (!ownedStudent) {
    return false;
  }

  return file.studentId === ownedStudent.studentId;
}

async function getAuthorizedFileOrThrow(fileId: string, actor: FileActor) {
  const file = await prisma.fileAsset.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new Error('File not found.');
  }

  const allowed = await canActorAccessFile(file, actor);
  if (!allowed) {
    throw new Error('Forbidden');
  }

  return file;
}

export async function createUploadIntent(params: {
  actor: FileActor;
  purpose: FilePurpose;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  studentProfileId?: string;
  studentId?: number;
  audit?: RequestAuditMeta;
}): Promise<{
  file: ReturnType<typeof serializeFileAsset>;
  upload: SignedUploadPayload;
}> {
  assertPurposeSupportedForPhaseOne(params.purpose);
  validateFileInput({
    purpose: params.purpose,
    mimeType: params.mimeType,
    sizeBytes: params.sizeBytes,
  });

  const target = await resolveUploadTarget(params);
  const fileId = randomUUID();
  const sanitizedFilename = normalizeUploadedFilename(params.filename);
  const objectKey = buildFileObjectKey({
    purpose: params.purpose,
    studentId: target.studentId,
    fileId,
    filename: sanitizedFilename,
  });

  const file = await prisma.fileAsset.create({
    data: {
      id: fileId,
      purpose: params.purpose,
      visibility: FileVisibility.PRIVATE,
      status: FileStatus.PENDING_UPLOAD,
      provider: StorageProvider.R2,
      bucket: getObjectStorageBucket(),
      objectKey,
      originalFilename: params.filename.trim() || sanitizedFilename,
      sanitizedFilename,
      mimeType: params.mimeType.trim().toLowerCase(),
      sizeBytes: params.sizeBytes,
      studentId: target.studentId,
      personId: target.personId,
      uploadedByUserId: params.actor.id,
    },
  });

  await recordAuditLog({
    userId: params.actor.id,
    event: 'FILE_UPLOAD_INTENT_CREATED',
    metadata: {
      fileId: file.id,
      purpose: file.purpose,
      studentId: file.studentId,
    },
    ip: params.audit?.ip,
    userAgent: params.audit?.userAgent,
  });

  return {
    file: serializeFileAsset(file),
    upload: buildServerUploadPayload(file.id, file.mimeType),
  };
}

export async function uploadPendingFile(params: {
  fileId: string;
  actor: FileActor;
  body: Uint8Array;
  mimeType?: string;
  audit?: RequestAuditMeta;
}) {
  const file = await getAuthorizedFileOrThrow(params.fileId, params.actor);

  if (file.status === FileStatus.ACTIVE) {
    return serializeFileAsset(file);
  }

  if (file.status !== FileStatus.PENDING_UPLOAD) {
    throw new Error('This file cannot accept uploads.');
  }

  const declaredMimeType = params.mimeType?.trim().toLowerCase();
  if (declaredMimeType && declaredMimeType !== file.mimeType) {
    throw new Error('Uploaded file type does not match the upload intent.');
  }

  validateFileInput({
    purpose: file.purpose,
    mimeType: file.mimeType,
    sizeBytes: params.body.byteLength,
  });

  await getObjectStorageProvider().putObject({
    objectKey: file.objectKey,
    body: params.body,
    mimeType: file.mimeType,
    sizeBytes: params.body.byteLength,
  });

  await recordAuditLog({
    userId: params.actor.id,
    event: 'FILE_UPLOAD_TRANSFERRED',
    metadata: {
      fileId: file.id,
      purpose: file.purpose,
      studentId: file.studentId,
      sizeBytes: params.body.byteLength,
    },
    ip: params.audit?.ip,
    userAgent: params.audit?.userAgent,
  });

  return serializeFileAsset(file);
}

export async function completeUpload(params: {
  fileId: string;
  actor: FileActor;
  audit?: RequestAuditMeta;
}) {
  const file = await getAuthorizedFileOrThrow(params.fileId, params.actor);

  if (file.status === FileStatus.ACTIVE) {
    return serializeFileAsset(file);
  }

  if (file.status !== FileStatus.PENDING_UPLOAD) {
    throw new Error('This file cannot be completed.');
  }

  const head = await getObjectStorageProvider().headObject(file.objectKey);
  if (!head) {
    throw new Error('Uploaded object not found in storage.');
  }

  const policy = FILE_POLICIES[file.purpose];
  if (head.sizeBytes <= 0 || head.sizeBytes > policy.maxSizeBytes) {
    await prisma.fileAsset.update({
      where: { id: file.id },
      data: {
        status: FileStatus.QUARANTINED,
        sizeBytes: head.sizeBytes,
        etag: head.etag,
      },
    });
    throw new Error('Uploaded file failed validation.');
  }

  const updated = await prisma.fileAsset.update({
    where: { id: file.id },
    data: {
      status: FileStatus.ACTIVE,
      sizeBytes: head.sizeBytes,
      etag: head.etag,
      uploadedAt: new Date(),
    },
  });

  await recordAuditLog({
    userId: params.actor.id,
    event: 'FILE_UPLOAD_COMPLETED',
    metadata: {
      fileId: updated.id,
      purpose: updated.purpose,
      studentId: updated.studentId,
    },
    ip: params.audit?.ip,
    userAgent: params.audit?.userAgent,
  });

  return serializeFileAsset(updated);
}

export async function getFileSummary(fileId: string, actor: FileActor) {
  const file = await getAuthorizedFileOrThrow(fileId, actor);
  return serializeFileAsset(file);
}

export async function createFileAccess(params: {
  fileId: string;
  actor: FileActor;
  disposition?: 'inline' | 'attachment';
  audit?: RequestAuditMeta;
}) {
  const file = await getAuthorizedFileOrThrow(params.fileId, params.actor);
  if (file.status !== FileStatus.ACTIVE) {
    throw new Error('File is not available.');
  }

  const access = await getObjectStorageProvider().createSignedDownload({
    objectKey: file.objectKey,
    filename: file.originalFilename,
    disposition: params.disposition || 'attachment',
    mimeType: file.mimeType,
    expiresInSeconds: getSignedUrlTtlSeconds(),
  });

  if (
    file.purpose === FilePurpose.RESULT_SLIP ||
    (file.purpose as string) === ATTACHE_ATTACHMENT_PURPOSE
  ) {
    await recordAuditLog({
      userId: params.actor.id,
      event: 'FILE_ACCESS_GRANTED',
      metadata: {
        fileId: file.id,
        purpose: file.purpose,
        disposition: params.disposition || 'attachment',
        studentId: file.studentId,
      },
      ip: params.audit?.ip,
      userAgent: params.audit?.userAgent,
    });
  }

  return access;
}

export async function listStudentFileLinks(
  studentId: number,
  progressIds: number[],
  db: DbLike = prisma,
): Promise<{
  profilePictureUrl?: string;
  proofDocumentsByProgressId: Map<number, string>;
}> {
  const files = await db.fileAsset.findMany({
    where: {
      studentId,
      status: FileStatus.ACTIVE,
      OR: [
        { purpose: FilePurpose.PROFILE_IMAGE },
        {
          purpose: FilePurpose.RESULT_SLIP,
          progressId: {
            in: progressIds.length > 0 ? progressIds : [-1],
          },
        },
      ],
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });

  let profilePictureUrl: string | undefined;
  const proofDocumentsByProgressId = new Map<number, string>();

  for (const file of files) {
    if (file.purpose === FilePurpose.PROFILE_IMAGE && !profilePictureUrl) {
      profilePictureUrl = buildFileContentPath(file.id);
      continue;
    }

    if (file.purpose === FilePurpose.RESULT_SLIP && file.progressId && !proofDocumentsByProgressId.has(file.progressId)) {
      proofDocumentsByProgressId.set(file.progressId, buildFileContentPath(file.id));
    }
  }

  return {
    profilePictureUrl,
    proofDocumentsByProgressId,
  };
}

export async function clearStudentProfileImageTx(tx: Prisma.TransactionClient, studentId: number): Promise<void> {
  await tx.fileAsset.updateMany({
    where: {
      studentId,
      purpose: FilePurpose.PROFILE_IMAGE,
      status: FileStatus.ACTIVE,
    },
    data: {
      status: FileStatus.DELETED,
    },
  });
}

export async function attachProfileImageToStudentTx(params: {
  tx: Prisma.TransactionClient;
  studentId: number;
  personId: number;
  fileId: string;
}): Promise<void> {
  const file = await params.tx.fileAsset.findUnique({
    where: { id: params.fileId },
  });

  if (!file || file.purpose !== FilePurpose.PROFILE_IMAGE) {
    throw new Error('Profile image file not found.');
  }

  if (file.studentId && file.studentId !== params.studentId) {
    throw new Error('Profile image already belongs to another student.');
  }

  await params.tx.fileAsset.updateMany({
    where: {
      studentId: params.studentId,
      purpose: FilePurpose.PROFILE_IMAGE,
      status: FileStatus.ACTIVE,
      id: {
        not: params.fileId,
      },
    },
    data: {
      status: FileStatus.DELETED,
      supersededById: params.fileId,
    },
  });

  await params.tx.fileAsset.update({
    where: { id: params.fileId },
    data: {
      studentId: params.studentId,
      personId: params.personId,
      status: FileStatus.ACTIVE,
      visibility: FileVisibility.PRIVATE,
    },
  });
}

export async function attachResultSlipToProgressTx(params: {
  tx: Prisma.TransactionClient;
  studentId: number;
  personId: number;
  enrollmentId: number;
  progressId: number;
  fileId: string;
}): Promise<void> {
  const file = await params.tx.fileAsset.findUnique({
    where: { id: params.fileId },
  });

  if (!file || file.purpose !== FilePurpose.RESULT_SLIP) {
    throw new Error('Result slip file not found.');
  }

  if (file.studentId && file.studentId !== params.studentId) {
    throw new Error('Result slip already belongs to another student.');
  }

  await params.tx.fileAsset.updateMany({
    where: {
      progressId: params.progressId,
      purpose: FilePurpose.RESULT_SLIP,
      status: FileStatus.ACTIVE,
      id: {
        not: params.fileId,
      },
    },
    data: {
      status: FileStatus.DELETED,
      supersededById: params.fileId,
    },
  });

  await params.tx.fileAsset.update({
    where: { id: params.fileId },
    data: {
      studentId: params.studentId,
      personId: params.personId,
      enrollmentId: params.enrollmentId,
      progressId: params.progressId,
      status: FileStatus.ACTIVE,
      visibility: FileVisibility.PRIVATE,
    },
  });
}

export function resolveFileIdFromReferenceOrThrow(
  reference: string | null | undefined,
  fieldLabel: string,
): string | null {
  const normalized = reference?.trim();
  if (!normalized) {
    return null;
  }

  const fileId = extractFileIdFromReference(normalized);
  if (!fileId) {
    throw new Error(`${fieldLabel} reference is invalid.`);
  }

  return fileId;
}

export { buildFileContentPath, extractFileIdFromReference };
