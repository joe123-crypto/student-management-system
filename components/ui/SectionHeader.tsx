import React from 'react';
import { cn } from './cn';

interface SectionHeaderProps {
  title: string;
  accent?: 'indigo' | 'emerald' | 'amber';
  className?: string;
}

const accentClass = {
  indigo: 'bg-[color:var(--theme-primary)]',
  emerald: 'bg-[color:var(--theme-primary-soft)]',
  amber: 'bg-[color:var(--theme-secondary)]',
};

export default function SectionHeader({ title, accent = 'indigo', className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('w-1.5 h-6 rounded-full', accentClass[accent])} />
      <h5 className="theme-text-muted text-xs font-black uppercase tracking-widest">{title}</h5>
    </div>
  );
}
