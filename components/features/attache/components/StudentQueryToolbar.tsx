import React from 'react';
import type { StudentQueryState } from '@/components/features/attache/types';
import { formatStudentStatus } from '@/lib/students/status';

interface StudentQueryToolbarProps {
  query: StudentQueryState;
  statusOptions: string[];
  onQueryChange: (patch: Partial<StudentQueryState>) => void;
}

interface StudentSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function StudentSearchInput({
  value,
  onChange,
  className,
}: StudentSearchInputProps) {
  return (
    <div className={className ?? 'relative w-full md:w-96 md:flex-shrink-0'}>
      <input
        type="text"
        placeholder="Search students..."
        className="theme-input h-14 w-full rounded-2xl border pl-12 pr-4 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--theme-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}

export default function StudentQueryToolbar({
  query,
  statusOptions,
  onQueryChange,
}: StudentQueryToolbarProps) {
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      <div className="theme-card flex min-h-11 min-w-0 items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-[0_10px_24px_-20px_rgba(96,83,55,0.4)] sm:min-w-60">
        <label htmlFor="student-sort" className="theme-text-muted type-label shrink-0">
          Sort:
        </label>
        <select
          id="student-sort"
          className="theme-heading min-w-0 flex-1 cursor-pointer bg-transparent text-xs font-bold outline-none"
          value={query.sortBy}
          onChange={(e) => onQueryChange({ sortBy: e.target.value as StudentQueryState['sortBy'] })}
        >
          <option value="name">Name (A-Z)</option>
          <option value="inscription">Inscription No.</option>
        </select>
      </div>
      <div className="theme-card flex min-h-11 min-w-0 items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-[0_10px_24px_-20px_rgba(96,83,55,0.4)] sm:min-w-56">
        <label htmlFor="student-status" className="theme-text-muted type-label shrink-0">
          Status:
        </label>
        <select
          id="student-status"
          className="theme-heading min-w-0 flex-1 cursor-pointer bg-transparent text-xs font-bold outline-none"
          value={query.status}
          onChange={(e) => onQueryChange({ status: e.target.value as StudentQueryState['status'] })}
        >
          <option value="ALL">All Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {formatStudentStatus(status)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
