import React from 'react';
import type { StudentProfile } from '@/types';
import type { StudentReturnField } from '@/components/features/attache/types';
import Checkbox from '@/components/ui/Checkbox';

interface StudentRecordsTableProps {
  students: StudentProfile[];
  isLoading?: boolean;
  returnFields: StudentReturnField[];
  selectedStudentIds: Set<string>;
  reviewedStudentIds: Set<string>;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectOne: (studentId: string, checked: boolean) => void;
  onManage: (studentId: string) => void;
}

interface TableColumn {
  key: StudentReturnField;
  label: string;
  render: (student: StudentProfile) => React.ReactNode;
}

function getStatusClasses(status: StudentProfile['status']): string {
  if (status === 'ACTIVE') {
    return 'theme-chip-success';
  }

  if (status === 'COMPLETED') {
    return 'theme-chip-warm';
  }

  return 'theme-chip-muted';
}

function getColumns(returnFields: StudentReturnField[]): TableColumn[] {
  const baseColumns: Record<StudentReturnField, TableColumn> = {
    fullName: {
      key: 'fullName',
      label: 'Full Name',
      render: (student) => (
        <div>
          <div className="theme-heading text-sm font-bold">{student.student.fullName}</div>
          <div className="theme-text-muted text-xs">{student.contact.email}</div>
        </div>
      ),
    },
    inscription: {
      key: 'inscription',
      label: 'Inscription No.',
      render: (student) => (
        <span className="text-sm font-mono text-[color:var(--theme-primary-soft)]">
          {student.student.inscriptionNumber}
        </span>
      ),
    },
    email: {
      key: 'email',
      label: 'Email',
      render: (student) => <span className="theme-text-muted text-sm">{student.contact.email}</span>,
    },
    university: {
      key: 'university',
      label: 'University',
      render: (student) => (
        <div>
          <div className="theme-heading text-sm font-medium">{student.university.universityName}</div>
          <div className="theme-text-muted text-xs">
            {[student.university.campus, student.university.city].filter(Boolean).join(' · ')}
          </div>
        </div>
      ),
    },
    program: {
      key: 'program',
      label: 'Program',
      render: (student) => (
        <div>
          <div className="theme-heading text-sm font-medium">{student.program.major}</div>
          <div className="theme-text-muted text-xs">{student.program.degreeLevel}</div>
        </div>
      ),
    },
    degreeLevel: {
      key: 'degreeLevel',
      label: 'Degree Level',
      render: (student) => <span className="theme-text-muted text-sm">{student.program.degreeLevel}</span>,
    },
    status: {
      key: 'status',
      label: 'Status',
      render: (student) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(student.status)}`}
        >
          {student.status}
        </span>
      ),
    },
    phone: {
      key: 'phone',
      label: 'Phone',
      render: (student) => (
        <span className="theme-text-muted text-sm">{student.contact.phone || 'Not provided'}</span>
      ),
    },
  };

  const safeFields = returnFields.length > 0 ? returnFields : ['fullName', 'email'];
  return safeFields.map((field) => baseColumns[field]);
}

export default function StudentRecordsTable({
  students,
  isLoading = false,
  returnFields,
  selectedStudentIds,
  reviewedStudentIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onManage,
}: StudentRecordsTableProps) {
  const allSelected =
    students.length > 0 && students.every((student) => selectedStudentIds.has(student.id));
  const columns = getColumns(returnFields);

  return (
    <div className="theme-card overflow-hidden rounded-2xl border">
      {isLoading ? (
        <div className="h-[400px] overflow-auto animate-pulse">
          <div className="theme-card-muted sticky top-0 z-10 border-b">
            <div className="grid grid-cols-[56px_repeat(4,minmax(0,1fr))] gap-4 px-4 py-4">
              <div className="h-4 w-4 rounded bg-[rgba(220,205,166,0.6)]" />
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-3 w-28 rounded bg-[rgba(220,205,166,0.6)]" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-[rgba(220,205,166,0.55)]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[56px_repeat(4,minmax(0,1fr))] gap-4 px-4 py-4"
              >
                <div className="mt-1 h-4 w-4 rounded bg-[rgba(220,205,166,0.6)]" />
                {Array.from({ length: 4 }).map((__, columnIndex) => (
                  <div key={columnIndex} className="space-y-2">
                    <div className="h-3 w-36 rounded bg-[rgba(220,205,166,0.6)]" />
                    <div className="h-3 w-24 rounded bg-[rgba(220,205,166,0.34)]" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[400px] overflow-auto">
          <div className="theme-card-muted border-b px-4 py-3 md:hidden">
            <label className="theme-text-muted inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <Checkbox checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} />
              Select all
            </label>
          </div>

          <div className="divide-y divide-[rgba(220,205,166,0.55)] md:hidden">
            {students.map((student) => {
              const isSelected = selectedStudentIds.has(student.id);
              const isReviewed = reviewedStudentIds.has(student.id);

              return (
                <article
                  key={student.id}
                  className="cursor-pointer space-y-3 p-4 transition-colors hover:bg-[rgba(237,228,194,0.22)]"
                  onClick={() => onManage(student.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="theme-text-muted type-label">
                      {isReviewed ? 'Reviewed record' : 'Record'}
                    </div>
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => onToggleSelectOne(student.id, e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {columns.map((column) => (
                      <div key={column.key}>
                        <p className="theme-text-muted type-label mb-1">{column.label}</p>
                        <div>{column.render(student)}</div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          <table className="hidden w-full min-w-[760px] text-left md:table">
            <thead className="sticky top-0 z-10">
              <tr className="theme-card-muted theme-text-muted type-label">
                <th className="px-4 py-4">
                  <Checkbox checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} />
                </th>
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-4">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(220,205,166,0.55)]">
              {students.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                const isReviewed = reviewedStudentIds.has(student.id);

                return (
                  <tr
                    key={student.id}
                    className="cursor-pointer transition-colors hover:bg-[rgba(237,228,194,0.22)]"
                    onClick={() => onManage(student.id)}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => onToggleSelectOne(student.id, e.target.checked)}
                      />
                    </td>
                    {columns.map((column, index) => (
                      <td key={column.key} className="px-6 py-4 align-top">
                        <div className="flex items-start gap-2">
                          {index === 0 && isReviewed ? (
                            <span className="theme-success type-label rounded-full px-2 py-1">
                              Reviewed
                            </span>
                          ) : null}
                          <div>{column.render(student)}</div>
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && students.length === 0 ? (
        <div className="p-12 text-center">
          <p className="theme-text-muted">No students found matching your filters.</p>
        </div>
      ) : null}
    </div>
  );
}
