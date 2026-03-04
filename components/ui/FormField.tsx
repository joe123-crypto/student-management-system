import React from 'react';
import { cn } from './cn';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export default function FormField({ label, children, className, labelClassName }: FormFieldProps) {
  return (
    <div className={className}>
      <label className={cn('block text-sm font-medium text-slate-700 mb-1', labelClassName)}>{label}</label>
      {children}
    </div>
  );
}
