'use client';

import { LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';

interface LogoutConfirmationDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmationDialog({
  open,
  onCancel,
  onConfirm,
}: LogoutConfirmationDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="theme-overlay absolute inset-0"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirmation-title"
        aria-describedby="logout-confirmation-description"
        className="theme-card animate-notification-modal relative w-full max-w-md rounded-2xl border p-6 shadow-xl"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--theme-danger-bg)] text-[color:var(--theme-danger)]">
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 id="logout-confirmation-title" className="theme-heading mt-5 text-xl font-bold">
          Do you want to log out?
        </h3>
        <p id="logout-confirmation-description" className="theme-text-muted mt-2 text-sm leading-6">
          You can stay signed in and continue from where you are, or log out of your dashboard now.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" onClick={onCancel} className="w-full">
            Stay signed in
          </Button>
          <Button variant="danger" onClick={onConfirm} className="w-full">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
