import React, { useEffect, useMemo, useState } from 'react';
import type { AttacheAgentContext, StudentProfile } from '@/types';
import type { StudentReturnField } from '@/components/features/attache/types';
import { StudentSearchInput } from '@/components/features/attache/components/StudentQueryToolbar';
import BulkActionsBar from '@/components/features/attache/components/BulkActionsBar';
import StudentRecordsTable from '@/components/features/attache/components/StudentRecordsTable';
import StudentTablePagination from '@/components/features/attache/components/StudentTablePagination';
import DatabaseQueryBuilder from '@/components/features/attache/components/DatabaseQueryBuilder';
import ExportRecordsSection from '@/components/features/attache/components/ExportRecordsSection';
import {
  DataQualityCard,
  DuplicateDetectionCard,
  QuerySummaryCard,
} from '@/components/features/attache/components/DataInsightsPanel';
import StudentDetailView from '@/components/features/attache/components/StudentDetailView';
import useStudentFilters from '@/components/features/attache/hooks/useStudentFilters';
import useStudentSelection from '@/components/features/attache/hooks/useStudentSelection';
import useStudentTable from '@/components/features/attache/hooks/useStudentTable';
import useStudentExports from '@/components/features/attache/hooks/useStudentExports';
import {
  applyStudentQuery,
  DEFAULT_STUDENT_QUERY,
  getDuplicateGroups,
  getQualityFlags,
  REPORT_COLUMNS,
} from '@/components/features/attache/utils/studentData';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import { useNotification } from '@/components/providers/NotificationProvider';
import {
  ChevronDown,
  DatabaseZap,
  FileDown,
  ScanSearch,
  ShieldCheck,
  UserPlus,
  Wrench,
  X,
} from 'lucide-react';

interface StudentsSectionProps {
  students: StudentProfile[];
  isLoading?: boolean;
  onDeleteStudents: (studentIds: string[]) => void;
  onOpenImportSettings: () => void;
  onAgentContextChange?: (context: AttacheAgentContext) => void;
}

const DEFAULT_REPORT_COLUMNS = ['fullName', 'email', 'inscriptionNumber', 'status', 'university', 'program'];
const PAGE_SIZE_OPTIONS = [25, 50, 100];
const DEFAULT_PAGE_SIZE = 50;

