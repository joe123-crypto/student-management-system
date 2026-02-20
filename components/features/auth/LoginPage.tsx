import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import SegmentedControl from '@/components/ui/SegmentedControl';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const roleOptions = [
  { value: UserRole.STUDENT, label: 'Student' },
  { value: UserRole.ATTACHE, label: 'Attache' },
] as const;

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email || (role === UserRole.STUDENT ? 'student@example.com' : 'attache@example.com'),
      role,
    };

    onLogin(mockUser);

    if (role === UserRole.STUDENT) {
      if (email === 'jean.dupont@example.com' || email === 'amina.f@example.com') {
        router.push('/student-dashboard');
      } else {
        router.push('/onboarding');
      }
      return;
    }

    router.push('/attache-dashboard');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 px-4 py-10 overflow-hidden flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-indigo-100/60" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-indigo-100/50" />
        <div className="absolute top-1/2 -left-12 h-20 w-20 rounded-full bg-indigo-200/40" />
      </div>

      <div className="relative w-full max-w-3xl rounded-[1.65rem] border border-slate-200 bg-white shadow-[0_30px_70px_-30px_rgba(79,70,229,0.35)] overflow-hidden">
        <div className="h-12 border-b border-slate-100 bg-slate-50/70 px-4 flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <div className="mx-auto h-7 w-[58%] rounded-md bg-white border border-slate-100" />
        </div>

        <div className="mx-auto w-full max-w-md px-8 py-10 md:py-12">
          <h1 className="text-center text-4xl font-black tracking-tight text-indigo-600">Sign in</h1>
          <p className="mt-2 text-center text-sm text-slate-400">Join the community today!</p>

          <SegmentedControl
            className="mt-6"
            value={role}
            options={roleOptions}
            onChange={(next) => setRole(next as UserRole)}
          />

          <Button type="button" variant="secondary" fullWidth className="mt-5 rounded-full bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100">
            <span className="text-base font-black text-slate-400">G</span>
            Use Google account
          </Button>

          <div className="my-5 text-center text-xs text-slate-300">or</div>

          <form onSubmit={handleLogin} className="space-y-4">
            <FormField label="Email" labelClassName="mb-1 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-3 border-b border-slate-300 pb-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 text-[10px]">?</span>
              </div>
            </FormField>

            <FormField label="Password" labelClassName="mb-1 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-3 border-b border-slate-300 pb-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                />
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 text-[10px]">?</span>
              </div>
            </FormField>

            <Button
              type="submit"
              fullWidth
              className="mt-5 rounded-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Already a member? <span className="font-semibold text-indigo-600">Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
