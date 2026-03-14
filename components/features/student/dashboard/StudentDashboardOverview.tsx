import React from 'react';
import { Announcement } from '@/types';
import StatCard from '@/components/ui/StatCard';
import { AnnouncementFeedSection } from '@/components/features/shared/announcements/AnnouncementSections';
import Skeleton from '@/components/ui/Skeleton';

interface StudentDashboardOverviewProps {
  announcements: Announcement[];
  isStudentLoading?: boolean;
  isAnnouncementsLoading?: boolean;
}

const StudentDashboardOverview: React.FC<StudentDashboardOverviewProps> = ({
  announcements,
  isStudentLoading = false,
  isAnnouncementsLoading = false,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {isStudentLoading ? (
          <>
            <Skeleton className="min-h-[150px] sm:min-h-[160px]" />
            <Skeleton className="min-h-[150px] sm:min-h-[160px]" />
          </>
        ) : (
          <>
            <StatCard label="Niveau" value="L1" suffix="/ L2" />
            <StatCard label="Grade" value="17.2" suffix="/ 20" valueClassName="text-[color:var(--theme-primary-soft)]" />
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
    </>
  );
};

export default StudentDashboardOverview;
