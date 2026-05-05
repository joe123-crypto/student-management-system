import React, { useEffect, useMemo, useState } from 'react';
import type { AttacheAgentContext, StudentProfile } from '@/types';
import StudentQueryToolbar, { StudentSearchInput } from '@/components/features/attache/components/StudentQueryToolbar';
import StudentAdvancedFilters from '@/components/features/attache/components/StudentAdvancedFilters';
import BulkActionsBar from '@/components/features/attache/components/BulkActionsBar';
import StudentRecordsTable from '@/components/features/attache/components/StudentRecordsTable';
import StudentTablePagination from '@/components/features/attache/components/StudentTablePagination';
import DatabaseImportSection from '@/components/features/attache/components/DatabaseImportSection';
import {
  DataQualityCard,
  DuplicateDetectionCard,
  QuerySummaryCard,
} from '@/components/features/attache/components/DataInsightsPanel';
import StudentDetailView from '@/components/features/attache/components/StudentDetailView';
import ExportRecordsModal from '@/components/features/attache/components/ExportRecordsModal';
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
  onImportStudents: (records: StudentProfile[], mode: 'append' | 'replace') => Promise<void>;
  onAgentContextChange?: (context: AttacheAgentContext) => void;
}

const DEFAULT_REPORT_COLUMNS = ['fullName', 'email', 'inscriptionNumber', 'status', 'university', 'program'];
const PAGE_SIZE_OPTIONS = [25, 50, 100];
const DEFAULT_PAGE_SIZE = 50;

export default function StudentsSection({
  students,
  isLoading = false,
  onDeleteStudents,
  onImportStudents,
  onAgentContextChange,
}: StudentsSectionProps) {
  const { notify } = useNotification();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [exportPopupOpen, setExportPopupOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<'query' | 'quality' | 'duplicates' | 'import'>('query');

  const {
    query,
    updateQuery,
    resetAdvancedFilters,
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
  const statusOptions = useMemo(
    () =>
      Array.from(new Set(students.map((student) => student.status.trim()).filter(Boolean))).sort((left, right) =>
        left.localeCompare(right),
      ),
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
    onAfterQuickExport: () => setExportPopupOpen(false),
  });

  const selectedStudent = selectedStudentId
    ? students.find((student) => student.id === selectedStudentId) ?? null
    : null;

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

  const uniqueUniversities = useMemo(
    () => Array.from(new Set(students.map((student) => student.university.universityName))).sort(),
    [students],
  );
  const uniquePrograms = useMemo(
    () => Array.from(new Set(students.map((student) => student.program.major))).sort(),
    [students],
  );
  const uniqueAcademicYears = useMemo(
    () =>
      Array.from(
        new Set(students.flatMap((student) => (student.academicHistory || []).map((entry) => entry.year))),
      ).sort(),
    [students],
  );

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

  const handleAddStudent = () => {
    setActiveTool('import');
    setToolsOpen(true);
    notify('Opening student import tools.', 'info');
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
    <div className="space-y-8">
      <section className="space-y-6">
        <div>
          <h1 className="theme-heading text-3xl font-bold">Students</h1>
          <p className="theme-text-muted mt-2 text-base">Find, review, and update student records.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            label="Total Students"
            value={students.length.toLocaleString()}
            supportingText="All student records"
          />
          <StatCard
            label="Active"
            value={activeStudentsCount.toLocaleString()}
            valueClassName="text-[color:var(--theme-primary)]"
            supportingText="Currently enrolled"
          />
          <StatCard
            label="Pending"
            value={pendingStudentsCount.toLocaleString()}
            valueClassName="text-[color:var(--theme-primary-soft)]"
            supportingText="Need completion"
          />
        </div>
      </section>

      <div className="space-y-6">
        <div className="theme-panel-glass sticky top-[4.25rem] z-20 rounded-2xl border p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(22rem,1fr)_auto] lg:items-center">
            <StudentSearchInput
              value={query.searchQuery}
              onChange={(value) => updateQuery({ searchQuery: value })}
              className="relative w-full"
            />
            <Button
              variant="success"
              size="lg"
              className="h-16 rounded-2xl px-8 text-base"
              onClick={handleAddStudent}
            >
              <UserPlus className="h-5 w-5" />
              Add Student
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <ExportRecordsModal
        open={exportPopupOpen}
        reportScope={reportScope}
        reportColumnKeys={reportColumnKeys}
        exportCount={exportCount}
        onClose={() => setExportPopupOpen(false)}
        onReportScopeChange={setReportScope}
        onToggleReportColumn={onToggleReportColumn}
        onQuickExport={handleQuickExportWithToast}
      />

      {toolsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="theme-overlay absolute inset-0" onClick={() => setToolsOpen(false)} />
          <div className="theme-card relative z-10 grid max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border shadow-xl lg:grid-cols-[17rem_minmax(0,1fr)]">
            <div className="theme-card-muted border-b p-4 lg:border-b-0 lg:border-r">
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
                  { id: 'import' as const, label: 'Import Students', icon: UserPlus },
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
                <button
                  type="button"
                  onClick={() => {
                    setToolsOpen(false);
                    setExportPopupOpen(true);
                  }}
                  className="theme-card flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-bold text-[color:var(--theme-text)] transition hover:bg-white"
                >
                  <FileDown className="h-4 w-4" />
                  Export Options
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6">
              {activeTool === 'query' ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="theme-heading text-lg font-bold">Database Query</h4>
                      <p className="theme-text-muted mt-1 text-sm">Sort, filter, and see the matching record count.</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={resetAdvancedFilters}>
                      Reset
                    </Button>
                  </div>
                  <StudentQueryToolbar query={query} statusOptions={statusOptions} onQueryChange={updateQuery} />
                  <StudentAdvancedFilters
                    query={query}
                    universities={uniqueUniversities}
                    programs={uniquePrograms}
                    academicYears={uniqueAcademicYears}
                    onQueryChange={updateQuery}
                  />
                  {isLoading ? (
                    <Skeleton className="h-72 rounded-2xl" />
                  ) : (
                    <QuerySummaryCard
                      totalCount={students.length}
                      filteredStudents={filteredStudents}
                      searchQuery={query.searchQuery}
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
              {activeTool === 'import' ? (
                <DatabaseImportSection students={students} onImportStudents={onImportStudents} />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