export default function StudentsSection({
  students,
  isLoading = false,
  onDeleteStudents,
  onOpenImportSettings,
  onAgentContextChange,
}: StudentsSectionProps) {
  const { notify } = useNotification();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<'query' | 'quality' | 'duplicates' | 'export'>('query');

  const {
    query,
    updateQuery,
  } = useStudentFilters(DEFAULT_STUDENT_QUERY);

  const duplicateGroups = useMemo(() => getDuplicateGroups(students), [students]);
  const duplicateStudentIds = useMemo(
    () => new Set(duplicateGroups.flatMap((group) => group.studentIds)),
    [duplicateGroups],
  );

  const qualityFlagEntries = useMemo(() => getQualityFlags(students), [students]);
  const qualityIssueCount = useMemo(
    () => qualityFlagEntries.filter((entry) => entry.items.length > 0).length,
    [qualityFlagEntries],
  );
  const activeStudentsCount = useMemo(
    () => students.filter((student) => student.status === 'ACTIVE').length,
    [students],
  );
  const pendingStudentsCount = useMemo(
    () => students.filter((student) => student.status === 'PENDING').length,
    [students],
  );
  const filteredStudents = useMemo(
    () => applyStudentQuery(students, query, duplicateStudentIds),
    [students, query, duplicateStudentIds],
  );

  const {
    tableStudents,
    isStudentTableLoading,
    currentPage,
    pageSize,
    totalPages,
    paginatedTableStudents,
    setCurrentPage,
    setPageSize,
  } = useStudentTable(students, query, duplicateStudentIds, DEFAULT_PAGE_SIZE);

  const {
    selectedStudentIds,
    reviewedStudentIds,
    clearSelection,
    handleToggleSelectAll,
    handleToggleSelectOne,
    handleMarkReviewed,
    handleDeleteSelected,
  } = useStudentSelection(filteredStudents, {
    isReady: !isStudentTableLoading,
    onDeleteStudents,
    onAfterDelete: (deletedIds) => {
      if (selectedStudentId && deletedIds.includes(selectedStudentId)) {
        setSelectedStudentId(null);
      }
    },
  });

  const selectedStudents = useMemo(
    () => students.filter((student) => selectedStudentIds.has(student.id)),
    [students, selectedStudentIds],
  );

  const {
    reportColumnKeys,
    reportScope,
    exportCount,
    setReportScope,
    onToggleReportColumn,
    exportDataset,
    handleQuickExport,
  } = useStudentExports(REPORT_COLUMNS, {
    defaultColumnKeys: DEFAULT_REPORT_COLUMNS,
    filteredStudents,
    selectedStudents,
  });

  const selectedStudent = selectedStudentId
    ? students.find((student) => student.id === selectedStudentId) ?? null
    : null;
  const visibleTableFields = useMemo<StudentReturnField[]>(
    () => (query.returnFields.length > 0 ? query.returnFields : DEFAULT_STUDENT_QUERY.returnFields),
    [query.returnFields],
  );

  useEffect(() => {
    onAgentContextChange?.({
      filteredStudentIds: filteredStudents.map((student) => student.id),
      selectedStudentIds: Array.from(selectedStudentIds),
      searchQuery: query.searchQuery,
      statusFilter: query.status,
      university: query.university,
      program: query.program,
      duplicatesOnly: query.duplicatesOnly,
    });
  }, [filteredStudents, onAgentContextChange, query, selectedStudentIds]);

  const handleExportSelected = () => {
    exportDataset(selectedStudents, DEFAULT_REPORT_COLUMNS, 'student_records_selected.csv');
    notify(`Exported ${selectedStudents.length} selected student${selectedStudents.length === 1 ? '' : 's'}.`, 'info');
  };

  const handleMarkReviewedWithToast = () => {
    handleMarkReviewed();
    notify(`Marked ${selectedStudentIds.size} selected student${selectedStudentIds.size === 1 ? '' : 's'} as reviewed.`);
  };

  const handleDeleteSelectedWithToast = () => {
    const count = selectedStudentIds.size;
    const deleted = handleDeleteSelected();
    if (deleted && count > 0) {
      notify(`Deleted ${count} selected student record${count === 1 ? '' : 's'}.`, 'danger');
    }
  };

  const handleOpenImportSettings = () => {
    onOpenImportSettings();
    notify('Student import is available in Settings.', 'info');
  };

  const handleQuickExportWithToast = (format: 'CSV' | 'TSV' | 'JSON') => {
    handleQuickExport(format);
    notify(`Exported ${exportCount} student record${exportCount === 1 ? '' : 's'} as ${format}.`, 'info');
  };

  const clearAllFilters = () => {
    updateQuery(DEFAULT_STUDENT_QUERY);
    notify('Student filters cleared.', 'info');
  };

  if (selectedStudent) {
    return <StudentDetailView student={selectedStudent} onBack={() => setSelectedStudentId(null)} />;
  }

  return (
    <div className="space-y-5">
      <section className="space-y-4">
        <div>
          <h1 className="theme-heading text-2xl font-bold">Students</h1>
          <p className="theme-text-muted mt-1 text-sm">Find, review, and update student records.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Total Students"
            value={students.length.toLocaleString()}
            supportingText="All student records"
            compact
          />
          <StatCard
            label="Active"
            value={activeStudentsCount.toLocaleString()}
            valueClassName="text-[color:var(--theme-primary)]"
            supportingText="Currently enrolled"
            compact
          />
          <StatCard
            label="Pending"
            value={pendingStudentsCount.toLocaleString()}
            valueClassName="text-[color:var(--theme-primary-soft)]"
            supportingText="Need completion"
            compact
          />
        </div>
      </section>

      <div className="space-y-4">
        <div className="theme-panel-glass sticky top-[3.5rem] z-20 rounded-2xl border p-3 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(22rem,1fr)_auto] lg:items-center">
            <StudentSearchInput
              value={query.searchQuery}
              onChange={(value) => updateQuery({ searchQuery: value })}
              className="relative w-full"
            />
            <Button
              variant="success"
              size="md"
              className="h-12 rounded-xl px-5 text-sm"
              onClick={handleOpenImportSettings}
            >
              <UserPlus className="h-4 w-4" />
              Import in Settings
            </Button>
          </div>
        </div>

        <div>
          <BulkActionsBar
            selectedCount={selectedStudentIds.size}
            onMarkReviewed={handleMarkReviewedWithToast}
            onExportSelected={handleExportSelected}
            onClearSelection={clearSelection}
            onDeleteSelected={handleDeleteSelectedWithToast}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="theme-text-muted text-sm font-semibold">
            Showing <span className="theme-heading">{paginatedTableStudents.length}</span> of{' '}
            <span className="theme-heading">{tableStudents.length}</span> records
          </p>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setToolsOpen(true)}
            disabled={isLoading}
          >
            <Wrench className="h-4 w-4" />
            Tools
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <StudentRecordsTable
          students={paginatedTableStudents}
          returnFields={visibleTableFields}
          isLoading={isLoading || isStudentTableLoading}
          selectedStudentIds={selectedStudentIds}
          reviewedStudentIds={reviewedStudentIds}
          onToggleSelectAll={(checked) => handleToggleSelectAll(paginatedTableStudents, checked)}
          onToggleSelectOne={handleToggleSelectOne}
          onManage={setSelectedStudentId}
          onClearFilters={clearAllFilters}
        />
        {!isLoading && !isStudentTableLoading ? (
          <StudentTablePagination
            totalItems={tableStudents.length}
            currentPage={currentPage}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages))}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        ) : null}
      </div>

      {toolsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="theme-overlay absolute inset-0" onClick={() => setToolsOpen(false)} />
          <div className="theme-card relative z-10 grid h-[calc(100dvh-2rem)] max-h-[56rem] w-full max-w-6xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-2xl border shadow-xl lg:grid-cols-[17rem_minmax(0,1fr)] lg:grid-rows-1">
            <div className="theme-card-muted min-h-0 overflow-y-auto border-b p-4 lg:border-b-0 lg:border-r">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="theme-heading text-xl font-bold">Tools</h3>
                  <p className="theme-text-muted mt-1 text-sm">Use only when you need more control.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setToolsOpen(false)}
                  className="theme-card rounded-xl border p-2"
                  aria-label="Close tools"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5 grid gap-2">
                {[
                  { id: 'query' as const, label: 'Database Query', icon: DatabaseZap },
                  { id: 'quality' as const, label: 'Data Quality', icon: ShieldCheck },
                  { id: 'duplicates' as const, label: 'Duplicate Detection', icon: ScanSearch },
                  { id: 'export' as const, label: 'Export Options', icon: FileDown },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeTool === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTool(item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                        active
                          ? 'bg-[color:var(--theme-primary)] text-white'
                          : 'theme-card border text-[color:var(--theme-text)] hover:bg-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto p-6">
              {activeTool === 'query' ? (
                <div className="space-y-6">
                  <div>
                    <div>
                      <h4 className="theme-heading text-lg font-bold">Database Query</h4>
                      <p className="theme-text-muted mt-1 text-sm">Sort, filter, and see the matching record count.</p>
                    </div>
                  </div>
                  <DatabaseQueryBuilder
                    initialQueryClauses={query.queryClauses}
                    initialReturnFields={query.returnFields}
                    onApply={({ queryClauses, returnFields }) => {
                      updateQuery({
                        ...DEFAULT_STUDENT_QUERY,
                        queryClauses,
                        returnFields,
                      });
                      setCurrentPage(1);
                      setToolsOpen(false);
                      notify('Database query applied to the student table.', 'info');
                    }}
                  />
                  {isLoading ? (
                    <Skeleton className="h-72 rounded-2xl" />
                  ) : (
                    <QuerySummaryCard
                      totalCount={students.length}
                      filteredStudents={filteredStudents}
                      searchQuery={query.searchQuery}
                      queryClauses={query.queryClauses}
                    />
                  )}
                </div>
              ) : null}
              {activeTool === 'quality' ? (
                isLoading ? (
                  <Skeleton className="h-72 rounded-2xl" />
                ) : (
                  <DataQualityCard filteredStudents={filteredStudents} qualityIssueCount={qualityIssueCount} />
                )
              ) : null}
              {activeTool === 'duplicates' ? (
                isLoading ? (
                  <Skeleton className="h-72 rounded-2xl" />
                ) : (
                  <DuplicateDetectionCard duplicateGroups={duplicateGroups} />
                )
              ) : null}
              {activeTool === 'export' ? (
                <ExportRecordsSection
                  reportScope={reportScope}
                  reportColumnKeys={reportColumnKeys}
                  exportCount={exportCount}
                  onReportScopeChange={setReportScope}
                  onToggleReportColumn={onToggleReportColumn}
                  onQuickExport={handleQuickExportWithToast}
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
