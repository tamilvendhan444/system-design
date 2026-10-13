import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, AlertCircle, Loader2, Database } from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import type { EmploymentType, ExperienceLevel, JobStatus } from '../../types/index.ts';

export const JobEditorPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!jobId;

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Core Engineering');
  const [description, setDescription] = useState('');
  const [responsibilitiesStr, setResponsibilitiesStr] = useState(
    'Architect resilient microservices\nConduct code reviews and system design sessions\nProfile and tune database query execution plans'
  );
  const [skillsStr, setSkillsStr] = useState('TypeScript, React, Node.js, PostgreSQL, Docker');
  const [location, setLocation] = useState('San Francisco, CA');
  const [isRemote, setIsRemote] = useState(true);
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('SENIOR');
  const [salaryMin, setSalaryMin] = useState(150000);
  const [salaryMax, setSalaryMax] = useState(210000);
  const [status, setStatus] = useState<JobStatus>('PUBLISHED');
  const [deadlineDays, setDeadlineDays] = useState(60);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && jobId) {
      setIsLoading(true);
      api.getJob(jobId).then((res) => {
        setIsLoading(false);
        if (res.success && res.data) {
          const j = res.data;
          setTitle(j.title);
          setDepartment(j.department || 'Engineering');
          setDescription(j.description);
          setResponsibilitiesStr(j.responsibilities?.join('\n') || '');
          setSkillsStr(j.requiredSkills?.join(', ') || '');
          setLocation(j.location);
          setIsRemote(j.isRemote);
          setEmploymentType(j.employmentType);
          setExperienceLevel(j.experienceLevel);
          setSalaryMin(j.salaryMin);
          setSalaryMax(j.salaryMax);
          setStatus(j.status);
        }
      });
    }
  }, [isEditing, jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const responsibilities = responsibilitiesStr
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const requiredSkills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const applicationDeadline = new Date(Date.now() + deadlineDays * 86400000).toISOString();

    const payload = {
      title,
      department,
      description,
      responsibilities,
      requiredSkills,
      location,
      isRemote,
      employmentType,
      experienceLevel,
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      status,
      applicationDeadline,
    };

    try {
      if (isEditing && jobId) {
        const res = await api.updateJob(jobId, payload);
        if (res.success) {
          navigate('/recruiter/jobs');
        } else {
          setError(res.message || 'Failed to update job posting');
        }
      } else {
        const res = await api.createJob(payload);
        if (res.success) {
          navigate('/recruiter/jobs');
        } else {
          setError(res.message || 'Failed to create job posting');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Vacancies</span>
        </Link>
      </div>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isEditing ? 'Edit Job Vacancy' : 'Create New Engineering Vacancy'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          API 7: Persists to PostgreSQL, invalidates Redis query caches, and publishes to Transactional Outbox
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Distributed Systems Engineer"
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
            >
              <option value="ENTRY">Entry (0-2 yrs)</option>
              <option value="MID">Mid (3-5 yrs)</option>
              <option value="SENIOR">Senior (6+ yrs)</option>
              <option value="LEAD">Lead / Principal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Vacancy Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
            >
              <option value="PUBLISHED">Published (Open)</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Minimum ($/yr)</label>
            <input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Maximum ($/yr)</label>
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              Allow Remote Work
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Required Technical Skills (comma-separated)
          </label>
          <input
            type="text"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Job Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe role impact, mission, team structure, and engineering culture..."
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Key Responsibilities (one per line)
          </label>
          <textarea
            value={responsibilitiesStr}
            onChange={(e) => setResponsibilitiesStr(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/recruiter/jobs"
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors shadow-xs disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving Posting...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isEditing ? 'Save Changes' : 'Publish Vacancy'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
