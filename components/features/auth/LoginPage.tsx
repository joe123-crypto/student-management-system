import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { MOCK_AUTH_EMAIL, MOCK_AUTH_INSCRIPTION, MOCK_AUTH_PASSWORD } from '@/data/prototypeDatabase';
import { Hash, HelpCircle, Lock, LogIn, Mail } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
  registeredStudentInscriptions: string[];
  onboardingStudentInscriptions: string[];
  studentPasswordsByInscription: Record<string, string>;
}

const roleOptions = [
  { value: UserRole.STUDENT, label: 'Student' },
  { value: UserRole.ATTACHE, label: 'Attache' },
] as const;

const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  registeredStudentInscriptions,
  onboardingStudentInscriptions,
  studentPasswordsByInscription,
}) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedLoginId = loginId.trim();
    const normalizedEmail = normalizedLoginId.toLowerCase();
    const normalizedInscription = normalizedLoginId.toUpperCase();

    if (role === UserRole.STUDENT) {
      if (!registeredStudentInscriptions.includes(normalizedInscription)) {
        alert('No student record found for this inscription number. Please contact administration.');
        return;
      }

      const expectedPassword =
        studentPasswordsByInscription[normalizedInscription] || MOCK_AUTH_PASSWORD;
      if (password !== expectedPassword) {
        alert('Invalid credentials. Check your inscription number and password.');
        return;
      }
    }

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      subject: role === UserRole.STUDENT ? `student:${normalizedInscription || MOCK_AUTH_INSCRIPTION}` : 'attache:default',
      loginId:
        role === UserRole.STUDENT
          ? normalizedInscription || MOCK_AUTH_INSCRIPTION
          : normalizedEmail || 'attache@example.com',
      authProvider: role === UserRole.STUDENT ? 'student_inscription' : 'attache_email',
      legacyEmail: role === UserRole.STUDENT ? MOCK_AUTH_EMAIL : normalizedEmail || 'attache@example.com',
      role,
    };

    onLogin(mockUser);

    if (role === UserRole.STUDENT) {
      if (
        registeredStudentInscriptions.includes(normalizedInscription) &&
        !onboardingStudentInscriptions.includes(normalizedInscription)
      ) {
        router.push('/student/dashboard');
      } else {
        router.push('/onboarding');
      }
      return;
    }

    router.push('/attache/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4  py-10 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-[1.65rem] border border-slate-200 bg-white shadow-sm">
        <div className="mx-auto w-full max-w-md px-8 py-10 md:py-12">
          <h1 className="text-center text-4xl font-black tracking-tight text-indigo-600">Sign in</h1>
          <p className="mt-2 text-center text-sm text-slate-400">Join the community today!</p>

          <SegmentedControl
            className="mt-6"
            value={role}
            options={roleOptions}
            onChange={(next) => setRole(next as UserRole)}
          />

          {role !== UserRole.STUDENT && (
            <>
              <Button type="button" variant="secondary" fullWidth className="mt-5 rounded-full bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100">
                <LogIn className="w-4 h-4 text-slate-400" />
                Use Google account
              </Button>

              <div className="my-5 text-center text-xs text-slate-300">or</div>
            </>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <FormField
              label={role === UserRole.STUDENT ? 'Inscription Number' : 'Email'}
              labelClassName="mb-1 text-xs font-medium text-slate-400"
            >
              <div className="flex items-center gap-3 border-b border-slate-300 pb-2">
                {role === UserRole.STUDENT ? (
                  <Hash className="w-4 h-4 text-slate-400" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-400" />
                )}
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder={role === UserRole.STUDENT ? 'INS-2023-001' : 'attache@example.com'}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
                <HelpCircle className="w-4 h-4 text-indigo-500" />
              </div>
            </FormField>

            <FormField label="Password" labelClassName="mb-1 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-3 border-b border-slate-300 pb-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="jean"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
                <HelpCircle className="w-4 h-4 text-indigo-500" />
              </div>
            </FormField>

            <Button
              type="submit"
              fullWidth
              className="mt-5 rounded-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Need access?{' '}
            <button
              type="button"
              onClick={() => router.push('/request-permission')}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Request permission
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
