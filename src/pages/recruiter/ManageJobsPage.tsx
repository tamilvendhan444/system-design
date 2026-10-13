import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Edit3,
  Trash2,
  Users,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Job } from '../../types/index.ts';

export const ManageJobsPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const companyId = user?.companyId || 'comp-1';
      const res = await api.getJobs({ companyId });
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting? This will invalidate Redis cache keys and emit a job.closed event.')) return;
    try {
      await api.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      await api.updateJob(job.id, { status: newStatus });
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Company Vacancy Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            API 7: Recruiter Job Management (Create, Edit, Publish, Close, Delete)
          </p>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors shadow-xs"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Post New Job Vacancy</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No vacancies created yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first engineering job posting to start sourcing top candidates.
          </p>
          <Link
            to="/recruiter/jobs/new"
            className="inline-block rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Create Job Posting
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      job.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : job.status === 'CLOSED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {job.status}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                    {job.department}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-400 font-mono">ID: {job.id}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">
                  <Link to={`/jobs/${job.id}`} className="hover:text-purple-600">
                    {job.title}
                  </Link>
                </h3>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{job.location} {job.isRemote && '(Remote)'}</span>
                  <span>•</span>
                  <span>{job.employmentType.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k / yr</span>
                  <span>•</span>
                  <span className="font-semibold text-blue-600">
                    {job.applicantCount || 0} Applicants
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                <button
                  onClick={() => handleToggleStatus(job)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    job.status === 'PUBLISHED'
                      ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {job.status === 'PUBLISHED' ? 'Close Vacancy' : 'Publish Vacancy'}
                </button>

                <Link
                  to={`/recruiter/jobs/${job.id}/edit`}
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Edit Job Posting"
                >
                  <Edit3 className="h-4 w-4" />
                </Link>

                <button
                  onClick={() => handleDelete(job.id)}
                  className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Job"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <Link
                  to={`/jobs/${job.id}`}
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Public View"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
