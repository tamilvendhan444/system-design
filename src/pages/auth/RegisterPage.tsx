import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Lock, User, Building, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Role } from '../../types/index.ts';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('JOB_SEEKER');
  const [companyName, setCompanyName] = useState('');
  const [skillsStr, setSkillsStr] = useState('TypeScript, React, Node.js');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await register({
      name,
      email,
      role,
      companyName: role === 'RECRUITER' ? companyName : undefined,
      skills,
    });

    setIsLoading(false);
    if (res.success) {
      if (role === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/seeker/dashboard');
      }
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/60">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20 mb-2">
            <Briefcase className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Create HireFlow Account</h1>
          <p className="text-xs text-slate-500">Join as an engineering candidate or enterprise recruiter</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector pill */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">I am registering as:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('JOB_SEEKER')}
                className={`rounded-xl border p-2 text-xs font-semibold transition-all ${
                  role === 'JOB_SEEKER'
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Job Seeker / Engineer
              </button>
              <button
                type="button"
                onClick={() => setRole('RECRUITER')}
                className={`rounded-xl border p-2 text-xs font-semibold transition-all ${
                  role === 'RECRUITER'
                    ? 'border-purple-600 bg-purple-50 text-purple-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Enterprise Recruiter
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
              <User className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full text-xs text-slate-800 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full text-xs text-slate-800 focus:outline-none"
                required
              />
            </div>
          </div>

          {role === 'RECRUITER' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization Name</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                <Building className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. CloudScale Dynamics"
                  className="w-full text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Technical Skills</label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="TypeScript, React, Go, Docker"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
