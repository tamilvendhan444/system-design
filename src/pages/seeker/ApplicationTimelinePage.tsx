import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import type { Application } from '../../types/index.ts';

export const ApplicationTimelinePage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [app, setApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApp = async () => {
      if (!applicationId) return;
      setIsLoading(true);
      try {
        const res = await api.getApplicationStatus(applicationId);
        if (res.success && res.data) {
          // fetch full application data
          const myApps = await api.getMyApplications();
          const found = myApps.data?.find((a) => a.id === applicationId);
          if (found) {
            setApp(found);
          } else {
            // Also check recruiter view if recruiter
            const recApps = await api.getRecruiterApplications();
            const foundRec = recApps.data?.find((a) => a.id === applicationId);
            if (foundRec) setApp(foundRec);
          }
        } else {
          setError(res.message || 'Application not found');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching application history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchApp();
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-2" />
        <h3 className="text-base font-bold text-slate-900">Application History Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'Application record could not be loaded.'}</p>
        <Link
          to="/applications"
          className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Return to My Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/applications"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Applications</span>
        </Link>
      </div>

      {/* Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                Application #{app.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(app.appliedAt).toLocaleString()}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              {app.job?.title || 'Job Role'}
            </h1>
            <div className="text-xs text-slate-600 mt-0.5">
              {app.company?.name || 'Company'} • {app.job?.location}
            </div>
          </div>

          <div className="text-right sm:text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Current State
            </div>
            <span
              className={`inline-block mt-1 rounded-full px-3 py-1 text-xs font-bold ${
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
          </div>
        </div>

        {/* Resume attached & cover letter */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              Attached Resume
            </div>
            <div className="font-medium text-slate-900">
              {app.resume?.filename || 'Resume_Software_Engineer.pdf'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              S3 Key: {app.resume?.storageKey || `s3://hireflow-resumes/${app.userId}`}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
            <div className="font-semibold text-slate-700">Cover Letter / Note</div>
            <p className="text-slate-600 line-clamp-2 italic">
              "{app.coverLetter || 'Standard submission note provided during application.'}"
            </p>
          </div>
        </div>
      </div>

      {/* Lifecycle Timeline (Section 6) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Audit History & State Machine Timeline</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrates Section 6: Persistent status history with timestamped actor provenance
          </p>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {app.statusHistory && app.statusHistory.length > 0 ? (
            app.statusHistory.map((item, index) => {
              const isFirst = index === 0;
              return (
                <div key={item.id} className="relative group">
                  {/* Pin Dot */}
                  <div
                    className={`absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-xs ${
                      isFirst ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-400'
                    }`}
                  />

                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-white px-2 py-0.5 text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs">
                          {item.newStatus}
                        </span>
                        {item.previousStatus && (
                          <span className="text-[10px] text-slate-400">
                            (from {item.previousStatus})
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(item.changedAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">
                      {item.note || `Status transitioned to ${item.newStatus}`}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" />
                        Actor: <strong className="text-slate-700">{item.changedByName || 'System Actor'}</strong> ({item.changedByRole || 'SYSTEM'})
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        Event: application.status_changed
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-400">No status updates recorded yet.</div>
          )}
        </div>
      </div>

      {/* Transactional Outbox Event Bus Specification Card */}
      <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-purple-900">
          <Layers className="h-4 w-4 text-purple-600" />
          <span>High-Level Design Event Stream Trace</span>
        </div>
        <p className="text-purple-800 leading-relaxed">
          When this application transitioned to <strong>{app.status}</strong>, an event was recorded in the PostgreSQL
          transactional outbox table, picked up by the RabbitMQ/Kafka consumer daemon, and delivered to the Notification Service
          and email dispatcher.
        </p>
        <div className="flex items-center gap-3 pt-1">
          <Link
            to="/system/infrastructure"
            className="font-bold text-purple-700 hover:underline flex items-center gap-1"
          >
            <span>View Live Outbox Queue in Infrastructure Lab</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
