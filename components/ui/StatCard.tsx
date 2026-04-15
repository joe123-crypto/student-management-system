import React from 'react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  suffix?: React.ReactNode;
  valueClassName?: string;
  supportingText?: string;
}

export default function StatCard({
  label,
  value,
  suffix,
  valueClassName,
  supportingText,
}: StatCardProps) {
  return (
    <div className="theme-card flex min-h-[160px] flex-col justify-between rounded-[2rem] border p-6 shadow-[0_18px_36px_rgba(37,79,34,0.06)] sm:p-8">
      <div className="space-y-2">
        <p className="theme-text-muted type-label">{label}</p>
        {supportingText ? (
          <p className="theme-text-muted type-body-sm max-w-[18rem]">{supportingText}</p>
        ) : null}
      </div>

      <div className="mt-6 flex items-end gap-3 sm:gap-4">
        <span
          className={`type-metric ${valueClassName || 'text-[color:var(--theme-text)]'}`}
        >
          {value}
        </span>
        {suffix ? <span className="theme-text-muted type-body pb-1 font-semibold">{suffix}</span> : null}
      </div>
    </div>
  );
}
