
import { StudentProfile, Announcement } from './types';

export const MOCK_STUDENTS: StudentProfile[] = [
  {
    id: '1',
    student: { fullName: 'Jean Dupont', givenName: 'Jean', familyName: 'Dupont', inscriptionNumber: 'INS-2023-001', dateOfBirth: '1998-05-12', nationality: 'French', gender: 'M' },
    passport: { passportNumber: 'FR123456', issueDate: '2018-10-10', expiryDate: '2028-10-10', issuingCountry: 'France' },
    university: { universityName: 'University of Technology', acronym: 'UT', campus: 'Main Campus', city: 'Berlin' },
    program: { degreeLevel: 'Masters', major: 'Computer Science', startDate: '2023-09-01', expectedEndDate: '2025-06-30' },
    bankAccount: { accountHolderName: 'Jean Dupont', accountNumber: '88776655', iban: 'DE123456789', swiftCode: 'BANKDEDX' },
    bank: { bankName: 'Deutsche Bank', branchName: 'Berlin Mitte', branchAddress: 'Alexanderplatz 1', branchCode: 'DB-BER-101' },
    contact: { email: 'jean.dupont@example.com', phone: '+49 123 456789', emergencyContactName: 'Marie Dupont', emergencyContactPhone: '+33 612 345678' },
    address: { homeCountryAddress: '12 Rue de Paris, Lyon', currentHostAddress: 'Berlin Student Housing, Room 402' },
    status: 'ACTIVE',
    academicHistory: [
      { id: 'h1', date: '2023-06-15', year: 'Year 1', level: 'L1', grade: '16.5', status: 'COMPLETED' }
    ]
  },
  {
    id: '2',
    student: { fullName: 'Amina Al-Farsi', givenName: 'Amina', familyName: 'Al-Farsi', inscriptionNumber: 'INS-2023-042', dateOfBirth: '2000-02-28', nationality: 'Omani', gender: 'F' },
    passport: { passportNumber: 'OM987654', issueDate: '2020-01-01', expiryDate: '2030-01-01', issuingCountry: 'Oman' },
    university: { universityName: 'Global Management School', acronym: 'GMS', campus: 'Downtown', city: 'Hamburg' },
    program: { degreeLevel: 'Bachelors', major: 'International Business', startDate: '2023-09-01', expectedEndDate: '2026-06-30' },
    bankAccount: { accountHolderName: 'Amina Al-Farsi', accountNumber: '11223344', iban: 'DE987654321', swiftCode: 'BANKDEDX' },
    bank: { bankName: 'Sparkasse', branchName: 'Hamburg North', branchAddress: 'Rathausmarkt 5', branchCode: 'SPK-HAM-02' },
    contact: { email: 'amina.f@example.com', phone: '+49 987 654321', emergencyContactName: 'Ahmed Al-Farsi', emergencyContactPhone: '+968 12345678' },
    address: { homeCountryAddress: 'Muscat, Street 40', currentHostAddress: 'Hamburg Shared Apt 12' },
    status: 'ACTIVE',
    academicHistory: [
      { id: 'h2', date: '2023-06-20', year: 'Year 1', level: 'L1', grade: '18.0', status: 'COMPLETED' }
    ]
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Visa Renewal Workshop',
    content: 'All students with visas expiring in the next 3 months must attend the workshop on Friday at 2 PM in Hall B.',
    date: '2024-05-20',
    author: 'Admin Attache'
  },
  {
    id: 'a2',
    title: 'Bank Allowance Update',
    content: 'The monthly scholarship allowance for June has been processed. Please check your bank accounts by the 5th of the month.',
    date: '2024-05-18',
    author: 'Admin Attache'
  }
];

export const PROGRESS_DATA = [
  { name: 'Year 1', gpa: 3.5, credits: 30 },
  { name: 'Year 2', gpa: 3.7, credits: 60 },
  { name: 'Year 3', gpa: 3.8, credits: 90 },
  { name: 'Year 4', gpa: 3.9, credits: 120 },
];


