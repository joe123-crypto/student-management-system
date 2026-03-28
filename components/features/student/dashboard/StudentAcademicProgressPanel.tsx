import React from 'react';
import { ProgressDetails } from '@/types';
import { PROGRESS_DATA } from '@/constants';
import AcademicStatusCard from '@/components/ui/AcademicStatusCard';
import Skeleton from '@/components/ui/Skeleton';
import { getSortedAcademicHistory } from '@/lib/students/academicHistory';

interface StudentAcademicProgressPanelProps {
  academicHistory?: ProgressDetails[];
  status?: string;
  onStartUpdate: () => void;
  loading?: boolean;
}

const StudentAcademicProgressPanel: React.FC<StudentAcademicProgressPanelProps> = ({
  academicHistory,
  status = 'PENDING',
  onStartUpdate,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="theme-card rounded-[2rem] border p-5 sm:rounded-[2.5rem] sm:p-10">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="space-y-8 sm:space-y-12">
          <Skeleton className="h-64 w-full sm:h-80" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-32 rounded-md" />
            <div className="grid gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sortedAcademicHistory = getSortedAcademicHistory(academicHistory);
  const latestEntry = sortedAcademicHistory[sortedAcademicHistory.length - 1];

  const chartData =
    sortedAcademicHistory.length > 0
      ? sortedAcademicHistory.map((entry) => ({
          label: entry.year,
          grade: Number(entry.grade),
        }))
      : PROGRESS_DATA.map((entry) => ({
          label: entry.name,
          grade: Number((entry.gpa * 5).toFixed(1)),
        }));

  return (
    <AcademicStatusCard
      title="Progress"
      status={status}
      metricLabel={latestEntry ? 'Latest Moyenne' : 'Academic Record'}
      metricValue={latestEntry ? `${latestEntry.grade}/20` : 'No records yet'}
      chartData={chartData}
      chartDataKey="grade"
      chartSeriesLabel="Moyenne"
      chartValueSuffix="/20"
      chartLabelKey="label"
      yDomain={[0, 20]}
      history={sortedAcademicHistory}
      actionLabel="Update"
      onAction={onStartUpdate}
      showRealtimeBadge
      showAxes
      showTooltip
    />
  );
};

export default StudentAcademicProgressPanel;
