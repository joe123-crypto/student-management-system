import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { Hash, ShieldCheck, UserRound } from 'lucide-react';

interface PermissionRequestPageProps {
  existingRequests: string[];
  onSubmitRequest: (
    inscriptionNumber: string,
    fullName: string,
    passportNumber: string,
  ) => Promise<void>;
}

const fieldLabelClass = 'theme-text-muted mb-2 text-xs font-black uppercase tracking-[0.18em]';
const fieldRowClass = 'theme-input flex items-center gap-3 rounded-2xl border px-4 py-3';
const inputClass =
  'w-full bg-transparent text-sm font-medium text-[color:var(--theme-text)] outline-none placeholder:text-[color:var(--theme-text-muted)]';

export default function PermissionRequestPage({
  existingRequests,
  onSubmitRequest,
}: PermissionRequestPageProps) {
  const [fullName, setFullName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [inscriptionNumber, setInscriptionNumber] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const normalizedFullName = useMemo(() => fullName.trim(), [fullName]);
  const normalizedPassportNumber = useMemo(
    () => passportNumber.trim().toUpperCase(),
    [passportNumber],
  );
  const normalizedInscription = useMemo(
    () => inscriptionNumber.trim().toUpperCase(),
    [inscriptionNumber],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!normalizedFullName) {
      setError('Please enter your full name.');
      return;
    }

    if (!normalizedPassportNumber) {
      setError('Please enter your passport number.');
      return;
    }

    if (!normalizedInscription) {
      setError('Please enter your inscription number.');
      return;
    }

    if (existingRequests.includes(normalizedInscription)) {
      setError('A request for this inscription number is already pending.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/students/lookup?inscriptionNumber=${encodeURIComponent(normalizedInscription)}`,
        {
          method: 'GET',
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        throw new Error(`Lookup failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as { exists?: boolean };
      if (!payload.exists) {
        setError('No student record found for this inscription number.');
        return;
      }

      await onSubmitRequest(normalizedInscription, normalizedFullName, normalizedPassportNumber);
      setMessage('Request sent to the student attache.');
      setFullName('');
      setPassportNumber('');
      setInscriptionNumber('');
    } catch (lookupError) {
      console.error('[PERMISSION_REQUEST] Failed to submit permission request:', lookupError);
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : 'Unable to verify this inscription number right now. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="theme-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute left-[-6%] top-20 h-60 w-60 rounded-full bg-[rgba(245,130,74,0.16)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-5%] h-64 w-64 rounded-full bg-[rgba(37,79,34,0.08)] blur-3xl" />

      <div className="theme-card relative z-10 w-full max-w-xl rounded-[2rem] border p-8 shadow-[0_28px_90px_-36px_rgba(37,79,34,0.32)] md:p-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="theme-accent-subtle mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Access request
            </div>
            <h1 className="theme-heading font-rounded text-4xl font-black tracking-tight">Request permission</h1>
            <p className="theme-text-muted mt-2 text-sm">Send your details to the student attache for account approval.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <FormField label="Full Name" labelClassName={fieldLabelClass}>
              <div className={fieldRowClass}>
                <UserRound className="h-4 w-4 text-[color:var(--theme-text-muted)]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className={inputClass}
                />
              </div>
            </FormField>

            <FormField label="Passport Number" labelClassName={fieldLabelClass}>
              <div className={fieldRowClass}>
                <ShieldCheck className="h-4 w-4 text-[color:var(--theme-text-muted)]" />
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="AA1234567"
                  className={inputClass}
                />
              </div>
            </FormField>

            <FormField label="Inscription Number" labelClassName={fieldLabelClass}>
              <div className={fieldRowClass}>
                <Hash className="h-4 w-4 text-[color:var(--theme-text-muted)]" />
                <input
                  type="text"
                  value={inscriptionNumber}
                  onChange={(e) => setInscriptionNumber(e.target.value)}
                  placeholder="INS-2023-001"
                  className={inputClass}
                />
              </div>
            </FormField>

            {error ? <p className="text-sm text-[color:var(--theme-danger)]">{error}</p> : null}
            {message ? <p className="text-sm text-[color:var(--theme-primary)]">{message}</p> : null}

            <Button type="submit" disabled={isSubmitting} fullWidth className="rounded-full py-3.5">
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send request'}
            </Button>
          </form>

          <p className="theme-text-muted mt-6 text-center text-sm">
            Back to{' '}
            <button type="button" onClick={() => router.push('/login')} className="theme-link font-semibold">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
