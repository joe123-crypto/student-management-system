import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
  valueClassName?: string;
}

export default function StatCard({ label, value, suffix, valueClassName }: StatCardProps) {
  return (
    <div className="flex min-h-[150px] flex-col justify-between rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] sm:min-h-[160px] sm:p-8">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-3 sm:gap-4">
        <span className={`text-4xl font-black tracking-tighter sm:text-5xl ${valueClassName || 'text-[#1a1b3a]'}`}>{value}</span>
        {suffix && <span className="text-lg font-bold text-slate-300 sm:text-xl">{suffix}</span>}
      </div>
    </div>
  );
}
