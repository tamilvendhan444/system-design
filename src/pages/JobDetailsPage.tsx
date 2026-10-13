import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  Bookmark,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { api } from '../services/apiClient.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ApplyModal } from '../components/ApplyModal.tsx';
import type { Job } from '../types/index.ts';

export const JobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      setIsLoading(true);
      try {
        const res = await api.getJob(jobId);
        if (res.success && res.data) {
          setJob(res.data);
          setIsSaved(!!res.data.isSaved);
        } else {
          setError(res.message || 'Job not found');
        }
      } catch (err: any) {
        setError(err.message || 'Network error fetching job');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleToggleSave = async () => {
    if (!job) return;
    try {
      if (isSaved) {
        await api.unsaveJob(job.id);
        setIsSaved(false);
      } else {
        await api.saveJob(job.id);
        setIsSaved(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl py-16 px-4 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Job Posting Unavailable</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'This job does not exist or has been removed.'}</p>
        <Link
          to="/jobs"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Link>
      </div>
    );
  }

  const isClosed = job.status !== 'PUBLISHED';
  const deadlineDate = new Date(job.applicationDeadline);
  const isPastDeadline = deadlineDate < new Date();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-slate-200 bg-white py-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to all jobs</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Job Body */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                  {job.department}
                </span>
                <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {job.employmentType.replace('_', ' ')}
                </span>
                <span className="rounded bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200/50">
                  {job.experienceLevel} Level
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
                {job.title}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  {job.company?.name || 'Company'}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {job.location} {job.isRemote && '(Remote Option)'}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-slate-900">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k / year
                </span>
              </div>

              {/* Status Banner */}
              {job.hasApplied && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>You have already submitted an active application for this role. Check your applications tab to view real-time status history.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                {job.hasApplied ? (
                  <Link
                    to="/applications"
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    View Application Status
                  </Link>
                ) : isClosed || isPastDeadline ? (
                  <button
                    disabled
                    className="flex-1 rounded-xl bg-slate-200 py-2.5 text-xs font-semibold text-slate-500 cursor-not-allowed"
                  >
                    Posting Closed
                  </button>
                ) : (
                  <button
                    onClick={() => setIsApplyModalOpen(true)}
                    className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Apply for Position</span>
                  </button>
                )}

                <button
                  onClick={handleToggleSave}
                  className={`rounded-xl border p-2.5 text-xs transition-colors ${
                    isSaved
                      ? 'border-amber-300 bg-amber-50 text-amber-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                  title={isSaved ? 'Remove bookmark' : 'Bookmark job'}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Description Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Role Overview
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {job.responsibilities && job.responsibilities.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Required Skills & Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-blue-50 border border-blue-200/60 px-2.5 py-1 text-xs font-medium text-blue-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* LLD API Spec Box */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white font-mono text-xs shadow-xs space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400">Low-Level Design Hook</div>
              <div className="text-emerald-400 font-semibold">GET /api/jobs/{job.id}</div>
              <div className="text-slate-400 text-[11px]">
                Payload includes Job entity joined with Company entity and live application count.
              </div>
            </div>
          </div>

          {/* Right Sidebar: Company Info & Meta */}
          <div className="space-y-5">
            {/* Company Card */}
            {job.company && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  About the Company
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-800 text-sm border border-slate-200">
                    {job.company.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{job.company.name}</h4>
                    <div className="text-[10px] text-slate-500">{job.company.industry}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {job.company.description}
                </p>

                <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Headquarters</span>
                    <span className="font-medium text-slate-800">{job.company.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company Size</span>
                    <span className="font-medium text-slate-800">{job.company.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Founded</span>
                    <span className="font-medium text-slate-800">{job.company.foundedYear}</span>
                  </div>
                </div>

                {job.company.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline pt-1"
                  >
                    <span>Visit website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            {/* Posting Metadata Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Job Metadata
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Posted Date</span>
                <span className="font-medium text-slate-800">{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Deadline</span>
                <span className="font-medium text-slate-800">{new Date(job.applicationDeadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Applicants</span>
                <span className="font-bold text-blue-600">{job.applicantCount || 0} candidates</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Job ID</span>
                <span className="font-mono text-[11px] text-slate-600">{job.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          setJob((prev) => (prev ? { ...prev, hasApplied: true } : prev));
        }}
      />
    </div>
  );
};
