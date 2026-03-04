import React from 'react';
import { Announcement } from '@/types';
import StatCard from '@/components/ui/StatCard';
import { AnnouncementFeedSection } from '@/components/features/shared/announcements/AnnouncementSections';

interface StudentDashboardOverviewProps {
  announcements: Announcement[];
}

const StudentDashboardOverview: React.FC<StudentDashboardOverviewProps> = ({ announcements }) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatCard label="Niveau" value="L1" suffix="/ L2" />
        <StatCard label="Grade" value="17.2" suffix="/ 20" valueClassName="text-indigo-600" />
      </div>

      <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-10">
        <AnnouncementFeedSection
          announcements={announcements}
          title="Latest Announcements"
          titleVariant="headline"
          listClassName="space-y-6"
        />
      </div>
    </>
  );
};

export default StudentDashboardOverview;
