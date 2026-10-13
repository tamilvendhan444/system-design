import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/apiClient.ts';
import type { Resume } from '../types/index.ts';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (resume: Resume) => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [filename, setFilename] = useState('');
  const [summary, setSummary] = useState('');
  const [skillsStr, setSkillsStr] = useState('TypeScript, React, Node.js, PostgreSQL, Docker, AWS');
  const [experienceYears, setExperienceYears] = useState(5);
  const [isDefault, setIsDefault] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatedFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFilename(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim()) {
      setError('Please provide a resume filename or select a file.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await api.uploadResume({
        filename: filename.trim().endsWith('.pdf') ? filename.trim() : `${filename.trim()}.pdf`,
        summary,
        skills,
        experienceYears: Number(experienceYears),
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || 'Failed to upload resume.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Resume</h3>
            <p className="text-xs text-slate-500">API 6: S3 Object Storage Simulation & Metadata Persistence</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Drag & drop simulated box */}
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
            <UploadCloud className="mx-auto h-8 w-8 text-blue-600 mb-2" />
            <div className="text-xs font-semibold text-slate-700">
              Drop resume file here (PDF or DOCX)
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Simulates Amazon S3 multipart presigned upload up to 10MB
            </p>
            <label className="mt-3 inline-block cursor-pointer rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50">
              Browse Files
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleSimulatedFileDrop}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resume Display Name / Filename <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g. Alex_Rivera_Lead_Architect_2026.pdf"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Set as Default Resume
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Extracted Skill Tags (comma-separated)
            </label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Candidate Executive Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summary of engineering accomplishments, architectures designed, and technology leadership..."
              rows={2}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              disabled={isUploading}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Storing to S3...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Upload & Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
