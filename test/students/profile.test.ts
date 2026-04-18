import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createEmptyStudentProfile,
  getMissingStudentOnboardingFields,
  requiresStudentOnboarding,
  sanitizeStudentSelfServicePatch,
  StudentSelfServicePatchError,
} from '@/lib/students/profile';

test('student onboarding stays required until all banking fields are present', () => {
  const student = createEmptyStudentProfile({
    id: 'student-1',
    inscriptionNumber: 'INS-2023-001',
    fullName: 'Ada Lovelace',
  });

  assert.deepEqual(getMissingStudentOnboardingFields(student), [
    'bank name',
    'branch code',
    'account number',
    'RIB key',
  ]);
  assert.equal(requiresStudentOnboarding(student), true);
});

test('student onboarding completion ignores whitespace-only banking values', () => {
  const student = createEmptyStudentProfile({
    id: 'student-1',
    inscriptionNumber: 'INS-2023-001',
    fullName: 'Ada Lovelace',
  });

  student.bank.bankName = '  ';
  student.bank.branchCode = '1234';
  student.bankAccount.accountNumber = '987654321';
  student.bankAccount.iban = '   ';

  assert.deepEqual(getMissingStudentOnboardingFields(student), ['bank name', 'RIB key']);
  assert.equal(requiresStudentOnboarding(student), true);
});

test('student onboarding clears once the required banking fields are saved', () => {
  const student = createEmptyStudentProfile({
    id: 'student-1',
    inscriptionNumber: 'INS-2023-001',
    fullName: 'Ada Lovelace',
  });

  student.bank.bankName = 'Banque Nationale';
  student.bank.branchCode = '1234';
  student.bankAccount.accountNumber = '987654321';
  student.bankAccount.iban = '001122334455';

  assert.deepEqual(getMissingStudentOnboardingFields(student), []);
  assert.equal(requiresStudentOnboarding(student), false);
});

test('student self-service patch keeps bank updates and profile picture changes', () => {
  const student = createEmptyStudentProfile({
    id: 'student-1',
    inscriptionNumber: 'INS-2023-001',
    fullName: 'Ada Lovelace',
  });

  const patch = sanitizeStudentSelfServicePatch(student, {
    student: { profilePicture: 'data:image/png;base64,abc' },
    bank: { bankName: 'Banque Nationale', branchCode: '1234' },
    bankAccount: { accountNumber: '987654321', iban: '001122334455' },
    status: 'COMPLETED',
  });

  assert.deepEqual(patch, {
    student: { profilePicture: 'data:image/png;base64,abc' },
    bank: {
      bankName: 'Banque Nationale',
      bankCode: '',
      branchName: '',
      branchAddress: '',
      branchCode: '1234',
    },
    bankAccount: {
      accountNumber: '987654321',
      iban: '001122334455',
      dateCreated: '',
    },
  });
});

test('student self-service patch rejects edits to existing academic records', () => {
  const student = createEmptyStudentProfile({
    id: 'student-1',
    inscriptionNumber: 'INS-2023-001',
    fullName: 'Ada Lovelace',
  });

  student.academicHistory = [
    {
      id: 'progress-1',
      date: '2025-01-10',
      year: 'Year 1',
      level: 'L1',
      grade: '15.2',
      status: 'ACTIVE',
    },
  ];

  assert.throws(
    () =>
      sanitizeStudentSelfServicePatch(student, {
        academicHistory: [
          {
            id: 'progress-1',
            date: '2025-01-10',
            year: 'Year 1',
            level: 'L1',
            grade: '19.5',
            status: 'ACTIVE',
          },
        ],
      }),
    StudentSelfServicePatchError,
  );
});
