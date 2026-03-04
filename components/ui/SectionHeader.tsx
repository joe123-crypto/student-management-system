import React from 'react';
import { cn } from './cn';

interface SectionHeaderProps {
  title: string;
  accent?: 'indigo' | 'emerald' | 'amber';
  className?: string;
}

const accentClass = {
  indigo: 'bg-indigo-600',
  emerald: 'bg-emerald-600',
  amber: 'bg-amber-600',
};

export default function SectionHeader({ title, accent = 'indigo', className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('w-1.5 h-6 rounded-full', accentClass[accent])} />
      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h5>
    </div>
  );
}
