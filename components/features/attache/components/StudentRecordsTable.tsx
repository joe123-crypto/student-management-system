import React from 'react';
import type { StudentProfile } from '@/types';
import type { StudentReturnField } from '@/components/features/attache/types';
import {
  DEFAULT_RETURN_FIELDS,
  getStudentFieldLabel,
  getStudentFieldValue,
} from '@/components/features/attache/utils/studentData';
import Checkbox from '@/components/ui/Checkbox';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { dashboardStaggerContainer } from '@/components/ui/motion';
import { SearchX } from 'lucide-react';

interface StudentRecordsTableProps {
  students: StudentProfile[];
  returnFields: StudentReturnField[];
  isLoading?: boolean;
  selectedStudentIds: Set<string>;
  reviewedStudentIds: Set<string>;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectOne: (studentId: string, checked: boolean) => void;
  onManage: (studentId: string) => void;
  onClearFilters: () => void;
}

const SELECTION_COLUMN_WIDTH_REM = 4;
const DEFAULT_COLUMN_WIDTH_REM = 13;
const FIELD_WIDTH_REM: Partial<Record<StudentReturnField, number>> = {
  fullName: 16,
  email: 16,
  university: 16,
  program: 16,
  currentHostAddress: 18,
  homeCountryAddress: 18,
  branchAddress: 16,
  emergencyContactName: 15,
  emergencyContactPhone: 14,
  status: 10,
  inscription: 12,
  iban: 14,
  accountNumber: 14,
};

const getColumnWidthRem = (field: StudentReturnField) => FIELD_WIDTH_REM[field] ?? DEFAULT_COLUMN_WIDTH_REM;

const getDisplayValue = (student: StudentProfile, field: StudentReturnField) => {
  const value = getStudentFieldValue(student, field).trim();
  return value.length > 0 ? value : '---';
};

