import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import type { StudentProfile } from '@/types';
import type { StudentQueryState } from '@/components/features/attache/types';
import { applyStudentQuery } from '@/components/features/attache/utils/studentData';

interface UseStudentTableResult {
  tableStudents: StudentProfile[];
  isStudentTableLoading: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginatedTableStudents: StudentProfile[];
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
}

export default function useStudentTable(
  students: StudentProfile[],
  query: StudentQueryState,
  duplicateStudentIds: Set<string>,
  defaultPageSize: number,
): UseStudentTableResult {
  const [tableStudents, setTableStudents] = useState<StudentProfile[]>([]);
  const [isStudentTableLoading, setIsStudentTableLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  useEffect(() => {
    let isActive = true;
    setIsStudentTableLoading(true);

    const timerId = window.setTimeout(() => {
      if (!isActive) return;
      setTableStudents(applyStudentQuery(students, query, duplicateStudentIds));
      setIsStudentTableLoading(false);
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timerId);
    };
  }, [students, query, duplicateStudentIds]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, students]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(tableStudents.length / pageSize)), [tableStudents.length, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTableStudents = useMemo(() => {
    const pageStartIndex = (currentPage - 1) * pageSize;
    return tableStudents.slice(pageStartIndex, pageStartIndex + pageSize);
  }, [tableStudents, currentPage, pageSize]);

  return {
    tableStudents,
    isStudentTableLoading,
    currentPage,
    pageSize,
    totalPages,
    paginatedTableStudents,
    setCurrentPage,
    setPageSize,
  };
}
