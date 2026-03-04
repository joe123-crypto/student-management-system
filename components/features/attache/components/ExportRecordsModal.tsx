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
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900">Export Records</h3>
        <p className="mt-1 text-sm text-slate-500">Select scope, columns, and format.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onReportScopeChange('FILTERED')}
              className={`text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${reportScope === 'FILTERED' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
            >
              Filtered
            </button>
            <button
              type="button"
              onClick={() => onReportScopeChange('SELECTED')}
              className={`text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${reportScope === 'SELECTED' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
            >
              Selected
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1 border border-slate-200 rounded-xl p-3">
            {REPORT_COLUMNS.map((column) => (
              <Checkbox
                key={column.key}
                checked={reportColumnKeys.includes(column.key)}
                onChange={(e) => onToggleReportColumn(column.key, e.target.checked)}
                label={column.label}
              />
            ))}
          </div>

          <p className="text-xs text-slate-500">
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
