import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  ArrowRight,
  Briefcase,
  AlertCircle,
  Sparkles,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../../services/apiClient.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Application, Job } from '../../types/index.ts';

const STATUS_COLORS: Record<string, string> = {
  APPLIED: '#64748b',
  UNDER_REVIEW: '#f59e0b',
  SHORTLISTED: '#3b82f6',
  INTERVIEW: '#6366f1',
  OFFERED: '#10b981',
  REJECTED: '#f43f5e',
};

export const SeekerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [anaRes, jobsRes] = await Promise.all([
          api.getSeekerAnalytics(),
          api.getJobs({ limit: 3, sort: 'newest' }),
        ]);
        if (anaRes.success && anaRes.data) {
          setAnalytics(anaRes.data);
        }
        if (jobsRes.success && jobsRes.data) {
          setRecommendedJobs(jobsRes.data);
        }
      } catch (err) {
        console.error('Failed to load seeker dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-blue-100">
              <Sparkles className="h-3 w-3" />
              Candidate Workspace
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">
              Welcome back, {user?.name || 'Candidate'}!
            </h1>
            <p className="text-xs text-blue-100 mt-0.5 max-w-xl">
              {user?.headline || 'Senior Full Stack & Cloud Architect'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/jobs"
              className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow-xs"
            >
              Browse Open Jobs
            </Link>
            <Link
              to="/resumes"
              className="rounded-xl bg-blue-500/50 border border-white/30 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500/70 transition-colors"
            >
              Manage Resumes
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Applied</span>
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {analytics?.totalApplications ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Committed in PostgreSQL</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Under Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {analytics?.underReview ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Recruiter screening</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Shortlisted</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {analytics?.shortlisted ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Advanced to interview</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Saved Bookmarks</span>
            <Bookmark className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600">
            {analytics?.savedJobsCount ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Saved opportunities</div>
        </div>
      </div>

      {/* Analytics Chart & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Application Pipeline Stages
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">API 10</span>
          </div>

          <div className="h-60 w-full">
            {analytics?.chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.chartData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === 'Shortlisted'
                            ? '#3b82f6'
                            : entry.name === 'Review'
                            ? '#f59e0b'
                            : entry.name === 'Offered'
                            ? '#10b981'
                            : '#64748b'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Loading chart...
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications List */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Recent Submissions & Status
              </h3>
              <p className="text-[11px] text-slate-400">Track stages via API 4 state machine</p>
            </div>
            <Link
              to="/applications"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {analytics?.recentApplications?.length > 0 ? (
              analytics.recentApplications.map((app: Application) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {app.job?.title || 'Job Posting'}
                    </h4>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {app.company?.name || 'Company'} • Applied{' '}
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        app.status === 'SHORTLISTED'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'UNDER_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : app.status === 'INTERVIEW'
                          ? 'bg-indigo-100 text-indigo-800'
                          : app.status === 'OFFERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {app.status}
                    </span>

                    <Link
                      to={`/applications/${app.id}`}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                    >
                      Timeline Trace
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                You have not submitted any applications yet. Explore openings to apply!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Recommended Roles for Your Profile
            </h3>
            <p className="text-[11px] text-slate-400">
              Matched against your skills ({user?.skills?.slice(0, 4).join(', ')})
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Explore all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendedJobs.map((j) => (
            <div
              key={j.id}
              className="rounded-xl border border-slate-200 p-3.5 flex flex-col justify-between hover:border-blue-300 transition-all bg-slate-50/30"
            >
              <div>
                <div className="text-[10px] font-bold text-blue-600 uppercase">{j.department}</div>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">{j.title}</h4>
                <div className="text-[11px] text-slate-500 mt-1">{j.company?.name} • {j.location}</div>
                <div className="text-xs font-bold text-slate-800 mt-2">
                  ${(j.salaryMin / 1000).toFixed(0)}k - ${(j.salaryMax / 1000).toFixed(0)}k
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{j.employmentType.replace('_', ' ')}</span>
                <Link
                  to={`/jobs/${j.id}`}
                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 shadow-2xs"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
