import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ label = 'Loading...', fullScreen = false }: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'theme-shell flex min-h-screen items-center justify-center'
    : 'flex items-center justify-center py-16';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--theme-primary)] border-t-transparent" />
        <p className="theme-text-muted font-bold">{label}</p>
      </div>
    </div>
  );
}
