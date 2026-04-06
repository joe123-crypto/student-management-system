import React, { useEffect, useMemo, useState } from 'react';
import type { AttacheAgentContext, StudentProfile } from '@/types';
import StudentQueryToolbar, { StudentSearchInput } from '@/components/features/attache/components/StudentQueryToolbar';
import StudentAdvancedFilters from '@/components/features/attache/components/StudentAdvancedFilters';
import BulkActionsBar from '@/components/features/attache/components/BulkActionsBar';
import DatabaseQueryModal from '@/components/features/attache/components/DatabaseQueryModal';
import StudentRecordsTable from '@/components/features/attache/components/StudentRecordsTable';
import StudentTablePagination from '@/components/features/attache/components/StudentTablePagination';
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

interface StudentsSectionProps {
  students: StudentProfile[];
  isLoading?: boolean;
  onDeleteStudents: (studentIds: string[]) => void;
  onLogCommunication?: (payload: {
    channel: 'EMAIL' | 'SMS';
    template: string;
    recipientCount: number;
  }) => void;
  onAgentContextChange?: (context: AttacheAgentContext) => void;
}

const DEFAULT_REPORT_COLUMNS = ['fullName', 'email', 'inscriptionNumber', 'status', 'university', 'program'];
const PAGE_SIZE_OPTIONS = [25, 50, 100];
const DEFAULT_PAGE_SIZE = 50;

export default function StudentsSection({
  students,
  isLoading = false,
  onDeleteStudents,
  onLogCommunication,
  onAgentContextChange,
}: StudentsSectionProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [exportPopupOpen, setExportPopupOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [querySummaryOpen, setQuerySummaryOpen] = useState(false);
  const [dataQualityOpen, setDataQualityOpen] = useState(false);
  const [duplicateDetectionOpen, setDuplicateDetectionOpen] = useState(false);
  const [databaseQueryOpen, setDatabaseQueryOpen] = useState(false);

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

  const appendCommunicationLog = (channel: 'EMAIL' | 'SMS', template: string, recipientCount: number) => {
    if (recipientCount === 0) return;
    onLogCommunication?.({
      recipientCount,
      channel,
      template,
    });
  };

  const handleRequestMissingDocsBulk = () => {
    appendCommunicationLog('EMAIL', 'MISSING_DOCS', selectedStudents.length);
  };

  const handleExportSelected = () => {
    exportDataset(selectedStudents, DEFAULT_REPORT_COLUMNS, 'student_records_selected.csv');
  };

  if (selectedStudent) {
    return <StudentDetailView student={selectedStudent} onBack={() => setSelectedStudentId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <StudentQueryToolbar
          query={query}
          onQueryChange={updateQuery}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_28rem] xl:items-center">
          <BulkActionsBar
            selectedCount={selectedStudentIds.size}
            onOpenDatabaseQuery={() => setDatabaseQueryOpen(true)}
            onMarkReviewed={handleMarkReviewed}
            onRequestMissingDocs={handleRequestMissingDocsBulk}
            onExportSelected={handleExportSelected}
            onOpenExportOptions={() => setExportPopupOpen(true)}
            onOpenAdvancedFilters={() => setAdvancedFiltersOpen(true)}
            onOpenQuerySummary={() => setQuerySummaryOpen(true)}
            onOpenDataQuality={() => setDataQualityOpen(true)}
            onOpenDuplicateDetection={() => setDuplicateDetectionOpen(true)}
            onClearSelection={clearSelection}
            onDeleteSelected={handleDeleteSelected}
            isExportDisabled={isLoading}
            isInsightsDisabled={isLoading}
          />

          <StudentSearchInput
            value={query.searchQuery}
            onChange={(value) => updateQuery({ searchQuery: value })}
            className="relative w-full"
          />
        </div>

        <StudentRecordsTable
          students={paginatedTableStudents}
          isLoading={isLoading || isStudentTableLoading}
          selectedStudentIds={selectedStudentIds}
          reviewedStudentIds={reviewedStudentIds}
          onToggleSelectAll={(checked) => handleToggleSelectAll(paginatedTableStudents, checked)}
          onToggleSelectOne={handleToggleSelectOne}
          onManage={setSelectedStudentId}
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
        onQuickExport={handleQuickExport}
      />

      <DatabaseQueryModal
        open={databaseQueryOpen}
        students={students}
        onClose={() => setDatabaseQueryOpen(false)}
        onOpenStudent={(studentId) => {
          setDatabaseQueryOpen(false);
          setSelectedStudentId(studentId);
        }}
      />

      {advancedFiltersOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="theme-overlay absolute inset-0" onClick={() => setAdvancedFiltersOpen(false)} />
          <div className="theme-card relative z-10 w-full max-w-5xl rounded-2xl border p-6 shadow-xl">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="theme-heading text-lg font-bold">Advanced Filtering</h3>
                <p className="theme-text-muted mt-1 text-sm">Apply more specific filters to narrow the student records table.</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={resetAdvancedFilters} className="theme-link text-sm font-bold">
                  Reset
                </button>
                <button type="button" onClick={() => setAdvancedFiltersOpen(false)} className="theme-link text-sm font-bold">
                  Close
                </button>
              </div>
            </div>

            <StudentAdvancedFilters
              query={query}
              universities={uniqueUniversities}
              programs={uniquePrograms}
              academicYears={uniqueAcademicYears}
              onQueryChange={updateQuery}
              className="max-h-[70vh] overflow-y-auto pr-1"
            />
          </div>
        </div>
      ) : null}

      {querySummaryOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="theme-overlay absolute inset-0" onClick={() => setQuerySummaryOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl">
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
        </div>
      ) : null}

      {dataQualityOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="theme-overlay absolute inset-0" onClick={() => setDataQualityOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl">
            {isLoading ? (
              <Skeleton className="h-72 rounded-2xl" />
            ) : (
              <DataQualityCard
                filteredStudents={filteredStudents}
                qualityIssueCount={qualityIssueCount}
              />
            )}
          </div>
        </div>
      ) : null}

      {duplicateDetectionOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="theme-overlay absolute inset-0" onClick={() => setDuplicateDetectionOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl">
            {isLoading ? (
              <Skeleton className="h-72 rounded-2xl" />
            ) : (
              <DuplicateDetectionCard duplicateGroups={duplicateGroups} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
