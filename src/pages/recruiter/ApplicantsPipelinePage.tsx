import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  FileText,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { StatusChangeModal } from '../../components/StatusChangeModal.tsx';
import type { Application } from '../../types/index.ts';

export const ApplicantsPipelinePage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filterJobId, setFilterJobId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Status modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchApplicants = async () => {
    setIsLoading(true);
    try {
      const res = await api.getRecruiterApplications();
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
    fetchApplicants();
  }, []);

  const uniqueJobs = Array.from(
    new Map(applications.map((a) => [a.jobId, a.job?.title || a.jobId])).entries()
  );

  const filteredApps = applications.filter((a) => {
    if (filterJobId && a.jobId !== filterJobId) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = a.user?.name?.toLowerCase().includes(q);
      const matchEmail = a.user?.email?.toLowerCase().includes(q);
      const matchJob = a.job?.title?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchJob) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Candidate Pipeline & Screening
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            API 8: Recruiter Applicant Management & State Machine Status History
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-bold text-purple-700">
            {filteredApps.length} Candidates Screened
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search candidate name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div>
          <select
            value={filterJobId}
            onChange={(e) => setFilterJobId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:outline-none shadow-2xs"
          >
            <option value="">All Company Vacancies</option>
            {uniqueJobs.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:outline-none shadow-2xs"
          >
            <option value="">All Pipeline Stages</option>
            <option value="APPLIED">Applied (New)</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFERED">Offer Extended</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applicants List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No applicants matching filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your job or stage filters to view all active submissions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-purple-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold text-sm">
                    {app.user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{app.user?.name}</h3>
                      <span className="text-xs text-slate-500">• {app.user?.email}</span>
                    </div>

                    <div className="text-xs text-slate-600 mt-0.5">
                      Applied for: <strong className="text-slate-800">{app.job?.title}</strong>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Submitted {new Date(app.appliedAt).toLocaleString()}
                    </div>
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

                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setIsModalOpen(true);
                    }}
                    className="rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors shadow-2xs"
                  >
                    Update Stage
                  </button>
                </div>
              </div>

              {/* Cover Letter & Resume Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    Attached Candidate Resume
                  </div>
                  <div className="font-medium text-slate-900 mt-0.5">
                    {app.resume?.filename || 'Resume.pdf'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {app.resume?.storageKey || 's3://hireflow-resumes/...'}
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-slate-700">Cover Note</div>
                  <p className="text-slate-600 italic line-clamp-2 mt-0.5">
                    "{app.coverLetter || 'No cover note provided.'}"
                  </p>
                </div>
              </div>

              {/* Status History Audit Preview */}
              {app.statusHistory && app.statusHistory.length > 0 && (
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Last note:</span>
                    <strong className="text-slate-700">"{app.statusHistory[0]?.note}"</strong>
                  </div>
                  <Link
                    to={`/applications/${app.id}`}
                    className="text-purple-600 hover:underline font-semibold flex items-center gap-0.5"
                  >
                    Full timeline trace <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <StatusChangeModal
        application={selectedApp}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchApplicants();
        }}
      />
    </div>
  );
};
