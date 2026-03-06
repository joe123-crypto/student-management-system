import type { StudentProfile } from '@/types';
import { INITIAL_PROTOTYPE_DATABASE } from '@/mock/prototypeSeedData';
import type { BRANCH, PERSON, PrototypeDatabase } from '@/mock/prototypeSchema';
export type { PrototypeDatabase } from '@/mock/prototypeSchema';
export const PROTOTYPE_DATABASE_STORAGE_KEY = 'prototype_database_v2';
const REQUIRED_TABLES: (keyof PrototypeDatabase)[] = [
  'PERSON',
  'STUDENT',
  'PASSPORT',
  'CONTACT',
  'ADDRESS',
  'PROVINCE',
  'UNIVERSITY',
  'DEPARTMENT',
  'PROGRAMTYPE',
  'PROGRAM',
  'ENROLLMENT',
  'PROGRESS',
  'BANK',
  'BRANCH',
  'ACCOUNT',
];

export function isPrototypeDatabase(value: unknown): value is PrototypeDatabase {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Record<keyof PrototypeDatabase, unknown>>;
  return REQUIRED_TABLES.every((table) => Array.isArray(candidate[table]));
}

const cloneDatabase = (db: PrototypeDatabase): PrototypeDatabase => JSON.parse(JSON.stringify(db)) as PrototypeDatabase;

const nextId = <K extends keyof PrototypeDatabase>(db: PrototypeDatabase, table: K): number =>
  Math.max(0, ...db[table].map((row: { id: number }) => row.id)) + 1;

const buildFullName = (person: PERSON) => `${person.given_name} ${person.family_name}`.trim();

function getContactValue(db: PrototypeDatabase, ownerId: number, type: string, label?: string): string {
  const matches = db.CONTACT.filter(
    (contact) =>
      contact.owner_id === ownerId &&
      contact.type.toUpperCase() === type.toUpperCase() &&
      (label ? contact.label.toUpperCase() === label.toUpperCase() : true),
  );
  const primary = matches.find((item) => item.is_primary);
  return (primary || matches[0])?.value || '';
}

function getProvinceName(db: PrototypeDatabase, wilayaId: number | undefined): string {
  if (!wilayaId) return '';
  return db.PROVINCE.find((entry) => entry.id === wilayaId)?.name || '';
}

function getOrCreateAddress(db: PrototypeDatabase, name: string, provinceName: string): number {
  const normalizedName = name.trim();
  if (!normalizedName) return 0;

  const existingAddress = db.ADDRESS.find((address) => address.name.toLowerCase() === normalizedName.toLowerCase());
  if (existingAddress) return existingAddress.id;

  const existingProvince = db.PROVINCE.find((province) => province.name.toLowerCase() === provinceName.toLowerCase());
  const provinceId = existingProvince
    ? existingProvince.id
    : (() => {
      const id = nextId(db, 'PROVINCE');
      db.PROVINCE.push({ id, name: provinceName || 'Unknown Province' });
      return id;
    })();

  const id = nextId(db, 'ADDRESS');
  db.ADDRESS.push({ id, name: normalizedName, wilaya_id: provinceId });
  return id;
}

function getOrCreateDepartment(db: PrototypeDatabase, name: string): number {
  const normalizedName = name.trim();
  if (!normalizedName) return db.DEPARTMENT[0]?.id || 1;

  const existing = db.DEPARTMENT.find((department) => department.name.toLowerCase() === normalizedName.toLowerCase());
  if (existing) return existing.id;

  const id = nextId(db, 'DEPARTMENT');
  db.DEPARTMENT.push({ id, name: normalizedName, description: `${normalizedName} department` });
  return id;
}

function getOrCreateProgramType(db: PrototypeDatabase, name: string): number {
  const normalized = name.trim();
  const existing = db.PROGRAMTYPE.find((entry) => entry.name.toLowerCase() === normalized.toLowerCase());
  if (existing) return existing.id;

  const id = nextId(db, 'PROGRAMTYPE');
  db.PROGRAMTYPE.push({ id, name: normalized || 'Program', default_duration: 2 });
  return id;
}

function getOrCreateProgram(db: PrototypeDatabase, name: string, degreeLevel: string): number {
  const normalizedName = name.trim() || 'General Studies';
  const existing = db.PROGRAM.find((program) => program.name.toLowerCase() === normalizedName.toLowerCase());
  if (existing) return existing.id;

  const id = nextId(db, 'PROGRAM');
  const departmentId = getOrCreateDepartment(db, 'General Studies');
  const programTypeId = getOrCreateProgramType(db, degreeLevel || 'Program');
  db.PROGRAM.push({
    id,
    name: normalizedName,
    description: normalizedName,
    department_id: departmentId,
    programtype_id: programTypeId,
  });
  return id;
}

