import React from 'react';
import Button from '@/components/ui/Button';
import type { StudentQueryState } from '@/components/features/attache/types';

interface StudentQueryToolbarProps {
  query: StudentQueryState;
  onQueryChange: (patch: Partial<StudentQueryState>) => void;
  onOpenExportOptions: () => void;
  showAdvancedToggle?: boolean;
  onToggleAdvanced?: () => void;
  advancedOpen?: boolean;
}

export default function StudentQueryToolbar({
  query,
  onQueryChange,
  onOpenExportOptions,
  showAdvancedToggle = true,
  onToggleAdvanced,
  advancedOpen = false,
}: StudentQueryToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search students..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={query.searchQuery}
            onChange={(e) => onQueryChange({ searchQuery: e.target.value })}
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {showAdvancedToggle ? (
            <Button onClick={onToggleAdvanced} variant="secondary" className="w-full md:w-auto">
              {advancedOpen ? 'Hide Filters' : 'Advanced Filters'}
            </Button>
          ) : null}
          <Button onClick={onOpenExportOptions} variant="success" className="w-full md:w-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort:</span>
          <select
            className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
            value={query.sortBy}
            onChange={(e) => onQueryChange({ sortBy: e.target.value as StudentQueryState['sortBy'] })}
          >
            <option value="name">Name (A-Z)</option>
            <option value="inscription">Inscription No.</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
          <select
            className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
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
