import React from 'react';
import { FileDown } from 'lucide-react';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import { REPORT_COLUMNS } from '@/components/features/attache/utils/studentData';

interface ExportRecordsSectionProps {
  reportScope: 'FILTERED' | 'SELECTED';
  reportColumnKeys: string[];
  exportCount: number;
  onReportScopeChange: (scope: 'FILTERED' | 'SELECTED') => void;
  onToggleReportColumn: (columnKey: string, checked: boolean) => void;
  onQuickExport: (format: 'CSV' | 'TSV' | 'JSON') => void;
}

const scopeOptions = [
  {
    key: 'FILTERED' as const,
    label: 'Filtered',
    description: 'Use the records currently matched by your search and filters.',
  },
  {
    key: 'SELECTED' as const,
    label: 'Selected',
    description: 'Use only the rows you have actively selected in the table.',
  },
];

export default function ExportRecordsSection({
  reportScope,
  reportColumnKeys,
  exportCount,
  onReportScopeChange,
  onToggleReportColumn,
  onQuickExport,
}: ExportRecordsSectionProps) {
  const exportDisabled = reportColumnKeys.length === 0 || exportCount === 0;

  return (
    <div className="space-y-8">
      <div className="theme-card rounded-3xl border p-8 md:p-10">
        <div className="flex items-center gap-3">
          <div className="theme-accent-subtle flex h-11 w-11 items-center justify-center rounded-xl border">
            <FileDown className="h-5 w-5" />
          </div>
          <div>
            <h3 className="theme-heading type-card-title">Export Records</h3>
            <p className="theme-text-muted type-body-sm">Select scope, columns, and format for your export.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div>
              <p className="theme-text-muted type-label">Export Scope</p>
              <div className="mt-3 grid gap-2">
                {scopeOptions.map((option) => {
                  const active = reportScope === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => onReportScopeChange(option.key)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                        active
                          ? 'theme-accent-subtle border-[color:var(--theme-primary-soft)]'
                          : 'theme-card-muted hover:bg-white'
                      }`}
                    >
                      <p className={`text-sm font-bold ${active ? 'theme-heading' : 'text-[color:var(--theme-text)]'}`}>
                        {option.label}
                      </p>
                      <p className="theme-text-muted mt-1 text-sm">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="theme-card-muted rounded-2xl border p-4">
              <p className="theme-text-muted type-label">Export Summary</p>
              <p className="theme-heading mt-3 text-2xl font-bold">{exportCount.toLocaleString()} rows</p>
              <p className="theme-text-muted mt-1 text-sm">{reportColumnKeys.length} columns selected</p>
            </div>
          </div>

          <div>
            <p className="theme-text-muted type-label">Columns</p>
            <div className="theme-card-muted mt-3 grid max-h-[24rem] grid-cols-1 gap-2 overflow-y-auto rounded-2xl border p-4 pr-2 sm:grid-cols-2">
              {REPORT_COLUMNS.map((column) => (
                <Checkbox
                  key={column.key}
                  checked={reportColumnKeys.includes(column.key)}
                  onChange={(e) => onToggleReportColumn(column.key, e.target.checked)}
                  label={column.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Button
            variant="success"
            onClick={() => onQuickExport('CSV')}
            disabled={exportDisabled}
          >
            CSV (.csv)
          </Button>
          <Button
            variant="secondary"
            onClick={() => onQuickExport('TSV')}
            disabled={exportDisabled}
          >
            TSV (.tsv)
          </Button>
          <Button
            variant="secondary"
            onClick={() => onQuickExport('JSON')}
            disabled={exportDisabled}
          >
            JSON (.json)
          </Button>
        </div>
      </div>
    </div>
  );
}
