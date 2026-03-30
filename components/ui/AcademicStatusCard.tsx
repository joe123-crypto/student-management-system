import React, { useEffect, useId, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ProgressDetails } from '@/types';
import Button from './Button';
import AcademicHistoryItem from './AcademicHistoryItem';
import { cn } from './cn';
import StatusBadge from './StatusBadge';

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
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    setIsChartReady(false);

    const frameId = window.requestAnimationFrame(() => {
      setIsChartReady(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [chartData, chartHeightClassName]);

  return (
    <div
      className={cn(
        'theme-card relative overflow-hidden rounded-[2rem] border p-5 sm:rounded-[2.5rem] sm:p-10',
        className,
      )}
    >
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <h4 className="theme-heading type-section-title">{title}</h4>
          {actionLabel && onAction ? (
            <Button size="sm" className="type-label" onClick={onAction}>
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
            <p className="theme-text-muted type-label mb-1">{metricLabel}</p>
            <p className="theme-heading type-metric">{metricValue}</p>
          </div>

          <div className="rounded-2xl border border-[rgba(220,205,166,0.55)] bg-[rgba(255,255,255,0.64)] p-6">
            <p className="theme-text-muted type-label mb-3">Status</p>
            <div className="flex items-center justify-between gap-4">
              <StatusBadge status={status} className="px-3 py-1.5 text-[11px] font-semibold" />
              <p className="theme-text-muted text-sm font-semibold">Managed by administration</p>
            </div>
          </div>
        </div>

        <div className={cn('w-full', chartHeightClassName)}>
          {isChartReady ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
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
                    fill: 'var(--theme-surface)',
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 2,
                    stroke: 'var(--theme-primary)',
                    fill: 'var(--theme-surface)',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="theme-card-muted h-full rounded-[1.5rem] border border-[rgba(220,205,166,0.42)]" />
          )}
        </div>

        {history && history.length > 0 ? (
          <div className="space-y-4">
            <h5 className="theme-text-muted type-label px-1">
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
