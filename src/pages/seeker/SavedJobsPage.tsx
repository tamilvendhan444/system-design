import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Building, MapPin, DollarSign, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { ApplyModal } from '../../components/ApplyModal.tsx';
import type { SavedJob, Job } from '../../types/index.ts';

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSavedJobs();
      if (res.success && res.data) {
        setSavedJobs(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (jobId: string) => {
    await api.unsaveJob(jobId);
    setSavedJobs((prev) => prev.filter((s) => s.jobId !== jobId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Saved Opportunities</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bookmarked job openings stored in PostgreSQL SavedJob table
          </p>
        </div>
        <Link
          to="/jobs"
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          Explore More Jobs
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <Bookmark className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No saved jobs yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any job card in the job search page to save it for quick reference.
          </p>
          <Link
            to="/jobs"
            className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Find Jobs to Bookmark
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {savedJobs.map((item) => {
            const job = item.job;
            if (!job) return null;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {job.department}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {job.employmentType.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-0.5 hover:text-blue-600">
                    <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      {job.company?.name || 'Company'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {job.location} {job.isRemote && '(Remote)'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-bold text-slate-900">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                      ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRemove(job.id)}
                    className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedJobForApply(job);
                      setIsApplyModalOpen(true);
                    }}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ApplyModal
        job={selectedJobForApply}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          // Handled
        }}
      />
    </div>
  );
};
