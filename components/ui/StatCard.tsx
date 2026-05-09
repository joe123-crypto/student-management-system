import React from 'react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  valueClassName?: string;
  supportingText?: string;
  compact?: boolean;
}

export default function StatCard({
  label,
  value,
  suffix,
  valueClassName,
  supportingText,
  compact = false,
}: StatCardProps) {
  return (
    <div className={`theme-card flex flex-col justify-between border shadow-[0_18px_36px_rgba(37,79,34,0.06)] ${compact ? 'min-h-[108px] rounded-2xl p-4 sm:p-5' : 'min-h-[160px] rounded-[2rem] p-6 sm:p-8'}`}>
      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        <p className="theme-text-muted type-label">{label}</p>
        {supportingText ? (
          <p className={`theme-text-muted max-w-[18rem] ${compact ? 'text-sm leading-snug' : 'type-body-sm'}`}>{supportingText}</p>
        ) : null}
      </div>

      <div className={`flex items-end ${compact ? 'mt-4 gap-2' : 'mt-6 gap-3 sm:gap-4'}`}>
        <span
          className={`${compact ? 'text-3xl font-bold leading-none' : 'type-metric'} ${valueClassName || 'text-[color:var(--theme-text)]'}`}
        >
          {value}
        </span>
        {suffix ? <span className="theme-text-muted type-body pb-1 font-semibold">{suffix}</span> : null}
      </div>
    </div>
  );
}
