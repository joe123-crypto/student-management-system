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

function getCsvValue(row: Record<string, string>, aliases: string[]) {
  for (const alias of aliases) {
    const value = row[normalizeHeader(alias)];
    if (value) return value;
  }
  return '';
}

export function toStudentProfile(row: Record<string, string>, index: number): StudentProfile | null {
  const email = getCsvValue(row, ['email', 'studentemail', 'contactemail']).toLowerCase();
  const givenName = getCsvValue(row, ['givenname', 'firstname', 'namefirst']);
  const familyName = getCsvValue(row, ['familyname', 'lastname', 'namelast']);
  const fullName = getCsvValue(row, ['fullname', 'studentname']) || `${givenName} ${familyName}`.trim();
  const inscriptionNumber = getCsvValue(row, ['inscriptionnumber', 'registrationnumber', 'studentid']);

  if (!email || !fullName) {
    return null;
  }

  const inferredGivenName = givenName || fullName.split(' ')[0] || '';
  const inferredFamilyName = familyName || fullName.split(' ').slice(1).join(' ') || '';
  const rawGender = getCsvValue(row, ['gender']).toUpperCase();
  const gender = rawGender === 'F' ? 'F' : rawGender === 'OTHER' ? 'Other' : 'M';
  const rawStatus = getCsvValue(row, ['status']).toUpperCase();
  const status: StudentProfile['status'] =
    rawStatus === 'ACTIVE' || rawStatus === 'COMPLETED' ? rawStatus : 'PENDING';

  return {
    id: Math.random().toString(36).substr(2, 9) || `csv-${index}`,
    student: {
      fullName,
      givenName: inferredGivenName,
      familyName: inferredFamilyName,
      inscriptionNumber: inscriptionNumber || `CSV-${Date.now()}-${index + 1}`,
      dateOfBirth: getCsvValue(row, ['dateofbirth', 'dob']),
      nationality: getCsvValue(row, ['nationality']) || 'Unknown',
      gender,
    },
    passport: {
      passportNumber: getCsvValue(row, ['passportnumber']),
      issueDate: getCsvValue(row, ['passportissuedate', 'issueDate']),
      expiryDate: getCsvValue(row, ['passportexpirydate', 'expiryDate']),
      issuingCountry: getCsvValue(row, ['passportissuingcountry', 'issuingCountry']),
    },
    university: {
      universityName: getCsvValue(row, ['universityname', 'university']) || 'Unknown University',
      acronym: getCsvValue(row, ['universityacronym', 'acronym']),
      campus: getCsvValue(row, ['campus']),
      city: getCsvValue(row, ['city']),
    },
    program: {
      degreeLevel: getCsvValue(row, ['degreelevel', 'level']),
      major: getCsvValue(row, ['major', 'program']) || 'Undeclared',
      startDate: getCsvValue(row, ['startdate']),
      expectedEndDate: getCsvValue(row, ['expectedenddate', 'enddate']),
    },
    bankAccount: {
      accountHolderName: getCsvValue(row, ['accountholdername']) || fullName,
      accountNumber: getCsvValue(row, ['accountnumber']),
      iban: getCsvValue(row, ['iban']),
      swiftCode: getCsvValue(row, ['swiftcode']),
    },
    bank: {
      bankName: getCsvValue(row, ['bankname']),
      branchName: getCsvValue(row, ['branchname']),
      branchAddress: getCsvValue(row, ['branchaddress']),
      branchCode: getCsvValue(row, ['branchcode']),
    },
    contact: {
      email,
      phone: getCsvValue(row, ['phone', 'phonenumber']),
      emergencyContactName: getCsvValue(row, ['emergencycontactname']),
      emergencyContactPhone: getCsvValue(row, ['emergencycontactphone']),
    },
    address: {
      homeCountryAddress: getCsvValue(row, ['homecountryaddress']),
      currentHostAddress: getCsvValue(row, ['currenthostaddress']),
    },
    status,
  };
}
