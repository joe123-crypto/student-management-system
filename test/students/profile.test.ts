import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createEmptyStudentProfile,
  getMissingStudentOnboardingFields,
  requiresStudentOnboarding,
  sanitizeStudentSelfServicePatch,
  StudentSelfServicePatchError,
} from '@/lib/students/profile';

test('student onboarding does not require bank details', () => {
  const student = createEmptyStudentProfile({
    id: 'student-1',
    inscriptionNumber: 'INS-2023-001',
    fullName: 'Ada Lovelace',
  });

  assert.deepEqual(getMissingStudentOnboardingFields(student), []);
  assert.equal(requiresStudentOnboarding(student), false);
});

test('student onboarding returns missing profile when student is null', () => {
  assert.deepEqual(getMissingStudentOnboardingFields(null), ['student profile']);
  assert.equal(requiresStudentOnboarding(null), true);
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

test('student self-service patch allows contact and address updates', () => {
  const student = createEmptyStudentProfile({
    id: 'student-1',
    inscriptionNumber: 'INS-2023-001',
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
  });

  const patch = sanitizeStudentSelfServicePatch(student, {
    contact: { email: 'ada.new@example.com', phone: '+213555123456' },
    address: { currentHostAddress: '123 Rue de Paris, Alger' },
  });

  assert.deepEqual(patch, {
    contact: {
      email: 'ada.new@example.com',
      phone: '+213555123456',
      emergencyContactName: '',
      emergencyContactPhone: '',
    },
    address: {
      homeCountryAddress: '',
      currentHostAddress: '123 Rue de Paris, Alger',
      wilaya: '',
      country: '',
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
