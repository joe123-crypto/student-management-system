'use client';

import { AlertTriangle, Home, RotateCw } from 'lucide-react';
import Button from '@/components/ui/Button';

interface AppErrorScreenProps {
  title: string;
  message: string;
  onRetry: () => void;
  onGoHome: () => void;
}

export default function AppErrorScreen({
  title,
  message,
  onRetry,
  onGoHome,
}: AppErrorScreenProps) {
  return (
    <div className="theme-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute left-[-6%] top-16 h-64 w-64 rounded-full bg-[rgba(245,130,74,0.16)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-6%] h-72 w-72 rounded-full bg-[rgba(37,79,34,0.08)] blur-3xl" />

      <div className="theme-card relative z-10 w-full max-w-2xl rounded-[2rem] border p-8 shadow-[0_28px_90px_-36px_rgba(37,79,34,0.32)] md:p-10">
        <div className="mx-auto max-w-xl text-center">
          <div className="theme-danger mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="mt-6 space-y-3">
            <div className="theme-accent-subtle type-label inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
              Controlled error state
            </div>
            <h1 className="theme-heading type-page-title">{title}</h1>
            <p className="theme-text-muted type-body-sm">{message}</p>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={onRetry} className="rounded-full px-6 py-3.5">
              <RotateCw className="h-4 w-4" />
              Try again
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onGoHome}
              className="rounded-full px-6 py-3.5"
            >
              <Home className="h-4 w-4" />
              Go home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
