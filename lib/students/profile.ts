import type { ProgressDetails, StudentProfile } from '@/types';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function normalizeGender(value: unknown): StudentProfile['student']['gender'] {
  const normalized = stringValue(value).toUpperCase();
  if (normalized === 'F') return 'F';
  if (normalized === 'OTHER') return 'Other';
  return 'M';
}

function normalizeStatus(value: unknown): StudentProfile['status'] {
  const normalized = stringValue(value).toUpperCase();
  if (normalized === 'ACTIVE' || normalized === 'COMPLETED') return normalized;
  return 'PENDING';
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
      proofDocument: optionalString(record.proofDocument),
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
      registrationNumber: '',
      dateOfBirth: '',
      nationality: '',
      gender: 'M',
    },
    passport: {
      passportNumber: '',
      issueDate: '',
      expiryDate: '',
      issuingCountry: '',
    },
    university: {
      universityName: '',
      acronym: '',
      campus: '',
      city: '',
      department: '',
    },
    program: {
      degreeLevel: '',
      major: '',
      startDate: '',
      expectedEndDate: '',
      programType: '',
    },
    bankAccount: {
      accountHolderName: fullName,
      accountNumber: '',
      iban: '',
      swiftCode: '',
      dateCreated: '',
    },
    bank: {
      bankName: '',
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
      street: '',
      city: '',
      state: '',
      countryCode: '',
      wilaya: '',
    },
    status: seed.status || 'PENDING',
    academicHistory: [],
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
  const hasProfilePicture = Object.prototype.hasOwnProperty.call(student, 'profilePicture');
  const hasStatus = Object.prototype.hasOwnProperty.call(record, 'status');

  const normalized = mergeStudentProfile(base, {
    id: stringValue(record.id, base.id),
    student: {
      fullName: stringValue(student.fullName, base.student.fullName),
      givenName: stringValue(student.givenName, base.student.givenName),
      familyName: stringValue(student.familyName, base.student.familyName),
      inscriptionNumber: stringValue(student.inscriptionNumber, base.student.inscriptionNumber),
      registrationNumber: stringValue(student.registrationNumber, base.student.registrationNumber),
      dateOfBirth: stringValue(student.dateOfBirth, base.student.dateOfBirth),
      nationality: stringValue(student.nationality, base.student.nationality),
      gender:
        Object.prototype.hasOwnProperty.call(student, 'gender')
          ? normalizeGender(student.gender)
          : base.student.gender,
      profilePicture: hasProfilePicture ? optionalString(student.profilePicture) : base.student.profilePicture,
    },
    passport: {
      passportNumber: stringValue(passport.passportNumber, base.passport.passportNumber),
      issueDate: stringValue(passport.issueDate, base.passport.issueDate),
      expiryDate: stringValue(passport.expiryDate, base.passport.expiryDate),
      issuingCountry: stringValue(passport.issuingCountry, base.passport.issuingCountry),
    },
    university: {
      universityName: stringValue(university.universityName, base.university.universityName),
      acronym: stringValue(university.acronym, base.university.acronym),
      campus: stringValue(university.campus, base.university.campus),
      city: stringValue(university.city, base.university.city),
      department: stringValue(university.department, base.university.department),
    },
    program: {
      degreeLevel: stringValue(program.degreeLevel, base.program.degreeLevel),
      major: stringValue(program.major, base.program.major),
      startDate: stringValue(program.startDate, base.program.startDate),
      expectedEndDate: stringValue(program.expectedEndDate, base.program.expectedEndDate),
      programType: stringValue(program.programType, base.program.programType),
    },
    bankAccount: {
      accountHolderName: stringValue(bankAccount.accountHolderName, base.bankAccount.accountHolderName),
      accountNumber: stringValue(bankAccount.accountNumber, base.bankAccount.accountNumber),
      iban: stringValue(bankAccount.iban, base.bankAccount.iban),
      swiftCode: stringValue(bankAccount.swiftCode, base.bankAccount.swiftCode),
      dateCreated: stringValue(bankAccount.dateCreated, base.bankAccount.dateCreated),
    },
    bank: {
      bankName: stringValue(bank.bankName, base.bank.bankName),
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
      street: stringValue(address.street, base.address.street),
      city: stringValue(address.city, base.address.city),
      state: stringValue(address.state, base.address.state),
      countryCode: stringValue(address.countryCode, base.address.countryCode),
      wilaya: stringValue(address.wilaya, base.address.wilaya),
    },
    status: hasStatus ? normalizeStatus(record.status) : base.status,
    academicHistory: normalizeAcademicHistory(record.academicHistory, base.academicHistory),
  });

  normalized.id = normalized.id || base.id;
  normalized.student.inscriptionNumber = normalized.student.inscriptionNumber.trim().toUpperCase();
  normalized.contact.email = normalized.contact.email.trim().toLowerCase();
  normalized.student.fullName = buildFullName(
    normalized.student.givenName,
    normalized.student.familyName,
    normalized.student.fullName || normalized.student.inscriptionNumber,
  );
  normalized.bankAccount.accountHolderName =
    normalized.bankAccount.accountHolderName || normalized.student.fullName;
  normalized.status = normalizeStatus(normalized.status);

  return normalized;
}

export function getMissingStudentOnboardingFields(student: StudentProfile | null): string[] {
  if (!student) {
    return ['student profile'];
  }

  const missingFields: string[] = [];

  if (!hasText(student.bank.bankName)) {
    missingFields.push('bank name');
  }

  if (!hasText(student.bank.branchCode)) {
    missingFields.push('branch code');
  }

  if (!hasText(student.bankAccount.accountNumber)) {
    missingFields.push('account number');
  }

  if (!hasText(student.bankAccount.iban)) {
    missingFields.push('RIB key');
  }

  return missingFields;
}

export function requiresStudentOnboarding(student: StudentProfile | null): boolean {
  return getMissingStudentOnboardingFields(student).length > 0;
}
