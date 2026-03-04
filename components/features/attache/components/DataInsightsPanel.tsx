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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Query Summary</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {filteredCount} <span className="text-sm font-bold text-slate-500">/ {totalCount} records</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">{hasQuery ? `Search: "${searchQuery.trim()}"` : 'No keyword filter applied'}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-2 py-3">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</p>
            <p className="text-lg font-black text-emerald-700">{activeCount}</p>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-2 py-3">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pending</p>
            <p className="text-lg font-black text-amber-700">{pendingCount}</p>
          </div>
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-2 py-3">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Completed</p>
            <p className="text-lg font-black text-indigo-700">{completedCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Quality</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Universities</p>
            <p className="text-lg font-black text-slate-900">{universityCount}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">With Progress</p>
            <p className="text-lg font-black text-slate-900">{progressCount}</p>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 col-span-2">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Flagged Records</p>
            <p className="text-lg font-black text-amber-800">{qualityIssueCount}</p>
          </div>
        </div>
        {topStudent ? (
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Top Result</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{topStudent.student.fullName}</p>
            <p className="text-xs text-slate-500">{topStudent.student.inscriptionNumber}</p>
          </div>
        ) : null}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duplicate Detection</p>
        {duplicateGroups.length === 0 ? (
          <p className="text-xs text-slate-500">No duplicate emails or inscription numbers detected.</p>
        ) : (
          <div className="space-y-2">
            {duplicateGroups.slice(0, 5).map((group) => (
              <div key={group.key} className="rounded-xl bg-red-50 border border-red-100 p-3">
                <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">{group.label}</p>
                <p className="text-xs font-semibold text-slate-700 break-all mt-1">{group.value}</p>
                <p className="text-xs text-slate-500 mt-1">{group.studentIds.length} records</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

