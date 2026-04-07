import React, { useEffect, useMemo, useState } from 'react';
import type { AttacheAgentContext, StudentProfile } from '@/types';
import StudentQueryToolbar from '@/components/features/attache/components/StudentQueryToolbar';
import BulkActionsBar from '@/components/features/attache/components/BulkActionsBar';
import DatabaseQueryModal from '@/components/features/attache/components/DatabaseQueryModal';
import StudentRecordsTable from '@/components/features/attache/components/StudentRecordsTable';
import StudentTablePagination from '@/components/features/attache/components/StudentTablePagination';
import {
  DataQualityCard,
  DuplicateDetectionCard,
} from '@/components/features/attache/components/DataInsightsPanel';
import StudentDetailView from '@/components/features/attache/components/StudentDetailView';
import ExportRecordsModal from '@/components/features/attache/components/ExportRecordsModal';
import AddStudentRecordModal from '@/components/features/attache/components/AddStudentRecordModal';
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
  onImportStudents: (records: StudentProfile[], mode: 'append' | 'replace') => Promise<void>;
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
  onImportStudents,
  onLogCommunication,
  onAgentContextChange,
}: StudentsSectionProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [exportPopupOpen, setExportPopupOpen] = useState(false);
  const [dataQualityOpen, setDataQualityOpen] = useState(false);
  const [duplicateDetectionOpen, setDuplicateDetectionOpen] = useState(false);
  const [databaseQueryOpen, setDatabaseQueryOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [studentStatusMessage, setStudentStatusMessage] = useState('');

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

        {studentStatusMessage ? (
          <div className="theme-success rounded-2xl border px-4 py-3 text-sm font-semibold">
            {studentStatusMessage}
          </div>
        ) : null}

        <BulkActionsBar
          selectedCount={selectedStudentIds.size}
          onAddStudent={() => {
            setStudentStatusMessage('');
            setAddStudentOpen(true);
          }}
          onOpenDatabaseQuery={() => setDatabaseQueryOpen(true)}
          onMarkReviewed={handleMarkReviewed}
          onRequestMissingDocs={handleRequestMissingDocsBulk}
          onExportSelected={handleExportSelected}
          onOpenExportOptions={() => setExportPopupOpen(true)}
          onOpenDataQuality={() => setDataQualityOpen(true)}
          onOpenDuplicateDetection={() => setDuplicateDetectionOpen(true)}
          onClearSelection={clearSelection}
          onDeleteSelected={handleDeleteSelected}
          isExportDisabled={isLoading}
          isInsightsDisabled={isLoading}
        />

        <StudentRecordsTable
          students={paginatedTableStudents}
          isLoading={isLoading || isStudentTableLoading}
          returnFields={query.returnFields}
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
        initialQueryClauses={query.queryClauses}
        initialReturnFields={query.returnFields}
        onClose={() => setDatabaseQueryOpen(false)}
        onApply={({ queryClauses, returnFields }) => {
          updateQuery({
            searchQuery: '',
            queryField: 'all',
            queryClauses,
            returnFields,
          });
          setCurrentPage(1);
        }}
      />

      <AddStudentRecordModal
        open={addStudentOpen}
        students={students}
        onClose={() => setAddStudentOpen(false)}
        onSubmit={async (student) => {
          await onImportStudents([student], 'append');
          setStudentStatusMessage(`Added ${student.student.fullName || student.student.inscriptionNumber} to student records.`);
          setAddStudentOpen(false);
        }}
      />

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
