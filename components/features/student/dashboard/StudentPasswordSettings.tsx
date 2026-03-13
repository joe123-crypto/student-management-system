import React, { useState } from 'react';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';

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

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
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
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <div className="mb-8 space-y-2">
          <h3 className="text-2xl font-black text-slate-900">Change Password</h3>
          <p className="text-sm text-slate-500">Update the password associated with your student account.</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <FormField label="Current Password">
            <input
              type="password"
              className={inputClassName}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </FormField>

          <FormField label="New Password">
            <input
              type="password"
              className={inputClassName}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </FormField>

          <FormField label="Confirm New Password">
            <input
              type="password"
              className={inputClassName}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
          </FormField>

          {passwordStatus ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                passwordStatus.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {passwordStatus.message}
            </div>
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
