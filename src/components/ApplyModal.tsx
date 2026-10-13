import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, Building, MapPin, DollarSign } from 'lucide-react';
import { api } from '../services/apiClient.ts';
import type { Job, Resume } from '../types/index.ts';

interface ApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appId: string) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ job, isOpen, onClose, onSuccess }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ applicationId: string; status: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessData(null);
      loadResumes();
    }
  }, [isOpen]);

  const loadResumes = async () => {
    setIsLoadingResumes(true);
    try {
      const res = await api.getResumes();
      if (res.success && res.data && res.data.length > 0) {
        setResumes(res.data);
        const defaultResume = res.data.find((r) => r.isDefault) || res.data[0];
        setSelectedResumeId(defaultResume.id);
      } else {
        // Create an automated default demo resume if none exists
        const created = await api.uploadResume({
          filename: 'Alex_Rivera_Software_Engineer_Resume.pdf',
          summary: 'Full Stack & Distributed Systems Engineer with 6+ years experience.',
          skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
          experienceYears: 6,
        });
        if (created.success && created.data) {
          setResumes([created.data]);
          setSelectedResumeId(created.data.id);
        }
      }
    } catch (err) {
      setErrorMessage('Could not load resumes from S3 metadata layer');
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !selectedResumeId) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.applyForJob(job.id, {
        resumeId: selectedResumeId,
        coverLetter: coverLetter.trim() || undefined,
      });

      if (res.success && res.data) {
        setSuccessData(res.data);
        onSuccess(res.data.applicationId);
      } else {
        setErrorMessage(res.message || 'Failed to submit application.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Submit Application</h3>
            <p className="text-xs text-slate-500">API 3: Transactional Outbox & Duplicate Validation</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {successData ? (
          <div className="my-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Application Submitted!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your application has been committed to the database and published to the event queue.
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-left border border-slate-200 space-y-1 font-mono">
              <div className="text-slate-500">Application ID: <span className="text-blue-600 font-semibold">{successData.applicationId}</span></div>
              <div className="text-slate-500">Initial Status: <span className="text-amber-600 font-semibold">{successData.status}</span></div>
              <div className="text-slate-500">Outbox Event: <span className="text-emerald-600 font-semibold">application.created (Queued)</span></div>
            </div>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Job Summary Pill */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <div className="text-xs font-bold text-slate-900">{job.title}</div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Building className="h-3 w-3 text-slate-400" />
                  {job.company?.name || 'Company'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {job.location} {job.isRemote && '(Remote)'}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-slate-400" />
                  ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <span className="font-semibold">Application Rejected: </span>
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Resume Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Resume File <span className="text-red-500">*</span>
              </label>
              {isLoadingResumes ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  Loading resumes from storage...
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-xs text-amber-600">No resumes found. One will be generated automatically.</div>
              ) : (
                <div className="space-y-2">
                  {resumes.map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-xs cursor-pointer transition-all ${
                        selectedResumeId === r.id
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="resumeOption"
                          value={r.id}
                          checked={selectedResumeId === r.id}
                          onChange={() => setSelectedResumeId(r.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                            {r.filename}
                            {r.isDefault && (
                              <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-800">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {(r.size / 1024).toFixed(0)} KB • {r.experienceYears} yrs exp • S3 Key: {r.storageKey}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cover Note / Message to Hiring Team (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why your experience with distributed systems or React makes you a strong fit..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedResumeId}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Committing Application...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