function upsertContact(
  db: PrototypeDatabase,
  ownerId: number,
  type: string,
  label: string,
  value: string,
  isPrimary: boolean,
): void {
  const existing = db.CONTACT.find(
    (entry) =>
      entry.owner_id === ownerId &&
      entry.type.toUpperCase() === type.toUpperCase() &&
      entry.label.toUpperCase() === label.toUpperCase(),
  );
  if (existing) {
    existing.value = value;
    existing.is_primary = isPrimary;
    return;
  }

  db.CONTACT.push({
    id: nextId(db, 'CONTACT'),
    owner_id: ownerId,
    type,
    value,
    label,
    is_primary: isPrimary,
    created_at: new Date().toISOString(),
  });
}

function toStatus(value: string): StudentProfile['status'] {
  const upper = value.toUpperCase();
  if (upper === 'ACTIVE' || upper === 'COMPLETED') return upper;
  return 'PENDING';
}

function calculateExpectedEnd(dateEnrolled: string, duration: number | undefined): string {
  if (!dateEnrolled) return '';
  const date = new Date(`${dateEnrolled}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  date.setUTCFullYear(date.getUTCFullYear() + (duration || 2));
  return date.toISOString().slice(0, 10);
}

function mergeStudentProfile(current: StudentProfile, patch: Partial<StudentProfile>): StudentProfile {
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

export function createPrototypeDatabase(): PrototypeDatabase {
  return cloneDatabase(INITIAL_PROTOTYPE_DATABASE);
}

export function getStudentProfilesFromDatabase(db: PrototypeDatabase): StudentProfile[] {
  return db.STUDENT.reduce<StudentProfile[]>((profiles, studentRow) => {
    const person = db.PERSON.find((entry) => entry.id === studentRow.person_id);
    if (!person) return profiles;

    const passport = db.PASSPORT.find((entry) => entry.person_id === person.id);
    const homeAddress = db.ADDRESS.find((entry) => entry.id === person.home_address_id);
    const currentAddress = db.ADDRESS.find((entry) => entry.id === studentRow.address_id);

    const enrollment = db.ENROLLMENT.filter((entry) => entry.student_id === studentRow.id).sort((a, b) =>
      b.date_enrolled.localeCompare(a.date_enrolled),
    )[0];
    const program = enrollment ? db.PROGRAM.find((entry) => entry.id === enrollment.program_id) : undefined;
    const programType = program ? db.PROGRAMTYPE.find((entry) => entry.id === program.programtype_id) : undefined;
    const department = program ? db.DEPARTMENT.find((entry) => entry.id === program.department_id) : undefined;

    const university =
      db.UNIVERSITY.find((entry) => entry.address_id === studentRow.address_id) ||
      db.UNIVERSITY.find((entry) => {
        const uniAddress = db.ADDRESS.find((address) => address.id === entry.address_id);
        return uniAddress?.wilaya_id === currentAddress?.wilaya_id;
      }) ||
      db.UNIVERSITY[0];

    const universityAddress = university ? db.ADDRESS.find((entry) => entry.id === university.address_id) : undefined;

    const account = db.ACCOUNT.find((entry) => entry.person_id === person.id);
    const branch = account ? db.BRANCH.find((entry) => entry.id === account.branch_id) : undefined;
    const bank = branch ? db.BANK.find((entry) => entry.id === branch.bank_id) : undefined;
    const branchAddress = branch ? db.ADDRESS.find((entry) => entry.id === branch.address_id) : undefined;

    const progressRows = enrollment
      ? db.PROGRESS.filter((entry) => entry.enrollment_id === enrollment.id).sort((a, b) => a.date.localeCompare(b.date))
      : [];

    const fullName = buildFullName(person);
    const email = getContactValue(db, person.id, 'EMAIL');
    const phone = getContactValue(db, person.id, 'PHONE');
    const emergencyName = getContactValue(db, person.id, 'EMERGENCY', 'name');
    const emergencyPhone = getContactValue(db, person.id, 'EMERGENCY', 'phone');
    const status = toStatus(enrollment?.status || 'PENDING');

    const profile: StudentProfile = {
      id: `student-${studentRow.id}`,
      student: {
        fullName,
        givenName: person.given_name,
        familyName: person.family_name,
        inscriptionNumber: studentRow.inscription_no,
        registrationNumber: enrollment?.registration_no,
        dateOfBirth: person.dob,
        nationality: passport?.passport_no ? passport.passport_no.slice(0, 2) : 'Unknown',
        gender: person.gender === 'F' ? 'F' : person.gender === 'Other' ? 'Other' : 'M',
      },
      passport: {
        passportNumber: passport?.passport_no || '',
        issueDate: passport?.issue_date || '',
        expiryDate: passport?.expiry || '',
        issuingCountry: passport?.passport_no ? passport.passport_no.slice(0, 2) : '',
      },
      university: {
        universityName: university?.name || '',
        acronym: university?.acronym || '',
        campus: universityAddress?.name || '',
        city: getProvinceName(db, universityAddress?.wilaya_id),
        department: department?.name || '',
      },
      program: {
        degreeLevel: programType?.name || '',
        major: program?.name || '',
        startDate: enrollment?.date_enrolled || '',
        expectedEndDate: calculateExpectedEnd(enrollment?.date_enrolled || '', programType?.default_duration),
      },
      bankAccount: {
        accountHolderName: fullName,
        accountNumber: account?.account_no || '',
        iban: account?.rib ? String(account.rib) : '',
        swiftCode: bank?.code ? String(bank.code) : '',
        dateCreated: account?.date_created || '',
      },
      bank: {
        bankName: bank?.name || '',
        branchName: branch?.name || '',
        branchAddress: branchAddress?.name || '',
        branchCode: branch?.code ? String(branch.code) : '',
      },
      contact: {
        email,
        phone,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
      },
      address: {
        homeCountryAddress: [homeAddress?.name, getProvinceName(db, homeAddress?.wilaya_id)].filter(Boolean).join(', '),
        currentHostAddress: [currentAddress?.name, getProvinceName(db, currentAddress?.wilaya_id)].filter(Boolean).join(', '),
      },
      status,
      academicHistory: progressRows.map((entry) => ({
        id: `progress-${entry.id}`,
        date: entry.date,
        year: entry.semester,
        level: entry.level,
        grade: entry.grade,
        status: entry.status,
      })),
    };

    profiles.push(profile);
    return profiles;
  }, []);
}

function addStudentProfileToDatabase(db: PrototypeDatabase, profile: StudentProfile): PrototypeDatabase {
  const nextDb = cloneDatabase(db);

  const homeAddressId = getOrCreateAddress(nextDb, profile.address.homeCountryAddress || 'Unknown address', 'Unknown');
  const currentAddressId = getOrCreateAddress(nextDb, profile.address.currentHostAddress || 'Unknown address', 'Unknown');

  const personId = nextId(nextDb, 'PERSON');
  nextDb.PERSON.push({
    id: personId,
    given_name: profile.student.givenName || profile.student.fullName.split(' ')[0] || '',
    family_name: profile.student.familyName || profile.student.fullName.split(' ').slice(1).join(' ') || '',
    dob: profile.student.dateOfBirth || '',
    gender: profile.student.gender || 'M',
    home_address_id: homeAddressId,
  });

  const studentId = nextId(nextDb, 'STUDENT');
  nextDb.STUDENT.push({
    id: studentId,
    person_id: personId,
    inscription_no: profile.student.inscriptionNumber || `INS-${new Date().getFullYear()}-${studentId}`,
    address_id: currentAddressId || homeAddressId,
  });

  nextDb.PASSPORT.push({
    id: nextId(nextDb, 'PASSPORT'),
    passport_no: profile.passport.passportNumber || '',
    issue_date: profile.passport.issueDate || '',
    expiry: profile.passport.expiryDate || '',
    person_id: personId,
  });

  upsertContact(nextDb, personId, 'EMAIL', 'primary', profile.contact.email, true);
  upsertContact(nextDb, personId, 'PHONE', 'mobile', profile.contact.phone || '', true);
  upsertContact(nextDb, personId, 'EMERGENCY', 'name', profile.contact.emergencyContactName || '', false);
  upsertContact(nextDb, personId, 'EMERGENCY', 'phone', profile.contact.emergencyContactPhone || '', false);

  const programId = getOrCreateProgram(nextDb, profile.program.major, profile.program.degreeLevel);
  nextDb.ENROLLMENT.push({
    id: nextId(nextDb, 'ENROLLMENT'),
    registration_no: profile.student.registrationNumber || `REG-${new Date().getFullYear()}-${studentId}`,
    date_enrolled: profile.program.startDate || new Date().toISOString().slice(0, 10),
    status: profile.status,
    student_id: studentId,
    program_id: programId,
  });

  const bankAddressId = getOrCreateAddress(nextDb, profile.bank.branchAddress || 'Default branch address', 'Unknown');
  let branch = nextDb.BRANCH.find((entry) => String(entry.code) === profile.bank.branchCode);
  if (!branch) {
    const bank = nextDb.BANK[0] || {
      id: 1,
      name: profile.bank.bankName || 'Default Bank',
      code: 10000,
      address_id: bankAddressId,
    };
    if (!nextDb.BANK.length) nextDb.BANK.push(bank);
    branch = {
      id: nextId(nextDb, 'BRANCH'),
      code: Number(profile.bank.branchCode) || 1001,
      name: profile.bank.branchName || 'Main Branch',
      address_id: bankAddressId,
      bank_id: bank.id,
    };
    nextDb.BRANCH.push(branch);
  }

  nextDb.ACCOUNT.push({
    id: nextId(nextDb, 'ACCOUNT'),
    account_no: profile.bankAccount.accountNumber || '',
    rib: Number(profile.bankAccount.iban) || 0,
    date_created: profile.bankAccount.dateCreated || new Date().toISOString().slice(0, 10),
    branch_id: branch.id,
    person_id: personId,
  });

  return nextDb;
}

export function updateStudentProfileInDatabase(
  db: PrototypeDatabase,
  studentProfileId: string,
  patch: Partial<StudentProfile>,
): PrototypeDatabase {
  const nextDb = cloneDatabase(db);
  const currentProfile = getStudentProfilesFromDatabase(nextDb).find((entry) => entry.id === studentProfileId);
  if (!currentProfile) return nextDb;

  const merged = mergeStudentProfile(currentProfile, patch);
  const studentId = Number(studentProfileId.replace('student-', ''));
  const studentRow = nextDb.STUDENT.find((entry) => entry.id === studentId);
  if (!studentRow) return nextDb;

  const person = nextDb.PERSON.find((entry) => entry.id === studentRow.person_id);
  if (!person) return nextDb;

  person.given_name = merged.student.givenName || person.given_name;
  person.family_name = merged.student.familyName || person.family_name;
  person.dob = merged.student.dateOfBirth || person.dob;
  person.gender = merged.student.gender || person.gender;

  studentRow.inscription_no = merged.student.inscriptionNumber || studentRow.inscription_no;
  const newHomeAddressId = getOrCreateAddress(nextDb, merged.address.homeCountryAddress || '', 'Unknown');
  if (newHomeAddressId) person.home_address_id = newHomeAddressId;
  const newCurrentAddressId = getOrCreateAddress(nextDb, merged.address.currentHostAddress || '', 'Unknown');
  if (newCurrentAddressId) studentRow.address_id = newCurrentAddressId;

  const passport = nextDb.PASSPORT.find((entry) => entry.person_id === person.id);
  if (passport) {
    passport.passport_no = merged.passport.passportNumber;
    passport.issue_date = merged.passport.issueDate;
    passport.expiry = merged.passport.expiryDate;
  } else {
    nextDb.PASSPORT.push({
      id: nextId(nextDb, 'PASSPORT'),
      passport_no: merged.passport.passportNumber || '',
      issue_date: merged.passport.issueDate || '',
      expiry: merged.passport.expiryDate || '',
      person_id: person.id,
    });
  }

  upsertContact(nextDb, person.id, 'EMAIL', 'primary', merged.contact.email, true);
  upsertContact(nextDb, person.id, 'PHONE', 'mobile', merged.contact.phone, true);
  upsertContact(nextDb, person.id, 'EMERGENCY', 'name', merged.contact.emergencyContactName, false);
  upsertContact(nextDb, person.id, 'EMERGENCY', 'phone', merged.contact.emergencyContactPhone, false);

  const enrollment =
    nextDb.ENROLLMENT.filter((entry) => entry.student_id === studentId).sort((a, b) =>
      b.date_enrolled.localeCompare(a.date_enrolled),
    )[0] || null;
  if (enrollment) {
    enrollment.status = merged.status;
    enrollment.registration_no = merged.student.registrationNumber || enrollment.registration_no;
    if (merged.program.startDate) enrollment.date_enrolled = merged.program.startDate;
    if (merged.program.major) {
      enrollment.program_id = getOrCreateProgram(nextDb, merged.program.major, merged.program.degreeLevel);
    }

    if (merged.academicHistory) {
      nextDb.PROGRESS = nextDb.PROGRESS.filter((entry) => entry.enrollment_id !== enrollment.id);
      merged.academicHistory.forEach((item) => {
        nextDb.PROGRESS.push({
          id: nextId(nextDb, 'PROGRESS'),
          date: item.date,
          semester: item.year,
          level: item.level,
          grade: item.grade,
          status: item.status,
          enrollment_id: enrollment.id,
        });
      });
    }
  }

  let account = nextDb.ACCOUNT.find((entry) => entry.person_id === person.id);
  if (!account) {
    account = {
      id: nextId(nextDb, 'ACCOUNT'),
      account_no: '',
      rib: 0,
      date_created: new Date().toISOString().slice(0, 10),
      branch_id: nextDb.BRANCH[0]?.id || 1,
      person_id: person.id,
    };
    nextDb.ACCOUNT.push(account);
  }

  account.account_no = merged.bankAccount.accountNumber || account.account_no;
  account.rib = Number(merged.bankAccount.iban) || account.rib;
  if (merged.bankAccount.dateCreated) account.date_created = merged.bankAccount.dateCreated;

  if (merged.bank.branchCode || merged.bank.branchName || merged.bank.branchAddress) {
    const branchAddressId = getOrCreateAddress(nextDb, merged.bank.branchAddress || 'Default branch address', 'Unknown');
    const existingBranch = nextDb.BRANCH.find((entry) => String(entry.code) === merged.bank.branchCode);
    if (existingBranch) {
      if (merged.bank.branchName) existingBranch.name = merged.bank.branchName;
      if (branchAddressId) existingBranch.address_id = branchAddressId;
      account.branch_id = existingBranch.id;
    } else {
      const bank = nextDb.BANK[0] || {
        id: 1,
        name: merged.bank.bankName || 'Default Bank',
        code: Number(merged.bankAccount.swiftCode) || 10000,
        address_id: branchAddressId,
      };
      if (!nextDb.BANK.length) nextDb.BANK.push(bank);
      const newBranch: BRANCH = {
        id: nextId(nextDb, 'BRANCH'),
        code: Number(merged.bank.branchCode) || 1001,
        name: merged.bank.branchName || 'Main Branch',
        address_id: branchAddressId || bank.address_id,
        bank_id: bank.id,
      };
      nextDb.BRANCH.push(newBranch);
      account.branch_id = newBranch.id;
    }
  }

  return nextDb;
}

export function deleteStudentsFromDatabase(db: PrototypeDatabase, studentProfileIds: string[]): PrototypeDatabase {
  const nextDb = cloneDatabase(db);
  const studentIds = new Set(studentProfileIds.map((value) => Number(value.replace('student-', ''))));
  const personIds = new Set(
    nextDb.STUDENT.filter((entry) => studentIds.has(entry.id)).map((entry) => entry.person_id),
  );
  const enrollmentIds = new Set(
    nextDb.ENROLLMENT.filter((entry) => studentIds.has(entry.student_id)).map((entry) => entry.id),
  );

  nextDb.PROGRESS = nextDb.PROGRESS.filter((entry) => !enrollmentIds.has(entry.enrollment_id));
  nextDb.ENROLLMENT = nextDb.ENROLLMENT.filter((entry) => !studentIds.has(entry.student_id));
  nextDb.ACCOUNT = nextDb.ACCOUNT.filter((entry) => !personIds.has(entry.person_id));
  nextDb.CONTACT = nextDb.CONTACT.filter((entry) => !personIds.has(entry.owner_id));
  nextDb.PASSPORT = nextDb.PASSPORT.filter((entry) => !personIds.has(entry.person_id));
  nextDb.STUDENT = nextDb.STUDENT.filter((entry) => !studentIds.has(entry.id));
  nextDb.PERSON = nextDb.PERSON.filter((entry) => !personIds.has(entry.id));

  return nextDb;
}

export function importStudentProfilesToDatabase(
  db: PrototypeDatabase,
  records: StudentProfile[],
  mode: 'append' | 'replace',
): PrototypeDatabase {
  const base =
    mode === 'replace'
      ? {
        ...cloneDatabase(db),
        PERSON: [],
        STUDENT: [],
        PASSPORT: [],
        CONTACT: [],
        ENROLLMENT: [],
        PROGRESS: [],
        ACCOUNT: [],
      }
      : cloneDatabase(db);

  return records.reduce((nextDb, profile) => addStudentProfileToDatabase(nextDb, profile), base);
}

