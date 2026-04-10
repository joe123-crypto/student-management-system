import type { AttacheAgentContext, StudentProfile } from '@/types';

export function areStringArraysEqualIgnoreOrder(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;

  const counts = new Map<string, number>();
  left.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  for (const value of right) {
    const count = counts.get(value);
    if (!count) return false;

    if (count === 1) {
      counts.delete(value);
    } else {
      counts.set(value, count - 1);
    }
  }

  return counts.size === 0;
}

export function isSameAgentContext(left: AttacheAgentContext, right: AttacheAgentContext): boolean {
  return (
    areStringArraysEqualIgnoreOrder(left.filteredStudentIds, right.filteredStudentIds)
    && areStringArraysEqualIgnoreOrder(left.selectedStudentIds, right.selectedStudentIds)
    && left.searchQuery === right.searchQuery
    && left.statusFilter === right.statusFilter
    && left.university === right.university
    && left.program === right.program
    && left.duplicatesOnly === right.duplicatesOnly
  );
}

export function pruneAgentContextStudentIds(
  context: AttacheAgentContext,
  students: StudentProfile[],
): AttacheAgentContext {
  const validStudentIds = new Set(students.map((student) => student.id));
  const filteredStudentIds = context.filteredStudentIds.filter((id) => validStudentIds.has(id));
  const selectedStudentIds = context.selectedStudentIds.filter((id) => validStudentIds.has(id));

  if (
    filteredStudentIds.length === context.filteredStudentIds.length
    && selectedStudentIds.length === context.selectedStudentIds.length
  ) {
    return context;
  }

  return {
    ...context,
    filteredStudentIds,
    selectedStudentIds,
  };
}
