import React from 'react';
import { cn } from './cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary-strong)] shadow-lg shadow-[rgba(0,95,2,0.16)]',
  secondary:
    'border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] text-[color:var(--theme-text)] hover:bg-[color:var(--theme-surface-strong)]',
  ghost:
    'bg-transparent text-[color:var(--theme-primary-soft)] hover:bg-[rgba(192,184,122,0.14)] hover:text-[color:var(--theme-primary)]',
  danger:
    'bg-[color:var(--theme-danger)] text-white hover:bg-[color:var(--theme-danger-strong)] shadow-lg shadow-[rgba(183,76,45,0.2)]',
  success: 'bg-[color:var(--theme-primary-soft)] text-white hover:bg-[color:var(--theme-primary)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs rounded-xl',
  md: 'px-6 py-3 text-sm rounded-xl',
  lg: 'px-8 py-3.5 text-sm rounded-2xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  );
}
