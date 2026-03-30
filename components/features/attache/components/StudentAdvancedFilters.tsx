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
    ? 'theme-card relative z-30 space-y-4 rounded-2xl border p-5'
    : 'theme-card space-y-4 rounded-2xl border p-5';
  const contentClass = compact
    ? 'theme-card absolute left-0 right-0 top-full mt-2 max-h-[70vh] space-y-4 overflow-y-auto rounded-2xl border p-5 shadow-xl'
    : 'space-y-4';

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="theme-text-muted type-label inline-flex items-center gap-2 hover:text-[color:var(--theme-primary-soft)]"
          aria-expanded={isOpen}
        >
          Advanced Filtering
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen ? (
          <button type="button" onClick={onReset} className="theme-link text-xs font-bold">
            Reset
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div className={contentClass}>
          <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
            <div>
              <label className="theme-text-muted type-label mb-2 block">University</label>
              <select
                className="theme-input w-full rounded-xl border px-3 py-2.5 outline-none"
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
              <label className="theme-text-muted type-label mb-2 block">Program</label>
              <select
                className="theme-input w-full rounded-xl border px-3 py-2.5 outline-none"
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
              <label className="theme-text-muted type-label mb-2 block">Academic Year</label>
              <select
                className="theme-input w-full rounded-xl border px-3 py-2.5 outline-none"
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
              <label className="theme-text-muted type-label mb-2 block">Missing Data</label>
              <select
                className="theme-input w-full rounded-xl border px-3 py-2.5 outline-none"
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
              <label className="theme-text-muted type-label mb-2 block">Document Status</label>
              <select
                className="theme-input w-full rounded-xl border px-3 py-2.5 outline-none"
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
              <label className="theme-text-muted type-label mb-2 block">Program Start Date From</label>
              <input
                type="date"
                className="theme-input w-full rounded-xl border px-3 py-2.5 outline-none"
                value={query.startDateFrom}
                onChange={(e) => onQueryChange({ startDateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="theme-text-muted type-label mb-2 block">Program Start Date To</label>
              <input
                type="date"
                className="theme-input w-full rounded-xl border px-3 py-2.5 outline-none"
                value={query.startDateTo}
                onChange={(e) => onQueryChange({ startDateTo: e.target.value })}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="theme-text-muted text-xs">Collapsed. Click Advanced Filtering to show filters.</p>
      )}
    </div>
  );
}
