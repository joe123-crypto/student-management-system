'use client';

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';
import { getNoticeToneMeta, type NoticeTone } from '@/components/ui/Notice';

type NotificationTone = 'success' | 'info' | 'danger';

type ToastNotificationInput = {
  tone?: NoticeTone;
  title: string;
  message?: string;
  durationMs?: number;
};

type DialogNotificationInput = {
  tone?: NoticeTone;
  title: string;
  message?: string;
  confirmLabel?: string;
  dismissLabel?: string;
  closeOnOverlayClick?: boolean;
  onConfirm?: () => void;
  onDismiss?: () => void;
};

type ToastNotification = ToastNotificationInput & {
  id: string;
  tone: NoticeTone;
  durationMs: number;
};

type DialogNotification = DialogNotificationInput & {
  tone: NoticeTone;
  closeOnOverlayClick: boolean;
};

type NotifyFunction = (notification: ToastNotificationInput | string, tone?: NotificationTone) => string;

interface NotificationContextValue {
  notify: NotifyFunction;
  showDialog: (notification: DialogNotificationInput) => void;
  closeDialog: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider.');
  }

  return context;
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    return {
      notify: () => undefined,
    };
  }

  return {
    notify: (message: string, tone?: NotificationTone) => {
      context.notify(message, tone);
    },
  };
}

function normalizeNotificationTone(tone?: NoticeTone | NotificationTone): NoticeTone {
  if (tone === 'danger') {
    return 'error';
  }

  return tone ?? 'info';
}

export default function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [dialog, setDialog] = useState<DialogNotification | null>(null);
  const toastCounterRef = useRef(0);
  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());
  const dialogConfirmButtonRef = useRef<HTMLButtonElement>(null);

  const dismissToast = useCallback((toastId: string) => {
    const timeoutId = toastTimeoutsRef.current.get(toastId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      toastTimeoutsRef.current.delete(toastId);
    }

    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const notify = useCallback<NotifyFunction>((notification, tone) => {
    toastCounterRef.current += 1;
    const toastId = `notification-${toastCounterRef.current}`;
    const isMessageNotification = typeof notification === 'string';
    const nextToast: ToastNotification = {
      id: toastId,
      tone: isMessageNotification
        ? normalizeNotificationTone(tone ?? 'success')
        : normalizeNotificationTone(notification.tone),
      durationMs: isMessageNotification ? 4200 : notification.durationMs ?? 4200,
      title: isMessageNotification ? notification : notification.title,
      message: isMessageNotification ? undefined : notification.message,
    };

    setToasts((current) => [...current, nextToast]);

    if (nextToast.durationMs > 0) {
      const timeoutId = window.setTimeout(() => {
        dismissToast(toastId);
      }, nextToast.durationMs);

      toastTimeoutsRef.current.set(toastId, timeoutId);
    }

    return toastId;
  }, [dismissToast]);

  const closeDialog = useCallback(() => {
    setDialog((current) => {
      current?.onDismiss?.();
      return null;
    });
  }, []);

  const showDialog = useCallback((notification: DialogNotificationInput) => {
    setDialog({
      ...notification,
      tone: notification.tone ?? 'info',
      closeOnOverlayClick: notification.closeOnOverlayClick ?? true,
    });
  }, []);

  const handleConfirmDialog = useCallback(() => {
    if (!dialog) {
      return;
    }

    const onConfirm = dialog.onConfirm;
    setDialog(null);
    onConfirm?.();
  }, [dialog]);

  useEffect(() => {
    const toastTimeouts = toastTimeoutsRef.current;

    return () => {
      toastTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      toastTimeouts.clear();
    };
  }, []);

  useEffect(() => {
    if (!dialog) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => {
      dialogConfirmButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dialog.closeOnOverlayClick) {
        event.preventDefault();
        closeDialog();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeDialog, dialog]);

  const contextValue = useMemo<NotificationContextValue>(
    () => ({
      notify,
      showDialog,
      closeDialog,
    }),
    [closeDialog, notify, showDialog],
  );

  const dialogToneMeta = dialog ? getNoticeToneMeta(dialog.tone) : null;
  const DialogIcon = dialogToneMeta?.Icon;

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4 sm:justify-end">
        <div className="flex w-full max-w-md flex-col gap-3">
          {toasts.map((toast) => {
            const toastToneMeta = getNoticeToneMeta(toast.tone);
            const ToastIcon = toastToneMeta.Icon;
            const toastRole = toast.tone === 'error' || toast.tone === 'warning' ? 'alert' : 'status';

            return (
              <div
                key={toast.id}
                role={toastRole}
                className={cn(
                  'pointer-events-auto animate-notification-enter overflow-hidden rounded-[1.75rem] border shadow-[0_24px_50px_rgba(37,79,34,0.14)]',
                  toastToneMeta.containerClassName,
                )}
              >
                <div className="flex items-start gap-3 px-4 py-4">
                  <div
                    className={cn(
                      'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/50',
                      toastToneMeta.iconWrapClassName,
                    )}
                  >
                    <ToastIcon className={cn('h-[18px] w-[18px]', toastToneMeta.iconClassName)} />
                  </div>

                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-semibold leading-6">{toast.title}</p>
                    {toast.message ? (
                      <p className="mt-0.5 text-sm leading-6 opacity-90">{toast.message}</p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/55 transition hover:bg-white/80"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {dialog && dialogToneMeta ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="theme-overlay absolute inset-0"
            onClick={() => {
              if (dialog.closeOnOverlayClick) {
                closeDialog();
              }
            }}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-dialog-title"
            className="theme-panel-glass animate-notification-modal relative z-10 w-full max-w-lg rounded-[2rem] border p-6 shadow-[0_28px_90px_rgba(37,79,34,0.18)] sm:p-8"
          >
            {dialog.closeOnOverlayClick || dialog.dismissLabel ? (
              <button
                type="button"
                onClick={closeDialog}
                className="theme-card-muted absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition hover:scale-[1.02]"
                aria-label="Close notification dialog"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}

            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-white/50',
                  dialogToneMeta.iconWrapClassName,
                )}
              >
                {DialogIcon ? (
                  <DialogIcon className={cn('h-6 w-6', dialogToneMeta.iconClassName)} />
                ) : null}
              </div>

              <div className="min-w-0 pt-1">
                <h2 id="notification-dialog-title" className="theme-heading text-xl font-bold tracking-[-0.03em]">
                  {dialog.title}
                </h2>
                {dialog.message ? (
                  <p className="theme-text-muted mt-3 text-sm leading-7">{dialog.message}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {dialog.dismissLabel ? (
                <Button variant="secondary" onClick={closeDialog} className="rounded-full px-6">
                  {dialog.dismissLabel}
                </Button>
              ) : null}
              <Button
                ref={dialogConfirmButtonRef}
                onClick={handleConfirmDialog}
                className="rounded-full px-8"
              >
                {dialog.confirmLabel ?? 'Okay'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </NotificationContext.Provider>
  );
}
