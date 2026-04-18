import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { StudentProfile } from '@/types';
import type { DuplicateGroup } from '@/components/features/attache/types';
import { AnimatedCount, dashboardHoverLift, dashboardHoverTransition, dashboardStaggerContainer, dashboardStaggerItem } from '@/components/ui/motion';
import {
  buildStudentStatusCounts,
  getStudentStatusThemeClass,
} from '@/lib/students/status';

interface DataInsightsPanelProps {
  totalCount: number;
  filteredStudents: StudentProfile[];
  searchQuery: string;
  duplicateGroups: DuplicateGroup[];
  qualityIssueCount: number;
}

interface InsightSectionProps {
  totalCount: number;
  filteredStudents: StudentProfile[];
  searchQuery: string;
  duplicateGroups: DuplicateGroup[];
  qualityIssueCount: number;
}

export function QuerySummaryCard({
  totalCount,
  filteredStudents,
  searchQuery,
}: Pick<InsightSectionProps, 'totalCount' | 'filteredStudents' | 'searchQuery'>) {
  const shouldReduceMotion = useReducedMotion();
  const filteredCount = filteredStudents.length;
  const statusCounts = buildStudentStatusCounts(filteredStudents).slice(0, 3);
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <motion.div
      className="theme-card space-y-4 rounded-2xl border p-5"
      whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
      transition={dashboardHoverTransition}
    >
      <div>
        <p className="theme-text-muted type-label">Query Summary</p>
        <p className="theme-heading type-section-title mt-1">
          <AnimatedCount value={filteredCount} />{' '}
          <span className="theme-text-muted text-sm font-bold">
            / <AnimatedCount value={totalCount} suffix=" records" />
          </span>
        </p>
        <p className="theme-text-muted mt-1 text-xs">{hasQuery ? `Search: "${searchQuery.trim()}"` : 'No keyword filter applied'}</p>
      </div>
      <div className="grid gap-2 text-center sm:grid-cols-3">
        {statusCounts.length > 0 ? (
          statusCounts.map((statusEntry) => (
            <div
              key={statusEntry.status}
              className={`${getStudentStatusThemeClass(statusEntry.status)} rounded-xl border px-2 py-3`}
            >
              <p className="type-label">{statusEntry.label}</p>
              <p className="type-card-title"><AnimatedCount value={statusEntry.count} /></p>
            </div>
          ))
        ) : (
          <div className="theme-card-muted rounded-xl border px-2 py-3 sm:col-span-3">
            <p className="type-label">No Status Data</p>
            <p className="type-card-title"><AnimatedCount value={0} /></p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function DataQualityCard({
  filteredStudents,
  qualityIssueCount,
}: Pick<InsightSectionProps, 'filteredStudents' | 'qualityIssueCount'>) {
  const shouldReduceMotion = useReducedMotion();
  const universityCount = new Set(filteredStudents.map((student) => student.university.universityName)).size;
  const progressCount = filteredStudents.filter((student) => (student.academicHistory?.length || 0) > 0).length;
  const topStudent = filteredStudents[0];

  return (
    <motion.div
      className="theme-card space-y-4 rounded-2xl border p-5"
      variants={dashboardStaggerContainer}
      initial="hidden"
      animate="visible"
      whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
      transition={dashboardHoverTransition}
    >
      <p className="theme-text-muted type-label">Data Quality</p>
      <div className="grid grid-cols-2 gap-2">
        <motion.div variants={dashboardStaggerItem} className="theme-card-muted rounded-xl border p-3">
          <p className="theme-text-muted type-label">Universities</p>
          <p className="theme-heading type-card-title"><AnimatedCount value={universityCount} /></p>
        </motion.div>
        <motion.div variants={dashboardStaggerItem} className="theme-card-muted rounded-xl border p-3">
          <p className="theme-text-muted type-label">With Progress</p>
          <p className="theme-heading type-card-title"><AnimatedCount value={progressCount} /></p>
        </motion.div>
        <motion.div variants={dashboardStaggerItem} className="theme-warning col-span-2 rounded-xl border p-3">
          <p className="type-label">Flagged Records</p>
          <p className="type-card-title"><AnimatedCount value={qualityIssueCount} /></p>
        </motion.div>
      </div>
      {topStudent ? (
        <motion.div variants={dashboardStaggerItem} className="theme-accent-subtle rounded-xl border p-3">
          <p className="type-label">Top Result</p>
          <p className="theme-heading mt-1 text-sm font-bold">{topStudent.student.fullName}</p>
          <p className="theme-text-muted text-xs">{topStudent.student.inscriptionNumber}</p>
        </motion.div>
      ) : null}
    </motion.div>
  );
}

export function DuplicateDetectionCard({
  duplicateGroups,
}: Pick<InsightSectionProps, 'duplicateGroups'>) {
  return (
    <motion.div
      className="theme-card space-y-3 rounded-2xl border p-5"
      variants={dashboardStaggerContainer}
      initial="hidden"
      animate="visible"
    >
      <p className="theme-text-muted type-label">Duplicate Detection</p>
      {duplicateGroups.length === 0 ? (
        <p className="theme-text-muted text-xs">No duplicate emails or inscription numbers detected.</p>
      ) : (
        <div className="space-y-2">
          {duplicateGroups.slice(0, 5).map((group) => (
            <motion.div key={group.key} variants={dashboardStaggerItem} className="theme-danger rounded-xl border p-3">
              <p className="type-label">{group.label}</p>
              <p className="mt-1 break-all text-xs font-semibold text-[color:var(--theme-text)]">{group.value}</p>
              <p className="theme-text-muted mt-1 text-xs">
                <AnimatedCount value={group.studentIds.length} suffix=" records" />
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function DataInsightsPanel({
  totalCount,
  filteredStudents,
  searchQuery,
  duplicateGroups,
  qualityIssueCount,
}: DataInsightsPanelProps) {
  return (
    <div className="space-y-4">
      <QuerySummaryCard totalCount={totalCount} filteredStudents={filteredStudents} searchQuery={searchQuery} />
      <DataQualityCard filteredStudents={filteredStudents} qualityIssueCount={qualityIssueCount} />
      <DuplicateDetectionCard duplicateGroups={duplicateGroups} />
    </div>
  );
}

