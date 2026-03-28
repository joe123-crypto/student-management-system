import React from 'react';
import { Announcement, StudentProfile } from '@/types';
import StatCard from '@/components/ui/StatCard';
import { AnnouncementFeedSection } from '@/components/features/shared/announcements/AnnouncementSections';
import Skeleton from '@/components/ui/Skeleton';
import { getLatestAcademicEntry } from '@/lib/students/academicHistory';

interface StudentDashboardOverviewProps {
  student?: StudentProfile | null;
  announcements: Announcement[];
  isStudentLoading?: boolean;
  isAnnouncementsLoading?: boolean;
}

const StudentDashboardOverview: React.FC<StudentDashboardOverviewProps> = ({
  student,
  announcements,
  isStudentLoading = false,
  isAnnouncementsLoading = false,
}) => {
  const latestAcademicEntry = getLatestAcademicEntry(student?.academicHistory);
  const currentLevel = student?.program.degreeLevel || 'Not set';
  const currentProgram = student?.program.major || 'Program details are not available yet.';
  const latestGrade = latestAcademicEntry ? latestAcademicEntry.grade : 'No record';
  const latestGradeSuffix = latestAcademicEntry ? '/ 20' : '';
  const latestGradeSupportingText = latestAcademicEntry
    ? `${latestAcademicEntry.year} submission is the latest academic update on file.`
    : 'Submit an academic update to start building your progress history.';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {isStudentLoading ? (
          <>
            <Skeleton className="min-h-[150px] sm:min-h-[160px]" />
            <Skeleton className="min-h-[150px] sm:min-h-[160px]" />
          </>
        ) : (
          <>
            <StatCard
              label="Current Level"
              value={currentLevel}
              supportingText={currentProgram}
            />
            <StatCard
              label="Latest Moyenne"
              value={latestGrade}
              suffix={latestGradeSuffix}
              supportingText={latestGradeSupportingText}
              valueClassName={latestAcademicEntry ? 'text-[color:var(--theme-primary-soft)]' : 'text-[color:var(--theme-text)]'}
            />
          </>
        )}
      </div>

      <div className="theme-card rounded-[2rem] border p-5 sm:rounded-[2.5rem] sm:p-10">
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
      </div>
    </div>
  );
};

export default StudentDashboardOverview;
