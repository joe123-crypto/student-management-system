import type { ProgressDetails } from '@/types';

function getAcademicOrderValue(value: string): number {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function compareAcademicHistoryEntries(left: ProgressDetails, right: ProgressDetails): number {
  const yearDelta = getAcademicOrderValue(left.year) - getAcademicOrderValue(right.year);
  if (yearDelta !== 0) {
    return yearDelta;
  }

  return getAcademicOrderValue(left.level) - getAcademicOrderValue(right.level);
}

export function getSortedAcademicHistory(academicHistory?: ProgressDetails[] | null): ProgressDetails[] {
  return [...(academicHistory ?? [])].sort(compareAcademicHistoryEntries);
}

export function getLatestAcademicEntry(academicHistory?: ProgressDetails[] | null): ProgressDetails | undefined {
  const sortedAcademicHistory = getSortedAcademicHistory(academicHistory);
  return sortedAcademicHistory[sortedAcademicHistory.length - 1];
}
