import React from 'react';
import type { ProgressDetails } from '@/types';
import StatusBadge from './StatusBadge';

interface AcademicHistoryItemProps {
  entry: ProgressDetails;
}

export default function AcademicHistoryItem({ entry }: AcademicHistoryItemProps) {
  return (
    <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
      <div>
        <p className="text-sm font-bold text-slate-800">
          {entry.year} - {entry.level}
        </p>
        <p className="text-xs text-slate-400 font-medium">Submitted on {entry.date}</p>
      </div>
      <div className="text-right space-y-1">
        <p className="text-lg font-black text-indigo-600">{entry.grade}/20</p>
        <StatusBadge status={entry.status} />
      </div>
    </div>
  );
}
