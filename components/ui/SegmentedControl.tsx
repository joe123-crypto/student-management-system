import React from 'react';
import { cn } from './cn';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (next: T) => void;
  className?: string;
}

export default function SegmentedControl<T extends string>({ value, options, onChange, className }: SegmentedControlProps<T>) {
  return (
    <div className={cn('grid gap-1 rounded-xl bg-slate-100 p-1', className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-semibold transition-all',
              active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
