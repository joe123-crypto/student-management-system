import React from 'react';
import Checkbox from '@/components/ui/Checkbox';
import { cn } from '@/components/ui/cn';

interface ReviewableFormFieldProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export default function ReviewableFormField({
  label,
  checked,
  onCheckedChange,
  children,
  className,
  labelClassName,
}: ReviewableFormFieldProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className={cn('theme-text-muted type-label block', labelClassName)}>{label}</span>
        <Checkbox
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          aria-label={`Mark ${label} for review`}
          containerClassName="shrink-0"
          className="h-5 w-5 rounded-md border-[rgba(160,58,19,0.32)]"
        />
      </div>
      {children}
    </div>
  );
}
