import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  MapPin,
  Calendar,
  ArrowRight,
  Filter,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Application, ApplicationStatus } from '../../types/index.ts';

const PIPELINE_STAGES: ApplicationStatus[] = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
];

export const MyApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMyApplications({ status: statusFilter || undefined });
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const getStageIndex = (status: ApplicationStatus) => {
    if (status === 'REJECTED' || status === 'WITHDRAWN') return -1;
    return PIPELINE_STAGES.indexOf(status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Job Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            API 5: PostgreSQL Application Records & Real-Time Status History Timeline
          </p>
        </div>

        <Link
          to="/jobs"
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Explore More Jobs</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
        {[
          { value: '', label: 'All Applications' },
          { value: 'APPLIED', label: 'Applied' },
          { value: 'UNDER_REVIEW', label: 'Under Review' },
          { value: 'SHORTLISTED', label: 'Shortlisted' },
          { value: 'INTERVIEW', label: 'Interviewing' },
          { value: 'OFFERED', label: 'Offered' },
          { value: 'REJECTED', label: 'Not Selected' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === tab.value
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <FileText className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No applications found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any active submissions in this category. Search open postings to apply!
          </p>
          <Link
            to="/jobs"
            className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Find Open Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isTerminal = app.status === 'REJECTED' || app.status === 'WITHDRAWN';

            return (
              <div
                key={app.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition-all space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {app.job?.department || 'Engineering'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ID: {app.id}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-0.5 hover:text-blue-600">
                      <Link to={`/jobs/${app.jobId}`}>{app.job?.title || 'Job Posting'}</Link>
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        {app.company?.name || 'Company'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {app.job?.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        app.status === 'SHORTLISTED'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'UNDER_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : app.status === 'INTERVIEW'
                          ? 'bg-indigo-100 text-indigo-800'
                          : app.status === 'OFFERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {app.status}
                    </span>

                    <Link
                      to={`/applications/${app.id}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs flex items-center gap-1"
                    >
                      <span>Timeline</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>

                {/* Visual Pipeline Stepper (Section 6: Application Workflow) */}
                {!isTerminal ? (
                  <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Pipeline Progression
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {PIPELINE_STAGES.map((st, idx) => {
                        const isReached = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;
                        return (
                          <div key={st} className="flex flex-col items-center text-center">
                            <div
                              className={`h-2 w-full rounded-full transition-all ${
                                isReached
                                  ? isCurrent
                                    ? 'bg-blue-600 ring-2 ring-blue-300'
                                    : 'bg-emerald-500'
                                  : 'bg-slate-200'
                              }`}
                            />
                            <span
                              className={`mt-1.5 text-[10px] font-semibold ${
                                isCurrent
                                  ? 'text-blue-700 font-bold'
                                  : isReached
                                  ? 'text-slate-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {st === 'UNDER_REVIEW' ? 'Review' : st.replace('_', ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-rose-50/80 p-3 border border-rose-200 text-xs text-rose-800">
                    Application reached terminal state: <strong>{app.status}</strong>. Feedback logged in status timeline.
                  </div>
                )}

                {/* Status history summary snippet */}
                {app.statusHistory && app.statusHistory.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Latest Update:</span>
                      <span className="text-slate-600">
                        {app.statusHistory[0]?.note || `Stage updated to ${app.status}`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      By {app.statusHistory[0]?.changedByName || 'Recruiter'} (
                      {new Date(app.statusHistory[0]?.changedAt || app.updatedAt).toLocaleDateString()})
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
