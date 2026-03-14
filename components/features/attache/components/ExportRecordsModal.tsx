import React from 'react';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import { REPORT_COLUMNS } from '@/components/features/attache/utils/studentData';

interface ExportRecordsModalProps {
  open: boolean;
  reportScope: 'FILTERED' | 'SELECTED';
  reportColumnKeys: string[];
  exportCount: number;
  onClose: () => void;
  onReportScopeChange: (scope: 'FILTERED' | 'SELECTED') => void;
  onToggleReportColumn: (columnKey: string, checked: boolean) => void;
  onQuickExport: (format: 'CSV' | 'TSV' | 'JSON') => void;
}

export default function ExportRecordsModal({
  open,
  reportScope,
  reportColumnKeys,
  exportCount,
  onClose,
  onReportScopeChange,
  onToggleReportColumn,
  onQuickExport,
}: ExportRecordsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="theme-overlay absolute inset-0" onClick={onClose} />
      <div className="theme-card relative w-full max-w-xl rounded-2xl border p-6 shadow-xl">
        <h3 className="theme-heading text-lg font-bold">Export Records</h3>
        <p className="theme-text-muted mt-1 text-sm">Select scope, columns, and format.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onReportScopeChange('FILTERED')}
              className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${reportScope === 'FILTERED' ? 'theme-accent-subtle text-[color:var(--theme-primary)]' : 'theme-card-muted text-[color:var(--theme-text-muted)]'}`}
            >
              Filtered
            </button>
            <button
              type="button"
              onClick={() => onReportScopeChange('SELECTED')}
              className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${reportScope === 'SELECTED' ? 'theme-accent-subtle text-[color:var(--theme-primary)]' : 'theme-card-muted text-[color:var(--theme-text-muted)]'}`}
            >
              Selected
            </button>
          </div>

          <div className="theme-card-muted grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-xl border p-3 pr-1">
            {REPORT_COLUMNS.map((column) => (
              <Checkbox
                key={column.key}
                checked={reportColumnKeys.includes(column.key)}
                onChange={(e) => onToggleReportColumn(column.key, e.target.checked)}
                label={column.label}
              />
            ))}
          </div>

          <p className="theme-text-muted text-xs">
            {reportColumnKeys.length} columns - {exportCount} rows
          </p>

          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              variant="success"
              onClick={() => onQuickExport('CSV')}
              disabled={reportColumnKeys.length === 0 || exportCount === 0}
            >
              CSV (.csv)
            </Button>
            <Button
              variant="secondary"
              onClick={() => onQuickExport('TSV')}
              disabled={reportColumnKeys.length === 0 || exportCount === 0}
            >
              TSV (.tsv)
            </Button>
            <Button
              variant="secondary"
              onClick={() => onQuickExport('JSON')}
              disabled={reportColumnKeys.length === 0 || exportCount === 0}
            >
              JSON (.json)
            </Button>
          </div>
        </div>

        <Button className="mt-4 w-full" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
