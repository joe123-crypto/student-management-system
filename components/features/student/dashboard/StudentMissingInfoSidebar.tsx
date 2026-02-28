import React from 'react';
import ActionCard from '@/components/ui/ActionCard';

interface StudentMissingInfoSidebarProps {
  items: string[];
}

const StudentMissingInfoSidebar: React.FC<StudentMissingInfoSidebarProps> = ({ items }) => {
  return (
    <aside className="relative self-start">
      <div className="md:sticky top-6 z-10 max-h-[calc(100vh-3rem)] space-y-8 overflow-y-auto rounded-[2rem] transition-all">
        <ActionCard
          title="Missing Information"
          items={items}
          emptyMessage="Your profile is up to date!"
          priorityLabel="Priority High"
        />
      </div>
    </aside>
  );
};

export default StudentMissingInfoSidebar;
