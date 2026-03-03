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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {isLoading ? (
        <div className="max-h-[400px] overflow-auto animate-pulse">
          <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
            <div className="grid grid-cols-[56px_1.3fr_1fr_1.2fr] gap-4 px-4 py-4">
              <div className="h-4 w-4 rounded bg-slate-200" />
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="h-3 w-32 rounded bg-slate-200" />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[56px_1.3fr_1fr_1.2fr] gap-4 px-4 py-4">
                <div className="h-4 w-4 rounded bg-slate-200 mt-1" />
                <div className="space-y-2">
                  <div className="h-3 w-40 rounded bg-slate-200" />
                  <div className="h-3 w-56 rounded bg-slate-100" />
                </div>
                <div className="h-3 w-28 rounded bg-slate-200 mt-1" />
                <div className="space-y-2">
                  <div className="h-3 w-36 rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-auto">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 md:hidden">
            <label className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Checkbox checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} />
              Select all
            </label>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {students.map((student) => {
              const isSelected = selectedStudentIds.has(student.id);
              const isReviewed = reviewedStudentIds.has(student.id);

              return (
                <article
                  key={student.id}
                  className="cursor-pointer space-y-3 p-4 transition-colors hover:bg-slate-50"
                  onClick={() => onManage(student.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-slate-900">{student.student.fullName}</p>
                      <p className="truncate text-xs text-slate-500">{student.contact.email}</p>
                    </div>
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onChange={(e) => onToggleSelectOne(student.id, e.target.checked)} />
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="font-mono text-slate-600">{student.student.inscriptionNumber}</p>
                    <p className="font-medium text-slate-900">{student.university.universityName}</p>
                    <p className="text-xs text-slate-500">{student.program.major}</p>
                  </div>

                  {isReviewed ? <span className="text-[10px] font-black uppercase text-emerald-600">Reviewed</span> : null}
                </article>
              );
            })}
          </div>

          <table className="hidden min-w-[760px] w-full text-left md:table">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-4">
                  <Checkbox checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} />
                </th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Inscription No.</th>
                <th className="px-6 py-4">University / Program</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                const isReviewed = reviewedStudentIds.has(student.id);

                return (
                  <tr key={student.id} className="cursor-pointer transition-colors hover:bg-slate-50" onClick={() => onManage(student.id)}>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onChange={(e) => onToggleSelectOne(student.id, e.target.checked)} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        {student.student.fullName}
                        {isReviewed ? <span className="text-[10px] font-black uppercase text-emerald-600">Reviewed</span> : null}
                      </div>
                      <div className="text-xs text-slate-500">{student.contact.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{student.student.inscriptionNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{student.university.universityName}</div>
                      <div className="text-xs text-slate-500">{student.program.major}</div>
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
          <p className="text-slate-500">No students found matching your filters.</p>
        </div>
      ) : null}
    </div>
  );
}
