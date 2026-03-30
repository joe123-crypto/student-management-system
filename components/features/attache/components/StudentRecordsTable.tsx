import React from 'react';
import type { StudentProfile } from '@/types';
import Checkbox from '@/components/ui/Checkbox';

interface StudentRecordsTableProps {
  students: StudentProfile[];
  isLoading?: boolean;
  selectedStudentIds: Set<string>;
  reviewedStudentIds: Set<string>;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectOne: (studentId: string, checked: boolean) => void;
  onManage: (studentId: string) => void;
}

export default function StudentRecordsTable({
  students,
  isLoading = false,
  selectedStudentIds,
  reviewedStudentIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onManage,
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
                    <div className="min-w-0">
                      <p className="theme-heading truncate text-base font-bold">{student.student.fullName}</p>
                      <p className="theme-text-muted truncate text-xs">{student.contact.email}</p>
                    </div>
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onChange={(e) => onToggleSelectOne(student.id, e.target.checked)} />
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="font-mono text-[color:var(--theme-primary-soft)]">{student.student.inscriptionNumber}</p>
                    <p className="theme-heading font-medium">{student.university.universityName}</p>
                    <p className="theme-text-muted text-xs">{student.program.major}</p>
                  </div>

                  {isReviewed ? <span className="theme-success type-label rounded-full px-2 py-1">Reviewed</span> : null}
                </article>
              );
            })}
          </div>

          <table className="hidden min-w-[760px] w-full text-left md:table">
            <thead className="sticky top-0 z-10">
              <tr className="theme-card-muted theme-text-muted type-label">
                <th className="px-4 py-4">
                  <Checkbox checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} />
                </th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Inscription No.</th>
                <th className="px-6 py-4">University / Program</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(220,205,166,0.55)]">
              {students.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                const isReviewed = reviewedStudentIds.has(student.id);

                return (
                  <tr key={student.id} className="cursor-pointer transition-colors hover:bg-[rgba(237,228,194,0.22)]" onClick={() => onManage(student.id)}>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onChange={(e) => onToggleSelectOne(student.id, e.target.checked)} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="theme-heading flex items-center gap-2 font-bold">
                        {student.student.fullName}
                        {isReviewed ? <span className="theme-success type-label rounded-full px-2 py-1">Reviewed</span> : null}
                      </div>
                      <div className="theme-text-muted text-xs">{student.contact.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-[color:var(--theme-primary-soft)]">{student.student.inscriptionNumber}</td>
                    <td className="px-6 py-4">
                      <div className="theme-heading text-sm font-medium">{student.university.universityName}</div>
                      <div className="theme-text-muted text-xs">{student.program.major}</div>
                    </td>
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
