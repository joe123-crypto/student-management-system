import type { StudentProfile } from '@/types';
import type {
  DatabaseQueryClause,
  DuplicateGroup,
  QueryField,
  QualityFlagResult,
  ReportColumnOption,
  StudentReturnField,
  StudentQueryState,
} from '@/components/features/attache/types';
import { getLatestAcademicEntry } from '@/lib/students/academicHistory';

type StudentFieldInputType = 'text' | 'email' | 'date' | 'select';
type StudentFieldSection =
  | 'student'
  | 'passport'
  | 'contact'
  | 'university'
  | 'program'
  | 'bank'
  | 'bankAccount'
  | 'address';

type StudentFieldDefinition = {
  key: StudentReturnField;
  label: string;
  getValues: (student: StudentProfile) => string[];
  patchTarget?: {
    section: StudentFieldSection;
    key: string;
  };
  inputType?: StudentFieldInputType;
  options?: readonly string[];
};

const FIELD_DEFINITIONS: readonly StudentFieldDefinition[] = [
  {
    key: 'fullName',
    label: 'Full Name',
    getValues: (student) => [
      student.student.fullName,
      student.student.givenName,
      student.student.familyName,
    ],
    patchTarget: { section: 'student', key: 'fullName' },
  },
  {
    key: 'givenName',
    label: 'Given Name',
    getValues: (student) => [student.student.givenName],
    patchTarget: { section: 'student', key: 'givenName' },
  },
  {
    key: 'familyName',
    label: 'Family Name',
    getValues: (student) => [student.student.familyName],
    patchTarget: { section: 'student', key: 'familyName' },
  },
  {
    key: 'inscription',
    label: 'Inscription No.',
    getValues: (student) => [student.student.inscriptionNumber],
    patchTarget: { section: 'student', key: 'inscriptionNumber' },
  },
  {
    key: 'registrationNumber',
    label: 'Registration No.',
    getValues: (student) => [student.student.registrationNumber || ''],
    patchTarget: { section: 'student', key: 'registrationNumber' },
  },
  {
    key: 'dateOfBirth',
    label: 'Date of Birth',
    getValues: (student) => [student.student.dateOfBirth],
    patchTarget: { section: 'student', key: 'dateOfBirth' },
    inputType: 'date',
  },
  {
    key: 'gender',
    label: 'Gender',
    getValues: (student) => [student.student.gender],
    patchTarget: { section: 'student', key: 'gender' },
    inputType: 'select',
    options: ['M', 'F', 'Other'],
  },
  {
    key: 'nationality',
    label: 'Nationality',
    getValues: (student) => [student.student.nationality],
    patchTarget: { section: 'student', key: 'nationality' },
  },
  {
    key: 'passportNumber',
    label: 'Passport No.',
    getValues: (student) => [student.passport.passportNumber],
    patchTarget: { section: 'passport', key: 'passportNumber' },
  },
  {
    key: 'passportIssueDate',
    label: 'Passport Issue Date',
    getValues: (student) => [student.passport.issueDate],
    patchTarget: { section: 'passport', key: 'issueDate' },
    inputType: 'date',
  },
  {
    key: 'passportExpiryDate',
    label: 'Passport Expiry Date',
    getValues: (student) => [student.passport.expiryDate],
    patchTarget: { section: 'passport', key: 'expiryDate' },
    inputType: 'date',
  },
  {
    key: 'passportIssuingCountry',
    label: 'Passport Country',
    getValues: (student) => [student.passport.issuingCountry],
    patchTarget: { section: 'passport', key: 'issuingCountry' },
  },
  {
    key: 'email',
    label: 'Email',
    getValues: (student) => [student.contact.email],
    patchTarget: { section: 'contact', key: 'email' },
    inputType: 'email',
  },
  {
    key: 'phone',
    label: 'Phone',
    getValues: (student) => [student.contact.phone],
    patchTarget: { section: 'contact', key: 'phone' },
  },
  {
    key: 'emergencyContactName',
    label: 'Emergency Contact',
    getValues: (student) => [student.contact.emergencyContactName],
    patchTarget: { section: 'contact', key: 'emergencyContactName' },
  },
  {
    key: 'emergencyContactPhone',
    label: 'Emergency Contact Phone',
    getValues: (student) => [student.contact.emergencyContactPhone],
    patchTarget: { section: 'contact', key: 'emergencyContactPhone' },
  },
  {
    key: 'status',
    label: 'Status',
    getValues: (student) => [student.status],
    inputType: 'select',
    options: ['PENDING', 'ACTIVE', 'COMPLETED'],
  },
  {
    key: 'university',
    label: 'University',
    getValues: (student) => [
      student.university.universityName,
      student.university.acronym,
      student.university.campus,
      student.university.city,
    ],
    patchTarget: { section: 'university', key: 'universityName' },
  },
  {
    key: 'universityAcronym',
    label: 'University Acronym',
    getValues: (student) => [student.university.acronym],
    patchTarget: { section: 'university', key: 'acronym' },
  },
  {
    key: 'campus',
    label: 'Campus',
    getValues: (student) => [student.university.campus],
    patchTarget: { section: 'university', key: 'campus' },
  },
  {
    key: 'universityCity',
    label: 'University City',
    getValues: (student) => [student.university.city],
    patchTarget: { section: 'university', key: 'city' },
  },
  {
    key: 'department',
    label: 'Department',
    getValues: (student) => [student.university.department || ''],
    patchTarget: { section: 'university', key: 'department' },
  },
  {
    key: 'program',
    label: 'Program',
    getValues: (student) => [
      student.program.major,
      student.program.degreeLevel,
      student.program.programType || '',
    ],
    patchTarget: { section: 'program', key: 'major' },
  },
  {
    key: 'degreeLevel',
    label: 'Degree Level',
    getValues: (student) => [student.program.degreeLevel],
    patchTarget: { section: 'program', key: 'degreeLevel' },
  },
  {
    key: 'programType',
    label: 'Program Type',
    getValues: (student) => [student.program.programType || ''],
    patchTarget: { section: 'program', key: 'programType' },
  },
  {
    key: 'startDate',
    label: 'Program Start Date',
    getValues: (student) => [student.program.startDate],
    patchTarget: { section: 'program', key: 'startDate' },
    inputType: 'date',
  },
  {
    key: 'expectedEndDate',
    label: 'Expected End Date',
    getValues: (student) => [student.program.expectedEndDate],
    patchTarget: { section: 'program', key: 'expectedEndDate' },
    inputType: 'date',
  },
  {
    key: 'bankName',
    label: 'Bank Name',
    getValues: (student) => [student.bank.bankName],
    patchTarget: { section: 'bank', key: 'bankName' },
  },
  {
    key: 'branchName',
    label: 'Branch Name',
    getValues: (student) => [student.bank.branchName],
    patchTarget: { section: 'bank', key: 'branchName' },
  },
  {
    key: 'branchAddress',
    label: 'Branch Address',
    getValues: (student) => [student.bank.branchAddress],
    patchTarget: { section: 'bank', key: 'branchAddress' },
  },
  {
    key: 'branchCode',
    label: 'Branch Code',
    getValues: (student) => [student.bank.branchCode],
    patchTarget: { section: 'bank', key: 'branchCode' },
  },
  {
    key: 'accountHolderName',
    label: 'Account Holder',
    getValues: (student) => [student.bankAccount.accountHolderName],
    patchTarget: { section: 'bankAccount', key: 'accountHolderName' },
  },
  {
    key: 'accountNumber',
    label: 'Account No.',
    getValues: (student) => [student.bankAccount.accountNumber],
    patchTarget: { section: 'bankAccount', key: 'accountNumber' },
  },
  {
    key: 'iban',
    label: 'RIB / IBAN',
    getValues: (student) => [student.bankAccount.iban],
    patchTarget: { section: 'bankAccount', key: 'iban' },
  },
  {
    key: 'swiftCode',
    label: 'Swift Code',
    getValues: (student) => [student.bankAccount.swiftCode],
    patchTarget: { section: 'bankAccount', key: 'swiftCode' },
  },
  {
    key: 'accountCreatedDate',
    label: 'Account Created',
    getValues: (student) => [student.bankAccount.dateCreated || ''],
    patchTarget: { section: 'bankAccount', key: 'dateCreated' },
    inputType: 'date',
  },
  {
    key: 'currentHostAddress',
    label: 'Current Host Address',
    getValues: (student) => [student.address.currentHostAddress],
    patchTarget: { section: 'address', key: 'currentHostAddress' },
  },
  {
    key: 'homeCountryAddress',
    label: 'Home Country Address',
    getValues: (student) => [student.address.homeCountryAddress],
    patchTarget: { section: 'address', key: 'homeCountryAddress' },
  },
  {
    key: 'street',
    label: 'Street',
    getValues: (student) => [student.address.street || ''],
    patchTarget: { section: 'address', key: 'street' },
  },
  {
    key: 'addressCity',
    label: 'Address City',
    getValues: (student) => [student.address.city || ''],
    patchTarget: { section: 'address', key: 'city' },
  },
  {
    key: 'state',
    label: 'State',
    getValues: (student) => [student.address.state || ''],
    patchTarget: { section: 'address', key: 'state' },
  },
  {
    key: 'wilaya',
    label: 'Wilaya',
    getValues: (student) => [student.address.wilaya || ''],
    patchTarget: { section: 'address', key: 'wilaya' },
  },
  {
    key: 'countryCode',
    label: 'Country Code',
    getValues: (student) => [student.address.countryCode || ''],
    patchTarget: { section: 'address', key: 'countryCode' },
  },
] as const;

