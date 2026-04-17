import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PASSWORD_REQUIREMENTS_MESSAGE,
  generateStudentPassword,
  isStrongPassword,
} from '@/lib/auth/password-policy';

test('generated student passwords are strong and seeded by inscription number', () => {
  const password = generateStudentPassword('8ZWE27877', [1, 2, 3]);

  assert.equal(password, 'IZiz!77BDF');
  assert.ok(isStrongPassword(password));
});

test('generated student passwords change when random input changes', () => {
  const firstPassword = generateStudentPassword('8ZWE27877', [1, 2, 3]);
  const secondPassword = generateStudentPassword('8ZWE27877', [6, 5, 4]);

  assert.notEqual(firstPassword, secondPassword);
  assert.ok(isStrongPassword(firstPassword));
  assert.ok(isStrongPassword(secondPassword));
  assert.equal(firstPassword.length, 10);
  assert.equal(secondPassword.length, 10);
});

test('password strength validation rejects weak passwords', () => {
  assert.equal(
    PASSWORD_REQUIREMENTS_MESSAGE,
    'New password must be at least 10 characters long and include uppercase, lowercase, a number, and a symbol.',
  );
  assert.equal(isStrongPassword('weak-pass'), false);
  assert.equal(isStrongPassword('Strong1!x'), false);
  assert.equal(isStrongPassword('Strong1!xy'), true);
});
