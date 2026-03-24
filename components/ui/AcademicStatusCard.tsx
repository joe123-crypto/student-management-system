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
  chartSeriesLabel?: string;
  chartValueSuffix?: string;
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
  chartSeriesLabel,
  chartValueSuffix,
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
        'theme-card relative overflow-hidden rounded-[2rem] border p-5 sm:rounded-[2.5rem] sm:p-10',
        className,
      )}
    >
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <h4 className="theme-heading font-rounded text-2xl font-black">{title}</h4>
          {actionLabel && onAction ? (
            <Button size="sm" className="text-[10px] uppercase tracking-widest" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
        {showRealtimeBadge ? (
          <div className="theme-accent-subtle inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--theme-primary)]" />
            Real-time Data
          </div>
        ) : null}
      </div>

      <div className="space-y-8 sm:space-y-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div className="theme-card-muted rounded-2xl border p-6">
            <p className="theme-text-muted mb-1 text-xs font-bold uppercase">{metricLabel}</p>
            <p className="theme-heading text-3xl font-black tracking-tight">{metricValue}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[color:var(--theme-primary-soft)] bg-[var(--theme-primary)] p-6 text-white shadow-[0_0_40px_rgba(0,95,2,0.2)]">
            <p className="mb-1 text-xs font-bold uppercase text-[rgba(255,255,255,0.7)]">Status</p>
            <p className="text-3xl font-black tracking-tight">{formatStatusLabel(status)}</p>
          </div>
        </div>

        <div className={cn('w-full', chartHeightClassName)}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--theme-primary-soft)" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="var(--theme-primary-soft)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(192, 184, 122, 0.45)" />
              {showAxes ? (
                <XAxis
                  dataKey={chartLabelKey}
                  stroke="var(--theme-text-muted)"
                  fontSize={10}
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
              ) : null}
              {showAxes ? (
                <YAxis
                  stroke="var(--theme-text-muted)"
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
                  formatter={(value) => [
                    `${value}${chartValueSuffix ?? ''}`,
                    chartSeriesLabel ?? chartDataKey,
                  ]}
                />
              ) : null}
              <Area
                type="monotone"
                dataKey={chartDataKey}
                stroke="var(--theme-primary)"
                strokeWidth={4}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                animationDuration={2000}
                dot={{
                  r: 4,
                  strokeWidth: 2,
                  stroke: 'var(--theme-primary)',
                  fill: 'var(--theme-surface, #fff)',
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: 'var(--theme-primary)',
                  fill: 'var(--theme-surface, #fff)',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {history && history.length > 0 ? (
          <div className="space-y-4">
            <h5 className="theme-text-muted px-1 text-[10px] font-black uppercase tracking-widest">
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