export const STUDENT_FIELD_DEFINITIONS = FIELD_DEFINITIONS;
export const STUDENT_FIELD_DEFINITION_MAP = FIELD_DEFINITIONS.reduce(
  (accumulator, definition) => {
    accumulator[definition.key] = definition;
    return accumulator;
  },
  {} as Record<StudentReturnField, StudentFieldDefinition>,
);
export const STUDENT_RETURN_FIELD_OPTIONS = FIELD_DEFINITIONS.map((definition) => ({
  value: definition.key,
  label: definition.label,
}));
export const STUDENT_QUERY_FIELD_OPTIONS: Array<{ value: QueryField; label: string }> = [
  { value: 'all', label: 'All fields' },
  ...STUDENT_RETURN_FIELD_OPTIONS,
];
export const ALL_RETURN_FIELDS = FIELD_DEFINITIONS.map(
  (definition) => definition.key,
) as StudentReturnField[];

export const DEFAULT_DATABASE_QUERY_CLAUSE: DatabaseQueryClause = {
  id: 'query-1',
  value: '',
  field: 'all',
};

export const DEFAULT_RETURN_FIELDS: StudentReturnField[] = [
  'fullName',
  'inscription',
  'email',
  'status',
  'university',
  'program',
];

export const DEFAULT_STUDENT_QUERY: StudentQueryState = {
  searchQuery: '',
  queryField: 'all',
  queryClauses: [DEFAULT_DATABASE_QUERY_CLAUSE],
  returnFields: DEFAULT_RETURN_FIELDS,
  status: 'ALL',
  sortBy: 'name',
  university: 'ALL',
  program: 'ALL',
  academicYear: 'ALL',
  missingData: 'ALL',
  startDateFrom: '',
  startDateTo: '',
  documentStatus: 'ALL',
  duplicatesOnly: false,
};

