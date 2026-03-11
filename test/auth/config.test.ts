import assert from 'node:assert/strict';
import test from 'node:test';
import authConfig from '@/auth.config';

test('auth config keeps the custom sign-in page and jwt sessions', () => {
  assert.equal(authConfig.pages?.signIn, '/login');
  assert.equal(authConfig.session?.strategy, 'jwt');
  assert.equal(authConfig.providers?.length, 1);
});
