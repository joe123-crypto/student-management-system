
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email || (role === UserRole.STUDENT ? 'student@example.com' : 'attache@example.com'),
      role: role
    };
    onLogin(mockUser);
    
    if (role === UserRole.STUDENT) {
      if (email === 'jean.dupont@example.com' || email === 'amina.f@example.com') {
        navigate('/student-dashboard');
      } else {
        navigate('/onboarding');
      }
    } else {
      navigate('/attache-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 py-8 px-10 text-white">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-indigo-100 mt-2">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-10 space-y-6">
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setRole(UserRole.STUDENT)}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${role === UserRole.STUDENT ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole(UserRole.ATTACHÉ)}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${role === UserRole.ATTACHÉ ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Attaché
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="e.g. name@university.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Forgot Password?</a>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Sign In
          </button>
          
          <p className="text-center text-slate-500 text-sm">
            Don't have an account? <a href="#" className="text-indigo-600 font-semibold hover:underline">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
