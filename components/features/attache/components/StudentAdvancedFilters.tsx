import React from 'react';
import Checkbox from '@/components/ui/Checkbox';
import type { StudentQueryState } from '@/components/features/attache/types';

interface StudentAdvancedFiltersProps {
  query: StudentQueryState;
  universities: string[];
  programs: string[];
  academicYears: string[];
  onQueryChange: (patch: Partial<StudentQueryState>) => void;
  className?: string;
}

export default function StudentAdvancedFilters({
  query,
  universities,
  programs,
  academicYears,
  onQueryChange,
  className,
}: StudentAdvancedFiltersProps) {
  return (
    <div className={className ?? 'space-y-4'}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="theme-text-muted mb-2 block text-[10px] font-black uppercase tracking-widest">University</label>
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
          <label className="theme-text-muted mb-2 block text-[10px] font-black uppercase tracking-widest">Program</label>
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
          <label className="theme-text-muted mb-2 block text-[10px] font-black uppercase tracking-widest">Academic Year</label>
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
          <label className="theme-text-muted mb-2 block text-[10px] font-black uppercase tracking-widest">Missing Data</label>
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
          <label className="theme-text-muted mb-2 block text-[10px] font-black uppercase tracking-widest">Document Status</label>
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

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="theme-text-muted mb-2 block text-[10px] font-black uppercase tracking-widest">Program Start Date From</label>
          <input
            type="date"
            className="theme-input w-full rounded-xl border px-3 py-2.5 outline-none"
            value={query.startDateFrom}
            onChange={(e) => onQueryChange({ startDateFrom: e.target.value })}
          />
        </div>
        <div>
          <label className="theme-text-muted mb-2 block text-[10px] font-black uppercase tracking-widest">Program Start Date To</label>
          <input
            type="date"
            className="theme-input w-full rounded-xl border px-3 py-2.5 outline-none"
            value={query.startDateTo}
            onChange={(e) => onQueryChange({ startDateTo: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
