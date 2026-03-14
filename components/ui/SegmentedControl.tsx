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
    <div
      className={cn('theme-card-muted grid gap-1 rounded-2xl border p-1', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
              active
                ? 'theme-card text-[color:var(--theme-primary)]'
                : 'text-[color:var(--theme-text-muted)] hover:text-[color:var(--theme-primary-soft)]',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
