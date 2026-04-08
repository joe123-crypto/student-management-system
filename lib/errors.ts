export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (typeof error === 'string') {
    const normalized = error.trim();
    return normalized || fallback;
  }

  if (error instanceof Error) {
    const normalized = error.message.trim();
    return normalized || fallback;
  }

  if (error && typeof error === 'object') {
    const maybeMessage = 'message' in error ? error.message : undefined;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage.trim();
    }

    const maybeError = 'error' in error ? error.error : undefined;
    if (typeof maybeError === 'string' && maybeError.trim()) {
      return maybeError.trim();
    }
  }

  return fallback;
}

export function isAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.name === 'AbortError') {
    return true;
  }

  const normalizedMessage = error.message.trim().toLowerCase();
  return normalizedMessage === 'the operation was aborted.' || normalizedMessage.includes('aborted');
}

export function shouldIgnoreReportedError(error: unknown): boolean {
  if (isAbortError(error)) {
    return true;
  }

  const normalizedMessage = getErrorMessage(error, '').trim();
  if (!normalizedMessage) {
    return true;
  }

  return normalizedMessage === 'NEXT_REDIRECT' || normalizedMessage === 'NEXT_NOT_FOUND';
}
