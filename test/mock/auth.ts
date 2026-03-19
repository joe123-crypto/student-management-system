import { INITIAL_PROTOTYPE_DATABASE } from '@/test/mock/prototypeSeedData';
import { UserRole } from '@/types';

export const MOCK_ATTACHE_LOGIN_ID = 'admin@scholarsalger.dz';
export const MOCK_STUDENT_LOGIN_ID = INITIAL_PROTOTYPE_DATABASE.STUDENT[0]?.inscription_no ?? 'INS-2023-001';
export const MOCK_PASSWORD_PLACEHOLDER = 'ScholarsDemo!2026';

type MockAuthorizedUser = {
  id: string;
  role: UserRole;
  loginId: string;
  subject: string;
  authProvider: 'student_inscription' | 'attache_email';
};

export function authorizeMockUser(
  role: UserRole,
  loginId: string,
  password: string,
): MockAuthorizedUser | null {
  const expectedPassword = (process.env.NEXT_PUBLIC_ATTACHE_PASSWORD ?? MOCK_PASSWORD_PLACEHOLDER).trim();
  if (!password || password !== expectedPassword) {
    return null;
  }

  if (role === UserRole.STUDENT) {
    const student = INITIAL_PROTOTYPE_DATABASE.STUDENT.find(
      (entry) => entry.inscription_no.trim().toUpperCase() === loginId,
    );

    if (!student) {
      return null;
    }

    return {
      id: `mock-student-${student.id}`,
      role: UserRole.STUDENT,
      loginId: student.inscription_no,
      subject: 'Mock Studies',
      authProvider: 'student_inscription',
    };
  }

  if (loginId !== MOCK_ATTACHE_LOGIN_ID) {
    return null;
  }

  return {
    id: 'mock-attache-admin',
    role: UserRole.ATTACHE,
    loginId,
    subject: 'Administration',
    authProvider: 'attache_email',
  };
}
