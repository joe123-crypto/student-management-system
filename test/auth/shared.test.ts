import assert from 'node:assert/strict';
import test from 'node:test';
import { getSigninLimits, normalizeLoginId, normalizeRole } from '@/lib/auth/shared';
import { UserRole } from '@/types';

function restoreEnv(name: 'AUTH_MAX_FAILED_ATTEMPTS' | 'AUTH_LOCK_MINUTES', value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

test('role normalization defaults to student', () => {
  assert.equal(normalizeRole(undefined), UserRole.STUDENT);
  assert.equal(normalizeRole('unexpected'), UserRole.STUDENT);
  assert.equal(normalizeRole(UserRole.ATTACHE), UserRole.ATTACHE);
});

test('login identifiers are normalized per role', () => {
  assert.equal(normalizeLoginId(UserRole.STUDENT, ' ins-2023-001 '), 'INS-2023-001');
  assert.equal(normalizeLoginId(UserRole.ATTACHE, ' Admin@Example.com '), 'admin@example.com');
});

test('sign-in limits fall back to defaults when env values are invalid', () => {
  const originalMaxAttempts = process.env.AUTH_MAX_FAILED_ATTEMPTS;
  const originalLockMinutes = process.env.AUTH_LOCK_MINUTES;

  process.env.AUTH_MAX_FAILED_ATTEMPTS = '0';
  process.env.AUTH_LOCK_MINUTES = 'not-a-number';

  assert.deepEqual(getSigninLimits(), {
    maxAttempts: 5,
    lockMinutes: 15,
  });

  restoreEnv('AUTH_MAX_FAILED_ATTEMPTS', originalMaxAttempts);
  restoreEnv('AUTH_LOCK_MINUTES', originalLockMinutes);
});

test('sign-in limits honor valid env overrides', () => {
  const originalMaxAttempts = process.env.AUTH_MAX_FAILED_ATTEMPTS;
  const originalLockMinutes = process.env.AUTH_LOCK_MINUTES;

  process.env.AUTH_MAX_FAILED_ATTEMPTS = '3';
  process.env.AUTH_LOCK_MINUTES = '10';

  assert.deepEqual(getSigninLimits(), {
    maxAttempts: 3,
    lockMinutes: 10,
  });

  restoreEnv('AUTH_MAX_FAILED_ATTEMPTS', originalMaxAttempts);
  restoreEnv('AUTH_LOCK_MINUTES', originalLockMinutes);
});
