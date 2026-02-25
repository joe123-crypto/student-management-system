import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { HelpCircle, Lock, LogIn, Mail } from 'lucide-react';

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
        router.push('/student/dashboard');
      } else {
        router.push('/onboarding');
      }
      return;
    }

    router.push('/attache/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-[1.65rem] border border-slate-200 bg-white shadow-sm">
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
            <LogIn className="w-4 h-4 text-slate-400" />
            Use Google account
          </Button>

          <div className="my-5 text-center text-xs text-slate-300">or</div>

          <form onSubmit={handleLogin} className="space-y-4">
            <FormField label="Email" labelClassName="mb-1 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-3 border-b border-slate-300 pb-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
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
                  placeholder="********"
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
            Already a member? <span className="font-semibold text-indigo-600">Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

