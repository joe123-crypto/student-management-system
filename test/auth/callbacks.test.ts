import assert from 'node:assert/strict';
import test from 'node:test';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { authCallbacks } from '@/lib/auth/callbacks';
import { UserRole } from '@/types';

test('jwt callback copies auth claims from the authenticated user', async () => {
  assert.ok(authCallbacks?.jwt);

  const token = await authCallbacks.jwt({
    token: {
      sub: 'existing-user',
      revoked: true,
      sessionVersion: 3,
    } as JWT,
    user: {
      id: 'user-1',
      role: UserRole.ATTACHE,
      loginId: 'admin@example.com',
      subject: 'Administration',
      authProvider: 'attache_email',
      sessionVersion: 4,
    },
    account: null,
    profile: undefined,
    trigger: 'signIn',
    isNewUser: false,
    session: undefined,
  } as Parameters<NonNullable<typeof authCallbacks.jwt>>[0]);

  assert.deepEqual(token, {
    sub: 'existing-user',
    role: UserRole.ATTACHE,
    loginId: 'admin@example.com',
    subject: 'Administration',
    authProvider: 'attache_email',
    sessionVersion: 4,
  });
});

test('jwt callback preserves legacy tokens that do not have a session version yet', async () => {
  assert.ok(authCallbacks?.jwt);

  const token = {
    sub: 'legacy-user',
    loginId: 'STUDENT123',
  } as JWT;

  const result = await authCallbacks.jwt({
    token,
    user: undefined,
    account: null,
    profile: undefined,
    trigger: 'update',
    isNewUser: false,
    session: undefined,
  } as unknown as Parameters<NonNullable<typeof authCallbacks.jwt>>[0]);

  assert.equal(result, token);
});

test('session callback exposes auth claims on session.user', async () => {
  assert.ok(authCallbacks?.session);

  const session = await authCallbacks.session({
    session: { user: { name: 'Jean' }, expires: '2099-01-01T00:00:00.000Z' } as Session,
    token: {
      sub: 'user-2',
      role: UserRole.STUDENT,
      loginId: 'STUDENT123',
      subject: 'Computer Science',
      authProvider: 'student_inscription',
    } as JWT,
    user: undefined,
    newSession: undefined,
    trigger: 'update',
  } as unknown as Parameters<NonNullable<typeof authCallbacks.session>>[0]);

  assert.deepEqual(session.user, {
    name: 'Jean',
    id: 'user-2',
    role: UserRole.STUDENT,
    loginId: 'STUDENT123',
    subject: 'Computer Science',
    authProvider: 'student_inscription',
  });
});

test('session callback clears auth claims when a token has been revoked', async () => {
  assert.ok(authCallbacks?.session);

  const session = await authCallbacks.session({
    session: { user: { name: 'Jean' }, expires: '2099-01-01T00:00:00.000Z' } as Session,
    token: {
      sub: 'user-2',
      role: UserRole.STUDENT,
      loginId: 'STUDENT123',
      subject: 'Computer Science',
      authProvider: 'student_inscription',
      revoked: true,
    } as JWT,
    user: undefined,
    newSession: undefined,
    trigger: 'update',
  } as unknown as Parameters<NonNullable<typeof authCallbacks.session>>[0]);

  assert.deepEqual(session.user, {
    name: 'Jean',
    id: undefined,
    role: undefined,
    loginId: undefined,
    subject: undefined,
    authProvider: undefined,
  });
});

test('session callback leaves auth claims undefined when token claims are missing', async () => {
  assert.ok(authCallbacks?.session);

  const session = await authCallbacks.session({
    session: { expires: '2099-01-01T00:00:00.000Z' } as Session,
    token: {} as JWT,
    user: undefined,
    newSession: undefined,
    trigger: 'update',
  } as unknown as Parameters<NonNullable<typeof authCallbacks.session>>[0]);

  assert.deepEqual(session.user, {
    id: undefined,
    role: undefined,
    loginId: undefined,
    subject: undefined,
    authProvider: undefined,
  });
});
