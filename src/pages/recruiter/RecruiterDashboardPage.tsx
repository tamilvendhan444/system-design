import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  TrendingUp,
  Building,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../../services/apiClient.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { StatusChangeModal } from '../../components/StatusChangeModal.tsx';
import type { Application } from '../../types/index.ts';

export const RecruiterDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status Change Modal
  const [selectedAppForStatus, setSelectedAppForStatus] = useState<Application | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getRecruiterAnalytics();
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleOpenStatusModal = (app: Application) => {
    setSelectedAppForStatus(app);
    setIsStatusModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-700 to-indigo-800 p-6 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-purple-100">
              <Building className="h-3 w-3" />
              {user?.company?.name || 'TechCorp Solutions'} Recruitment Hub
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">
              Recruitment Operations Center
            </h1>
            <p className="text-xs text-purple-100 mt-0.5 max-w-xl">
              Manage live engineering vacancies, screen applicants, and advance candidates through the pipeline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/recruiter/jobs/new"
              className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-purple-800 hover:bg-purple-50 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post New Vacancy</span>
            </Link>
            <Link
              to="/recruiter/applicants"
              className="rounded-xl bg-purple-600/60 border border-white/30 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-600/80 transition-colors"
            >
              Candidate Pipeline
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Vacancies</span>
            <Briefcase className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {analytics?.activeJobsCount ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Published & accepting apps</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Applicants</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-600">
            {analytics?.totalApplicants ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across all company jobs</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Shortlisted</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {analytics?.shortlistedCount ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">In interview rounds</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Hired / Offered</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {analytics?.hiredCount ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Offers accepted</div>
        </div>
      </div>

      {/* Pipeline Chart & Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Candidate Funnel Conversion
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">API 10</span>
          </div>

          <div className="h-60 w-full">
            {analytics?.pipelineChart ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.pipelineChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="candidates" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Loading analytics...
              </div>
            )}
          </div>
        </div>

        {/* Recent Applicants awaiting action */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Recent Submissions
              </h3>
              <p className="text-[11px] text-slate-400">
                Update candidate status to trigger outbox notifications
              </p>
            </div>
            <Link
              to="/recruiter/applicants"
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              All Applicants <ArrowRight className="h-3 w-3" />
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
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        {app.user?.name || 'Applicant'}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {app.user?.email}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Applied for: <strong>{app.job?.title}</strong> •{' '}
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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

                    <button
                      onClick={() => handleOpenStatusModal(app)}
                      className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 transition-colors shadow-2xs"
                    >
                      Update Stage
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No applicants currently registered for your company vacancies.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vacancy Performance Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Company Job Postings Pipeline
            </h3>
            <p className="text-[11px] text-slate-400">
              Live funnel performance across all postings
            </p>
          </div>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-semibold text-purple-600 hover:text-purple-800"
          >
            Manage all postings
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Job Title</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Applicants</th>
                <th className="py-2.5 px-3">Shortlisted</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics?.jobPerformance?.map((j: any) => (
                <tr key={j.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <Link to={`/jobs/${j.id}`} className="hover:text-purple-600">
                      {j.title}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
                      {j.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {j.applicants}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-blue-600">
                    {j.shortlisted}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      to="/recruiter/applicants"
                      className="text-purple-600 font-semibold hover:underline"
                    >
                      View Candidates
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StatusChangeModal
        application={selectedAppForStatus}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={() => {
          fetchAnalytics();
        }}
      />
    </div>
  );
};
