'use client';

import { useEffect, useState } from 'react';
import {
  getRuntimeCacheKey,
  readCache,
  writeCache,
} from '@/components/shell/shared/browser-cache';
import { mergeStudentProfile } from '@/lib/students/profile';
import { services } from '@/services';
import type { PrototypeDatabase } from '@/test/mock/prototypeDatabase';
import { isMockDbEnabled } from '@/test/mock/config';
import type { StudentProfile, User } from '@/types';
import { UserRole } from '@/types';

const STUDENTS_CACHE_TTL_MS = 5 * 60 * 1000;

type StudentsPayload = {
  student?: StudentProfile | null;
  students?: StudentProfile[];
};

function upsertStudent(students: StudentProfile[], nextStudent: StudentProfile): StudentProfile[] {
  const existingIndex = students.findIndex((student) => student.id === nextStudent.id);

  if (existingIndex === -1) {
    return [...students, nextStudent];
  }

  const next = [...students];
  next[existingIndex] = nextStudent;
  return next;
}

async function readStudentError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error || `Failed to update student (${response.status}).`;
}

function mergeStudentPatch(
  students: StudentProfile[],
  id: string,
  patch: Partial<StudentProfile>,
): StudentProfile[] {
  return students.map((student) =>
    student.id === id ? mergeStudentProfile(student, patch) : student,
  );
}

export function useStudents(
  user: User | null,
  initialData: {
    students?: StudentProfile[];
    currentStudent?: StudentProfile | null;
  } = {},
) {
  const userKey = user ? `${user.role}:${user.id}:${user.loginId}` : 'anonymous';
  const [students, setStudents] = useState<StudentProfile[]>(initialData.students || []);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(
    initialData.currentStudent ?? null,
  );
  const [hydratedKey, setHydratedKey] = useState<string | null>(
    user ? userKey : initialData.students?.length || initialData.currentStudent ? 'anonymous' : null,
  );
  const [mockDatabase, setMockDatabase] = useState<PrototypeDatabase | null>(null);
  const isHydrated = hydratedKey === userKey;

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === UserRole.ATTACHE) {
      setStudents((current) => (current.length > 0 ? current : initialData.students || []));
      setCurrentStudent(null);
    } else {
      setStudents((current) =>
        current.length > 0 ? current : initialData.currentStudent ? [initialData.currentStudent] : [],
      );
      setCurrentStudent((current) => current ?? initialData.currentStudent ?? null);
    }

    setHydratedKey((current) => current ?? userKey);
  }, [initialData.currentStudent, initialData.students, user, userKey]);

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

  function applyServerState(
    nextUser: User,
    payload: StudentsPayload,
  ) {
    if (nextUser.role === UserRole.ATTACHE) {
      setStudents(payload.students || []);
      setCurrentStudent(null);
      return;
    }

    const student = payload.student || null;
    setStudents(student ? [student] : []);
    setCurrentStudent(student);
  }

  function getStudentsCacheKey(nextUser: User) {
    return getRuntimeCacheKey(nextUser, 'students');
  }

  function buildPayload(nextUser: User, nextStudents: StudentProfile[], nextStudent: StudentProfile | null) {
    if (nextUser.role === UserRole.ATTACHE) {
      return { students: nextStudents };
    }

    return { student: nextStudent };
  }

  function persistCachedPayload(nextUser: User, payload: StudentsPayload) {
    void writeCache(getStudentsCacheKey(nextUser), payload, STUDENTS_CACHE_TTL_MS).catch((error) => {
      console.error('[STUDENTS] Failed to write IndexedDB student cache:', error);
    });
  }

  async function fetchStudentsFromApi(nextUser: User, signal?: AbortSignal) {
    const response = await fetch(
      nextUser.role === UserRole.ATTACHE ? '/api/students' : '/api/students/me',
      {
        method: 'GET',
        cache: 'no-store',
        signal,
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to load students (${response.status}).`);
    }

    return (await response.json()) as {
      student?: StudentProfile | null;
      students?: StudentProfile[];
    };
  }

  async function refreshStudentsFromServer(nextUser: User) {
    if (isMockDbEnabled()) {
      const database = mockDatabase ?? services.students.loadDatabase();
      syncMockState(database, nextUser);
      return;
    }

    const payload = await fetchStudentsFromApi(nextUser);
    applyServerState(nextUser, payload);
    persistCachedPayload(nextUser, payload);
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

      const cacheKey = getStudentsCacheKey(user);
      let hasCachedStudents = false;

      try {
        try {
          const cachedPayload = await readCache<StudentsPayload>(cacheKey);
          if (!isCancelled && cachedPayload) {
            hasCachedStudents = true;
            applyServerState(user, cachedPayload);
            setHydratedKey(userKey);
          }
        } catch (error) {
          console.error('[STUDENTS] Failed to read IndexedDB student cache:', error);
        }

        const payload = await fetchStudentsFromApi(user, controller.signal);

        if (isCancelled) {
          return;
        }

        applyServerState(user, payload);
        persistCachedPayload(user, payload);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('[STUDENTS] Failed to hydrate students:', error);
        }

        if (!isCancelled && !hasCachedStudents) {
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

    const previousStudents = students;
    const previousCurrentStudent = currentStudent;

    setStudents((current) => mergeStudentPatch(current, id, profile));
    setCurrentStudent((current) =>
      current && current.id === id ? mergeStudentProfile(current, profile) : current,
    );

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patch: profile }),
      });

      if (!response.ok) {
        throw new Error(await readStudentError(response));
      }

      const payload = (await response.json()) as { student: StudentProfile };
      const nextStudent = payload.student;

      setStudents((current) =>
        user?.role === UserRole.ATTACHE ? upsertStudent(current, nextStudent) : [nextStudent],
      );

      if (user?.role === UserRole.STUDENT) {
        setCurrentStudent(nextStudent);
      }

      if (user) {
        persistCachedPayload(
          user,
          buildPayload(
            user,
            user.role === UserRole.ATTACHE ? upsertStudent(students, nextStudent) : [nextStudent],
            user.role === UserRole.STUDENT ? nextStudent : null,
          ),
        );
      }

      if (user) {
        void refreshStudentsFromServer(user).catch((error) => {
          console.error('[STUDENTS] Failed to refresh students after update:', error);
        });
      }
    } catch (error) {
      setStudents(previousStudents);
      setCurrentStudent(previousCurrentStudent);
      throw error;
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

    if (user) {
      persistCachedPayload(
        user,
        buildPayload(
          user,
          students.filter((student) => !studentIds.includes(student.id)),
          currentStudent && !studentIds.includes(currentStudent.id) ? currentStudent : null,
        ),
      );
    }
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

    if (user) {
      persistCachedPayload(user, buildPayload(user, payload.students || [], null));
    }
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
