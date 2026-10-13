import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await login(email);
    setIsLoading(false);
    if (res.success) {
      if (email.includes('admin')) {
        navigate('/admin/dashboard');
      } else if (email.includes('recruiter')) {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/seeker/dashboard');
      }
    } else {
      setError(res.message || 'Login failed');
    }
  };

  const handleQuickDemoLogin = async (userId: string, targetPath: string) => {
    setIsLoading(true);
    await switchUser(userId);
    setIsLoading(false);
    navigate(targetPath);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/60">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20 mb-2">
            <Briefcase className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Sign in to HireFlow</h1>
          <p className="text-xs text-slate-500">Access your candidate applications, vacancies, or admin tools</p>
        </div>

        {/* 1-Click Quick Demo Sign-In Buttons */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 space-y-2">
          <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Hackathon Quick-Switch Personas</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('user-seeker-1', '/seeker/dashboard')}
              className="flex items-center justify-between rounded-lg bg-white p-2 text-xs font-semibold text-slate-800 border border-blue-200 hover:bg-blue-50 transition-colors shadow-2xs"
            >
              <span>Alex Rivera (Job Seeker)</span>
              <span className="text-[10px] text-blue-600 font-bold">1-Click Login →</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('user-recruiter-1', '/recruiter/dashboard')}
              className="flex items-center justify-between rounded-lg bg-white p-2 text-xs font-semibold text-slate-800 border border-purple-200 hover:bg-purple-50 transition-colors shadow-2xs"
            >
              <span>Sarah Chen (Recruiter @ TechCorp)</span>
              <span className="text-[10px] text-purple-600 font-bold">1-Click Login →</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('user-admin-1', '/admin/dashboard')}
              className="flex items-center justify-between rounded-lg bg-white p-2 text-xs font-semibold text-slate-800 border border-rose-200 hover:bg-rose-50 transition-colors shadow-2xs"
            >
              <span>Marcus Vance (Administrator)</span>
              <span className="text-[10px] text-rose-600 font-bold">1-Click Login →</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus-within:border-blue-500">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. seeker@hireflow.dev"
                className="w-full text-xs text-slate-800 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus-within:border-blue-500">
              <Lock className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs text-slate-800 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In with Password</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register new user
          </Link>
        </div>
      </div>
    </div>
  );
};
