import React from 'react';
import ActionCard from '@/components/ui/ActionCard';
import Skeleton from '@/components/ui/Skeleton';

interface StudentMissingInfoSidebarProps {
  items: string[];
  loading?: boolean;
}

const StudentMissingInfoSidebar: React.FC<StudentMissingInfoSidebarProps> = ({
  items,
  loading = false,
}) => {
  return (
    <aside className="relative self-start">
      <div className="md:sticky top-6 z-10 max-h-[calc(100vh-3rem)] space-y-8 overflow-y-auto rounded-[2rem] transition-all">
        {loading ? (
          <div className="theme-card rounded-[2rem] border p-6">
            <Skeleton className="h-5 w-40" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        ) : (
          <ActionCard
            title="Missing Information"
            items={items}
            emptyMessage="Your profile is up to date!"
            priorityLabel="Priority High"
          />
        )}
      </div>
    </aside>
  );
};

export default StudentMissingInfoSidebar;
