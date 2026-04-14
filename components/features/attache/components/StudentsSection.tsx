import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import EditStudentRecordModal from '@/components/features/attache/components/EditStudentRecordModal';
import ExportRecordsModal from '@/components/features/attache/components/ExportRecordsModal';
import AddStudentRecordModal from '@/components/features/attache/components/AddStudentRecordModal';
import useStudentFilters from '@/components/features/attache/hooks/useStudentFilters';
import useStudentSelection from '@/components/features/attache/hooks/useStudentSelection';
import useStudentTable from '@/components/features/attache/hooks/useStudentTable';
import useStudentExports from '@/components/features/attache/hooks/useStudentExports';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { isSameAgentContext } from '@/components/features/attache/utils/agentContext';
import {
  applyStudentQuery,
  DEFAULT_STUDENT_QUERY,
  getDuplicateGroups,
  getQualityFlags,
  REPORT_COLUMNS,
} from '@/components/features/attache/utils/studentData';
import Skeleton from '@/components/ui/Skeleton';
import { dashboardPanelMotion, dashboardStaggerContainer, dashboardStaggerItem } from '@/components/ui/motion';

interface StudentsSectionProps {
  students: StudentProfile[];
  isLoading?: boolean;
  onDeleteStudents: (studentIds: string[]) => void;
  onImportStudents: (records: StudentProfile[], mode: 'append' | 'replace') => Promise<void>;
  onUpdateStudent: (id: string, profile: Partial<StudentProfile>) => Promise<void>;
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
  onUpdateStudent,
  onLogCommunication,
  onAgentContextChange,
}: StudentsSectionProps) {
  const notifications = useNotifications();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [exportPopupOpen, setExportPopupOpen] = useState(false);
  const [dataQualityOpen, setDataQualityOpen] = useState(false);
  const [duplicateDetectionOpen, setDuplicateDetectionOpen] = useState(false);
  const [databaseQueryOpen, setDatabaseQueryOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [editStudentOpen, setEditStudentOpen] = useState(false);
  const [inlineEditingStudentId, setInlineEditingStudentId] = useState<string | null>(null);

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
  const singleSelectedStudent = useMemo(() => {
    if (selectedStudentIds.size !== 1) {
      return null;
    }

    return students.find((student) => selectedStudentIds.has(student.id)) ?? null;
  }, [students, selectedStudentIds]);

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
    if (!inlineEditingStudentId) {
      return;
    }

    const hasSingleSelectedStudent =
      selectedStudentIds.size === 1 && selectedStudentIds.has(inlineEditingStudentId);
    const isEditedStudentOnCurrentPage = paginatedTableStudents.some((student) => student.id === inlineEditingStudentId);

    if (!hasSingleSelectedStudent || !isEditedStudentOnCurrentPage) {
      setInlineEditingStudentId(null);
    }
  }, [inlineEditingStudentId, paginatedTableStudents, selectedStudentIds]);

  const agentContext = useMemo<AttacheAgentContext>(() => ({
    filteredStudentIds: filteredStudents.map((student) => student.id),
    selectedStudentIds: Array.from(selectedStudentIds),
    searchQuery: query.searchQuery,
    statusFilter: query.status,
    university: query.university,
    program: query.program,
    duplicatesOnly: query.duplicatesOnly,
  }), [
    filteredStudents,
    query.duplicatesOnly,
    query.program,
    query.searchQuery,
    query.status,
    query.university,
    selectedStudentIds,
  ]);
  const lastSentAgentContextRef = useRef<AttacheAgentContext | null>(null);

  useEffect(() => {
    if (!onAgentContextChange) return;
    if (lastSentAgentContextRef.current && isSameAgentContext(lastSentAgentContextRef.current, agentContext)) {
      return;
    }

    lastSentAgentContextRef.current = agentContext;
    onAgentContextChange(agentContext);
  }, [agentContext, onAgentContextChange]);

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
    if (editStudentOpen) {
      return (
        <motion.div {...dashboardPanelMotion}>
          <EditStudentRecordModal
            open={editStudentOpen}
            mode="inline"
            student={selectedStudent}
            students={students}
            onClose={() => setEditStudentOpen(false)}
            onSubmit={async (nextStudent) => {
              await onUpdateStudent(selectedStudent.id, nextStudent);
              setEditStudentOpen(false);
              notifications.notify({
                tone: 'success',
                title: 'Student record updated',
                message: `${nextStudent.student.fullName || nextStudent.student.inscriptionNumber} has been updated.`,
              });
            }}
          />
        </motion.div>
      );
    }

    return (
      <motion.div {...dashboardPanelMotion}>
        <StudentDetailView
          student={selectedStudent}
          onBack={() => {
            setSelectedStudentId(null);
            setEditStudentOpen(false);
          }}
          onEdit={() => setEditStudentOpen(true)}
          onDeleteProgressRecord={async (entry) => {
            await onUpdateStudent(selectedStudent.id, {
              academicHistory: (selectedStudent.academicHistory || []).filter((item) => item.id !== entry.id),
            });
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={dashboardStaggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-6">
        <motion.div variants={dashboardStaggerItem}>
          <StudentQueryToolbar
            query={query}
            onQueryChange={updateQuery}
          />
        </motion.div>

        <motion.div variants={dashboardStaggerItem}>
          <BulkActionsBar
            selectedCount={selectedStudentIds.size}
            onAddStudent={() => {
              setAddStudentOpen(true);
            }}
            onEditSelected={() => {
              if (!singleSelectedStudent) return;
              setInlineEditingStudentId((current) => (
                current === singleSelectedStudent.id ? null : singleSelectedStudent.id
              ));
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
            isEditActive={inlineEditingStudentId !== null}
            isEditDisabled={!singleSelectedStudent || isLoading || isStudentTableLoading}
            isExportDisabled={isLoading}
            isInsightsDisabled={isLoading}
          />
        </motion.div>

        <motion.div variants={dashboardStaggerItem}>
          <StudentRecordsTable
            students={paginatedTableStudents}
            isLoading={isLoading || isStudentTableLoading}
            returnFields={query.returnFields}
            selectedStudentIds={selectedStudentIds}
            reviewedStudentIds={reviewedStudentIds}
            onToggleSelectAll={(checked) => handleToggleSelectAll(paginatedTableStudents, checked)}
            onToggleSelectOne={handleToggleSelectOne}
            editingStudentId={inlineEditingStudentId}
            onCancelEdit={() => setInlineEditingStudentId(null)}
            onManage={setSelectedStudentId}
            onSaveEdit={async (studentId, patch) => {
              await onUpdateStudent(studentId, patch);
              setInlineEditingStudentId(null);
              const updatedStudent = students.find((entry) => entry.id === studentId);
              const nextFullName =
                patch.student?.fullName ||
                [
                  patch.student?.givenName,
                  patch.student?.familyName,
                ]
                  .filter(Boolean)
                  .join(' ')
                  .trim() ||
                updatedStudent?.student.fullName ||
                updatedStudent?.student.inscriptionNumber ||
                'student';
              notifications.notify({
                tone: 'success',
                title: 'Student record updated',
                message: `Saved changes for ${nextFullName}.`,
              });
            }}
          />
        </motion.div>
        {!isLoading && !isStudentTableLoading ? (
          <motion.div variants={dashboardStaggerItem}>
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
          </motion.div>
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
          setAddStudentOpen(false);
          notifications.notify({
            tone: 'success',
            title: 'Student record created',
            message: `Added ${student.student.fullName || student.student.inscriptionNumber} to student records.`,
          });
        }}
      />

      <AnimatePresence>
        {dataQualityOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="theme-overlay absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDataQualityOpen(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {isLoading ? (
                <Skeleton className="h-72 rounded-2xl" />
              ) : (
                <DataQualityCard
                  filteredStudents={filteredStudents}
                  qualityIssueCount={qualityIssueCount}
                />
              )}
            </motion.div>
          </div>
        ) : null}

        {duplicateDetectionOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="theme-overlay absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDuplicateDetectionOpen(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {isLoading ? (
                <Skeleton className="h-72 rounded-2xl" />
              ) : (
                <DuplicateDetectionCard duplicateGroups={duplicateGroups} />
              )}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