export default function StudentRecordsTable({
  students,
  returnFields,
  isLoading = false,
  selectedStudentIds,
  reviewedStudentIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onManage,
  onClearFilters,
}: StudentRecordsTableProps) {
  const allSelected = students.length > 0 && students.every((student) => selectedStudentIds.has(student.id));
  const visibleFields = returnFields.length > 0 ? returnFields : DEFAULT_RETURN_FIELDS;
  const desktopTableMinWidthRem =
    SELECTION_COLUMN_WIDTH_REM +
    visibleFields.reduce((total, field) => total + getColumnWidthRem(field), 0);

  return (
    <div className="theme-card overflow-hidden rounded-2xl border">
      {isLoading ? (
        <div className="h-[320px] overflow-auto animate-pulse">
          <table
            className="w-full table-fixed text-left text-sm"
            style={{ minWidth: `${desktopTableMinWidthRem}rem` }}
          >
            <colgroup>
              <col style={{ width: `${SELECTION_COLUMN_WIDTH_REM}rem` }} />
              {visibleFields.map((field) => (
                <col key={field} style={{ width: `${getColumnWidthRem(field)}rem` }} />
              ))}
            </colgroup>
            <thead className="sticky top-0 z-10">
              <tr className="theme-card-muted border-b">
                <th className="px-4 py-3">
                  <div className="h-4 w-4 rounded bg-[rgba(220,205,166,0.6)]" />
                </th>
                {visibleFields.map((field) => (
                  <th key={field} className="px-4 py-3">
                    <div className="h-3 w-24 rounded bg-[rgba(220,205,166,0.6)]" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(220,205,166,0.55)]">
              {Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="h-16">
                  <td className="px-4 py-4 align-middle">
                    <div className="h-4 w-4 rounded bg-[rgba(220,205,166,0.6)]" />
                  </td>
                  {visibleFields.map((field) => (
                    <td key={`${field}-${index}`} className="px-4 py-4 align-middle">
                      <div
                        className={`rounded bg-[rgba(220,205,166,0.6)] ${
                          field === 'status' ? 'h-6 w-20 rounded-full' : 'h-3 w-28'
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : students.length === 0 ? (
        <div className="p-10 text-center sm:p-14">
          <div className="theme-card-muted mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border">
            <SearchX className="h-8 w-8 text-[color:var(--theme-primary-soft)]" />
          </div>
          <h3 className="theme-heading mt-5 text-xl font-bold">No students yet - import them from Settings to get started</h3>
          <p className="theme-text-muted mx-auto mt-3 max-w-md text-base">
            Clear the current search or open Settings to import the first student records.
          </p>
          <Button variant="secondary" size="sm" className="mt-5" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="min-h-[340px] overflow-auto">
          <div className="theme-card-muted border-b px-4 py-3 sm:hidden">
            <label className="theme-text-muted inline-flex items-center gap-2 text-sm font-bold uppercase">
              <Checkbox checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} />
              Select all
            </label>
          </div>

          <div className={`divide-y divide-[rgba(220,205,166,0.55)] sm:hidden ${dashboardStaggerContainer.className}`}>
            {students.map((student) => {
              const isSelected = selectedStudentIds.has(student.id);
              const isReviewed = reviewedStudentIds.has(student.id);
              const fullName = student.student.fullName || '---';
              const email = student.contact.email || '---';
              const inscriptionNumber = student.student.inscriptionNumber || '---';
              const universityName = student.university.universityName || '---';
              const programMajor = student.program.major || '---';

              return (
                <article
                  key={student.id}
                  className="cursor-pointer space-y-3 p-4 transition-colors hover:bg-[rgba(237,228,194,0.22)]"
                  onClick={() => onManage(student.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="theme-heading truncate text-base font-bold" title={fullName}>
                        {fullName}
                      </p>
                      <p className="theme-text-muted truncate text-xs" title={email}>
                        {email}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge status={student.status} compact />
                      <Checkbox checked={isSelected} onChange={(e) => onToggleSelectOne(student.id, e.target.checked)} />
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="truncate font-mono text-[color:var(--theme-primary-soft)]" title={inscriptionNumber}>
                      {inscriptionNumber}
                    </p>
                    <p className="theme-heading truncate font-medium" title={universityName}>
                      {universityName}
                    </p>
                    <p className="theme-text-muted truncate text-sm" title={programMajor}>
                      {programMajor}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    {isReviewed ? <span className="theme-success type-label rounded-full px-2 py-1">Reviewed</span> : null}
                  </div>
                </article>
              );
            })}
          </div>

          <table
            className="hidden w-full table-fixed text-left text-sm sm:table"
            style={{ minWidth: `${desktopTableMinWidthRem}rem` }}
          >
            <colgroup>
              <col style={{ width: `${SELECTION_COLUMN_WIDTH_REM}rem` }} />
              {visibleFields.map((field) => (
                <col key={field} style={{ width: `${getColumnWidthRem(field)}rem` }} />
              ))}
            </colgroup>
            <thead className="sticky top-0 z-10">
              <tr className="theme-card-muted theme-text-muted type-label">
                <th className="px-4 py-3">
                  <Checkbox checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} />
                </th>
                {visibleFields.map((field) => (
                  <th key={field} className="px-4 py-3 whitespace-nowrap">
                    {getStudentFieldLabel(field)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y divide-[rgba(220,205,166,0.55)] ${dashboardStaggerContainer.className}`}>
              {students.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                const isReviewed = reviewedStudentIds.has(student.id);
                const rowTitle =
                  student.student.fullName ||
                  student.contact.email ||
                  student.student.inscriptionNumber ||
                  'Student record';

                return (
                  <tr
                    key={student.id}
                    className="h-16 cursor-pointer transition-colors hover:bg-[rgba(237,228,194,0.26)]"
                    onClick={() => onManage(student.id)}
                    title={rowTitle}
                  >
                    <td className="px-4 py-4 align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={isSelected} onChange={(e) => onToggleSelectOne(student.id, e.target.checked)} />
                        {isReviewed ? (
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full bg-[color:var(--theme-primary)]"
                            title="Reviewed"
                          />
                        ) : null}
                      </div>
                    </td>
                    {visibleFields.map((field) => (
                      <td key={`${student.id}-${field}`} className="px-4 py-4 align-middle">
                        {field === 'status' ? (
                          <div className="overflow-hidden whitespace-nowrap">
                            <StatusBadge status={student.status} compact />
                          </div>
                        ) : (
                          <div
                            className={`overflow-hidden whitespace-nowrap ${
                              field === 'inscription' || field === 'accountNumber' || field === 'iban'
                                ? 'font-mono text-[color:var(--theme-primary-soft)]'
                                : 'theme-heading font-medium'
                            }`}
                            title={getDisplayValue(student, field)}
                          >
                            {getDisplayValue(student, field)}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
