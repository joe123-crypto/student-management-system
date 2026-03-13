import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateAccess, getDefaultSignedInRoute } from '@/lib/auth/access-control';
import { UserRole } from '@/types';

test('students are redirected to the login page when they access protected routes anonymously', () => {
  const decision = evaluateAccess({
    pathname: '/student/dashboard',
    isLoggedIn: false,
  });

  assert.deepEqual(decision, { action: 'redirect', target: '/login' });
});

test('students can access student routes after sign-in', () => {
  const decision = evaluateAccess({
    pathname: '/student/dashboard',
    isLoggedIn: true,
    role: UserRole.STUDENT,
  });

  assert.deepEqual(decision, { action: 'allow' });
});

test('attaches cannot access student routes', () => {
  const decision = evaluateAccess({
    pathname: '/student/dashboard',
    isLoggedIn: true,
    role: UserRole.ATTACHE,
  });

  assert.deepEqual(decision, { action: 'redirect', target: '/attache/dashboard' });
});

test('students cannot access attache routes', () => {
  const decision = evaluateAccess({
    pathname: '/attache/dashboard',
    isLoggedIn: true,
    role: UserRole.STUDENT,
  });

  assert.deepEqual(decision, { action: 'redirect', target: '/onboarding' });
});

test('signed-in users are redirected away from the login page', () => {
  const studentDecision = evaluateAccess({
    pathname: '/login',
    isLoggedIn: true,
    role: UserRole.STUDENT,
  });
  const attacheDecision = evaluateAccess({
    pathname: '/login',
    isLoggedIn: true,
    role: UserRole.ATTACHE,
  });

  assert.deepEqual(studentDecision, { action: 'redirect', target: '/onboarding' });
  assert.deepEqual(attacheDecision, { action: 'redirect', target: '/attache/dashboard' });
});

test('onboarding remains student-only', () => {
  const anonymousDecision = evaluateAccess({
    pathname: '/onboarding',
    isLoggedIn: false,
  });
  const attacheDecision = evaluateAccess({
    pathname: '/onboarding',
    isLoggedIn: true,
    role: UserRole.ATTACHE,
  });

  assert.deepEqual(anonymousDecision, { action: 'redirect', target: '/login' });
  assert.deepEqual(attacheDecision, { action: 'redirect', target: '/attache/dashboard' });
});

test('default signed-in routes stay role-specific', () => {
  assert.equal(getDefaultSignedInRoute(UserRole.STUDENT), '/onboarding');
  assert.equal(getDefaultSignedInRoute(UserRole.ATTACHE), '/attache/dashboard');
});
