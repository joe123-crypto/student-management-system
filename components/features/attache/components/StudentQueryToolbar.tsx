import React from 'react';
import Button from '@/components/ui/Button';
import type { StudentQueryState } from '@/components/features/attache/types';

interface StudentQueryToolbarProps {
  query: StudentQueryState;
  onQueryChange: (patch: Partial<StudentQueryState>) => void;
  onOpenExportOptions: () => void;
}

export default function StudentQueryToolbar({
  query,
  onQueryChange,
  onOpenExportOptions,
}: StudentQueryToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search students..."
            className="theme-input w-full rounded-2xl border py-3 pl-12 pr-4 outline-none"
            value={query.searchQuery}
            onChange={(e) => onQueryChange({ searchQuery: e.target.value })}
          />
          <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--theme-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <Button onClick={onOpenExportOptions} variant="success" className="w-full rounded-2xl md:w-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="theme-card flex items-center gap-2 rounded-xl border px-4 py-2">
          <span className="theme-text-muted text-[10px] font-bold uppercase tracking-widest">Sort:</span>
          <select
            className="theme-heading cursor-pointer bg-transparent text-xs font-bold outline-none"
            value={query.sortBy}
            onChange={(e) => onQueryChange({ sortBy: e.target.value as StudentQueryState['sortBy'] })}
          >
            <option value="name">Name (A-Z)</option>
            <option value="inscription">Inscription No.</option>
          </select>
        </div>
        <div className="theme-card flex items-center gap-2 rounded-xl border px-4 py-2">
          <span className="theme-text-muted text-[10px] font-bold uppercase tracking-widest">Status:</span>
          <select
            className="theme-heading cursor-pointer bg-transparent text-xs font-bold outline-none"
            value={query.status}
            onChange={(e) => onQueryChange({ status: e.target.value as StudentQueryState['status'] })}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
