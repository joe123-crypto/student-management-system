type StatusCarrier = {
  status: string;
};

export function normalizeStudentStatusKey(status?: string | null): string {
  return (status || '').trim().toLowerCase().replace(/[_\s]+/g, ' ');
}

export function formatStudentStatus(status?: string | null): string {
  const normalized = normalizeStudentStatusKey(status);

  if (!normalized) {
    return 'Unknown';
  }

  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getStudentStatusThemeClass(status?: string | null): string {
  const normalized = normalizeStudentStatusKey(status);

  if (['active', 'approved', 'enrolled', 'ongoing'].includes(normalized)) {
    return 'theme-success';
  }

  if (['pending', 'submitted', 'awaiting review', 'in review'].includes(normalized)) {
    return 'theme-warning';
  }

  if (['completed', 'graduated', 'finished'].includes(normalized)) {
    return 'theme-info';
  }

  if (['cancelled', 'canceled', 'dropped', 'failed', 'inactive', 'rejected', 'suspended'].includes(normalized)) {
    return 'theme-danger';
  }

  return 'theme-card-muted theme-text-muted';
}

export function countStudentsWithStatus(
  students: ReadonlyArray<StatusCarrier>,
  targetStatus: string,
): number {
  const normalizedTarget = normalizeStudentStatusKey(targetStatus);

  return students.filter((student) => normalizeStudentStatusKey(student.status) === normalizedTarget).length;
}

export function buildStudentStatusCounts(
  students: ReadonlyArray<StatusCarrier>,
): Array<{ status: string; label: string; count: number }> {
  const counts = new Map<string, { status: string; label: string; count: number }>();

  students.forEach((student) => {
    const rawStatus = student.status.trim();
    const normalized = normalizeStudentStatusKey(rawStatus || 'unknown');
    const existing = counts.get(normalized);

    if (existing) {
      existing.count += 1;
      return;
    }

    counts.set(normalized, {
      status: rawStatus || 'unknown',
      label: formatStudentStatus(rawStatus || 'unknown'),
      count: 1,
    });
  });

  return Array.from(counts.values()).sort(
    (left, right) => right.count - left.count || left.label.localeCompare(right.label),
  );
}
