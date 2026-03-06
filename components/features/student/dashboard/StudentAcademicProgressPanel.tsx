import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ProgressDetails } from '@/types';
import { PROGRESS_DATA } from '@/constants';
import Button from '@/components/ui/Button';
import AcademicHistoryItem from '@/components/ui/AcademicHistoryItem';

interface StudentAcademicProgressPanelProps {
  academicHistory?: ProgressDetails[];
  onStartUpdate: () => void;
}

const StudentAcademicProgressPanel: React.FC<StudentAcademicProgressPanelProps> = ({
  academicHistory,
  onStartUpdate,
}) => {
  return (
    <div className="relative min-h-[500px] overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm transition-all sm:rounded-[2.5rem] sm:p-10">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <h4 className="font-rounded text-2xl font-black text-[#1a1b3a]">Progress</h4>
          <Button size="sm" className="text-[10px] uppercase tracking-widest" onClick={onStartUpdate}>
            Update
          </Button>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600">
          <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
          Real-time Data
        </div>
      </div>

      <div className="space-y-8 sm:space-y-12">
        <div className="h-64 w-full sm:h-80">
          <ResponsiveContainer width="100%" height="100%" minWidth={1}>
            <AreaChart data={PROGRESS_DATA}>
              <defs>
                <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={10}
                fontWeight="bold"
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                domain={[0, 4]}
                fontSize={10}
                fontWeight="bold"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '16px',
                  fontWeight: 'bold',
                }}
              />
              <Area
                type="monotone"
                dataKey="gpa"
                stroke="#4f46e5"
                strokeWidth={5}
                fillOpacity={1}
                fill="url(#colorGpa)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {academicHistory && academicHistory.length > 0 ? (
          <div className="space-y-4">
            <h5 className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Submission History
            </h5>
            <div className="grid gap-4">
              {academicHistory.map((entry) => (
                <AcademicHistoryItem key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StudentAcademicProgressPanel;
