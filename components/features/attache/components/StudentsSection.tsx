import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AttacheAgentContext, StudentProfile } from '@/types';
import StudentQueryToolbar from '@/components/features/attache/components/StudentQueryToolbar';
import BulkActionsBar from '@/components/features/attache/components/BulkActionsBar';
import DatabaseQueryModal from '@/components/features/attache/components/DatabaseQueryModal';
import StudentRecordsTable from '@/components/features/attache/components/StudentRecordsTable';
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
  selectedStudentId?: string | null;
  onSelectedStudentIdChange?: (studentId: string | null) => void;
  fitViewport?: boolean;
}

const DEFAULT_REPORT_COLUMNS = ['fullName', 'email', 'inscriptionNumber', 'status', 'university', 'program'];

export default function StudentsSection({
  students,
  isLoading = false,
  onDeleteStudents,
  onImportStudents,
  onUpdateStudent,
  onLogCommunication,
  onAgentContextChange,
  selectedStudentId: controlledSelectedStudentId,
  onSelectedStudentIdChange,
  fitViewport = false,
}: StudentsSectionProps) {
  const notifications = useNotifications();
  const [uncontrolledSelectedStudentId, setUncontrolledSelectedStudentId] = useState<string | null>(null);
  const [exportPopupOpen, setExportPopupOpen] = useState(false);
  const [dataQualityOpen, setDataQualityOpen] = useState(false);
  const [duplicateDetectionOpen, setDuplicateDetectionOpen] = useState(false);
  const [databaseQueryOpen, setDatabaseQueryOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [editStudentOpen, setEditStudentOpen] = useState(false);
  const [inlineEditingStudentId, setInlineEditingStudentId] = useState<string | null>(null);
  const isSelectedStudentControlled = controlledSelectedStudentId !== undefined;
  const selectedStudentId = isSelectedStudentControlled ? controlledSelectedStudentId : uncontrolledSelectedStudentId;
  const setSelectedStudentId = useCallback((studentId: string | null) => {
    if (!isSelectedStudentControlled) {
      setUncontrolledSelectedStudentId(studentId);
    }
    onSelectedStudentIdChange?.(studentId);
  }, [isSelectedStudentControlled, onSelectedStudentIdChange]);

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
  const statusOptions = useMemo(() => {
    const uniqueStatuses = Array.from(
      new Set(students.map((student) => student.status.trim()).filter(Boolean)),
    ).sort((left, right) => left.localeCompare(right));

    if (query.status !== 'ALL' && !uniqueStatuses.includes(query.status)) {
      uniqueStatuses.push(query.status);
    }

    return uniqueStatuses;
  }, [query.status, students]);

  const {
    selectedStudentIds,
    reviewedStudentIds,
    clearSelection,
    handleToggleSelectAll,
    handleToggleSelectOne,
    handleMarkReviewed,
    handleDeleteSelected,
  } = useStudentSelection(filteredStudents, {
    isReady: !isLoading,
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
    const isEditedStudentVisible = filteredStudents.some((student) => student.id === inlineEditingStudentId);

    if (!hasSingleSelectedStudent || !isEditedStudentVisible) {
      setInlineEditingStudentId(null);
    }
  }, [filteredStudents, inlineEditingStudentId, selectedStudentIds]);

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
      className={fitViewport ? 'flex h-full min-h-0 flex-col gap-4' : 'space-y-6'}
      variants={dashboardStaggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className={fitViewport ? 'flex min-h-0 flex-1 flex-col gap-4' : 'space-y-6'}>
        <motion.div variants={dashboardStaggerItem}>
          <BulkActionsBar
            selectedCount={selectedStudentIds.size}
            filters={(
              <StudentQueryToolbar
                query={query}
                statusOptions={statusOptions}
                onQueryChange={updateQuery}
              />
            )}
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
            isEditDisabled={!singleSelectedStudent || isLoading}
            isExportDisabled={isLoading}
            isInsightsDisabled={isLoading}
            compact={fitViewport}
          />
        </motion.div>

        <motion.div variants={dashboardStaggerItem} className={fitViewport ? 'min-h-0 flex-1' : undefined}>
          <StudentRecordsTable
            students={filteredStudents}
            isLoading={isLoading}
            returnFields={query.returnFields}
            selectedStudentIds={selectedStudentIds}
            reviewedStudentIds={reviewedStudentIds}
            onToggleSelectAll={(checked) => handleToggleSelectAll(filteredStudents, checked)}
            onToggleSelectOne={handleToggleSelectOne}
            editingStudentId={inlineEditingStudentId}
            onCancelEdit={() => setInlineEditingStudentId(null)}
            onManage={setSelectedStudentId}
            fitViewport={fitViewport}
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
