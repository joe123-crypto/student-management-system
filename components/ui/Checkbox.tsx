import React from 'react';
import { cn } from './cn';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

export default function Checkbox({ label, className, containerClassName, ...props }: CheckboxProps) {
  return (
    <label className={cn('inline-flex items-center gap-2 text-sm text-[color:var(--theme-text)]', containerClassName)}>
      <input
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border-[color:var(--theme-border)] bg-[color:var(--theme-card)] text-[color:var(--theme-primary)] focus:ring-2 focus:ring-[color:rgba(160,58,19,0.18)]',
          className,
        )}
        {...props}
      />
      {label ? <span>{label}</span> : null}
    </label>
  );
}

