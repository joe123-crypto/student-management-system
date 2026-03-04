import React from 'react';
import type { ProgressDetails } from '@/types';
import StatusBadge from './StatusBadge';

interface AcademicHistoryItemProps {
  entry: ProgressDetails;
}

export default function AcademicHistoryItem({ entry }: AcademicHistoryItemProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <p className="text-sm font-bold text-slate-800">
          {entry.year} - {entry.level}
        </p>
        <p className="text-xs text-slate-400 font-medium">Submitted on {entry.date}</p>
      </div>
      <div className="space-y-1 text-left sm:text-right">
        <p className="text-xl font-black text-indigo-600 sm:text-lg">{entry.grade}/20</p>
        <StatusBadge status={entry.status} />
      </div>
    </div>
  );
}
