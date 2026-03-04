import { getFromStorage } from '@/components/shell/shared/storage';
import type { User } from '@/types';
import { UserRole } from '@/types';
import type { AuthPasswordStore, AuthService } from '@/services/contracts';

const USER_STORAGE_KEY = 'user';
const AUTH_PASSWORDS_STORAGE_KEY = 'auth_passwords_v1';

function normalizeStoredUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;

  const entry = raw as Partial<User> & { email?: string };
  const role = entry.role;
  if (role !== UserRole.STUDENT && role !== UserRole.ATTACHE) return null;

  const legacyEmail = typeof entry.legacyEmail === 'string' ? entry.legacyEmail : entry.email;
  const loginId =
    typeof entry.loginId === 'string' && entry.loginId
      ? entry.loginId
      : typeof entry.email === 'string'
        ? entry.email
        : '';
  const authProvider =
    entry.authProvider === 'student_inscription' || entry.authProvider === 'attache_email'
      ? entry.authProvider
      : role === UserRole.STUDENT
        ? 'student_inscription'
        : 'attache_email';

  return {
    id: typeof entry.id === 'string' && entry.id ? entry.id : Math.random().toString(36).slice(2, 11),
    subject:
      typeof entry.subject === 'string' && entry.subject
        ? entry.subject
        : role === UserRole.STUDENT
          ? `student:${loginId || 'unknown'}`
          : 'attache:default',
    loginId,
    authProvider,
    legacyEmail: legacyEmail || undefined,
    role,
  };
}

function normalizeStoredAuthPasswords(raw: unknown): AuthPasswordStore {
  if (!raw || typeof raw !== 'object') return {};
  return Object.entries(raw as Record<string, unknown>).reduce<AuthPasswordStore>((acc, [key, value]) => {
    if (typeof value === 'string' && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export const mockAuthService: AuthService = {
  loadUser() {
    return normalizeStoredUser(getFromStorage<unknown>(USER_STORAGE_KEY, null));
  },
  saveUser(user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },
  loadPasswordStore() {
    return normalizeStoredAuthPasswords(getFromStorage<unknown>(AUTH_PASSWORDS_STORAGE_KEY, {}));
  },
  savePasswordStore(passwords) {
    window.localStorage.setItem(AUTH_PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
  },
};

