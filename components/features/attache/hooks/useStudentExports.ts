import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import type { StudentProfile } from '@/types';
import type { ReportColumnOption } from '@/components/features/attache/types';
import { buildStudentDelimited, buildStudentJson, downloadFile } from '@/components/features/attache/utils/studentData';

interface UseStudentExportsOptions {
  defaultColumnKeys: string[];
  filteredStudents: StudentProfile[];
  selectedStudents: StudentProfile[];
  onAfterQuickExport?: () => void;
}

interface UseStudentExportsResult {
  reportColumnKeys: string[];
  reportScope: 'FILTERED' | 'SELECTED';
  exportCount: number;
  setReportScope: Dispatch<SetStateAction<'FILTERED' | 'SELECTED'>>;
  onToggleReportColumn: (columnKey: string, checked: boolean) => void;
  exportDataset: (
    dataset: StudentProfile[],
    columns: string[],
    filename: string,
    format?: 'CSV' | 'TSV' | 'JSON',
  ) => void;
  handleQuickExport: (format: 'CSV' | 'TSV' | 'JSON') => void;
}

export default function useStudentExports(
  reportColumns: ReportColumnOption[],
  { defaultColumnKeys, filteredStudents, selectedStudents, onAfterQuickExport }: UseStudentExportsOptions,
): UseStudentExportsResult {
  const [reportColumnKeys, setReportColumnKeys] = useState<string[]>(defaultColumnKeys);
  const [reportScope, setReportScope] = useState<'FILTERED' | 'SELECTED'>('FILTERED');

  const exportDataset = useCallback(
    (
      dataset: StudentProfile[],
      columns: string[],
      filename: string,
      format: 'CSV' | 'TSV' | 'JSON' = 'CSV',
    ) => {
      if (dataset.length === 0 || columns.length === 0) return;

      if (format === 'JSON') {
        const json = buildStudentJson(dataset, columns, reportColumns);
        downloadFile(filename, 'application/json', json);
        return;
      }

      const delimiter = format === 'TSV' ? '\t' : ',';
      const content = buildStudentDelimited(dataset, columns, reportColumns, delimiter);
      const mimeType = format === 'TSV' ? 'text/tab-separated-values' : 'text/csv';
      downloadFile(filename, mimeType, content);
    },
    [reportColumns],
  );

  const handleQuickExport = useCallback(
    (format: 'CSV' | 'TSV' | 'JSON') => {
      const extension = format.toLowerCase();
      const dataset = reportScope === 'SELECTED' ? selectedStudents : filteredStudents;
      const scopeLabel = reportScope.toLowerCase();
      exportDataset(dataset, reportColumnKeys, `student_records_${scopeLabel}.${extension}`, format);
      onAfterQuickExport?.();
    },
    [exportDataset, filteredStudents, onAfterQuickExport, reportColumnKeys, reportScope, selectedStudents],
  );

  const onToggleReportColumn = useCallback((columnKey: string, checked: boolean) => {
    setReportColumnKeys((prev) => {
      if (checked) return prev.includes(columnKey) ? prev : [...prev, columnKey];
      return prev.filter((entry) => entry !== columnKey);
    });
  }, []);

  const exportCount = useMemo(
    () => (reportScope === 'SELECTED' ? selectedStudents.length : filteredStudents.length),
    [filteredStudents.length, reportScope, selectedStudents.length],
  );

  return {
    reportColumnKeys,
    reportScope,
    exportCount,
    setReportScope,
    onToggleReportColumn,
    exportDataset,
    handleQuickExport,
  };
}
