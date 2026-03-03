import type { StudentProfile } from '@/types';

interface PERSON {
  id: number;
  given_name: string;
  family_name: string;
  dob: string;
  gender: string;
  home_address_id: number;
}

interface STUDENT {
  id: number;
  person_id: number;
  inscription_no: string;
  address_id: number;
}

interface PASSPORT {
  id: number;
  passport_no: string;
  issue_date: string;
  expiry: string;
  person_id: number;
}

interface CONTACT {
  id: number;
  owner_id: number;
  type: string;
  value: string;
  label: string;
  is_primary: boolean;
  created_at: string;
}

interface ADDRESS {
  id: number;
  name: string;
  wilaya_id: number;
}

interface PROVINCE {
  id: number;
  name: string;
}

interface UNIVERSITY {
  id: number;
  name: string;
  acronym: string;
  address_id: number;
}

interface DEPARTMENT {
  id: number;
  name: string;
  description: string;
}

interface PROGRAMTYPE {
  id: number;
  name: string;
  default_duration: number;
}

interface PROGRAM {
  id: number;
  name: string;
  description: string;
  department_id: number;
  programtype_id: number;
}

interface ENROLLMENT {
  id: number;
  registration_no: string;
  date_enrolled: string;
  status: string;
  student_id: number;
  program_id: number;
}

interface PROGRESS {
  id: number;
  date: string;
  semester: string;
  level: string;
  grade: string;
  status: string;
  enrollment_id: number;
}

interface BANK {
  id: number;
  name: string;
  code: number;
  address_id: number;
}

interface BRANCH {
  id: number;
  code: number;
  name: string;
  address_id: number;
  bank_id: number;
}

interface ACCOUNT {
  id: number;
  account_no: string;
  rib: number;
  date_created: string;
  branch_id: number;
  person_id: number;
}

export interface PrototypeDatabase {
  PERSON: PERSON[];
  STUDENT: STUDENT[];
  PASSPORT: PASSPORT[];
  CONTACT: CONTACT[];
  ADDRESS: ADDRESS[];
  PROVINCE: PROVINCE[];
  UNIVERSITY: UNIVERSITY[];
  DEPARTMENT: DEPARTMENT[];
  PROGRAMTYPE: PROGRAMTYPE[];
  PROGRAM: PROGRAM[];
  ENROLLMENT: ENROLLMENT[];
  PROGRESS: PROGRESS[];
  BANK: BANK[];
  BRANCH: BRANCH[];
  ACCOUNT: ACCOUNT[];
}

export const PROTOTYPE_DATABASE_STORAGE_KEY = 'prototype_database_v1';

const now = '2026-02-26T10:00:00Z';

