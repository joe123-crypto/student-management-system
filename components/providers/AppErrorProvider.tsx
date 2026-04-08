'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { getErrorMessage, shouldIgnoreReportedError } from '@/lib/errors';

type ReportErrorOptions = {
  title?: string;
  fallback?: string;
  dismissAfterMs?: number | null;
};

type AppErrorContextValue = {
  reportError: (error: unknown, options?: ReportErrorOptions) => string | null;
};

const DEFAULT_DISMISS_MS = 7000;
const ERROR_DEDUPE_WINDOW_MS = 2000;

const AppErrorContext = createContext<AppErrorContextValue | null>(null);

export function useAppError() {
  const context = useContext(AppErrorContext);

  if (!context) {
    throw new Error('useAppError must be used within AppErrorProvider.');
  }

  return context;
}

export default function AppErrorProvider({ children }: { children: ReactNode }) {
  const { notify } = useNotifications();
  const recentErrorsRef = useRef<Map<string, number>>(new Map());

  const reportError = useCallback(
    (error: unknown, options: ReportErrorOptions = {}) => {
      if (shouldIgnoreReportedError(error)) {
        return null;
      }

      const title = options.title?.trim() || 'Something went wrong';
      const message = getErrorMessage(error, options.fallback);
      const dedupeKey = `${title}::${message}`;
      const now = Date.now();

      recentErrorsRef.current.forEach((timestamp, key) => {
        if (now - timestamp > ERROR_DEDUPE_WINDOW_MS) {
          recentErrorsRef.current.delete(key);
        }
      });

      const previousTimestamp = recentErrorsRef.current.get(dedupeKey);
      if (previousTimestamp && now - previousTimestamp < ERROR_DEDUPE_WINDOW_MS) {
        return null;
      }

      recentErrorsRef.current.set(dedupeKey, now);

      return notify({
        tone: 'error',
        title,
        message,
        durationMs:
          typeof options.dismissAfterMs === 'undefined'
            ? DEFAULT_DISMISS_MS
            : options.dismissAfterMs ?? 0,
      });
    },
    [notify],
  );

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportError(event.error ?? event.message, {
        title: 'Unexpected error',
        fallback: 'An unexpected problem interrupted this page.',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(event.reason, {
        title: 'Unexpected error',
        fallback: 'An unexpected problem interrupted this action.',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [reportError]);

  const contextValue = useMemo<AppErrorContextValue>(
    () => ({
      reportError,
    }),
    [reportError],
  );

  return <AppErrorContext.Provider value={contextValue}>{children}</AppErrorContext.Provider>;
}
