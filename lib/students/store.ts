import { randomUUID } from 'crypto';
import { Prisma, StudentProfileStatus, UserRole as PrismaUserRole } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
  createEmptyStudentProfile,
  mergeStudentProfile,
  normalizeStudentProfile,
} from '@/lib/students/profile';
import type { StudentProfile, UserRole } from '@/types';

type StudentProfileRecordRow = {
  id: string;
  authUserId: string | null;
  inscriptionNumber: string;
  fullName: string;
  status: StudentProfileStatus;
  profile: Prisma.JsonValue;
};

type StudentIdentity = {
  id?: string;
  loginId: string;
  role: UserRole;
};

function toPrismaStatus(status: StudentProfile['status']): StudentProfileStatus {
  if (status === 'ACTIVE') return StudentProfileStatus.ACTIVE;
  if (status === 'COMPLETED') return StudentProfileStatus.COMPLETED;
  return StudentProfileStatus.PENDING;
}

function fromPrismaStatus(status: StudentProfileStatus): StudentProfile['status'] {
  if (status === StudentProfileStatus.ACTIVE) return 'ACTIVE';
  if (status === StudentProfileStatus.COMPLETED) return 'COMPLETED';
  return 'PENDING';
}

function serializeStudentProfile(profile: StudentProfile): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(profile)) as Prisma.InputJsonValue;
}

function hydrateStudentProfile(record: StudentProfileRecordRow): StudentProfile {
  return normalizeStudentProfile(record.profile, {
    id: record.id,
    status: fromPrismaStatus(record.status),
    student: {
      inscriptionNumber: record.inscriptionNumber,
      fullName: record.fullName,
    },
  });
}

function getInscriptionNumber(profile: StudentProfile): string {
  return profile.student.inscriptionNumber.trim().toUpperCase();
}

async function resolveAuthUserId(
  inscriptionNumber: string,
  preferredAuthUserId?: string | null,
): Promise<string | null> {
  if (preferredAuthUserId) {
    return preferredAuthUserId;
  }

  const authUser = await prisma.authUser.findUnique({
    where: {
      role_loginId: {
        role: PrismaUserRole.STUDENT,
        loginId: inscriptionNumber,
      },
    },
    select: { id: true },
  });

  return authUser?.id ?? null;
}

async function createStudentProfileRecord(
  profile: StudentProfile,
  preferredAuthUserId?: string | null,
): Promise<StudentProfile> {
  const id = profile.id || randomUUID();
  const inscriptionNumber = getInscriptionNumber(profile);
  const fullName = profile.student.fullName || inscriptionNumber;
  const authUserId = await resolveAuthUserId(inscriptionNumber, preferredAuthUserId);
  const persistableProfile = normalizeStudentProfile(profile, {
    id,
    status: profile.status,
    student: {
      inscriptionNumber,
      fullName,
    },
  });

  const record = await prisma.studentProfileRecord.create({
    data: {
      id,
      authUserId: authUserId ?? undefined,
      inscriptionNumber,
      fullName,
      status: toPrismaStatus(persistableProfile.status),
      profile: serializeStudentProfile({ ...persistableProfile, id }),
    },
  });

  return hydrateStudentProfile(record);
}

async function updateStudentProfileRecord(
  existing: StudentProfileRecordRow,
  nextProfile: StudentProfile,
): Promise<StudentProfile> {
  const inscriptionNumber = getInscriptionNumber(nextProfile);
  const fullName = nextProfile.student.fullName || inscriptionNumber;
  const authUserId = await resolveAuthUserId(inscriptionNumber, existing.authUserId);
  const persistableProfile = normalizeStudentProfile(nextProfile, {
    id: existing.id,
    status: fromPrismaStatus(existing.status),
    student: {
      inscriptionNumber,
      fullName,
    },
  });

  const updated = await prisma.studentProfileRecord.update({
    where: { id: existing.id },
    data: {
      authUserId,
      inscriptionNumber,
      fullName,
      status: toPrismaStatus(persistableProfile.status),
      profile: serializeStudentProfile({ ...persistableProfile, id: existing.id }),
    },
  });

  return hydrateStudentProfile(updated);
}

export async function listStudentProfiles(): Promise<StudentProfile[]> {
  const records = await prisma.studentProfileRecord.findMany({
    orderBy: [{ fullName: 'asc' }, { createdAt: 'asc' }],
  });

  return records.map(hydrateStudentProfile);
}