export const REPORT_COLUMNS: ReportColumnOption[] = [
  { key: 'fullName', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'inscriptionNumber', label: 'Inscription Number' },
  { key: 'status', label: 'Status' },
  { key: 'university', label: 'University' },
  { key: 'program', label: 'Program' },
  { key: 'degreeLevel', label: 'Degree Level' },
  { key: 'startDate', label: 'Program Start Date' },
  { key: 'phone', label: 'Phone' },
  { key: 'iban', label: 'IBAN' },
];

const normalize = (value: string) => value.trim().toLowerCase();

export function createDatabaseQueryClause(
  value = '',
  field: QueryField = 'all',
  id = `query-${Math.random().toString(36).slice(2, 10)}`,
): DatabaseQueryClause {
  return {
    id,
    value,
    field,
  };
}

export function getStudentFieldValues(student: StudentProfile, field: StudentReturnField): string[] {
  return STUDENT_FIELD_DEFINITION_MAP[field]?.getValues(student) || [];
}

export function getStudentFieldValue(student: StudentProfile, field: StudentReturnField): string {
  const values = getStudentFieldValues(student, field);
  return values.find((value) => value.trim().length > 0) || values[0] || '';
}

export function getStudentFieldLabel(field: StudentReturnField): string {
  return STUDENT_FIELD_DEFINITION_MAP[field]?.label || field;
}

