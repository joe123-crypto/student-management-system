import React from 'react';
import type { ProgressDetails } from '@/types';
import StatusBadge from './StatusBadge';

interface AcademicHistoryItemProps {
  entry: ProgressDetails;
}

export default function AcademicHistoryItem({ entry }: AcademicHistoryItemProps) {
  return (
    <div className="theme-card-muted flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <p className="theme-heading text-sm font-bold">
          {entry.year} - {entry.level}
        </p>
        <p className="theme-text-muted text-xs font-medium">Submitted on {entry.date}</p>
      </div>
      <div className="space-y-1 text-left sm:text-right">
        <p className="theme-accent text-xl font-black sm:text-lg">{entry.grade}/20</p>
        <StatusBadge status={entry.status} />
      </div>
    </div>
  );
}
