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
      <label className={cn('theme-heading mb-1 block text-sm font-medium', labelClassName)}>{label}</label>
      {children}
    </div>
  );
}
