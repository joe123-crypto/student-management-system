'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, Copy, RefreshCcw, ShieldCheck, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Notice from '@/components/ui/Notice';
import { generateStudentPassword } from '@/lib/auth/password-policy';
import { getErrorMessage } from '@/lib/errors';
import type { PermissionRequest } from '@/types';

interface ApprovePermissionRequestModalProps {
  open: boolean;
  request: PermissionRequest | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (params: { password: string }) => Promise<void>;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('aria-hidden') && element.getClientRects().length > 0);
}

function fallbackCopyTextToClipboard(value: string) {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';

  const currentSelection = document.getSelection();
  const originalRange =
    currentSelection && currentSelection.rangeCount > 0 ? currentSelection.getRangeAt(0) : null;

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const isCopied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (originalRange && currentSelection) {
    currentSelection.removeAllRanges();
    currentSelection.addRange(originalRange);
  }

  if (!isCopied) {
    throw new Error('Clipboard copy is unavailable.');
  }
}

async function copyTextToClipboard(value: string) {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      fallbackCopyTextToClipboard(value);
      return;
    }
  }

  fallbackCopyTextToClipboard(value);
}

export default function ApprovePermissionRequestModal({
  open,
  request,
  isSubmitting,
  onClose,
  onSubmit,
}: ApprovePermissionRequestModalProps) {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const isPasswordReset = request?.status === 'APPROVED';

  useEffect(() => {
    if (!open || !request) {
      return;
    }

    setGeneratedPassword(generateStudentPassword(request.inscriptionNumber));
    setCopyState('idle');
    setSubmitError('');
  }, [open, request]);

  useEffect(() => {
    if (copyState !== 'copied') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState('idle');
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const modal = modalRef.current;
      if (!modal) {
        return;
      }

      const focusableElements = getFocusableElements(modal);
      if (focusableElements.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const focusIsInsideModal = Boolean(activeElement && modal.contains(activeElement));

      if (event.shiftKey) {
        if (!focusIsInsideModal || activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }

        return;
      }

      if (!focusIsInsideModal || activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSubmitting, onClose, open]);

  if (!open || !request) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
      <div className="theme-overlay absolute inset-0" onClick={() => !isSubmitting && onClose()} />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="theme-panel-glass relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-y-auto rounded-[1.75rem] border p-5 shadow-[0_28px_90px_rgba(37,79,34,0.18)] sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="theme-icon-well inline-flex h-10 w-10 items-center justify-center rounded-xl border">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h2 id={titleId} className="theme-heading text-lg font-bold">
              {isPasswordReset ? 'Change Student Password' : 'Approve Permission Request'}
            </h2>
            <p className="theme-text-muted text-sm leading-6">
              {isPasswordReset
                ? 'Generate and save a new temporary password for this student.'
                : 'Save student login details, then approve this request.'}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => !isSubmitting && onClose()}
            className="theme-card-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border transition hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close approval modal"
            disabled={isSubmitting}
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="theme-card rounded-[1.25rem] border p-4">
            <p className="font-semibold leading-6">{request.fullName || request.inscriptionNumber}</p>
            <p className="theme-text-muted mt-1 text-sm leading-6">
              Login ID: <span className="font-mono font-semibold text-[color:var(--theme-text)]">{request.inscriptionNumber}</span>
            </p>
          </div>

          <div className="theme-card rounded-[1.25rem] border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="theme-heading text-sm font-semibold">Generated Password</p>
                <p className="theme-text-muted mt-1 text-sm leading-6">
                  Select Generate if you want a new password.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCopyState('idle');
                  setSubmitError('');
                  setGeneratedPassword(generateStudentPassword(request.inscriptionNumber));
                }}
                disabled={isSubmitting}
                className="rounded-full px-3"
              >
                <RefreshCcw className="h-4 w-4" />
                Generate
              </Button>
            </div>

            <div className="theme-card-muted relative mt-3 rounded-[1rem] border px-4 py-3">
              <p className="theme-text-muted text-xs uppercase tracking-[0.18em]">Temporary Password</p>
              <p className="mt-2 break-all pr-12 font-mono text-sm font-semibold tracking-[0.08em] sm:text-base">
                {generatedPassword}
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (!generatedPassword) {
                    setCopyState('error');
                    return;
                  }

                  try {
                    await copyTextToClipboard(generatedPassword);
                    setCopyState('copied');
                  } catch {
                    setCopyState('error');
                  }
                }}
                disabled={isSubmitting || !generatedPassword}
                className={`absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                  copyState === 'copied'
                    ? 'theme-success'
                    : 'theme-card border-[color:var(--theme-border)] hover:bg-[rgba(255,255,255,0.9)]'
                } disabled:pointer-events-none disabled:opacity-50`}
                aria-label="Copy generated password"
                title={copyState === 'copied' ? 'Copied' : 'Copy password'}
              >
                {copyState === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copyState === 'error' ? (
              <p className="mt-2 text-xs text-[color:var(--theme-danger)]">
                Could not copy the password. Please copy it manually.
              </p>
            ) : null}
          </div>

          {submitError ? (
            <Notice
              tone="error"
              title="Could not approve request"
              message={submitError}
            />
          ) : null}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!generatedPassword) {
                setSubmitError('Generate a password before approving this request.');
                return;
              }

              setSubmitError('');

              try {
                await onSubmit({ password: generatedPassword });
              } catch (error) {
                setSubmitError(
                  getErrorMessage(
                    error,
                    'Unable to approve this request right now. Please try again.',
                  ),
                );
              }
            }}
            disabled={isSubmitting}
            className="rounded-full px-8"
          >
            {isSubmitting
              ? (isPasswordReset ? 'Saving new password...' : 'Saving credentials...')
              : (isPasswordReset ? 'Save New Password' : 'Approve and Save Credentials')}
          </Button>
        </div>
      </div>
    </div>
  );
}
