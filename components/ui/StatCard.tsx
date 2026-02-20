import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
  valueClassName?: string;
}

export default function StatCard({ label, value, suffix, valueClassName }: StatCardProps) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[160px]">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-4">
        <span className={`text-5xl font-black tracking-tighter ${valueClassName || 'text-[#1a1b3a]'}`}>{value}</span>
        {suffix && <span className="text-xl font-bold text-slate-300">{suffix}</span>}
      </div>
    </div>
  );
}
