import type { StudentProfile } from '@/types';

export type CsvDelimiterOption = 'auto' | ',' | ';' | '\t';

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const output: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      output.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  output.push(current.trim());
  return output;
}

function detectDelimiter(source: string): string {
  const firstLine = source.split(/\r?\n/).find((line) => line.trim().length > 0) || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (tabCount > semicolonCount && tabCount > commaCount) return '\t';
  if (semicolonCount > commaCount) return ';';
  return ',';
}

export function parseCsvRows(source: string, delimiterOption: CsvDelimiterOption) {
  const delimiter = delimiterOption === 'auto' ? detectDelimiter(source) : delimiterOption;
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader);

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line, delimiter);
    return headers.reduce<Record<string, string>>((row, key, index) => {
      row[key] = (values[index] || '').trim();
      return row;
    }, {});
  });
}

function getCsvValue(row: Record<string, string>, key: string) {
  return row[normalizeHeader(key)] || '';
}

export function toStudentProfile(row: Record<string, string>, index: number): StudentProfile | null {
  const email = getCsvValue(row, 'email').toLowerCase();
  const givenName = getCsvValue(row, 'givenName');
  const familyName = getCsvValue(row, 'familyName');
  const fullName = getCsvValue(row, 'fullName');
  const inscriptionNumber = getCsvValue(row, 'inscriptionNumber');

  if (!email || !fullName) {
    return null;
  }

  const inferredGivenName = givenName || fullName.split(' ')[0] || '';
  const inferredFamilyName = familyName || fullName.split(' ').slice(1).join(' ') || '';
  const rawGender = getCsvValue(row, 'gender').toUpperCase();
  const gender = rawGender === 'F' ? 'F' : rawGender === 'OTHER' ? 'Other' : 'M';
  const rawStatus = getCsvValue(row, 'status').toUpperCase();
  const status: StudentProfile['status'] =
    rawStatus === 'ACTIVE' || rawStatus === 'COMPLETED' ? rawStatus : 'PENDING';

  return {
    id: Math.random().toString(36).slice(2, 11) || `csv-${index}`,
    student: {
      fullName,
      givenName: inferredGivenName,
      familyName: inferredFamilyName,
      inscriptionNumber: inscriptionNumber || `CSV-${Date.now()}-${index + 1}`,
      dateOfBirth: getCsvValue(row, 'dateOfBirth'),
      nationality: getCsvValue(row, 'nationality') || 'Unknown',
      gender,
    },
    passport: {
      passportNumber: getCsvValue(row, 'passportNumber'),
      issueDate: getCsvValue(row, 'issueDate'),
      expiryDate: getCsvValue(row, 'expiryDate'),
      issuingCountry: getCsvValue(row, 'issuingCountry'),
    },
    university: {
      universityName: getCsvValue(row, 'universityName') || 'Unknown University',
      acronym: getCsvValue(row, 'acronym'),
      campus: getCsvValue(row, 'campus'),
      city: getCsvValue(row, 'city'),
    },
    program: {
      degreeLevel: getCsvValue(row, 'degreeLevel'),
      major: getCsvValue(row, 'major') || 'Undeclared',
      startDate: getCsvValue(row, 'startDate'),
      expectedEndDate: getCsvValue(row, 'expectedEndDate'),
    },
    bankAccount: {
      accountHolderName: getCsvValue(row, 'accountHolderName') || fullName,
      accountNumber: getCsvValue(row, 'accountNumber'),
      iban: getCsvValue(row, 'iban'),
      swiftCode: getCsvValue(row, 'swiftCode'),
    },
    bank: {
      bankName: getCsvValue(row, 'bankName'),
      branchName: getCsvValue(row, 'branchName'),
      branchAddress: getCsvValue(row, 'branchAddress'),
      branchCode: getCsvValue(row, 'branchCode'),
    },
    contact: {
      email,
      phone: getCsvValue(row, 'phone'),
      emergencyContactName: getCsvValue(row, 'emergencyContactName'),
      emergencyContactPhone: getCsvValue(row, 'emergencyContactPhone'),
    },
    address: {
      homeCountryAddress: getCsvValue(row, 'homeCountryAddress'),
      currentHostAddress: getCsvValue(row, 'currentHostAddress'),
    },
    status,
  };
}
