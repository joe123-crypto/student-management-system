import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { Hash, ShieldCheck } from 'lucide-react';

interface PermissionRequestPageProps {
  existingRequests: string[];
  onSubmitRequest: (inscriptionNumber: string, fullName: string, passportNumber: string) => void;
}

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

      onSubmitRequest(normalizedInscription, normalizedFullName, normalizedPassportNumber);
      setMessage('Request sent to the student attache.');
      setFullName('');
      setPassportNumber('');
      setInscriptionNumber('');
    } catch (lookupError) {
      console.error('[PERMISSION_REQUEST] Failed to verify inscription number:', lookupError);
      setError('Unable to verify this inscription number right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-[1.65rem] border border-slate-200 bg-white shadow-sm">
        <div className="mx-auto w-full max-w-md px-8 py-10 md:py-12">
          <h1 className="text-center text-4xl font-black tracking-tight text-indigo-600">Request permission</h1>
          <p className="mt-2 text-center text-sm text-slate-400">Send an access request to the student attache.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <FormField label="Full Name" labelClassName="mb-1 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-3 border-b border-slate-300 pb-2">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
            </FormField>

            <FormField label="Passport Number" labelClassName="mb-1 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-3 border-b border-slate-300 pb-2">
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="AA1234567"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
            </FormField>

            <FormField label="Inscription Number" labelClassName="mb-1 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-3 border-b border-slate-300 pb-2">
                <Hash className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={inscriptionNumber}
                  onChange={(e) => setInscriptionNumber(e.target.value)}
                  placeholder="INS-2023-001"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
            </FormField>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              fullWidth
              className="rounded-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send request'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Back to{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
