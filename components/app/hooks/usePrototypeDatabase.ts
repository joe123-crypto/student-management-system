'use client';

import { useEffect, useMemo, useState } from 'react';
import type { StudentProfile } from '@/types';
import {
  createPrototypeDatabase,
  deleteStudentsFromDatabase,
  getStudentProfilesFromDatabase,
  importStudentProfilesToDatabase,
  PROTOTYPE_DATABASE_STORAGE_KEY,
  type PrototypeDatabase,
  updateStudentProfileInDatabase,
} from '@/data/prototypeDatabase';
import { getFromStorage } from '@/components/app/hooks/storage';

export function usePrototypeDatabase() {
  const [database, setDatabase] = useState<PrototypeDatabase>(createPrototypeDatabase());
  const [isHydrated, setIsHydrated] = useState(false);

  const students = useMemo(() => getStudentProfilesFromDatabase(database), [database]);

  useEffect(() => {
    setDatabase(getFromStorage<PrototypeDatabase>(PROTOTYPE_DATABASE_STORAGE_KEY, createPrototypeDatabase()));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(PROTOTYPE_DATABASE_STORAGE_KEY, JSON.stringify(database));
  }, [database, isHydrated]);

  const updateStudent = (id: string, profile: Partial<StudentProfile>) => {
    setDatabase((prev) => updateStudentProfileInDatabase(prev, id, profile));
  };

  const deleteStudents = (studentIds: string[]) => {
    setDatabase((prev) => deleteStudentsFromDatabase(prev, studentIds));
  };

  const importStudents = (records: StudentProfile[], mode: 'append' | 'replace') => {
    setDatabase((prev) => importStudentProfilesToDatabase(prev, records, mode));
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