function getFieldValue(student: StudentProfile, field: QueryField): string[] {
  if (field === 'all') {
    return ALL_RETURN_FIELDS.flatMap((key) => getStudentFieldValues(student, key));
  }

  return getStudentFieldValues(student, field);
}

function getLatestDocumentStatus(student: StudentProfile): string {
  return getLatestAcademicEntry(student.academicHistory)?.status || 'MISSING';
}

function hasMissingProfile(student: StudentProfile): boolean {
  return !student.student.profilePicture;
}

function hasMissingBank(student: StudentProfile): boolean {
  return !student.bankAccount.iban || !student.bank.branchCode;
}

function hasAnyMissing(student: StudentProfile): boolean {
  return hasMissingProfile(student) || hasMissingBank(student) || !student.contact.phone || !student.academicHistory?.length;
}

function isDateWithinRange(date: string, from: string, to: string): boolean {
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function getDuplicateGroups(students: StudentProfile[]): DuplicateGroup[] {
  const byEmail = new Map<string, string[]>();
  const byInscription = new Map<string, string[]>();

  students.forEach((student) => {
    const email = normalize(student.contact.email);
    const inscription = normalize(student.student.inscriptionNumber);
    byEmail.set(email, [...(byEmail.get(email) || []), student.id]);
    byInscription.set(inscription, [...(byInscription.get(inscription) || []), student.id]);
  });

  const groups: DuplicateGroup[] = [];
  byEmail.forEach((ids, email) => {
    if (ids.length > 1) groups.push({ key: `email:${email}`, value: email, label: 'Duplicate Email', studentIds: ids });
  });
  byInscription.forEach((ids, inscription) => {
    if (ids.length > 1) groups.push({ key: `inscription:${inscription}`, value: inscription, label: 'Duplicate Inscription', studentIds: ids });
  });
  return groups;
}

export function getQualityFlags(students: StudentProfile[]): QualityFlagResult[] {
  return students.map((student) => {
    const items: string[] = [];
    if (!student.student.profilePicture) items.push('Missing profile picture');
    if (!student.bankAccount.iban) items.push('Missing IBAN');
    if (!student.bank.branchCode) items.push('Missing bank branch code');
    if (!student.contact.phone) items.push('Missing phone number');
    if (!student.academicHistory?.length) items.push('No academic history submissions');
    return { studentId: student.id, items };
  });
}

export function applyStudentQuery(
  students: StudentProfile[],
  query: StudentQueryState,
  duplicateStudentIds: Set<string>,
): StudentProfile[] {
  const q = normalize(query.searchQuery);
  const activeClauses = query.queryClauses
    .map((clause) => ({
      field: clause.field,
      value: normalize(clause.value),
    }))
    .filter((clause) => clause.value.length > 0);

  const filtered = students.filter((student) => {
    const matchesLegacySearch =
      q.length === 0 ||
      getFieldValue(student, query.queryField).some((value) => normalize(value).includes(q));
    const matchesClauseSearch =
      activeClauses.length === 0 ||
      activeClauses.every((clause) =>
        getFieldValue(student, clause.field).some((value) => normalize(value).includes(clause.value)),
      );
    const matchesSearch = matchesLegacySearch && matchesClauseSearch;
    if (!matchesSearch) return false;

    if (query.status !== 'ALL' && student.status !== query.status) return false;
    if (query.university !== 'ALL' && student.university.universityName !== query.university) return false;
    if (query.program !== 'ALL' && student.program.major !== query.program) return false;

    if (query.academicYear !== 'ALL') {
      const hasYear = (student.academicHistory || []).some((entry) => entry.year === query.academicYear);
      if (!hasYear) return false;
    }

    if (query.missingData !== 'ALL') {
      if (query.missingData === 'ANY_MISSING' && !hasAnyMissing(student)) return false;
      if (query.missingData === 'MISSING_PROFILE' && !hasMissingProfile(student)) return false;
      if (query.missingData === 'MISSING_BANK' && !hasMissingBank(student)) return false;
      if (query.missingData === 'NONE' && hasAnyMissing(student)) return false;
    }

    if (query.documentStatus !== 'ALL') {
      const latest = getLatestDocumentStatus(student);
      if (latest !== query.documentStatus) return false;
    }

    if (query.startDateFrom || query.startDateTo) {
      if (!isDateWithinRange(student.program.startDate, query.startDateFrom, query.startDateTo)) return false;
    }

    if (query.duplicatesOnly && !duplicateStudentIds.has(student.id)) return false;

    return true;
  });

  filtered.sort((a, b) => {
    if (query.sortBy === 'name') return a.student.fullName.localeCompare(b.student.fullName);
    return a.student.inscriptionNumber.localeCompare(b.student.inscriptionNumber);
  });

  return filtered;
}

function getValueByColumnKey(student: StudentProfile, key: string): string {
  const map: Record<string, string> = {
    fullName: student.student.fullName,
    email: student.contact.email,
    inscriptionNumber: student.student.inscriptionNumber,
    status: student.status,
    university: student.university.universityName,
    program: student.program.major,
    degreeLevel: student.program.degreeLevel,
    startDate: student.program.startDate,
    phone: student.contact.phone || '',
    iban: student.bankAccount.iban || '',
  };
  return map[key] ?? '';
}

export function buildStudentDelimited(
  students: StudentProfile[],
  columnKeys: string[],
  columnLookup: ReportColumnOption[],
  delimiter: ',' | '\t',
): string {
  const columns = columnLookup.filter((column) => columnKeys.includes(column.key));
  const escape = (value: string) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const header = columns.map((column) => escape(column.label)).join(delimiter);
  const rows = students
    .map((student) => columns.map((column) => escape(getValueByColumnKey(student, column.key))).join(delimiter))
    .join('\n');
  return `${header}\n${rows}`;
}

export function buildStudentJson(students: StudentProfile[], columnKeys: string[], columnLookup: ReportColumnOption[]): string {
  const columns = columnLookup.filter((column) => columnKeys.includes(column.key));
  const rows = students.map((student) => {
    const record: Record<string, string> = {};
    columns.forEach((column) => {
      record[column.key] = getValueByColumnKey(student, column.key);
    });
    return record;
  });
  return JSON.stringify(rows, null, 2);
}

export function downloadFile(filename: string, mimeType: string, content: string): void {
  const payload = `data:${mimeType};charset=utf-8,${content}`;
  const encodedUri = encodeURI(payload);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

