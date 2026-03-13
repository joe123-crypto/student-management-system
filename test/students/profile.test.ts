import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmptyStudentProfile, getMissingStudentOnboardingFields, requiresStudentOnboarding } from '@/lib/students/profile';

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
