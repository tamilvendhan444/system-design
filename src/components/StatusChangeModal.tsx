import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/apiClient.ts';
import type { Application, ApplicationStatus } from '../types/index.ts';

interface StatusChangeModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUSES: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: 'APPLIED', label: 'Applied', color: 'bg-slate-100 text-slate-800' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-amber-100 text-amber-800' },
  { value: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-blue-100 text-blue-800' },
  { value: 'INTERVIEW', label: 'Interview Scheduled', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'OFFERED', label: 'Offer Extended', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'REJECTED', label: 'Not Moving Forward', color: 'bg-rose-100 text-rose-800' },
  { value: 'WITHDRAWN', label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
];

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  application,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(
    application?.status || 'UNDER_REVIEW'
  );
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (application) {
      setSelectedStatus(application.status);
      setNote('');
      setErrorMessage(null);
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.updateApplicationStatus(application.id, selectedStatus, note);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.message || 'Failed to update application status.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error updating status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Update Candidate Stage</h3>
            <p className="text-xs text-slate-500">API 8: Status State Machine & Audit History</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-200/80">
            <div className="text-slate-500">Candidate</div>
            <div className="font-bold text-slate-900 text-sm">{application.user?.name || 'Applicant'}</div>
            <div className="text-slate-600 mt-1">Role: {application.job?.title || 'Job'}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Current Status:</span>
              <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                {application.status}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select New Stage
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((st) => (
                <button
                  type="button"
                  key={st.value}
                  onClick={() => setSelectedStatus(st.value)}
                  className={`flex items-center justify-between rounded-xl border p-2 text-xs font-medium text-left transition-all ${
                    selectedStatus === st.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-500 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{st.label}</span>
                  {selectedStatus === st.value && (
                    <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reviewer Note / Feedback
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Scored 9/10 in technical system architecture round; advancing to hiring manager."
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedStatus === application.status}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Transitioning...
                </>
              ) : (
                <>
                  <span>Confirm Transition</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