export async function findStudentProfileById(id: string): Promise<StudentProfile | null> {
  const record = await prisma.studentProfileRecord.findUnique({ where: { id } });
  return record ? hydrateStudentProfile(record) : null;
}

export async function findStudentProfileByInscriptionNumber(
  inscriptionNumber: string,
): Promise<StudentProfile | null> {
  const normalizedInscription = inscriptionNumber.trim().toUpperCase();
  const record = await prisma.studentProfileRecord.findUnique({
    where: { inscriptionNumber: normalizedInscription },
  });

  return record ? hydrateStudentProfile(record) : null;
}

export async function lookupStudentInscription(inscriptionNumber: string): Promise<boolean> {
  const normalizedInscription = inscriptionNumber.trim().toUpperCase();
  if (!normalizedInscription) {
    return false;
  }

  const count = await prisma.studentProfileRecord.count({
    where: { inscriptionNumber: normalizedInscription },
  });

  return count > 0;
}

export async function ensureStudentProfileForIdentity(
  identity: StudentIdentity,
): Promise<StudentProfile | null> {
  if (identity.role !== 'STUDENT' || !identity.loginId) {
    return null;
  }

  const normalizedInscription = identity.loginId.trim().toUpperCase();
  const byAuthUserId = identity.id
    ? await prisma.studentProfileRecord.findUnique({ where: { authUserId: identity.id } })
    : null;

  if (byAuthUserId) {
    return hydrateStudentProfile(byAuthUserId);
  }

  const byInscription = await prisma.studentProfileRecord.findUnique({
    where: { inscriptionNumber: normalizedInscription },
  });

  if (byInscription) {
    if (!byInscription.authUserId && identity.id) {
      await prisma.studentProfileRecord.update({
        where: { id: byInscription.id },
        data: { authUserId: identity.id },
      });
    }
    return hydrateStudentProfile({
      ...byInscription,
      authUserId: byInscription.authUserId || identity.id || null,
    });
  }

  const profile = createEmptyStudentProfile({
    inscriptionNumber: normalizedInscription,
    fullName: normalizedInscription,
    status: 'PENDING',
  });

  return createStudentProfileRecord(profile, identity.id ?? null);
}

export async function updateStudentProfile(
  id: string,
  patch: Partial<StudentProfile>,
): Promise<StudentProfile> {
  const existing = await prisma.studentProfileRecord.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Student profile not found.');
  }

  const currentProfile = hydrateStudentProfile(existing);
  const nextProfile = normalizeStudentProfile(mergeStudentProfile(currentProfile, patch), {
    id: existing.id,
    status: fromPrismaStatus(existing.status),
    student: {
      inscriptionNumber: existing.inscriptionNumber,
      fullName: existing.fullName,
    },
  });

  return updateStudentProfileRecord(existing, nextProfile);
}

export async function deleteStudentProfiles(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  await prisma.studentProfileRecord.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
}

function dedupeProfiles(records: StudentProfile[]): StudentProfile[] {
  const byInscription = new Map<string, StudentProfile>();

  for (const record of records) {
    const normalized = normalizeStudentProfile(record);
    const inscriptionNumber = getInscriptionNumber(normalized);
    if (!inscriptionNumber) {
      continue;
    }
    byInscription.set(inscriptionNumber, normalized);
  }

  return Array.from(byInscription.values());
}

export async function importStudentProfiles(
  records: StudentProfile[],
  mode: 'append' | 'replace',
): Promise<StudentProfile[]> {
  const dedupedProfiles = dedupeProfiles(records);

  if (mode === 'replace') {
    await prisma.studentProfileRecord.deleteMany();

    for (const profile of dedupedProfiles) {
      await createStudentProfileRecord(normalizeStudentProfile(profile));
    }

    return listStudentProfiles();
  }

  for (const importedProfile of dedupedProfiles) {
    const normalized = normalizeStudentProfile(importedProfile);
    const inscriptionNumber = getInscriptionNumber(normalized);
    const existing = await prisma.studentProfileRecord.findUnique({
      where: { inscriptionNumber },
    });

    if (!existing) {
      await createStudentProfileRecord(normalized);
      continue;
    }

    const merged = normalizeStudentProfile(
      mergeStudentProfile(hydrateStudentProfile(existing), normalized),
      {
        id: existing.id,
        status: fromPrismaStatus(existing.status),
        student: {
          inscriptionNumber: existing.inscriptionNumber,
          fullName: existing.fullName,
        },
      },
    );

    await updateStudentProfileRecord(existing, merged);
  }

  return listStudentProfiles();
}
