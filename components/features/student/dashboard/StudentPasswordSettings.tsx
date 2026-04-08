import React, { useState } from 'react';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Notice from '@/components/ui/Notice';

const PASSWORD_REQUIREMENTS_MESSAGE =
  'Use at least 12 characters with uppercase, lowercase, a number, and a symbol.';

function isStrongPassword(password: string) {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

interface StudentPasswordSettingsProps {
  onChangePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; message: string }>;
  inputClassName: string;
}

export default function StudentPasswordSettings({
  onChangePassword,
  inputClassName,
}: StudentPasswordSettingsProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Please fill all password fields.' });
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setPasswordStatus({ type: 'error', message: PASSWORD_REQUIREMENTS_MESSAGE });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onChangePassword(currentPassword, newPassword);
      setPasswordStatus({ type: result.ok ? 'success' : 'error', message: result.message });
      if (result.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="theme-card rounded-3xl border p-8 md:p-10">
        <div className="mb-8 space-y-2">
          <h3 className="theme-heading type-section-title">Change Password</h3>
          <p className="theme-text-muted type-body-sm">Update the password associated with your student account.</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <FormField label="Current Password">
            <input
              type="password"
              autoComplete="current-password"
              className={inputClassName}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </FormField>

          <FormField label="New Password">
            <input
              type="password"
              autoComplete="new-password"
              className={inputClassName}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </FormField>

          <FormField label="Confirm New Password">
            <input
              type="password"
              autoComplete="new-password"
              className={inputClassName}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
          </FormField>

          <p className="theme-text-muted text-xs">{PASSWORD_REQUIREMENTS_MESSAGE}</p>

          {passwordStatus ? (
            <Notice
              tone={passwordStatus.type === 'success' ? 'success' : 'error'}
              title={passwordStatus.type === 'success' ? 'Password updated' : 'Password change failed'}
              message={passwordStatus.message}
            />
          ) : null}

          <div className="pt-2">
            <Button type="submit" className="rounded-full px-8" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
