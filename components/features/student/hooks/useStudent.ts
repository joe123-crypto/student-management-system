import { useMemo } from 'react';
import type { StudentProfile } from '@/types';

export function useStudent(students: StudentProfile[], email: string) {
  return useMemo(() => students.find((s) => s.contact.email === email) ?? null, [students, email]);
}
