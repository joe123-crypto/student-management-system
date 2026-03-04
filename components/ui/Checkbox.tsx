import React from 'react';
import { cn } from './cn';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

export default function Checkbox({ label, className, containerClassName, ...props }: CheckboxProps) {
  return (
    <label className={cn('inline-flex items-center gap-2 text-sm text-slate-700', containerClassName)}>
      <input type="checkbox" className={cn('w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500', className)} {...props} />
      {label ? <span>{label}</span> : null}
    </label>
  );
}

