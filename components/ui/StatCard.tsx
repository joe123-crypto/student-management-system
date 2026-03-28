import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
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
        <p className="theme-text-muted text-[11px] font-black uppercase tracking-[0.16em]">{label}</p>
        {supportingText ? (
          <p className="theme-text-muted max-w-[18rem] text-sm leading-relaxed">{supportingText}</p>
        ) : null}
      </div>

      <div className="mt-6 flex items-end gap-3 sm:gap-4">
        <span
          className={`text-4xl font-black tracking-[-0.04em] sm:text-5xl ${valueClassName || 'text-[color:var(--theme-text)]'}`}
        >
          {value}
        </span>
        {suffix ? <span className="theme-text-muted pb-1 text-base font-semibold sm:text-lg">{suffix}</span> : null}
      </div>
    </div>
  );
}
