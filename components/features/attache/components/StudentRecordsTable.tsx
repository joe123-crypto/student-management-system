import React from 'react';
import type { StudentProfile } from '@/types';
import Checkbox from '@/components/ui/Checkbox';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { dashboardStaggerContainer } from '@/components/ui/motion';
import { Eye, SearchX } from 'lucide-react';

interface StudentRecordsTableProps {
  students: StudentProfile[];
  isLoading?: boolean;
  selectedStudentIds: Set<string>;
  reviewedStudentIds: Set<string>;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectOne: (studentId: string, checked: boolean) => void;
  onManage: (studentId: string) => void;
  onClearFilters: () => void;
}

export default function StudentRecordsTable({
  students,
  isLoading = false,
  selectedStudentIds,
  reviewedStudentIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onManage,
  onClearFilters,
}: StudentRecordsTableProps) {
  const allSelected = students.length > 0 && students.every((student) => selectedStudentIds.has(student.id));

  return (
    <div className="theme-card overflow-hidden rounded-2xl border">
      {isLoading ? (
        <div className="h-[400px] overflow-auto animate-pulse">
          <div className="theme-card-muted sticky top-0 z-10 border-b">
            <div className="grid grid-cols-[56px_1.3fr_1fr_1.2fr] gap-4 px-4 py-4">
              <div className="h-4 w-4 rounded bg-[rgba(220,205,166,0.6)]" />
              <div className="h-3 w-24 rounded bg-[rgba(220,205,166,0.6)]" />
              <div className="h-3 w-24 rounded bg-[rgba(220,205,166,0.6)]" />
              <div className="h-3 w-32 rounded bg-[rgba(220,205,166,0.6)]" />
            </div>
          </div>
          <div className="divide-y divide-[rgba(220,205,166,0.55)]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[56px_1.3fr_1fr_1.2fr] gap-4 px-4 py-4">
                <div className="mt-1 h-4 w-4 rounded bg-[rgba(220,205,166,0.6)]" />
                <div className="space-y-2">
                  <div className="h-3 w-40 rounded bg-[rgba(220,205,166,0.6)]" />
                  <div className="h-3 w-56 rounded bg-[rgba(220,205,166,0.34)]" />
                </div>
                <div className="mt-1 h-3 w-28 rounded bg-[rgba(220,205,166,0.6)]" />
                <div className="space-y-2">
                  <div className="h-3 w-36 rounded bg-[rgba(220,205,166,0.6)]" />
                  <div className="h-3 w-24 rounded bg-[rgba(220,205,166,0.34)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="p-10 text-center sm:p-14">
          <div className="theme-card-muted mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border">
            <SearchX className="h-8 w-8 text-[color:var(--theme-primary-soft)]" />
          </div>
          <h3 className="theme-heading mt-5 text-xl font-bold">No students yet — click Add Student to get started</h3>
          <p className="theme-text-muted mx-auto mt-3 max-w-md text-base">
            Clear the current search or add the first student record.
          </p>
          <Button variant="secondary" size="sm" className="mt-5" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="min-h-[480px] overflow-auto">
          <div className="theme-card-muted border-b px-5 py-4 sm:hidden">
            <label className="theme-text-muted inline-flex items-center gap-2 text-sm font-bold uppercase">
              <Checkbox checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} />
              Select all
            </label>
          </div>

          <div className={`divide-y divide-[rgba(220,205,166,0.55)] sm:hidden ${dashboardStaggerContainer.className}`}>
            {students.map((student) => {
              const isSelected = selectedStudentIds.has(student.id);
              const isReviewed = reviewedStudentIds.has(student.id);

              return (
                <article
                  key={student.id}
                  className="cursor-pointer space-y-4 p-5 transition-colors hover:bg-[rgba(237,228,194,0.22)]"
                  onClick={() => onManage(student.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="theme-heading truncate text-lg font-bold">{student.student.fullName}</p>
                      <p className="theme-text-muted truncate text-sm">{student.contact.email}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge status={student.status} />
                      <Checkbox checked={isSelected} onChange={(e) => onToggleSelectOne(student.id, e.target.checked)} />
                    </div>
                  </div>

                  <div className="space-y-1 text-base">
                    <p className="font-mono text-[color:var(--theme-primary-soft)]">{student.student.inscriptionNumber}</p>
                    <p className="theme-heading font-medium">{student.university.universityName}</p>
                    <p className="theme-text-muted text-sm">{student.program.major}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    {isReviewed ? <span className="theme-success type-label rounded-full px-2 py-1">Reviewed</span> : <span />}
                    <Button variant="secondary" size="sm" onClick={(event) => {
                      event.stopPropagation();
                      onManage(student.id);
                    }}>
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          <table className="hidden min-w-[880px] w-full text-left text-base sm:table">
            <thead className="sticky top-0 z-10">
              <tr className="theme-card-muted theme-text-muted type-label">
                <th className="px-5 py-5">
                  <Checkbox checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} />
                </th>
                <th className="px-7 py-5">Student Name</th>
                <th className="px-7 py-5">Inscription No.</th>
                <th className="px-7 py-5">Status</th>
                <th className="px-7 py-5">University / Program</th>
                <th className="px-7 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-[rgba(220,205,166,0.55)] ${dashboardStaggerContainer.className}`}>
              {students.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                const isReviewed = reviewedStudentIds.has(student.id);

                return (
                  <tr key={student.id} className="cursor-pointer transition-colors hover:bg-[rgba(237,228,194,0.26)]" onClick={() => onManage(student.id)}>
                    <td className="px-5 py-6" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onChange={(e) => onToggleSelectOne(student.id, e.target.checked)} />
                    </td>
                    <td className="px-7 py-6">
                      <div className="theme-heading flex items-center gap-2 text-lg font-bold">
                        {student.student.fullName}
                        {isReviewed ? <span className="theme-success type-label rounded-full px-2 py-1">Reviewed</span> : null}
                      </div>
                      <div className="theme-text-muted mt-1 text-sm">{student.contact.email}</div>
                    </td>
                    <td className="px-7 py-6 font-mono text-[color:var(--theme-primary-soft)]">{student.student.inscriptionNumber}</td>
                    <td className="px-7 py-6">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="px-7 py-6">
                      <div className="theme-heading font-semibold">{student.university.universityName}</div>
                      <div className="theme-text-muted mt-1 text-sm">{student.program.major}</div>
                    </td>
                    <td className="px-7 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="secondary" size="sm" onClick={() => onManage(student.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </td>
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
