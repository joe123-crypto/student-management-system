import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ label = 'Loading...', fullScreen = false }: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'flex items-center justify-center min-h-screen bg-white'
    : 'flex items-center justify-center py-16';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-600">{label}</p>
      </div>
    </div>
  );
}
