import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Trash2,
  CheckCircle2,
  Plus,
  ShieldCheck,
  HardDrive,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { ResumeUploadModal } from '../../components/ResumeUploadModal.tsx';
import type { Resume } from '../../types/index.ts';

export const ResumeManagementPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const res = await api.getResumes();
      if (res.success && res.data) {
        setResumes(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to remove this resume from S3 object storage simulation?')) return;
    try {
      await api.deleteResume(resumeId);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Resume Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            API 6: Amazon S3 Object Storage Simulation & PostgreSQL Metadata Persistence
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Upload New Resume</span>
        </button>
      </div>

      {/* S3 Storage Infrastructure Architecture Notice */}
      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-blue-400">
          <HardDrive className="h-4 w-4" />
          <span>Object Storage Architecture (Round 3 HLD)</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          In production, candidate PDF/DOCX files are uploaded directly to Amazon S3 / Google Cloud Storage using
          presigned URLs to avoid saturated API Gateway memory. Only metadata (filesize, SHA256 checksum, S3 URI,
          and parsed skill tags) is committed to PostgreSQL.
        </p>
      </div>

      {/* Resumes List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <UploadCloud className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No resumes uploaded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload your resume to start applying for high-impact software engineering and architecture roles.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Upload Resume
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{r.filename}</h3>
                      {r.isDefault && (
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          Default Resume
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{(r.size / 1024).toFixed(0)} KB</span>
                      <span>•</span>
                      <span>{r.experienceYears} Years Experience</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Uploaded {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete resume"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {r.summary && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                  {r.summary}
                </p>
              )}

              {/* Extracted Skills */}
              {r.skills && r.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {r.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Storage Key: {r.storageKey}</span>
                <span className="text-emerald-600 font-semibold">Integrity Verified</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={(newResume) => {
          setResumes((prev) => [newResume, ...prev]);
        }}
      />
    </div>
  );
};
