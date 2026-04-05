import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
  attachProfileImageToStudentTx,
  attachResultSlipToProgressTx,
  clearStudentProfileImageTx,
  extractFileIdFromReference,
  listStudentFileLinksBatch,
  listStudentFileLinks,
  resolveFileIdFromReferenceOrThrow,
} from '@/lib/files/store';
import {
  createEmptyStudentProfile,
  mergeStudentProfile,
  normalizeStudentProfile,
} from '@/lib/students/profile';
import type { StudentProfile, UserRole } from '@/types';

type StudentIdentity = {
  id?: string;
  loginId: string;
  role: UserRole;
};

type DbTx = Prisma.TransactionClient;

const STUDENT_WRITE_TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 30_000,
};

const studentInclude = Prisma.validator<Prisma.StudentInclude>()({
  person: {
    include: {
      homeAddress: {
        include: {
          province: true,
        },
      },
      passports: {
        orderBy: {
          id: 'desc',
        },
        take: 1,
      },
      contacts: {
        orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
      },
      accounts: {
        orderBy: {
          id: 'desc',
        },
        take: 1,
        include: {
          branch: {
            include: {
              address: {
                include: {
                  province: true,
                },
              },
              bank: {
                include: {
                  address: {
                    include: {
                      province: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  address: {
    include: {
      province: true,
    },
  },
  enrollments: {
    orderBy: [{ dateEnrolled: 'desc' }, { id: 'desc' }],
    take: 1,
    include: {
      program: {
        include: {
          department: true,
          programType: true,
        },
      },
      progressRows: {
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      },
    },
  },
});

const universityInclude = Prisma.validator<Prisma.UniversityInclude>()({
  address: {
    include: {
      province: true,
    },
  },
});

type StudentRow = Prisma.StudentGetPayload<{ include: typeof studentInclude }>;
type UniversityRow = Prisma.UniversityGetPayload<{ include: typeof universityInclude }>;
type StudentFileLinks = Awaited<ReturnType<typeof listStudentFileLinks>>;
type UniversityLookup = {
  byAddressId: Map<number, UniversityRow>;
  byProvinceId: Map<number, UniversityRow>;
  fallback: UniversityRow | null;
};

function buildStudentProfileId(studentId: number): string {
  return `student-${studentId}`;
}

function parseStudentProfileId(id: string): number | null {
  const normalized = id.trim();
  const match = /^student-(\d+)$/.exec(normalized);
  if (match) {
    return Number(match[1]);
  }

  return /^\d+$/.test(normalized) ? Number(normalized) : null;
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function normalizeStoredStatus(value: string | null | undefined): StudentProfile['status'] {
  const normalized = (value || '').trim().toUpperCase();
  if (normalized === 'ACTIVE' || normalized === 'COMPLETED') {
    return normalized;
  }

  return 'PENDING';
}

function toStoredStatus(value: StudentProfile['status']): string {
  return normalizeStoredStatus(value);
}

function buildFullName(givenName: string, familyName: string, fallback = ''): string {
  const combined = `${givenName} ${familyName}`.trim();
  return combined || fallback;
}

function formatAddress(address: { name: string; province?: { name: string } | null } | null | undefined): string {
  const parts = [address?.name?.trim() || '', address?.province?.name?.trim() || ''].filter(Boolean);
  return parts.join(', ');
}

function calculateExpectedEnd(dateEnrolled: string, duration: number | undefined): string {
  if (!dateEnrolled) {
    return '';
  }

  const date = new Date(`${dateEnrolled}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  date.setUTCFullYear(date.getUTCFullYear() + (duration || 2));
  return date.toISOString().slice(0, 10);
}

function parseIntegerString(value: string | null | undefined, fallback: number): number {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) {
    return fallback;
  }

  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBigIntString(value: string | null | undefined, fallback: bigint): bigint {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) {
    return fallback;
  }

  try {
    return BigInt(digits);
  } catch {
    return fallback;
  }
}

function bigIntToString(value: bigint | null | undefined): string {
  return value === null || value === undefined || value === BigInt(0) ? '' : value.toString();
}

function getContactValue(contacts: StudentRow['person']['contacts'], type: string, label?: string): string {
  const matches = contacts.filter(
    (contact) =>
      contact.type.toUpperCase() === type.toUpperCase() &&
      (label ? contact.label.toUpperCase() === label.toUpperCase() : true),
  );
  const primary = matches.find((entry) => entry.isPrimary);
  return (primary || matches[0])?.value || '';
}

function buildUniversityLookup(universities: UniversityRow[]): UniversityLookup {
  const byAddressId = new Map<number, UniversityRow>();
  const byProvinceId = new Map<number, UniversityRow>();

  for (const university of universities) {
    if (university.addressId && !byAddressId.has(university.addressId)) {
      byAddressId.set(university.addressId, university);
    }

    const provinceId = university.address?.wilayaId;
    if (provinceId && !byProvinceId.has(provinceId)) {
      byProvinceId.set(provinceId, university);
    }
  }

  return {
    byAddressId,
    byProvinceId,
    fallback: universities[0] || null,
  };
}

function selectUniversity(student: StudentRow, universityLookup: UniversityLookup): UniversityRow | null {
  const currentAddressId = student.addressId ?? null;
  const currentProvinceId = student.address?.wilayaId ?? null;

  return (
    (currentAddressId ? universityLookup.byAddressId.get(currentAddressId) : null) ||
    (currentProvinceId ? universityLookup.byProvinceId.get(currentProvinceId) : null) ||
    universityLookup.fallback ||
    null
  );
}

function mapStudentRow(
  student: StudentRow,
  universityLookup: UniversityLookup,
  fileLinks?: StudentFileLinks,
): StudentProfile {
  const person = student.person;
  const passport = person.passports[0];
  const account = person.accounts[0];
  const branch = account?.branch;
  const bank = branch?.bank;
  const latestEnrollment = student.enrollments[0];
  const program = latestEnrollment?.program;
  const programType = program?.programType;
  const department = program?.department;
  const university = selectUniversity(student, universityLookup);

  const fullName = buildFullName(
    person.givenName,
    person.familyName,
    buildStudentProfileId(student.id),
  );

  return normalizeStudentProfile({
    id: buildStudentProfileId(student.id),
    student: {
      fullName,
      givenName: person.givenName,
      familyName: person.familyName,
      inscriptionNumber: student.inscriptionNo,
      registrationNumber: latestEnrollment?.registrationNo || '',
      dateOfBirth: person.dob,
      nationality: passport?.passportNo ? passport.passportNo.slice(0, 2) : '',
      gender: person.gender === 'F' ? 'F' : person.gender === 'Other' ? 'Other' : 'M',
      profilePicture: fileLinks?.profilePictureUrl,
    },
    passport: {
      passportNumber: passport?.passportNo || '',
      issueDate: passport?.issueDate || '',
      expiryDate: passport?.expiry || '',
      issuingCountry: passport?.passportNo ? passport.passportNo.slice(0, 2) : '',
    },
    university: {
      universityName: university?.name || '',
      acronym: university?.acronym || '',
      campus: university?.address?.name || '',
      city: university?.address?.province?.name || '',
      department: department?.name || '',
    },
    program: {
      degreeLevel: programType?.name || '',
      major: program?.name || '',
      startDate: latestEnrollment?.dateEnrolled || '',
      expectedEndDate: calculateExpectedEnd(latestEnrollment?.dateEnrolled || '', programType?.defaultDuration),
      programType: programType?.name || '',
    },
    bankAccount: {
      accountHolderName: fullName,
      accountNumber: account?.accountNo || '',
      iban: bigIntToString(account?.rib),
      swiftCode: bank?.code ? String(bank.code) : '',
      dateCreated: account?.dateCreated || '',
    },
    bank: {
      bankName: bank?.name || '',
      branchName: branch?.name || '',
      branchAddress: branch?.address?.name || '',
      branchCode: branch?.code ? String(branch.code) : '',
    },
    contact: {
      email: getContactValue(person.contacts, 'EMAIL'),
      phone: getContactValue(person.contacts, 'PHONE'),
      emergencyContactName: getContactValue(person.contacts, 'EMERGENCY', 'name'),
      emergencyContactPhone: getContactValue(person.contacts, 'EMERGENCY', 'phone'),
    },
    address: {
      homeCountryAddress: formatAddress(person.homeAddress),
      currentHostAddress: formatAddress(student.address),
      street: student.address?.name || '',
      city: student.address?.province?.name || '',
      state: student.address?.province?.name || '',
      countryCode: '',
      wilaya: student.address?.province?.name || '',
    },
    status: normalizeStoredStatus(latestEnrollment?.status),
    academicHistory: (latestEnrollment?.progressRows || []).map((entry) => ({
      id: `progress-${entry.id}`,
      date: entry.date,
      year: entry.semester,
      level: entry.level,
      grade: entry.grade,
      status: entry.status,
      proofDocument: fileLinks?.proofDocumentsByProgressId.get(entry.id),
    })),
  });
}

async function loadUniversities(db: typeof prisma | DbTx = prisma): Promise<UniversityRow[]> {
  return db.university.findMany({
    include: universityInclude,
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
  });
}

async function getStudentRowById(studentId: number, db: typeof prisma | DbTx = prisma): Promise<StudentRow | null> {
  return db.student.findUnique({
    where: { id: studentId },
    include: studentInclude,
  });
}

async function getStudentRowByInscriptionNumber(
  inscriptionNumber: string,
  db: typeof prisma | DbTx = prisma,
): Promise<StudentRow | null> {
  return db.student.findUnique({
    where: { inscriptionNo: inscriptionNumber },
    include: studentInclude,
  });
}

async function hydrateStudentRow(student: StudentRow | null, db: typeof prisma | DbTx = prisma): Promise<StudentProfile | null> {
  if (!student) {
    return null;
  }

  const universities = await loadUniversities(db);
  const universityLookup = buildUniversityLookup(universities);
  const latestEnrollment = student.enrollments[0];
  const progressIds = latestEnrollment?.progressRows.map((entry) => entry.id) || [];
  const fileLinks = await listStudentFileLinks(student.id, progressIds, db);
  return mapStudentRow(student, universityLookup, fileLinks);
}

type SyncedProgressRow = {
  progressId: number;
  proofDocument?: string;
};

type SyncedEnrollmentResult = {
  enrollmentId: number;
  progressRows: SyncedProgressRow[];
} | null;

async function getOrCreateProvince(tx: DbTx, provinceName: string): Promise<number | null> {
  const normalized = provinceName.trim();
  if (!normalized) {
    return null;
  }

  const existing = await tx.province.findFirst({
    where: {
      name: {
        equals: normalized,
        mode: 'insensitive',
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (existing) {
    return existing.id;
  }

  const created = await tx.province.create({
    data: {
      name: normalized,
    },
  });

  return created.id;
}

async function getOrCreateAddress(tx: DbTx, addressName: string, provinceName: string): Promise<number | null> {
  const normalizedAddress = addressName.trim();
  if (!normalizedAddress) {
    return null;
  }

  const provinceId = await getOrCreateProvince(tx, provinceName.trim());
  const existing = await tx.address.findFirst({
    where: {
      AND: [
        {
          name: {
            equals: normalizedAddress,
            mode: 'insensitive',
          },
        },
        provinceId === null ? { wilayaId: null } : { wilayaId: provinceId },
      ],
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (existing) {
    return existing.id;
  }

  const created = await tx.address.create({
    data: {
      name: normalizedAddress,
      wilayaId: provinceId ?? undefined,
    },
  });

  return created.id;
}

async function getOrCreateDepartment(tx: DbTx, departmentName: string): Promise<number> {
  const normalized = departmentName.trim() || 'General Studies';
  const existing = await tx.department.findFirst({
    where: {
      name: {
        equals: normalized,
        mode: 'insensitive',
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (existing) {
    return existing.id;
  }

  const created = await tx.department.create({
    data: {
      name: normalized,
      description: `${normalized} department`,
    },
  });

  return created.id;
}

async function getOrCreateProgramType(tx: DbTx, programTypeName: string): Promise<number> {
  const normalized = programTypeName.trim() || 'Program';
  const existing = await tx.programType.findFirst({
    where: {
      name: {
        equals: normalized,
        mode: 'insensitive',
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (existing) {
    return existing.id;
  }

  const created = await tx.programType.create({
    data: {
      name: normalized,
      defaultDuration: 2,
    },
  });

  return created.id;
}

async function getOrCreateProgram(
  tx: DbTx,
  programName: string,
  departmentId: number,
  programTypeId: number,
): Promise<number> {
  const normalized = programName.trim() || 'General Studies';
  const existing = await tx.program.findFirst({
    where: {
      departmentId,
      programTypeId,
      name: {
        equals: normalized,
        mode: 'insensitive',
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (existing) {
    return existing.id;
  }

  const created = await tx.program.create({
    data: {
      name: normalized,
      description: normalized,
      departmentId,
      programTypeId,
    },
  });

  return created.id;
}

async function getOrCreateBank(tx: DbTx, bankName: string, bankCode: number, addressId: number | null): Promise<number> {
  const normalizedName = bankName.trim() || 'Default Bank';
  const normalizedCode = bankCode || 10000;
  const existing = await tx.bank.findFirst({
    where: {
      code: normalizedCode,
      name: {
        equals: normalizedName,
        mode: 'insensitive',
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (existing) {
    if (!existing.addressId && addressId) {
      await tx.bank.update({
        where: { id: existing.id },
        data: { addressId },
      });
    }
    return existing.id;
  }

  const created = await tx.bank.create({
    data: {
      name: normalizedName,
      code: normalizedCode,
      addressId: addressId ?? undefined,
    },
  });

  return created.id;
}

async function getOrCreateBranch(
  tx: DbTx,
  branchName: string,
  branchCode: number,
  addressId: number | null,
  bankId: number,
): Promise<number> {
  const normalizedName = branchName.trim() || 'Main Branch';
  const normalizedCode = branchCode || 1001;
  const existing = await tx.branch.findFirst({
    where: {
      bankId,
      code: normalizedCode,
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (existing) {
    await tx.branch.update({
      where: { id: existing.id },
      data: {
        name: normalizedName || existing.name,
        addressId: addressId ?? existing.addressId ?? undefined,
      },
    });
    return existing.id;
  }

  const created = await tx.branch.create({
    data: {
      name: normalizedName,
      code: normalizedCode,
      addressId: addressId ?? undefined,
      bankId,
    },
  });

  return created.id;
}

async function ensureUniversityReference(tx: DbTx, profile: StudentProfile): Promise<void> {
  const hasUniversityData = [
    profile.university.universityName,
    profile.university.acronym,
    profile.university.campus,
    profile.university.city,
  ].some(hasText);

  if (!hasUniversityData) {
    return;
  }

  const normalizedName = profile.university.universityName.trim();
  const normalizedAcronym = profile.university.acronym.trim();
  const addressId = await getOrCreateAddress(tx, profile.university.campus, profile.university.city);
  const existing = await tx.university.findFirst({
    where: {
      name: {
        equals: normalizedName || '',
        mode: 'insensitive',
      },
      acronym: {
        equals: normalizedAcronym || '',
        mode: 'insensitive',
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (existing) {
    await tx.university.update({
      where: { id: existing.id },
      data: {
        name: normalizedName || existing.name,
        acronym: normalizedAcronym || existing.acronym,
        addressId: existing.addressId ?? addressId ?? undefined,
      },
    });
    return;
  }

  await tx.university.create({
    data: {
      name: normalizedName || 'Unknown University',
      acronym: normalizedAcronym,
      addressId: addressId ?? undefined,
    },
  });
}

async function syncContact(
  tx: DbTx,
  ownerId: number,
  type: 'EMAIL' | 'PHONE' | 'EMERGENCY',
  label: 'primary' | 'mobile' | 'name' | 'phone',
  value: string,
  isPrimary: boolean,
): Promise<void> {
  const existing = await tx.contact.findFirst({
    where: {
      ownerId,
      type,
      label,
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (existing) {
    await tx.contact.update({
      where: { id: existing.id },
      data: {
        value,
        isPrimary,
      },
    });
    return;
  }

  await tx.contact.create({
    data: {
      ownerId,
      type,
      label,
      value,
      isPrimary,
      createdAt: new Date().toISOString(),
    },
  });
}

async function syncContacts(tx: DbTx, ownerId: number, profile: StudentProfile): Promise<void> {
  await syncContact(tx, ownerId, 'EMAIL', 'primary', profile.contact.email, true);
  await syncContact(tx, ownerId, 'PHONE', 'mobile', profile.contact.phone, true);
  await syncContact(tx, ownerId, 'EMERGENCY', 'name', profile.contact.emergencyContactName, false);
  await syncContact(tx, ownerId, 'EMERGENCY', 'phone', profile.contact.emergencyContactPhone, false);
}

async function syncPassport(tx: DbTx, personId: number, profile: StudentProfile): Promise<void> {
  const existing = await tx.passport.findFirst({
    where: { personId },
    orderBy: {
      id: 'asc',
    },
  });

  if (existing) {
    await tx.passport.update({
      where: { id: existing.id },
      data: {
        passportNo: profile.passport.passportNumber,
        issueDate: profile.passport.issueDate,
        expiry: profile.passport.expiryDate,
      },
    });
    return;
  }

  await tx.passport.create({
    data: {
      passportNo: profile.passport.passportNumber,
      issueDate: profile.passport.issueDate,
      expiry: profile.passport.expiryDate,
      personId,
    },
  });
}

function hasEnrollmentData(profile: StudentProfile, existingEnrollment: { id: number } | null): boolean {
  if (existingEnrollment) {
    return true;
  }

  return (
    hasText(profile.student.registrationNumber) ||
    hasText(profile.program.startDate) ||
    hasText(profile.program.major) ||
    hasText(profile.program.degreeLevel) ||
    hasText(profile.program.programType || '') ||
    hasText(profile.university.department || '') ||
    profile.status !== 'PENDING' ||
    Boolean(profile.academicHistory?.length)
  );
}

async function syncLatestEnrollment(
  tx: DbTx,
  studentId: number,
  profile: StudentProfile,
): Promise<SyncedEnrollmentResult> {
  const latestEnrollment = await tx.enrollment.findFirst({
    where: { studentId },
    orderBy: [{ dateEnrolled: 'desc' }, { id: 'desc' }],
  });

  if (!hasEnrollmentData(profile, latestEnrollment)) {
    return null;
  }

  const departmentId = await getOrCreateDepartment(tx, profile.university.department || '');
  const programTypeId = await getOrCreateProgramType(tx, profile.program.degreeLevel || profile.program.programType || '');
  const programId = await getOrCreateProgram(tx, profile.program.major || '', departmentId, programTypeId);
  const registrationNo =
    (profile.student.registrationNumber || '').trim() ||
    latestEnrollment?.registrationNo ||
    `REG-${new Date().getFullYear()}-${studentId}`;
  const dateEnrolled =
    profile.program.startDate.trim() || latestEnrollment?.dateEnrolled || new Date().toISOString().slice(0, 10);
  const status = toStoredStatus(profile.status);

  const enrollment = latestEnrollment
    ? await tx.enrollment.update({
        where: { id: latestEnrollment.id },
        data: {
          registrationNo,
          dateEnrolled,
          status,
          programId,
        },
      })
    : await tx.enrollment.create({
        data: {
          registrationNo,
          dateEnrolled,
          status,
          studentId,
          programId,
        },
      });

  if (profile.academicHistory === undefined) {
    return {
      enrollmentId: enrollment.id,
      progressRows: [],
    };
  }

  const existingProgressRows = await tx.progress.findMany({
    where: {
      enrollmentId: enrollment.id,
    },
    orderBy: [{ date: 'asc' }, { id: 'asc' }],
  });

  const syncedProgressRows: SyncedProgressRow[] = [];

  for (let index = 0; index < profile.academicHistory.length; index += 1) {
    const item = profile.academicHistory[index];
    const existingRow = existingProgressRows[index];
    const data = {
      date: item.date,
      semester: item.year,
      level: item.level,
      grade: item.grade,
      status: item.status || 'PENDING',
      enrollmentId: enrollment.id,
    };

    const progress = existingRow
      ? await tx.progress.update({
          where: { id: existingRow.id },
          data,
        })
      : await tx.progress.create({
          data,
        });

    syncedProgressRows.push({
      progressId: progress.id,
      proofDocument: item.proofDocument,
    });
  }

  const extraProgressRows = existingProgressRows.slice(profile.academicHistory.length);
  for (const progress of extraProgressRows) {
    await tx.progress.delete({
      where: { id: progress.id },
    });
  }

  return {
    enrollmentId: enrollment.id,
    progressRows: syncedProgressRows,
  };
}

function hasBankingData(profile: StudentProfile, existingAccount: { id: number } | null): boolean {
  if (existingAccount) {
    return true;
  }

  return [
    profile.bankAccount.accountNumber,
    profile.bankAccount.iban,
    profile.bankAccount.swiftCode,
    profile.bankAccount.dateCreated || '',
    profile.bank.bankName,
    profile.bank.branchName,
    profile.bank.branchAddress,
    profile.bank.branchCode,
  ].some(hasText);
}

async function syncBanking(tx: DbTx, personId: number, profile: StudentProfile): Promise<void> {
  const existingAccount = await tx.account.findFirst({
    where: { personId },
    orderBy: {
      id: 'desc',
    },
  });

  if (!hasBankingData(profile, existingAccount)) {
    return;
  }

  const provinceName = profile.address.wilaya || profile.address.city || profile.university.city || 'Unknown';
  const branchAddressId = await getOrCreateAddress(tx, profile.bank.branchAddress, provinceName);
  const bankId = await getOrCreateBank(
    tx,
    profile.bank.bankName,
    parseIntegerString(profile.bankAccount.swiftCode, 10000),
    branchAddressId,
  );
  const branchId = await getOrCreateBranch(
    tx,
    profile.bank.branchName,
    parseIntegerString(profile.bank.branchCode, 1001),
    branchAddressId,
    bankId,
  );

  const accountNo = profile.bankAccount.accountNumber.trim() || existingAccount?.accountNo || '';
  const rib = parseBigIntString(profile.bankAccount.iban, existingAccount?.rib ?? BigInt(0));
  const dateCreated =
    profile.bankAccount.dateCreated?.trim() || existingAccount?.dateCreated || new Date().toISOString().slice(0, 10);

  if (existingAccount) {
    await tx.account.update({
      where: { id: existingAccount.id },
      data: {
        accountNo,
        rib,
        dateCreated,
        branchId,
      },
    });
    return;
  }

  await tx.account.create({
    data: {
      accountNo,
      rib,
      currency: '',
      dateCreated,
      branchId,
      personId,
    },
  });
}

function getPrimaryProvinceName(profile: StudentProfile): string {
  return profile.address.wilaya || profile.address.city || profile.university.city || 'Unknown';
}

function getHomeAddressName(profile: StudentProfile): string {
  return profile.address.homeCountryAddress || profile.address.street || '';
}

function getCurrentAddressName(profile: StudentProfile): string {
  return profile.address.currentHostAddress || profile.address.street || '';
}

async function createStudentProfileTx(tx: DbTx, profile: StudentProfile): Promise<number> {
  const normalizedProfile = normalizeStudentProfile(profile);
  const provinceName = getPrimaryProvinceName(normalizedProfile);
  const homeAddressId = await getOrCreateAddress(tx, getHomeAddressName(normalizedProfile), provinceName);
  const currentAddressId = await getOrCreateAddress(tx, getCurrentAddressName(normalizedProfile), provinceName);
  const fullName = normalizedProfile.student.fullName || normalizedProfile.student.inscriptionNumber;

  const person = await tx.person.create({
    data: {
      givenName: normalizedProfile.student.givenName || fullName.split(' ')[0] || normalizedProfile.student.inscriptionNumber,
      familyName:
        normalizedProfile.student.familyName ||
        fullName.split(' ').slice(1).join(' ') ||
        'Student',
      dob: normalizedProfile.student.dateOfBirth,
      gender: normalizedProfile.student.gender,
      homeAddressId: homeAddressId ?? undefined,
    },
  });

  const student = await tx.student.create({
    data: {
      personId: person.id,
      inscriptionNo: normalizedProfile.student.inscriptionNumber,
      addressId: currentAddressId ?? undefined,
    },
  });

  await syncPassport(tx, person.id, normalizedProfile);
  await syncContacts(tx, person.id, normalizedProfile);
  await ensureUniversityReference(tx, normalizedProfile);
  const syncedEnrollment = await syncLatestEnrollment(tx, student.id, normalizedProfile);
  await syncBanking(tx, person.id, normalizedProfile);
  await syncManagedFilesTx({
    tx,
    studentId: student.id,
    personId: person.id,
    profile: normalizedProfile,
    syncedEnrollment,
    clearProfilePicture: false,
  });

  return student.id;
}

async function syncManagedFilesTx(params: {
  tx: DbTx;
  studentId: number;
  personId: number;
  profile: StudentProfile;
  syncedEnrollment: SyncedEnrollmentResult;
  clearProfilePicture: boolean;
}): Promise<void> {
  if (params.clearProfilePicture) {
    await clearStudentProfileImageTx(params.tx, params.studentId);
  } else {
    const profileImageFileId = extractFileIdFromReference(params.profile.student.profilePicture);
    if (profileImageFileId) {
      await attachProfileImageToStudentTx({
        tx: params.tx,
        studentId: params.studentId,
        personId: params.personId,
        fileId: profileImageFileId,
      });
    }
  }

  if (!params.syncedEnrollment) {
    return;
  }

  for (const row of params.syncedEnrollment.progressRows) {
    const proofFileId = extractFileIdFromReference(row.proofDocument);
    if (!proofFileId) {
      continue;
    }

    await attachResultSlipToProgressTx({
      tx: params.tx,
      studentId: params.studentId,
      personId: params.personId,
      enrollmentId: params.syncedEnrollment.enrollmentId,
      progressId: row.progressId,
      fileId: proofFileId,
    });
  }
}

async function updateStudentProfileTx(
  tx: DbTx,
  studentId: number,
  profile: StudentProfile,
  options: { clearProfilePicture: boolean },
): Promise<void> {
  const student = await tx.student.findUnique({
    where: { id: studentId },
    include: {
      person: true,
    },
  });

  if (!student) {
    throw new Error('Student profile not found.');
  }

  const normalizedProfile = normalizeStudentProfile(profile, {
    id: buildStudentProfileId(student.id),
    student: {
      inscriptionNumber: student.inscriptionNo,
    },
  });
  const provinceName = getPrimaryProvinceName(normalizedProfile);
  const homeAddressId = await getOrCreateAddress(tx, getHomeAddressName(normalizedProfile), provinceName);
  const currentAddressId = await getOrCreateAddress(tx, getCurrentAddressName(normalizedProfile), provinceName);

  await tx.person.update({
    where: { id: student.personId },
    data: {
      givenName: normalizedProfile.student.givenName,
      familyName: normalizedProfile.student.familyName,
      dob: normalizedProfile.student.dateOfBirth,
      gender: normalizedProfile.student.gender,
      homeAddressId: homeAddressId ?? undefined,
    },
  });

  await tx.student.update({
    where: { id: student.id },
    data: {
      addressId: currentAddressId ?? undefined,
    },
  });

  await syncPassport(tx, student.personId, normalizedProfile);
  await syncContacts(tx, student.personId, normalizedProfile);
  await ensureUniversityReference(tx, normalizedProfile);
  const syncedEnrollment = await syncLatestEnrollment(tx, student.id, normalizedProfile);
  await syncBanking(tx, student.personId, normalizedProfile);
  await syncManagedFilesTx({
    tx,
    studentId: student.id,
    personId: student.personId,
    profile: normalizedProfile,
    syncedEnrollment,
    clearProfilePicture: options.clearProfilePicture,
  });
}

async function clearNormalizedStudentData(tx: DbTx): Promise<void> {
  await tx.fileAsset.deleteMany();
  await tx.progress.deleteMany();
  await tx.enrollment.deleteMany();
  await tx.account.deleteMany();
  await tx.contact.deleteMany();
  await tx.passport.deleteMany();
  await tx.student.deleteMany();
  await tx.person.deleteMany();
  await tx.branch.deleteMany();
  await tx.bank.deleteMany();
  await tx.university.deleteMany();
  await tx.program.deleteMany();
  await tx.programType.deleteMany();
  await tx.department.deleteMany();
  await tx.address.deleteMany();
  await tx.province.deleteMany();
}

function dedupeProfiles(records: StudentProfile[]): StudentProfile[] {
  const byInscription = new Map<string, StudentProfile>();

  for (const record of records) {
    const normalized = normalizeStudentProfile(record);
    const inscriptionNumber = normalized.student.inscriptionNumber.trim().toUpperCase();
    if (!inscriptionNumber) {
      continue;
    }
    byInscription.set(inscriptionNumber, normalized);
  }

  return Array.from(byInscription.values());
}

export async function listStudentProfiles(): Promise<StudentProfile[]> {
  const [students, universities] = await Promise.all([
    prisma.student.findMany({
      include: studentInclude,
    }),
    loadUniversities(),
  ]);
  const universityLookup = buildUniversityLookup(universities);
  const fileLinksByStudentId = await listStudentFileLinksBatch(
    students.map((student) => ({
      studentId: student.id,
      progressIds: student.enrollments[0]?.progressRows.map((entry) => entry.id) || [],
    })),
  );

  const profiles = students.map((student) =>
    mapStudentRow(student, universityLookup, fileLinksByStudentId.get(student.id)),
  );

  return profiles
    .sort((left, right) =>
      left.student.fullName.localeCompare(right.student.fullName) ||
      left.student.inscriptionNumber.localeCompare(right.student.inscriptionNumber),
    );
}

export async function findStudentProfileById(id: string): Promise<StudentProfile | null> {
  const studentId = parseStudentProfileId(id);
  if (!studentId) {
    return null;
  }

  const student = await getStudentRowById(studentId);
  return hydrateStudentRow(student);
}

export async function findStudentProfileByInscriptionNumber(
  inscriptionNumber: string,
): Promise<StudentProfile | null> {
  const normalizedInscription = inscriptionNumber.trim().toUpperCase();
  if (!normalizedInscription) {
    return null;
  }

  const student = await getStudentRowByInscriptionNumber(normalizedInscription);
  return hydrateStudentRow(student);
}

export async function lookupStudentInscription(inscriptionNumber: string): Promise<boolean> {
  const normalizedInscription = inscriptionNumber.trim().toUpperCase();
  if (!normalizedInscription) {
    return false;
  }

  const count = await prisma.student.count({
    where: {
      inscriptionNo: normalizedInscription,
    },
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
  const existing = await getStudentRowByInscriptionNumber(normalizedInscription);
  if (existing) {
    return hydrateStudentRow(existing);
  }

  const profile = createEmptyStudentProfile({
    inscriptionNumber: normalizedInscription,
    fullName: normalizedInscription,
    status: 'PENDING',
  });

  const studentId = await prisma.$transaction(
    (tx) => createStudentProfileTx(tx, profile),
    STUDENT_WRITE_TRANSACTION_OPTIONS,
  );
  const created = await getStudentRowById(studentId);
  return hydrateStudentRow(created);
}

export async function updateStudentProfile(
  id: string,
  patch: Partial<StudentProfile>,
): Promise<StudentProfile> {
  const existing = await findStudentProfileById(id);
  if (!existing) {
    throw new Error('Student profile not found.');
  }

  const nextProfile = normalizeStudentProfile(mergeStudentProfile(existing, patch), {
    id: existing.id,
    status: existing.status,
    student: {
      inscriptionNumber: existing.student.inscriptionNumber,
      fullName: existing.student.fullName,
    },
  });

  nextProfile.student.inscriptionNumber = existing.student.inscriptionNumber;

  const studentId = parseStudentProfileId(existing.id);
  if (!studentId) {
    throw new Error('Student profile not found.');
  }

  const clearProfilePicture = patch.student?.profilePicture === '';
  const profilePictureTouched = Boolean(
    patch.student && Object.prototype.hasOwnProperty.call(patch.student, 'profilePicture'),
  );

  if (profilePictureTouched && !clearProfilePicture) {
    resolveFileIdFromReferenceOrThrow(
      typeof patch.student?.profilePicture === 'string' ? patch.student.profilePicture : '',
      'Profile picture',
    );
  }

  for (const [index, entry] of (nextProfile.academicHistory || []).entries()) {
    resolveFileIdFromReferenceOrThrow(
      entry.proofDocument,
      `Academic history item ${index + 1}`,
    );
  }

  await prisma.$transaction(
    (tx) =>
      updateStudentProfileTx(tx, studentId, nextProfile, {
        clearProfilePicture,
      }),
    STUDENT_WRITE_TRANSACTION_OPTIONS,
  );
  const updated = await findStudentProfileById(existing.id);

  if (!updated) {
    throw new Error('Student profile not found.');
  }

  return updated;
}

export async function deleteStudentProfiles(ids: string[]): Promise<void> {
  const studentIds = ids
    .map(parseStudentProfileId)
    .filter((value): value is number => Boolean(value));

  if (studentIds.length === 0) {
    return;
  }

  const students = await prisma.student.findMany({
    where: {
      id: {
        in: studentIds,
      },
    },
    select: {
      id: true,
      personId: true,
    },
  });

  if (students.length === 0) {
    return;
  }

  const personIds = students.map((student) => student.personId);
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId: {
        in: studentIds,
      },
    },
    select: {
      id: true,
    },
  });
  const enrollmentIds = enrollments.map((entry) => entry.id);

  await prisma.$transaction(
    async (tx) => {
      await tx.fileAsset.deleteMany({
        where: {
          studentId: {
            in: studentIds,
          },
        },
      });

      if (enrollmentIds.length > 0) {
        await tx.progress.deleteMany({
          where: {
            enrollmentId: {
              in: enrollmentIds,
            },
          },
        });
      }

      await tx.enrollment.deleteMany({
        where: {
          studentId: {
            in: studentIds,
          },
        },
      });
      await tx.account.deleteMany({
        where: {
          personId: {
            in: personIds,
          },
        },
      });
      await tx.contact.deleteMany({
        where: {
          ownerId: {
            in: personIds,
          },
        },
      });
      await tx.passport.deleteMany({
        where: {
          personId: {
            in: personIds,
          },
        },
      });
      await tx.student.deleteMany({
        where: {
          id: {
            in: studentIds,
          },
        },
      });
      await tx.person.deleteMany({
        where: {
          id: {
            in: personIds,
          },
        },
      });
    },
    STUDENT_WRITE_TRANSACTION_OPTIONS,
  );
}

export async function importStudentProfiles(
  records: StudentProfile[],
  mode: 'append' | 'replace',
): Promise<StudentProfile[]> {
  const dedupedProfiles = dedupeProfiles(records);

  if (mode === 'replace') {
    await prisma.$transaction(
      async (tx) => {
        await clearNormalizedStudentData(tx);

        for (const profile of dedupedProfiles) {
          await createStudentProfileTx(tx, normalizeStudentProfile(profile));
        }
      },
      STUDENT_WRITE_TRANSACTION_OPTIONS,
    );

    return listStudentProfiles();
  }

  for (const importedProfile of dedupedProfiles) {
    const normalized = normalizeStudentProfile(importedProfile);
    const existing = await prisma.student.findUnique({
      where: {
        inscriptionNo: normalized.student.inscriptionNumber,
      },
      include: studentInclude,
    });

    if (!existing) {
      await prisma.$transaction(
        (tx) => createStudentProfileTx(tx, normalized),
        STUDENT_WRITE_TRANSACTION_OPTIONS,
      );
      continue;
    }

    const currentProfile = await hydrateStudentRow(existing);
    if (!currentProfile) {
      continue;
    }

    const merged = normalizeStudentProfile(mergeStudentProfile(currentProfile, normalized), {
      id: currentProfile.id,
      status: currentProfile.status,
      student: {
        inscriptionNumber: currentProfile.student.inscriptionNumber,
        fullName: currentProfile.student.fullName,
      },
    });
    merged.student.inscriptionNumber = currentProfile.student.inscriptionNumber;

    await prisma.$transaction(
      (tx) =>
        updateStudentProfileTx(tx, existing.id, merged, {
          clearProfilePicture: false,
        }),
      STUDENT_WRITE_TRANSACTION_OPTIONS,
    );
  }

  return listStudentProfiles();
}
