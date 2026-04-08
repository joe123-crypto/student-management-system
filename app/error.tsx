'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppErrorScreen from '@/components/ui/AppErrorScreen';
import { getErrorMessage } from '@/lib/errors';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('[APP] Unhandled route error:', error);
  }, [error]);

  return (
    <AppErrorScreen
      title="This page hit a problem"
      message={getErrorMessage(
        error,
        'An unexpected issue interrupted this page. You can retry or return home.',
      )}
      onRetry={reset}
      onGoHome={() => router.replace('/')}
    />
  );
}
