import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { UserRole } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { Hash, HelpCircle, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';

const roleOptions = [
  { value: UserRole.STUDENT, label: 'Student' },
  { value: UserRole.ATTACHE, label: 'Attache' },
] as const;

const studentLoginPlaceholder = 'STUDENT123';
const attacheLoginPlaceholder = 'admin@scholarsalger.dz';
const passwordPlaceholder = 'Enter your password';
const fieldLabelClass = 'mb-2';
const fieldRowClass = 'theme-input flex items-center gap-3 rounded-2xl border px-4 py-3';
const inputClass =
  'w-full bg-transparent text-sm font-medium text-[color:var(--theme-text)] outline-none placeholder:text-[color:var(--theme-text-muted)]';

const LoginPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const normalizedLoginId = loginId.trim();
    const normalizedEmail = normalizedLoginId.toLowerCase();
    const normalizedInscription = normalizedLoginId.toUpperCase();

    if (role === UserRole.ATTACHE && (!normalizedEmail || !normalizedEmail.includes('@'))) {
      alert('Enter a valid attache email.');
      setIsSubmitting(false);
      return;
    }

    const result = await signIn('credentials', {
      role,
      loginId: role === UserRole.STUDENT ? normalizedInscription : normalizedEmail,
      password,
      redirect: false,
    });

    if (result?.error) {
      alert('Invalid credentials.');
      setIsSubmitting(false);
      return;
    }

    if (role === UserRole.STUDENT) {
      router.push('/onboarding');
      return;
    }

    router.push('/attache/dashboard');
    setIsSubmitting(false);
  };

  return (
    <div className="theme-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute left-[-5%] top-16 h-56 w-56 rounded-full bg-[rgba(245,130,74,0.16)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-4%] h-64 w-64 rounded-full bg-[rgba(37,79,34,0.08)] blur-3xl" />

      <div className="theme-card relative z-10 w-full max-w-xl rounded-[2rem] border p-8 shadow-[0_28px_90px_-36px_rgba(37,79,34,0.32)] md:p-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="theme-accent-subtle type-label mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure access
            </div>
            <h1 className="theme-heading type-page-title">Sign in</h1>
            <p className="theme-text-muted type-body-sm mt-2">Sign in to access your ScholarsAlger account.</p>
          </div>

          <SegmentedControl
            className="mt-6"
            value={role}
            options={roleOptions}
            onChange={(next) => setRole(next as UserRole)}
          />

          {role !== UserRole.STUDENT ? (
            <>
              <Button type="button" variant="secondary" fullWidth className="mt-5 rounded-full">
                <LogIn className="w-4 h-4" />
                Use Google account
              </Button>
              <div className="theme-text-muted type-label my-5 text-center">or continue with credentials</div>
            </>
          ) : null}

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
            <FormField
              label={role === UserRole.STUDENT ? 'Inscription Number' : 'Email'}
              labelClassName={fieldLabelClass}
            >
              <div className={fieldRowClass}>
                {role === UserRole.STUDENT ? (
                  <Hash className="h-4 w-4 text-[color:var(--theme-text-muted)]" />
                ) : (
                  <Mail className="h-4 w-4 text-[color:var(--theme-text-muted)]" />
                )}
                <input
                  type="text"
                  name="loginId"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder={role === UserRole.STUDENT ? studentLoginPlaceholder : attacheLoginPlaceholder}
                  autoComplete={role === UserRole.STUDENT ? 'username' : 'email'}
                  spellCheck={false}
                  className={inputClass}
                />
                <HelpCircle className="h-4 w-4 text-[color:var(--theme-primary-soft)]" />
              </div>
            </FormField>

            <FormField label="Password" labelClassName={fieldLabelClass}>
              <div className={fieldRowClass}>
                <Lock className="h-4 w-4 text-[color:var(--theme-text-muted)]" />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={passwordPlaceholder}
                  autoComplete="current-password"
                  className={inputClass}
                />
                <HelpCircle className="h-4 w-4 text-[color:var(--theme-primary-soft)]" />
              </div>
            </FormField>

            <Button type="submit" disabled={isSubmitting} fullWidth className="mt-6 rounded-full py-3.5">
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="theme-text-muted mt-6 text-center text-sm">
            Need access?{' '}
            <button type="button" onClick={() => router.push('/request-permission')} className="theme-link font-semibold">
              Request permission
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
