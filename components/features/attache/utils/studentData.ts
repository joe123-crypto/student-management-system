import type { StudentProfile } from '@/types';
import type {
  DuplicateGroup,
  QualityFlagResult,
  ReportColumnOption,
  StudentQueryState,
} from '@/components/features/attache/types';

export const DEFAULT_STUDENT_QUERY: StudentQueryState = {
  searchQuery: '',
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

function getLatestDocumentStatus(student: StudentProfile): string {
  if (!student.academicHistory || student.academicHistory.length === 0) {
    return 'MISSING';
  }
  return student.academicHistory[student.academicHistory.length - 1]?.status || 'MISSING';
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

  const filtered = students.filter((student) => {
    const matchesSearch =
      q.length === 0 ||
      normalize(student.student.fullName).includes(q) ||
      normalize(student.student.inscriptionNumber).includes(q) ||
      normalize(student.contact.email).includes(q);
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

export function buildStudentCsv(students: StudentProfile[], columnKeys: string[], columnLookup: ReportColumnOption[]): string {
  return buildStudentDelimited(students, columnKeys, columnLookup, ',');
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

