import React, { useMemo, useState } from 'react';
import type { StudentProfile } from '@/types';
import StudentQueryToolbar from '@/components/features/attache/components/StudentQueryToolbar';
import StudentAdvancedFilters from '@/components/features/attache/components/StudentAdvancedFilters';
import BulkActionsBar from '@/components/features/attache/components/BulkActionsBar';
import StudentRecordsTable from '@/components/features/attache/components/StudentRecordsTable';
import StudentTablePagination from '@/components/features/attache/components/StudentTablePagination';
import DataInsightsPanel from '@/components/features/attache/components/DataInsightsPanel';
import CommunicationCenter from '@/components/features/attache/components/CommunicationCenter';
import StudentDetailView from '@/components/features/attache/components/StudentDetailView';
import ExportRecordsModal from '@/components/features/attache/components/ExportRecordsModal';
import type { CommunicationLogEntry } from '@/components/features/attache/types';
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
}

const DEFAULT_REPORT_COLUMNS = ['fullName', 'email', 'inscriptionNumber', 'status', 'university', 'program'];
const PAGE_SIZE_OPTIONS = [25, 50, 100];
const DEFAULT_PAGE_SIZE = 50;
const makeId = () => Math.random().toString(36).slice(2, 11);

export default function StudentsSection({
  students,
  isLoading = false,
  onDeleteStudents,
}: StudentsSectionProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLogEntry[]>([]);
  const [exportPopupOpen, setExportPopupOpen] = useState(false);

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
    const entry: CommunicationLogEntry = {
      id: makeId(),
      sentAt: new Date().toLocaleString(),
      recipientCount,
      channel,
      template,
    };
    setCommunicationLogs((prev) => [entry, ...prev]);
  };

  const handleRequestMissingDocsBulk = () => {
    appendCommunicationLog('EMAIL', 'MISSING_DOCS', selectedStudents.length);
  };

  const handleExportSelected = () => {
    exportDataset(selectedStudents, DEFAULT_REPORT_COLUMNS, 'student_records_selected.csv');
  };

  const handleSendCommunication = ({
    channel,
    template,
    scope,
  }: {
    channel: 'EMAIL' | 'SMS';
    template: string;
    scope: 'SELECTED' | 'FILTERED';
    customMessage: string;
  }) => {
    const recipients = scope === 'SELECTED' ? selectedStudents.length : filteredStudents.length;
    appendCommunicationLog(channel, template, recipients);
  };

  if (selectedStudent) {
    return <StudentDetailView student={selectedStudent} onBack={() => setSelectedStudentId(null)} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-20" />
            <Skeleton className="h-[420px]" />
            <Skeleton className="hidden h-52 md:block" />
          </div>
          <aside className="hidden space-y-4 md:block xl:sticky xl:top-24">
            <Skeleton className="h-72" />
            <Skeleton className="h-48" />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="space-y-6">
          <StudentQueryToolbar
            query={query}
            onQueryChange={updateQuery}
            onOpenExportOptions={() => setExportPopupOpen(true)}
          />

          <BulkActionsBar
            selectedCount={selectedStudentIds.size}
            onMarkReviewed={handleMarkReviewed}
            onRequestMissingDocs={handleRequestMissingDocsBulk}
            onExportSelected={handleExportSelected}
            onClearSelection={clearSelection}
            onDeleteSelected={handleDeleteSelected}
          />

          <StudentRecordsTable
            students={paginatedTableStudents}
            isLoading={isStudentTableLoading}
            selectedStudentIds={selectedStudentIds}
            reviewedStudentIds={reviewedStudentIds}
            onToggleSelectAll={(checked) => handleToggleSelectAll(paginatedTableStudents, checked)}
            onToggleSelectOne={handleToggleSelectOne}
            onManage={setSelectedStudentId}
          />
          {!isStudentTableLoading ? (
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

          <div className="hidden md:block">
            <CommunicationCenter
              selectedCount={selectedStudents.length}
              filteredCount={filteredStudents.length}
              onSend={handleSendCommunication}
              logs={communicationLogs}
            />
          </div>
        </div>

        <aside className="hidden md:block xl:sticky xl:top-24 space-y-4">
          <StudentAdvancedFilters
            query={query}
            universities={uniqueUniversities}
            programs={uniquePrograms}
            academicYears={uniqueAcademicYears}
            onQueryChange={updateQuery}
            onReset={resetAdvancedFilters}
            compact
          />
          <DataInsightsPanel
            totalCount={students.length}
            filteredStudents={filteredStudents}
            searchQuery={query.searchQuery}
            duplicateGroups={duplicateGroups}
            qualityIssueCount={qualityIssueCount}
          />
        </aside>
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
    </div>
  );
}
