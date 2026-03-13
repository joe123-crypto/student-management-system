'use client';

import { useEffect, useState } from 'react';
import { services } from '@/services';
import type { PrototypeDatabase } from '@/test/mock/prototypeDatabase';
import { isMockDbEnabled } from '@/test/mock/config';
import type { StudentProfile, User } from '@/types';
import { UserRole } from '@/types';

function upsertStudent(students: StudentProfile[], nextStudent: StudentProfile): StudentProfile[] {
  const existingIndex = students.findIndex((student) => student.id === nextStudent.id);

  if (existingIndex === -1) {
    return [...students, nextStudent];
  }

  const next = [...students];
  next[existingIndex] = nextStudent;
  return next;
}

export function useStudents(user: User | null) {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const [mockDatabase, setMockDatabase] = useState<PrototypeDatabase | null>(null);
  const userKey = user ? `${user.role}:${user.id}:${user.loginId}` : 'anonymous';
  const isHydrated = hydratedKey === userKey;

  function syncMockState(database: PrototypeDatabase, nextUser: User | null) {
    const nextStudents = services.students.getProfiles(database);
    setMockDatabase(database);

    if (!nextUser) {
      setStudents([]);
      setCurrentStudent(null);
      return;
    }

    if (nextUser.role === UserRole.ATTACHE) {
      setStudents(nextStudents);
      setCurrentStudent(null);
      return;
    }

    const student =
      nextStudents.find(
        (entry) =>
          entry.student.inscriptionNumber.trim().toUpperCase() === nextUser.loginId.trim().toUpperCase(),
      ) ?? null;

    setStudents(student ? [student] : []);
    setCurrentStudent(student);
  }

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function loadStudents() {
      if (isMockDbEnabled()) {
        if (!user) {
          if (!isCancelled) {
            setMockDatabase(null);
            setStudents([]);
            setCurrentStudent(null);
            setHydratedKey(userKey);
          }
          return;
        }

        try {
          const database = services.students.loadDatabase();

          if (!isCancelled) {
            syncMockState(database, user);
          }
        } catch (error) {
          console.error('[STUDENTS] Failed to hydrate mock students:', error);

          if (!isCancelled) {
            setMockDatabase(null);
            setStudents([]);
            setCurrentStudent(null);
          }
        } finally {
          if (!isCancelled) {
            setHydratedKey(userKey);
          }
        }

        return;
      }

      if (!user) {
        if (!isCancelled) {
          setStudents([]);
          setCurrentStudent(null);
          setHydratedKey(userKey);
        }
        return;
      }

      try {
        const response = await fetch(
          user.role === UserRole.ATTACHE ? '/api/students' : '/api/students/me',
          {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to load students (${response.status}).`);
        }

        const payload = (await response.json()) as {
          student?: StudentProfile | null;
          students?: StudentProfile[];
        };

        if (isCancelled) {
          return;
        }

        if (user.role === UserRole.ATTACHE) {
          setStudents(payload.students || []);
          setCurrentStudent(null);
        } else {
          const student = payload.student || null;
          setStudents(student ? [student] : []);
          setCurrentStudent(student);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('[STUDENTS] Failed to hydrate students:', error);
        }

        if (!isCancelled) {
          setStudents([]);
          setCurrentStudent(null);
        }
      } finally {
        if (!isCancelled) {
          setHydratedKey(userKey);
        }
      }
    }

    void loadStudents();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [user, userKey]);

  async function updateStudent(id: string, profile: Partial<StudentProfile>) {
    if (isMockDbEnabled()) {
      const database = mockDatabase ?? services.students.loadDatabase();
      const nextDatabase = services.students.updateStudent(database, id, profile);
      services.students.saveDatabase(nextDatabase);
      syncMockState(nextDatabase, user);
      return;
    }

    const response = await fetch(`/api/students/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patch: profile }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update student (${response.status}).`);
    }

    const payload = (await response.json()) as { student: StudentProfile };
    const nextStudent = payload.student;

    setStudents((current) =>
      user?.role === UserRole.ATTACHE ? upsertStudent(current, nextStudent) : [nextStudent],
    );

    if (user?.role === UserRole.STUDENT) {
      setCurrentStudent(nextStudent);
    }
  }

  async function deleteStudents(studentIds: string[]) {
    if (studentIds.length === 0) {
      return;
    }

    if (isMockDbEnabled()) {
      const database = mockDatabase ?? services.students.loadDatabase();
      const nextDatabase = services.students.deleteStudents(database, studentIds);
      services.students.saveDatabase(nextDatabase);
      syncMockState(nextDatabase, user);
      return;
    }

    const response = await fetch('/api/students', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: studentIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete students (${response.status}).`);
    }

    setStudents((current) => current.filter((student) => !studentIds.includes(student.id)));
  }

  async function importStudents(records: StudentProfile[], mode: 'append' | 'replace') {
    if (isMockDbEnabled()) {
      const database = mockDatabase ?? services.students.loadDatabase();
      const nextDatabase = services.students.importStudents(database, records, mode);
      services.students.saveDatabase(nextDatabase);
      syncMockState(nextDatabase, user);
      return;
    }

    const response = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records, mode }),
    });

    if (!response.ok) {
      throw new Error(`Failed to import students (${response.status}).`);
    }

    const payload = (await response.json()) as { students: StudentProfile[] };
    setStudents(payload.students || []);
  }

  return {
    students,
    currentStudent,
    updateStudent,
    deleteStudents,
    importStudents,
    isHydrated,
  };
}
