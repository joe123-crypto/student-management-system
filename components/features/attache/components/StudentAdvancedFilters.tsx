import React, { useState } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import type { StudentQueryState } from '@/components/features/attache/types';
import { ChevronDown } from 'lucide-react';

interface StudentAdvancedFiltersProps {
  query: StudentQueryState;
  universities: string[];
  programs: string[];
  academicYears: string[];
  onQueryChange: (patch: Partial<StudentQueryState>) => void;
  onReset: () => void;
  compact?: boolean;
}

export default function StudentAdvancedFilters({
  query,
  universities,
  programs,
  academicYears,
  onQueryChange,
  onReset,
  compact = false,
}: StudentAdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperClass = compact
    ? 'bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 relative z-30'
    : 'bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4';
  const contentClass = compact
    ? 'absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4 max-h-[70vh] overflow-y-auto'
    : 'space-y-4';

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
          aria-expanded={isOpen}
        >
          Advanced Filtering
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen ? (
          <button type="button" onClick={onReset} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
            Reset
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div className={contentClass}>
          <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">University</label>
              <select
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={query.university}
                onChange={(e) => onQueryChange({ university: e.target.value })}
              >
                <option value="ALL">All Universities</option>
                {universities.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Program</label>
              <select
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={query.program}
                onChange={(e) => onQueryChange({ program: e.target.value })}
              >
                <option value="ALL">All Programs</option>
                {programs.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Year</label>
              <select
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={query.academicYear}
                onChange={(e) => onQueryChange({ academicYear: e.target.value })}
              >
                <option value="ALL">All Years</option>
                {academicYears.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Missing Data</label>
              <select
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={query.missingData}
                onChange={(e) => onQueryChange({ missingData: e.target.value as StudentQueryState['missingData'] })}
              >
                <option value="ALL">All Records</option>
                <option value="ANY_MISSING">Any Missing Fields</option>
                <option value="MISSING_PROFILE">Missing Profile Picture</option>
                <option value="MISSING_BANK">Missing Banking Data</option>
                <option value="NONE">No Missing Fields</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Document Status</label>
              <select
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={query.documentStatus}
                onChange={(e) => onQueryChange({ documentStatus: e.target.value as StudentQueryState['documentStatus'] })}
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="MISSING">Missing</option>
              </select>
            </div>

            <div className="flex items-end">
              <Checkbox
                checked={query.duplicatesOnly}
                onChange={(e) => onQueryChange({ duplicatesOnly: e.target.checked })}
                label="Duplicates only"
                containerClassName="font-semibold"
              />
            </div>
          </div>

          <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Program Start Date From</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={query.startDateFrom}
                onChange={(e) => onQueryChange({ startDateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Program Start Date To</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={query.startDateTo}
                onChange={(e) => onQueryChange({ startDateTo: e.target.value })}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">Collapsed. Click Advanced Filtering to show filters.</p>
      )}
    </div>
  );
}
