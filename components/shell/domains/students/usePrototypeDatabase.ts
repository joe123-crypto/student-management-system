'use client';

import { useEffect, useMemo, useState } from 'react';
import type { StudentProfile } from '@/types';
import { createPrototypeDatabase, type PrototypeDatabase } from '@/test/mock/prototypeDatabase';
import { services } from '@/services';

export function usePrototypeDatabase() {
  const [database, setDatabase] = useState<PrototypeDatabase>(createPrototypeDatabase());
  const [isHydrated, setIsHydrated] = useState(false);

  const students = useMemo(() => services.students.getProfiles(database), [database]);

  useEffect(() => {
    setDatabase(services.students.loadDatabase());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    services.students.saveDatabase(database);
  }, [database, isHydrated]);

  const updateStudent = (id: string, profile: Partial<StudentProfile>) => {
    setDatabase((prev) => services.students.updateStudent(prev, id, profile));
  };

  const deleteStudents = (studentIds: string[]) => {
    setDatabase((prev) => services.students.deleteStudents(prev, studentIds));
  };

  const importStudents = (records: StudentProfile[], mode: 'append' | 'replace') => {
    setDatabase((prev) => services.students.importStudents(prev, records, mode));
  };

  return {
    database,
    students,
    updateStudent,
    deleteStudents,
    importStudents,
    isHydrated,
  };
}
