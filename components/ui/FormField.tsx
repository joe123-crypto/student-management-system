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
    <div className={cn('min-w-0', className)}>
      <label className={cn('theme-text-muted type-label mb-2 block', labelClassName)}>{label}</label>
      {children}
    </div>
  );
}
