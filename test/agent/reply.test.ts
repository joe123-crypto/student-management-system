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
      dateOfBirth: '2001-01-01',
      gender: 'Female',
      profilePicture: '',
      ...overrides.student,
    },
    passport: {
      passportNumber: 'P123456',
      nationality: 'NG',
      issueDate: '2024-01-01',
      expiryDate: '2034-01-01',
      issuingCountry: 'NG',
      ...overrides.passport,
    },
    university: {
      universityName: 'University of Algiers',
      acronym: 'UA',
      city: 'Algiers',
      department: 'Engineering',
      ...overrides.university,
    },
    program: {
      degreeLevel: 'Masters',
      major: 'Computer Science',
      startDate: '2025-09-01',
      expectedEndDate: '2027-09-01',
      systemType: 'Masters',
      ...overrides.program,
    },
    bankAccount: {
      accountNumber: '1234567890',
      iban: '',
      dateCreated: '2025-01-01',
      ...overrides.bankAccount,
    },
    bank: {
      bankName: 'Example Bank',
      bankCode: '12345',
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
      wilaya: 'Algiers',
      country: 'Algeria',
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
        dateOfBirth: '2001-01-01',
        gender: 'Female',
        profilePicture: 'profile-file',
      },
      passport: {
        passportNumber: 'P123457',
        nationality: 'NG',
        issueDate: '2024-01-01',
        expiryDate: '2034-01-01',
        issuingCountry: 'NG',
      },
      contact: {
        email: 'grace@example.com',
        phone: '08012345678',
        emergencyContactName: 'Alan',
        emergencyContactPhone: '08099999999',
      },
      bankAccount: {
        accountNumber: '1234567891',
        iban: 'DZ123',
        dateCreated: '2025-01-01',
      },
      bank: {
        bankName: 'Example Bank',
        bankCode: '12345',
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
