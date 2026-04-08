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
    'bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary-strong)] shadow-[0_12px_24px_rgba(37,79,34,0.16)]',
  secondary:
    'border border-[color:var(--theme-border)] bg-[rgba(255,255,255,0.72)] text-[color:var(--theme-text)] hover:bg-[rgba(255,255,255,0.96)]',
  ghost:
    'bg-transparent text-[color:var(--theme-primary-soft)] hover:bg-[rgba(237,228,194,0.38)] hover:text-[color:var(--theme-primary)]',
  danger:
    'bg-[color:var(--theme-danger)] text-white hover:bg-[color:var(--theme-danger-strong)] shadow-[0_12px_24px_rgba(183,76,45,0.18)]',
  success: 'bg-[color:var(--theme-primary-soft)] text-white hover:bg-[color:var(--theme-primary)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-2xl',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(160,58,19,0.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-page)] active:scale-95 disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export default Button;