const INITIAL_DATABASE: PrototypeDatabase = {
  PERSON: [
    { id: 1, given_name: 'Jean', family_name: 'Dupont', dob: '1998-05-12', gender: 'M', home_address_id: 1 },
    { id: 2, given_name: 'Amina', family_name: 'Al-Farsi', dob: '2000-02-28', gender: 'F', home_address_id: 2 },
    { id: 3, given_name: 'Karim', family_name: 'Bensaid', dob: '1999-11-10', gender: 'M', home_address_id: 3 },
    { id: 4, given_name: 'Leila', family_name: 'Mansouri', dob: '2001-03-19', gender: 'F', home_address_id: 4 },
    { id: 5, given_name: 'Samir', family_name: 'Haddad', dob: '1997-07-07', gender: 'M', home_address_id: 5 },
  ],
  STUDENT: [
    { id: 1, person_id: 1, inscription_no: 'INS-2023-001', address_id: 6 },
    { id: 2, person_id: 2, inscription_no: 'INS-2023-042', address_id: 7 },
    { id: 3, person_id: 3, inscription_no: 'INS-2024-011', address_id: 8 },
    { id: 4, person_id: 4, inscription_no: 'INS-2024-037', address_id: 9 },
    { id: 5, person_id: 5, inscription_no: 'INS-2022-099', address_id: 10 },
  ],
  PASSPORT: [
    { id: 1, passport_no: 'FR123456', issue_date: '2018-10-10', expiry: '2028-10-10', person_id: 1 },
    { id: 2, passport_no: 'OM987654', issue_date: '2020-01-01', expiry: '2030-01-01', person_id: 2 },
    { id: 3, passport_no: 'DZ661122', issue_date: '2019-03-15', expiry: '2029-03-15', person_id: 3 },
    { id: 4, passport_no: 'DZ993344', issue_date: '2021-06-02', expiry: '2031-06-02', person_id: 4 },
    { id: 5, passport_no: 'DZ776655', issue_date: '2017-09-20', expiry: '2027-09-20', person_id: 5 },
  ],
  CONTACT: [
    { id: 1, owner_id: 1, type: 'EMAIL', value: 'jean.dupont@example.com', label: 'primary', is_primary: true, created_at: now },
    { id: 2, owner_id: 1, type: 'PHONE', value: '+49 123 456789', label: 'mobile', is_primary: true, created_at: now },
    { id: 3, owner_id: 1, type: 'EMERGENCY', value: 'Marie Dupont', label: 'name', is_primary: false, created_at: now },
    { id: 4, owner_id: 1, type: 'EMERGENCY', value: '+33 612 345678', label: 'phone', is_primary: false, created_at: now },
    { id: 5, owner_id: 2, type: 'EMAIL', value: 'amina.f@example.com', label: 'primary', is_primary: true, created_at: now },
    { id: 6, owner_id: 2, type: 'PHONE', value: '+49 987 654321', label: 'mobile', is_primary: true, created_at: now },
    { id: 7, owner_id: 2, type: 'EMERGENCY', value: 'Ahmed Al-Farsi', label: 'name', is_primary: false, created_at: now },
    { id: 8, owner_id: 2, type: 'EMERGENCY', value: '+968 12345678', label: 'phone', is_primary: false, created_at: now },
    { id: 9, owner_id: 3, type: 'EMAIL', value: 'karim.b@example.com', label: 'primary', is_primary: true, created_at: now },
    { id: 10, owner_id: 3, type: 'PHONE', value: '+213 550 001122', label: 'mobile', is_primary: true, created_at: now },
    { id: 11, owner_id: 3, type: 'EMERGENCY', value: 'Nora Bensaid', label: 'name', is_primary: false, created_at: now },
    { id: 12, owner_id: 3, type: 'EMERGENCY', value: '+213 555 101010', label: 'phone', is_primary: false, created_at: now },
    { id: 13, owner_id: 4, type: 'EMAIL', value: 'leila.m@example.com', label: 'primary', is_primary: true, created_at: now },
    { id: 14, owner_id: 4, type: 'PHONE', value: '+213 661 998877', label: 'mobile', is_primary: true, created_at: now },
    { id: 15, owner_id: 4, type: 'EMERGENCY', value: 'Hichem Mansouri', label: 'name', is_primary: false, created_at: now },
    { id: 16, owner_id: 4, type: 'EMERGENCY', value: '+213 770 888777', label: 'phone', is_primary: false, created_at: now },
    { id: 17, owner_id: 5, type: 'EMAIL', value: 'samir.h@example.com', label: 'primary', is_primary: true, created_at: now },
    { id: 18, owner_id: 5, type: 'PHONE', value: '+213 699 223344', label: 'mobile', is_primary: true, created_at: now },
    { id: 19, owner_id: 5, type: 'EMERGENCY', value: 'Dalia Haddad', label: 'name', is_primary: false, created_at: now },
    { id: 20, owner_id: 5, type: 'EMERGENCY', value: '+213 777 121212', label: 'phone', is_primary: false, created_at: now },
  ],
  ADDRESS: [
    { id: 1, name: '12 Rue de Paris, Lyon', wilaya_id: 1 },
    { id: 2, name: 'Muscat, Street 40', wilaya_id: 2 },
    { id: 3, name: 'Cite 500, Algiers', wilaya_id: 3 },
    { id: 4, name: 'Hai El Yasmine, Oran', wilaya_id: 4 },
    { id: 5, name: 'Sidi Mabrouk, Constantine', wilaya_id: 5 },
    { id: 6, name: 'USTHB Main Campus Housing', wilaya_id: 3 },
    { id: 7, name: 'Hamburg Shared Apt 12', wilaya_id: 4 },
    { id: 8, name: 'ESI Algiers Student Block B', wilaya_id: 3 },
    { id: 9, name: 'Oran Student Hall 3', wilaya_id: 4 },
    { id: 10, name: 'Constantine Graduate Residence', wilaya_id: 5 },
    { id: 11, name: 'USTHB Admin Block', wilaya_id: 3 },
    { id: 12, name: 'GMS Downtown', wilaya_id: 4 },
    { id: 13, name: 'National Bank HQ', wilaya_id: 3 },
    { id: 14, name: 'Bab Ezzouar Branch', wilaya_id: 3 },
    { id: 15, name: 'Oran Center Branch', wilaya_id: 4 },
    { id: 16, name: 'Constantine Center Branch', wilaya_id: 5 },
  ],
  PROVINCE: [
    { id: 1, name: 'Lyon' },
    { id: 2, name: 'Muscat' },
    { id: 3, name: 'Algiers' },
    { id: 4, name: 'Oran' },
    { id: 5, name: 'Constantine' },
  ],
  UNIVERSITY: [
    { id: 1, name: 'University of Science and Technology Houari Boumediene', acronym: 'USTHB', address_id: 11 },
    { id: 2, name: 'Global Management School', acronym: 'GMS', address_id: 12 },
  ],
  DEPARTMENT: [
    { id: 1, name: 'Computer Science', description: 'Core computing and software studies' },
    { id: 2, name: 'Business Administration', description: 'Business and management studies' },
    { id: 3, name: 'Civil Engineering', description: 'Infrastructure and construction studies' },
  ],
  PROGRAMTYPE: [
    { id: 1, name: 'Bachelors', default_duration: 3 },
    { id: 2, name: 'Masters', default_duration: 2 },
    { id: 3, name: 'PhD', default_duration: 3 },
  ],
  PROGRAM: [
    { id: 1, name: 'Computer Science', description: 'Advanced software systems', department_id: 1, programtype_id: 2 },
    { id: 2, name: 'International Business', description: 'Global business operations', department_id: 2, programtype_id: 1 },
    { id: 3, name: 'Data Science', description: 'Data analysis and AI methods', department_id: 1, programtype_id: 2 },
    { id: 4, name: 'Civil Engineering', description: 'Design and build public infrastructure', department_id: 3, programtype_id: 1 },
    { id: 5, name: 'Finance', description: 'Corporate finance and markets', department_id: 2, programtype_id: 2 },
  ],
  ENROLLMENT: [
    { id: 1, registration_no: 'REG-2023-1001', date_enrolled: '2023-09-01', status: 'ACTIVE', student_id: 1, program_id: 1 },
    { id: 2, registration_no: 'REG-2023-1042', date_enrolled: '2023-09-01', status: 'ACTIVE', student_id: 2, program_id: 2 },
    { id: 3, registration_no: 'REG-2024-1111', date_enrolled: '2024-09-15', status: 'PENDING', student_id: 3, program_id: 3 },
    { id: 4, registration_no: 'REG-2024-1337', date_enrolled: '2024-09-10', status: 'ACTIVE', student_id: 4, program_id: 4 },
    { id: 5, registration_no: 'REG-2022-0999', date_enrolled: '2022-09-01', status: 'COMPLETED', student_id: 5, program_id: 5 },
  ],
  PROGRESS: [
    { id: 1, date: '2024-06-15', semester: 'Year 1', level: 'L1', grade: '16.5', status: 'COMPLETED', enrollment_id: 1 },
    { id: 2, date: '2025-06-20', semester: 'Year 2', level: 'L2', grade: '17.1', status: 'COMPLETED', enrollment_id: 1 },
    { id: 3, date: '2024-06-20', semester: 'Year 1', level: 'L1', grade: '18.0', status: 'COMPLETED', enrollment_id: 2 },
    { id: 4, date: '2025-01-20', semester: 'Semester 1', level: 'M1', grade: '15.8', status: 'PENDING', enrollment_id: 3 },
    { id: 5, date: '2025-06-22', semester: 'Year 1', level: 'L1', grade: '14.9', status: 'COMPLETED', enrollment_id: 4 },
    { id: 6, date: '2025-07-01', semester: 'Year 2', level: 'M2', grade: '16.2', status: 'COMPLETED', enrollment_id: 5 },
  ],
  BANK: [
    { id: 1, name: 'National Bank', code: 12345, address_id: 13 },
  ],
  BRANCH: [
    { id: 1, code: 1101, name: 'Bab Ezzouar', address_id: 14, bank_id: 1 },
    { id: 2, code: 2201, name: 'Oran Center', address_id: 15, bank_id: 1 },
    { id: 3, code: 3301, name: 'Constantine Center', address_id: 16, bank_id: 1 },
  ],
  ACCOUNT: [
    { id: 1, account_no: '88776655', rib: 123456789, date_created: '2023-10-01', branch_id: 1, person_id: 1 },
    { id: 2, account_no: '11223344', rib: 987654321, date_created: '2023-10-03', branch_id: 2, person_id: 2 },
    { id: 3, account_no: '55443322', rib: 556677889, date_created: '2024-10-01', branch_id: 1, person_id: 3 },
    { id: 4, account_no: '77665544', rib: 668899110, date_created: '2024-10-05', branch_id: 2, person_id: 4 },
    { id: 5, account_no: '99990011', rib: 221133445, date_created: '2022-10-01', branch_id: 3, person_id: 5 },
  ],
};

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
  return cloneDatabase(INITIAL_DATABASE);
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
