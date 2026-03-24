import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAttacheAgentReply } from '@/lib/agent/reply';
import type { Announcement, AttacheAgentContext, PermissionRequest, StudentProfile } from '@/types';

function createStudentProfile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    id: 'student-1',
    student: {
      fullName: 'Ada Lovelace',
      givenName: 'Ada',
      familyName: 'Lovelace',
      inscriptionNumber: 'INS-001',
      registrationNumber: 'REG-001',
      dateOfBirth: '2001-01-01',
      gender: 'F',
      nationality: 'NG',
      profilePicture: '',
      ...overrides.student,
    },
    passport: {
      passportNumber: 'P123456',
      issueDate: '2024-01-01',
      expiryDate: '2034-01-01',
      issuingCountry: 'NG',
      ...overrides.passport,
    },
    university: {
      universityName: 'University of Algiers',
      acronym: 'UA',
      campus: 'Main Campus',
      city: 'Algiers',
      department: 'Engineering',
      ...overrides.university,
    },
    program: {
      degreeLevel: 'Masters',
      major: 'Computer Science',
      startDate: '2025-09-01',
      expectedEndDate: '2027-09-01',
      programType: 'Masters',
      ...overrides.program,
    },
    bankAccount: {
      accountHolderName: 'Ada Lovelace',
      accountNumber: '1234567890',
      iban: '',
      swiftCode: '12345',
      dateCreated: '2025-01-01',
      ...overrides.bankAccount,
    },
    bank: {
      bankName: 'Example Bank',
      branchName: 'Central',
      branchAddress: 'Central Branch',
      branchCode: '',
      ...overrides.bank,
    },
    contact: {
      email: 'ada@example.com',
      phone: '',
      emergencyContactName: 'Charles',
      emergencyContactPhone: '08000000000',
      ...overrides.contact,
    },
    address: {
      homeCountryAddress: 'Lagos',
      currentHostAddress: 'Algiers',
      street: 'Main Street',
      city: 'Algiers',
      state: 'Algiers',
      countryCode: 'DZ',
      wilaya: 'Algiers',
      ...overrides.address,
    },
    status: 'PENDING',
    academicHistory: [],
    ...overrides,
  };
}

test('buildAttacheAgentReply summarizes current scope counts', () => {
  const students: StudentProfile[] = [
    createStudentProfile(),
    createStudentProfile({
      id: 'student-2',
      student: {
        fullName: 'Grace Hopper',
        givenName: 'Grace',
        familyName: 'Hopper',
        inscriptionNumber: 'INS-002',
        registrationNumber: 'REG-002',
        dateOfBirth: '2001-01-01',
        gender: 'F',
        nationality: 'NG',
        profilePicture: 'profile-file',
      },
      contact: {
        email: 'grace@example.com',
        phone: '08012345678',
        emergencyContactName: 'Alan',
        emergencyContactPhone: '08099999999',
      },
      bankAccount: {
        accountHolderName: 'Grace Hopper',
        accountNumber: '1234567891',
        iban: 'DZ123',
        swiftCode: '12345',
        dateCreated: '2025-01-01',
      },
      bank: {
        bankName: 'Example Bank',
        branchName: 'Central',
        branchAddress: 'Central Branch',
        branchCode: '1001',
      },
      status: 'ACTIVE',
      academicHistory: [
        {
          id: 'progress-1',
          date: '2026-01-01',
          year: 'Year 1',
          level: 'Level 1',
          grade: 'A',
          status: 'COMPLETED',
        },
      ],
    }),
  ];
  const announcements: Announcement[] = [];
  const permissionRequests: PermissionRequest[] = [];
  const context: AttacheAgentContext = {
    filteredStudentIds: ['student-1', 'student-2'],
    selectedStudentIds: [],
    searchQuery: '',
    statusFilter: 'ALL',
    university: 'ALL',
    program: 'ALL',
    duplicatesOnly: false,
  };

  const reply = buildAttacheAgentReply({
    prompt: 'Summarize the current student scope',
    students,
    announcements,
    permissionRequests,
    context,
  });

  assert.match(reply.content, /2 student record\(s\)/i);
  assert.match(reply.content, /1 missing bank details/i);
  assert.equal(reply.metadata.filteredCount, 2);
});

test('buildAttacheAgentReply drafts outreach content', () => {
  const reply = buildAttacheAgentReply({
    prompt: 'Draft a missing-documents reminder',
    students: [createStudentProfile()],
    announcements: [],
    permissionRequests: [],
    context: {
      filteredStudentIds: ['student-1'],
      selectedStudentIds: ['student-1'],
      searchQuery: 'Ada',
      statusFilter: 'PENDING',
      university: 'ALL',
      program: 'ALL',
      duplicatesOnly: false,
    },
  });

  assert.match(reply.content, /Subject: Follow-up on your student record/i);
  assert.match(reply.content, /please sign in to your portal profile/i);
  assert.equal(reply.metadata.intent, 'draft');
});
