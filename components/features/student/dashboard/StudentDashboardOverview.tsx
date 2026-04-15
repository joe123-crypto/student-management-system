import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Announcement, StudentProfile } from '@/types';
import StatCard from '@/components/ui/StatCard';
import { AnimatedCount, dashboardHoverLift, dashboardHoverTransition, dashboardStaggerContainer, dashboardStaggerItem } from '@/components/ui/motion';
import { AnnouncementFeedSection } from '@/components/features/shared/announcements/AnnouncementSections';
import Skeleton from '@/components/ui/Skeleton';
import { getLatestAcademicEntry } from '@/lib/students/academicHistory';
import {
  ProfileSectionId,
  profileSections,
} from '@/components/features/student/dashboard/StudentProfileSectionDetailsCard';

interface StudentDashboardOverviewProps {
  student?: StudentProfile | null;
  announcements: Announcement[];
  isStudentLoading?: boolean;
  isAnnouncementsLoading?: boolean;
  onOpenProfileSection?: (sectionId: ProfileSectionId) => void;
}

const StudentDashboardOverview: React.FC<StudentDashboardOverviewProps> = ({
  student,
  announcements,
  isStudentLoading = false,
  isAnnouncementsLoading = false,
  onOpenProfileSection,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const latestAcademicEntry = getLatestAcademicEntry(student?.academicHistory);
  const latestGradeNumber = latestAcademicEntry ? Number(latestAcademicEntry.grade) : null;
  const currentLevel = student?.program.degreeLevel || 'Not set';
  const currentProgram = student?.program.major || 'Program details are not available yet.';
  const latestGrade = latestAcademicEntry ? latestAcademicEntry.grade : 'No record';
  const latestGradeSuffix = latestAcademicEntry ? '/ 20' : '';
  const latestGradeSupportingText = latestAcademicEntry
    ? `${latestAcademicEntry.year} submission is the latest academic update on file.`
    : 'Submit an academic update to start building your progress history.';
  const latestGradeDecimalPlaces =
    latestGradeNumber !== null && Number.isFinite(latestGradeNumber) && !Number.isInteger(latestGradeNumber)
      ? 1
      : 0;

  return (
    <motion.div
      className="space-y-6"
      variants={dashboardStaggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {isStudentLoading ? (
          <>
            <Skeleton className="min-h-[150px] sm:min-h-[160px]" />
            <Skeleton className="min-h-[150px] sm:min-h-[160px]" />
          </>
        ) : (
          <>
            <motion.div variants={dashboardStaggerItem}>
              <StatCard
                label="Current Level"
                value={currentLevel}
                supportingText={currentProgram}
              />
            </motion.div>
            <motion.div variants={dashboardStaggerItem}>
              <StatCard
                label="Latest Moyenne"
                value={
                  latestGradeNumber !== null && Number.isFinite(latestGradeNumber) ? (
                    <AnimatedCount value={latestGradeNumber} decimalPlaces={latestGradeDecimalPlaces} />
                  ) : (
                    latestGrade
                  )
                }
                suffix={latestGradeSuffix}
                supportingText={latestGradeSupportingText}
                valueClassName={latestAcademicEntry ? 'text-[color:var(--theme-primary-soft)]' : 'text-[color:var(--theme-text)]'}
              />
            </motion.div>
          </>
        )}
      </div>

      <motion.div
        variants={dashboardStaggerItem}
        className="theme-card rounded-[2rem] border p-5 sm:rounded-[2.5rem] sm:p-8"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="theme-text-muted type-label">Profile sections</p>
            <h5 className="theme-heading type-card-title">Open a section to view the full record</h5>
          </div>
          <p className="theme-text-muted hidden text-sm font-semibold md:block">
            <AnimatedCount value={profileSections.length} suffix=" sections" />
          </p>
        </div>

        <motion.div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" variants={dashboardStaggerContainer}>
          {profileSections.map((section) => {
            const SectionIcon = section.icon;

            return (
              <motion.button
                key={section.id}
                type="button"
                onClick={() => onOpenProfileSection?.(section.id)}
                variants={dashboardStaggerItem}
                whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
                transition={dashboardHoverTransition}
                className="group flex min-h-[7.75rem] flex-col items-start justify-between rounded-[1.6rem] border border-[rgba(220,205,166,0.46)] bg-[rgba(255,255,255,0.58)] px-5 py-5 text-left transition-all hover:-translate-y-0.5 hover:border-[rgba(37,79,34,0.22)] hover:bg-[rgba(255,255,255,0.8)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(37,79,34,0.08)] text-[color:var(--theme-primary-soft)] transition-colors group-hover:text-[color:var(--theme-primary)]">
                  <SectionIcon className="h-5 w-5" />
                </div>

                <div className="mt-4">
                  <h6 className="theme-heading type-card-title">{section.title}</h6>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--theme-primary)]">
                  <span>Open section</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>

      <motion.div
        variants={dashboardStaggerItem}
        className="theme-card rounded-[2rem] border p-5 sm:rounded-[2.5rem] sm:p-10"
      >
        {isAnnouncementsLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-56" />
            <div className="space-y-5">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          </div>
        ) : (
          <AnnouncementFeedSection
            announcements={announcements}
            title="Latest Announcements"
            titleVariant="headline"
            listClassName="space-y-6"
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default StudentDashboardOverview;
