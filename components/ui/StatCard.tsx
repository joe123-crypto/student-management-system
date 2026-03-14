import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
  valueClassName?: string;
}

export default function StatCard({ label, value, suffix, valueClassName }: StatCardProps) {
  return (
    <div className="theme-card flex min-h-[150px] flex-col justify-between rounded-[2rem] border p-6 sm:min-h-[160px] sm:p-8">
      <p className="theme-text-muted text-[11px] font-black uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-3 sm:gap-4">
        <span
          className={`text-4xl font-black tracking-tighter sm:text-5xl ${valueClassName || 'text-[color:var(--theme-text)]'}`}
        >
          {value}
        </span>
        {suffix ? <span className="theme-text-muted text-lg font-bold sm:text-xl">{suffix}</span> : null}
      </div>
    </div>
  );
}
