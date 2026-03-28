import assert from 'node:assert/strict';
import test from 'node:test';
import { getLatestAcademicEntry, getSortedAcademicHistory } from '@/lib/students/academicHistory';

const unsortedAcademicHistory = [
  {
    id: 'progress-3',
    date: '2026-01-10',
    year: 'Year 3',
    level: 'L3',
    grade: '15.8',
    status: 'ACTIVE',
  },
  {
    id: 'progress-1',
    date: '2024-01-10',
    year: 'Year 1',
    level: 'L1',
    grade: '13.4',
    status: 'PENDING',
  },
  {
    id: 'progress-2',
    date: '2025-01-10',
    year: 'Year 2',
    level: 'L2',
    grade: '14.9',
    status: 'COMPLETED',
  },
];

test('getSortedAcademicHistory orders academic records by year and level', () => {
  const sortedAcademicHistory = getSortedAcademicHistory(unsortedAcademicHistory);

  assert.deepEqual(
    sortedAcademicHistory.map((entry) => entry.id),
    ['progress-1', 'progress-2', 'progress-3'],
  );
});

test('getLatestAcademicEntry returns the newest record even when history is unsorted', () => {
  const latestAcademicEntry = getLatestAcademicEntry(unsortedAcademicHistory);

  assert.equal(latestAcademicEntry?.id, 'progress-3');
  assert.equal(latestAcademicEntry?.grade, '15.8');
  assert.equal(latestAcademicEntry?.year, 'Year 3');
});
