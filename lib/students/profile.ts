import type { ProgressDetails, StudentProfile } from '@/types';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export class StudentSelfServicePatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudentSelfServicePatchError';
  }
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function numberValue(value: unknown, fallback?: number): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function parseMoyenne(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function normalizeGender(value: unknown): StudentProfile['student']['gender'] {
  const normalized = stringValue(value).trim().toUpperCase();
  if (normalized === 'F' || normalized === 'FEMALE') return 'Female';
  if (normalized === 'OTHER') return 'Other';
  return 'Male';
}

function normalizeStatus(value: unknown): StudentProfile['status'] {
  return stringValue(value).trim() || 'pending';
}

function buildFullName(givenName: string, familyName: string, fallback = ''): string {
  const combined = `${givenName} ${familyName}`.trim();
  return combined || fallback;
}

function normalizeAcademicHistory(
  value: unknown,
  fallback: ProgressDetails[] = [],
): ProgressDetails[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.map((entry, index) => {
    const record = isRecord(entry) ? entry : {};
    return {
      id: stringValue(record.id, fallback[index]?.id || `progress-${index + 1}`),
      date: stringValue(record.date, fallback[index]?.date || ''),
      year: stringValue(record.year, fallback[index]?.year || ''),
      level: stringValue(record.level, fallback[index]?.level || ''),
      grade: stringValue(record.grade, fallback[index]?.grade || ''),
      status: stringValue(record.status, fallback[index]?.status || 'PENDING'),
      stageCode: optionalString(record.stageCode) || fallback[index]?.stageCode,
      academicYear: optionalString(record.academicYear) || fallback[index]?.academicYear,
      statusDate: optionalString(record.statusDate) || fallback[index]?.statusDate,
      resultStatus: optionalString(record.resultStatus) || fallback[index]?.resultStatus,
      moyenne:
        parseMoyenne(record.moyenne) ??
        parseMoyenne(record.grade) ??
        parseMoyenne(record.resultStatus) ??
        fallback[index]?.moyenne,
      proofDocument: optionalString(record.proofDocument),
    };
  });
}

function normalizeProgramAwards(
  value: unknown,
  fallback: NonNullable<StudentProfile['studentAwards']> = [],
): NonNullable<StudentProfile['studentAwards']> {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.map((entry, index) => {
    const record = isRecord(entry) ? entry : {};
    return {
      id: stringValue(record.id, fallback[index]?.id || `award-${index + 1}`),
      code: stringValue(record.code, fallback[index]?.code || ''),
      label: stringValue(record.label, fallback[index]?.label || ''),
      sequenceNo: numberValue(record.sequenceNo, fallback[index]?.sequenceNo || index + 1) || index + 1,
      nominalYear: numberValue(record.nominalYear, fallback[index]?.nominalYear || 1) || 1,
      status: optionalString(record.status) || fallback[index]?.status,
      awardDate: optionalString(record.awardDate) || fallback[index]?.awardDate,
    };
  });
}

type StudentProfileSeed = {
  id?: string;
  inscriptionNumber?: string;
  fullName?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  status?: StudentProfile['status'];
};

type StudentProfileFallback = {
  id?: string;
  status?: StudentProfile['status'];
  student?: Partial<StudentProfile['student']>;
  contact?: Partial<StudentProfile['contact']>;
};

export function createEmptyStudentProfile(seed: StudentProfileSeed = {}): StudentProfile {
  const inscriptionNumber = (seed.inscriptionNumber || '').trim().toUpperCase();
  const givenName = (seed.givenName || '').trim() || (seed.fullName?.trim().split(' ')[0] || 'New');
  const familyName =
    (seed.familyName || '').trim() || (seed.fullName?.trim().split(' ').slice(1).join(' ') || 'Student');
  const fullName = (seed.fullName || '').trim() || buildFullName(givenName, familyName, inscriptionNumber);
  const email = (seed.email || '').trim().toLowerCase();

  return {
    id: seed.id || '',
    student: {
      fullName,
      givenName,
      familyName,
      inscriptionNumber,
      dateOfBirth: '',
      gender: 'Male',
    },
    passport: {
      passportNumber: '',
      nationality: '',
      issueDate: '',
      expiryDate: '',
      issuingCountry: '',
    },
    university: {
      universityName: '',
      acronym: '',
      city: '',
      department: '',
    },
    program: {
      degreeLevel: '',
      major: '',
      startDate: '',
      expectedEndDate: '',
      systemType: '',
      durationYears: undefined,
      awards: [],
    },
    bankAccount: {
      accountNumber: '',
      iban: '',
      dateCreated: '',
    },
    bank: {
      bankName: '',
      bankCode: '',
      branchName: '',
      branchAddress: '',
      branchCode: '',
    },
    contact: {
      email,
      phone: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    },
    address: {
      homeCountryAddress: '',
      currentHostAddress: '',
      wilaya: '',
      country: '',
    },
    status: seed.status || 'pending',
    academicHistory: [],
    studentAwards: [],
  };
}

export function mergeStudentProfile(current: StudentProfile, patch: Partial<StudentProfile>): StudentProfile {
  return {
    ...current,
    ...patch,
    student: { ...current.student, ...(patch.student || {}) },
    passport: { ...current.passport, ...(patch.passport || {}) },
    university: { ...current.university, ...(patch.university || {}) },
    program: { ...current.program, ...(patch.program || {}) },
    bankAccount: { ...current.bankAccount, ...(patch.bankAccount || {}) },
    bank: { ...current.bank, ...(patch.bank || {}) },
    contact: { ...current.contact, ...(patch.contact || {}) },
    address: { ...current.address, ...(patch.address || {}) },
    academicHistory: patch.academicHistory ?? current.academicHistory,
    studentAwards: patch.studentAwards ?? current.studentAwards,
  };
}

export function normalizeStudentProfile(
  input: unknown,
  fallback: StudentProfileFallback = {},
): StudentProfile {
  const fallbackStudent: UnknownRecord = isRecord(fallback.student) ? fallback.student : {};
  const fallbackContact: UnknownRecord = isRecord(fallback.contact) ? fallback.contact : {};
  const base = createEmptyStudentProfile({
    id: stringValue(fallback.id),
    inscriptionNumber: stringValue(fallbackStudent.inscriptionNumber),
    fullName: stringValue(fallbackStudent.fullName),
    givenName: stringValue(fallbackStudent.givenName),
    familyName: stringValue(fallbackStudent.familyName),
    email: stringValue(fallbackContact.email),
    status: normalizeStatus(fallback.status),
  });

  const record = isRecord(input) ? input : {};
  const student = isRecord(record.student) ? record.student : {};
  const passport = isRecord(record.passport) ? record.passport : {};
  const university = isRecord(record.university) ? record.university : {};
  const program = isRecord(record.program) ? record.program : {};
  const bankAccount = isRecord(record.bankAccount) ? record.bankAccount : {};
  const bank = isRecord(record.bank) ? record.bank : {};
  const contact = isRecord(record.contact) ? record.contact : {};
  const address = isRecord(record.address) ? record.address : {};
  const studentAwards = normalizeProgramAwards(record.studentAwards, base.studentAwards);
  const hasProfilePicture = Object.prototype.hasOwnProperty.call(student, 'profilePicture');
  const hasStatus = Object.prototype.hasOwnProperty.call(record, 'status');

  const normalized = mergeStudentProfile(base, {
    id: stringValue(record.id, base.id),
    student: {
      fullName: stringValue(student.fullName, base.student.fullName),
      givenName: stringValue(student.givenName, base.student.givenName),
      familyName: stringValue(student.familyName, base.student.familyName),
      inscriptionNumber: stringValue(student.inscriptionNumber, base.student.inscriptionNumber),
      dateOfBirth: stringValue(student.dateOfBirth, base.student.dateOfBirth),
      gender:
        Object.prototype.hasOwnProperty.call(student, 'gender')
          ? normalizeGender(student.gender)
          : base.student.gender,
      profilePicture: hasProfilePicture ? optionalString(student.profilePicture) : base.student.profilePicture,
    },
    passport: {
      passportNumber: stringValue(passport.passportNumber, base.passport.passportNumber),
      nationality: stringValue(passport.nationality, base.passport.nationality),
      issueDate: stringValue(passport.issueDate, base.passport.issueDate),
      expiryDate: stringValue(passport.expiryDate, base.passport.expiryDate),
      issuingCountry: stringValue(passport.issuingCountry, base.passport.issuingCountry),
    },
    university: {
      universityName: stringValue(university.universityName, base.university.universityName),
      acronym: stringValue(university.acronym, base.university.acronym),
      city: stringValue(university.city, base.university.city),
      department: stringValue(university.department, base.university.department),
    },
    program: {
      degreeLevel: stringValue(program.degreeLevel, base.program.degreeLevel),
      major: stringValue(program.major, base.program.major),
      startDate: stringValue(program.startDate, base.program.startDate),
      expectedEndDate: stringValue(program.expectedEndDate, base.program.expectedEndDate),
      systemType: stringValue(program.systemType, base.program.systemType),
      durationYears: numberValue(program.durationYears, base.program.durationYears),
      awards: normalizeProgramAwards(program.awards, base.program.awards),
    },
    bankAccount: {
      accountNumber: stringValue(bankAccount.accountNumber, base.bankAccount.accountNumber),
      iban: stringValue(bankAccount.iban, base.bankAccount.iban),
      dateCreated: stringValue(bankAccount.dateCreated, base.bankAccount.dateCreated),
    },
    bank: {
      bankName: stringValue(bank.bankName, base.bank.bankName),
      bankCode: stringValue(bank.bankCode, base.bank.bankCode),
      branchName: stringValue(bank.branchName, base.bank.branchName),
      branchAddress: stringValue(bank.branchAddress, base.bank.branchAddress),
      branchCode: stringValue(bank.branchCode, base.bank.branchCode),
    },
    contact: {
      email: stringValue(contact.email, base.contact.email),
      phone: stringValue(contact.phone, base.contact.phone),
      emergencyContactName: stringValue(contact.emergencyContactName, base.contact.emergencyContactName),
      emergencyContactPhone: stringValue(contact.emergencyContactPhone, base.contact.emergencyContactPhone),
    },
    address: {
      homeCountryAddress: stringValue(address.homeCountryAddress, base.address.homeCountryAddress),
      currentHostAddress: stringValue(address.currentHostAddress, base.address.currentHostAddress),
      wilaya: stringValue(address.wilaya, base.address.wilaya),
      country: stringValue(address.country, base.address.country),
    },
    status: hasStatus ? normalizeStatus(record.status) : base.status,
    academicHistory: normalizeAcademicHistory(record.academicHistory, base.academicHistory),
    studentAwards,
  });

  normalized.id = normalized.id || base.id;
  normalized.student.inscriptionNumber = normalized.student.inscriptionNumber.trim().toUpperCase();
  normalized.contact.email = normalized.contact.email.trim().toLowerCase();
  normalized.student.fullName = buildFullName(
    normalized.student.givenName,
    normalized.student.familyName,
    normalized.student.fullName || normalized.student.inscriptionNumber,
  );
  normalized.status = normalizeStatus(normalized.status);

  return normalized;
}

function sanitizeStringFields<T extends string>(
  value: unknown,
  allowedFields: readonly T[],
): Partial<Record<T, string>> {
  if (!isRecord(value)) {
    return {};
  }

  const next: Partial<Record<T, string>> = {};

  for (const field of allowedFields) {
    const candidate = value[field];
    if (typeof candidate === 'string') {
      next[field] = candidate;
    }
  }

  return next;
}

function academicHistoryMatches(
  left: ProgressDetails | undefined,
  right: ProgressDetails | undefined,
): boolean {
  return (
    left?.id === right?.id &&
    left?.date === right?.date &&
    left?.year === right?.year &&
    left?.level === right?.level &&
    left?.grade === right?.grade &&
    left?.status === right?.status &&
    left?.stageCode === right?.stageCode &&
    left?.academicYear === right?.academicYear &&
    left?.statusDate === right?.statusDate &&
    left?.resultStatus === right?.resultStatus &&
    left?.moyenne === right?.moyenne
  );
}

export function sanitizeStudentSelfServicePatch(
  existing: StudentProfile,
  patch: unknown,
): Partial<StudentProfile> {
  if (!isRecord(patch)) {
    throw new StudentSelfServicePatchError('Invalid student patch.');
  }

  const sanitized: Partial<StudentProfile> = {};

  const studentFields = sanitizeStringFields(patch.student, ['profilePicture'] as const);
  if (Object.keys(studentFields).length > 0) {
    sanitized.student = {
      profilePicture: studentFields.profilePicture,
    } as StudentProfile['student'];
  }

  const bankFields = sanitizeStringFields(
    patch.bank,
    ['bankName', 'bankCode', 'branchName', 'branchAddress', 'branchCode'] as const,
  );
  if (Object.keys(bankFields).length > 0) {
    sanitized.bank = {
      bankName: bankFields.bankName ?? existing.bank.bankName,
      bankCode: bankFields.bankCode ?? existing.bank.bankCode,
      branchName: bankFields.branchName ?? existing.bank.branchName,
      branchAddress: bankFields.branchAddress ?? existing.bank.branchAddress,
      branchCode: bankFields.branchCode ?? existing.bank.branchCode,
    };
  }

  const bankAccountFields = sanitizeStringFields(
    patch.bankAccount,
    ['accountNumber', 'iban', 'dateCreated'] as const,
  );
  if (Object.keys(bankAccountFields).length > 0) {
    sanitized.bankAccount = {
      accountNumber: bankAccountFields.accountNumber ?? existing.bankAccount.accountNumber,
      iban: bankAccountFields.iban ?? existing.bankAccount.iban,
      dateCreated: bankAccountFields.dateCreated ?? existing.bankAccount.dateCreated,
    };
  }

  const contactFields = sanitizeStringFields(
    patch.contact,
    ['email', 'phone', 'emergencyContactName', 'emergencyContactPhone'] as const,
  );
  if (Object.keys(contactFields).length > 0) {
    sanitized.contact = {
      email: contactFields.email ?? existing.contact.email,
      phone: contactFields.phone ?? existing.contact.phone,
      emergencyContactName: contactFields.emergencyContactName ?? existing.contact.emergencyContactName,
      emergencyContactPhone: contactFields.emergencyContactPhone ?? existing.contact.emergencyContactPhone,
    };
  }

  const addressFields = sanitizeStringFields(
    patch.address,
    ['homeCountryAddress', 'currentHostAddress', 'wilaya', 'country'] as const,
  );
  if (Object.keys(addressFields).length > 0) {
    sanitized.address = {
      homeCountryAddress: addressFields.homeCountryAddress ?? existing.address.homeCountryAddress,
      currentHostAddress: addressFields.currentHostAddress ?? existing.address.currentHostAddress,
      wilaya: addressFields.wilaya ?? existing.address.wilaya,
      country: addressFields.country ?? existing.address.country,
    };
  }

  if (Array.isArray(patch.academicHistory)) {
    const existingHistory = existing.academicHistory ?? [];
    const normalizedIncoming = normalizeAcademicHistory(patch.academicHistory, existingHistory);

    if (normalizedIncoming.length < existingHistory.length) {
      throw new StudentSelfServicePatchError('Existing academic records cannot be removed.');
    }

    for (let index = 0; index < existingHistory.length; index += 1) {
      if (!academicHistoryMatches(normalizedIncoming[index], existingHistory[index])) {
        throw new StudentSelfServicePatchError('Existing academic records cannot be edited directly.');
      }
    }

    const appendedHistory = normalizedIncoming.slice(existingHistory.length).map((entry, index) => {
      const year = entry.year.trim();
      const level = entry.level.trim();
      const grade = entry.grade.trim();

      if (!year || !level || !grade) {
        throw new StudentSelfServicePatchError(
          'New academic submissions must include year, level, and grade.',
        );
      }

      return {
        id: entry.id || `submission-${existingHistory.length + index + 1}`,
        date: entry.date || new Date().toISOString().slice(0, 10),
        year,
        level,
        grade,
        status: 'PENDING',
        stageCode: entry.stageCode || level,
        academicYear: entry.academicYear || year,
        statusDate: entry.statusDate || entry.date || new Date().toISOString().slice(0, 10),
        resultStatus: entry.resultStatus || grade,
        moyenne: parseMoyenne(entry.moyenne) ?? parseMoyenne(grade) ?? parseMoyenne(entry.resultStatus),
        proofDocument: entry.proofDocument,
      };
    });

    if (appendedHistory.length > 0) {
      sanitized.academicHistory = [...existingHistory, ...appendedHistory];
    }
  }

  if (Object.keys(sanitized).length === 0) {
    throw new StudentSelfServicePatchError('No allowed student profile changes were provided.');
  }

  return sanitized;
}

export function getMissingStudentOnboardingFields(student: StudentProfile | null): string[] {
  if (!student) {
    return ['student profile'];
  }

  // Bank details are no longer required during onboarding.
  // Students can add them later from their dashboard.
  return [];
}

export function requiresStudentOnboarding(student: StudentProfile | null): boolean {
  return getMissingStudentOnboardingFields(student).length > 0;
}
