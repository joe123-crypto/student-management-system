import { useCallback, useEffect, useState } from 'react';
import type { StudentProfile } from '@/types';

interface UseStudentSelectionOptions {
  isReady?: boolean;
  onDeleteStudents?: (studentIds: string[]) => void;
  onAfterDelete?: (deletedIds: string[]) => void;
}

interface UseStudentSelectionResult {
  selectedStudentIds: Set<string>;
  reviewedStudentIds: Set<string>;
  clearSelection: () => void;
  handleToggleSelectAll: (studentsOnPage: StudentProfile[], checked: boolean) => void;
  handleToggleSelectOne: (studentId: string, checked: boolean) => void;
  handleMarkReviewed: () => void;
  handleDeleteSelected: () => void;
}

export default function useStudentSelection(
  filteredStudents: StudentProfile[],
  { isReady = true, onDeleteStudents, onAfterDelete }: UseStudentSelectionOptions = {},
): UseStudentSelectionResult {
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [reviewedStudentIds, setReviewedStudentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isReady) return;
    setSelectedStudentIds((prev) => {
      const visibleStudentIds = new Set(filteredStudents.map((student) => student.id));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (visibleStudentIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [filteredStudents, isReady]);

  const clearSelection = useCallback(() => {
    setSelectedStudentIds(new Set());
  }, []);

  const handleToggleSelectAll = useCallback((studentsOnPage: StudentProfile[], checked: boolean) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      studentsOnPage.forEach((student) => {
        if (checked) next.add(student.id);
        else next.delete(student.id);
      });
      return next;
    });
  }, []);

  const handleToggleSelectOne = useCallback((studentId: string, checked: boolean) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(studentId);
      else next.delete(studentId);
      return next;
    });
  }, []);

  const handleMarkReviewed = useCallback(() => {
    setReviewedStudentIds((prev) => {
      const next = new Set(prev);
      selectedStudentIds.forEach((id) => next.add(id));
      return next;
    });
  }, [selectedStudentIds]);

  const handleDeleteSelected = useCallback(() => {
    if (!onDeleteStudents || selectedStudentIds.size === 0) return;

    const shouldDelete = window.confirm(
      `Delete ${selectedStudentIds.size} selected record${selectedStudentIds.size === 1 ? '' : 's'}? This cannot be undone.`,
    );
    if (!shouldDelete) return;

    const idsToDelete = Array.from(selectedStudentIds);
    onDeleteStudents(idsToDelete);
    setSelectedStudentIds(new Set());
    setReviewedStudentIds((prev) => {
      const next = new Set(prev);
      idsToDelete.forEach((id) => next.delete(id));
      return next;
    });
    onAfterDelete?.(idsToDelete);
  }, [onAfterDelete, onDeleteStudents, selectedStudentIds]);

  return {
    selectedStudentIds,
    reviewedStudentIds,
    clearSelection,
    handleToggleSelectAll,
    handleToggleSelectOne,
    handleMarkReviewed,
    handleDeleteSelected,
  };
}
