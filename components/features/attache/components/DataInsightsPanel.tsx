import React from 'react';
import type { StudentProfile } from '@/types';
import type { DuplicateGroup } from '@/components/features/attache/types';

interface DataInsightsPanelProps {
  totalCount: number;
  filteredStudents: StudentProfile[];
  searchQuery: string;
  duplicateGroups: DuplicateGroup[];
  qualityIssueCount: number;
}

export default function DataInsightsPanel({
  totalCount,
  filteredStudents,
  searchQuery,
  duplicateGroups,
  qualityIssueCount,
}: DataInsightsPanelProps) {
  const filteredCount = filteredStudents.length;
  const activeCount = filteredStudents.filter((student) => student.status === 'ACTIVE').length;
  const pendingCount = filteredStudents.filter((student) => student.status === 'PENDING').length;
  const completedCount = filteredStudents.filter((student) => student.status === 'COMPLETED').length;
  const universityCount = new Set(filteredStudents.map((student) => student.university.universityName)).size;
  const progressCount = filteredStudents.filter((student) => (student.academicHistory?.length || 0) > 0).length;
  const topStudent = filteredStudents[0];
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="theme-card space-y-4 rounded-2xl border p-5">
        <div>
          <p className="theme-text-muted text-[10px] font-black uppercase tracking-widest">Query Summary</p>
          <p className="theme-heading mt-1 text-2xl font-black">
            {filteredCount} <span className="theme-text-muted text-sm font-bold">/ {totalCount} records</span>
          </p>
          <p className="theme-text-muted mt-1 text-xs">{hasQuery ? `Search: "${searchQuery.trim()}"` : 'No keyword filter applied'}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="theme-success rounded-xl border px-2 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest">Active</p>
            <p className="text-lg font-black">{activeCount}</p>
          </div>
          <div className="theme-warning rounded-xl border px-2 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest">Pending</p>
            <p className="text-lg font-black">{pendingCount}</p>
          </div>
          <div className="theme-info rounded-xl border px-2 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest">Completed</p>
            <p className="text-lg font-black">{completedCount}</p>
          </div>
        </div>
      </div>

      <div className="theme-card space-y-4 rounded-2xl border p-5">
        <p className="theme-text-muted text-[10px] font-black uppercase tracking-widest">Data Quality</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="theme-card-muted rounded-xl border p-3">
            <p className="theme-text-muted text-[10px] font-black uppercase tracking-widest">Universities</p>
            <p className="theme-heading text-lg font-black">{universityCount}</p>
          </div>
          <div className="theme-card-muted rounded-xl border p-3">
            <p className="theme-text-muted text-[10px] font-black uppercase tracking-widest">With Progress</p>
            <p className="theme-heading text-lg font-black">{progressCount}</p>
          </div>
          <div className="theme-warning col-span-2 rounded-xl border p-3">
            <p className="text-[10px] font-black uppercase tracking-widest">Flagged Records</p>
            <p className="text-lg font-black">{qualityIssueCount}</p>
          </div>
        </div>
        {topStudent ? (
          <div className="theme-accent-subtle rounded-xl border p-3">
            <p className="text-[10px] font-black uppercase tracking-widest">Top Result</p>
            <p className="theme-heading mt-1 text-sm font-bold">{topStudent.student.fullName}</p>
            <p className="theme-text-muted text-xs">{topStudent.student.inscriptionNumber}</p>
          </div>
        ) : null}
      </div>

      <div className="theme-card space-y-3 rounded-2xl border p-5">
        <p className="theme-text-muted text-[10px] font-black uppercase tracking-widest">Duplicate Detection</p>
        {duplicateGroups.length === 0 ? (
          <p className="theme-text-muted text-xs">No duplicate emails or inscription numbers detected.</p>
        ) : (
          <div className="space-y-2">
            {duplicateGroups.slice(0, 5).map((group) => (
              <div key={group.key} className="theme-danger rounded-xl border p-3">
                <p className="text-[10px] font-black uppercase tracking-widest">{group.label}</p>
                <p className="mt-1 break-all text-xs font-semibold text-[color:var(--theme-text)]">{group.value}</p>
                <p className="theme-text-muted mt-1 text-xs">{group.studentIds.length} records</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

