import React, { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ProgressDetails } from '@/types';
import Button from './Button';
import AcademicHistoryItem from './AcademicHistoryItem';
import { cn } from './cn';

type ChartDatum = Record<string, string | number>;

interface AcademicStatusCardProps {
  title: string;
  status: string;
  metricLabel: string;
  metricValue: string;
  chartData: ChartDatum[];
  chartDataKey: string;
  chartLabelKey?: string;
  yDomain?: [number | 'auto', number | 'auto'];
  history?: ProgressDetails[];
  historyTitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  showRealtimeBadge?: boolean;
  showAxes?: boolean;
  showTooltip?: boolean;
  className?: string;
  chartHeightClassName?: string;
}

function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function AcademicStatusCard({
  title,
  status,
  metricLabel,
  metricValue,
  chartData,
  chartDataKey,
  chartLabelKey = 'name',
  yDomain,
  history,
  historyTitle = 'Submission History',
  actionLabel,
  onAction,
  showRealtimeBadge = false,
  showAxes = false,
  showTooltip = false,
  className,
  chartHeightClassName = 'h-64 sm:h-80',
}: AcademicStatusCardProps) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-10',
        className,
      )}
    >
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <h4 className="font-rounded text-2xl font-black text-[#1a1b3a]">{title}</h4>
          {actionLabel && onAction ? (
            <Button size="sm" className="text-[10px] uppercase tracking-widest" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
        {showRealtimeBadge ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600">
            <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
            Real-time Data
          </div>
        ) : null}
      </div>

      <div className="space-y-8 sm:space-y-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">{metricLabel}</p>
            <p className="text-3xl font-black tracking-tight text-slate-900">{metricValue}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-indigo-400 bg-indigo-600 p-6 text-white shadow-[0_0_40px_rgba(79,70,229,0.2)]">
            <p className="mb-1 text-xs font-bold uppercase text-indigo-200">Status</p>
            <p className="text-3xl font-black tracking-tight">{formatStatusLabel(status)}</p>
          </div>
        </div>

        <div className={cn('w-full', chartHeightClassName)}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              {showAxes ? (
                <XAxis
                  dataKey={chartLabelKey}
                  stroke="#94a3b8"
                  fontSize={10}
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
              ) : null}
              {showAxes ? (
                <YAxis
                  stroke="#94a3b8"
                  domain={yDomain}
                  fontSize={10}
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
              ) : null}
              {showTooltip ? (
                <Tooltip
                  contentStyle={{
                    borderRadius: '20px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '16px',
                    fontWeight: 'bold',
                  }}
                />
              ) : null}
              <Area
                type="monotone"
                dataKey={chartDataKey}
                stroke="#4f46e5"
                strokeWidth={4}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {history && history.length > 0 ? (
          <div className="space-y-4">
            <h5 className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {historyTitle}
            </h5>
            <div className="grid gap-4">
              {history.map((entry) => (
                <AcademicHistoryItem key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
