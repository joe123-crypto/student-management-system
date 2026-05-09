import React from 'react';
import { AnimatedCount } from '@/components/ui/motion';

interface StudentTablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function StudentTablePagination({
  totalItems,
  currentPage,
  pageSize,
  pageSizeOptions = [25, 50, 100],
  onPageChange,
  onPageSizeChange,
}: StudentTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  return (
    <div className="theme-card flex flex-col gap-3 rounded-xl border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="student-table-page-size" className="theme-text-muted text-xs font-bold uppercase tracking-wide">
          Rows
        </label>
        <select
          id="student-table-page-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="theme-input rounded-lg border px-2.5 py-1 text-xs outline-none"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="theme-text-muted text-xs sm:whitespace-nowrap">
          Showing <AnimatedCount value={start} />-<AnimatedCount value={end} /> of{' '}
          <AnimatedCount value={totalItems} />
        </span>
      </div>

      <div className="flex items-center gap-2 max-[420px]:grid max-[420px]:grid-cols-[1fr_auto_1fr]">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="theme-card-muted theme-heading rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[rgba(237,228,194,0.32)] disabled:cursor-not-allowed disabled:opacity-50 max-[420px]:w-full"
        >
          Previous
        </button>
        <span className="theme-heading text-center text-xs font-semibold">
          Page <AnimatedCount value={safePage} /> of <AnimatedCount value={totalPages} />
        </span>
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="theme-card-muted theme-heading rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[rgba(237,228,194,0.32)] disabled:cursor-not-allowed disabled:opacity-50 max-[420px]:w-full"
        >
          Next
        </button>
      </div>
    </div>
  );
}
