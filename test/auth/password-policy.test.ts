import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PASSWORD_REQUIREMENTS_MESSAGE,
  generateStudentPassword,
  isStrongPassword,
} from '@/lib/auth/password-policy';

test('generated student passwords are strong and seeded by inscription number', () => {
  const password = generateStudentPassword('8ZWE27877', [1, 2, 3, 4, 5, 6]);

  assert.equal(password, 'IZWizw!877BDFHKM');
  assert.ok(isStrongPassword(password));
});

test('generated student passwords change when random input changes', () => {
  const firstPassword = generateStudentPassword('8ZWE27877', [1, 2, 3, 4, 5, 6]);
  const secondPassword = generateStudentPassword('8ZWE27877', [6, 5, 4, 3, 2, 1]);

  assert.notEqual(firstPassword, secondPassword);
  assert.ok(isStrongPassword(firstPassword));
  assert.ok(isStrongPassword(secondPassword));
});

test('password strength validation rejects weak passwords', () => {
  assert.equal(
    PASSWORD_REQUIREMENTS_MESSAGE,
    'New password must be at least 12 characters long and include uppercase, lowercase, a number, and a symbol.',
  );
  assert.equal(isStrongPassword('weak-pass'), false);
  assert.equal(isStrongPassword('StrongPass123!'), true);
});
