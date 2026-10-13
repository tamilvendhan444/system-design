import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  DollarSign,
  Briefcase,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  Zap,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/apiClient.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ApplyModal } from '../components/ApplyModal.tsx';
import type { Job, EmploymentType, ExperienceLevel, PaginationMeta } from '../types/index.ts';

export const JobSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [employmentType, setEmploymentType] = useState<string>(searchParams.get('employmentType') || '');
  const [experienceLevel, setExperienceLevel] = useState<string>(searchParams.get('experienceLevel') || '');
  const [isRemote, setIsRemote] = useState<boolean>(searchParams.get('isRemote') === 'true');
  const [minSalary, setMinSalary] = useState<string>(searchParams.get('minSalary') || '');
  const [sort, setSort] = useState<string>(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10));

  const [jobs, setJobs] = useState<Job[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [dataSource, setDataSource] = useState<'cache' | 'database' | 'search-engine'>('database');
  const [isLoading, setIsLoading] = useState(true);

  // Apply Modal state
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getJobs({
        keyword,
        location,
        employmentType: employmentType || undefined,
        experienceLevel: experienceLevel || undefined,
        isRemote: isRemote ? 'true' : undefined,
        minSalary: minSalary || undefined,
        sort,
        page,
        limit: 6,
      });

      if (res.success && res.data) {
        setJobs(res.data);
        if (res.meta) setMeta(res.meta);
        if (res.source) setDataSource(res.source);
      }
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [keyword, location, employmentType, experienceLevel, isRemote, minSalary, sort, page]);

  const handleApplyClick = (job: Job) => {
    setSelectedJobForApply(job);
    setIsApplyModalOpen(true);
  };

  const handleToggleSave = async (jobId: string, currentSaved: boolean) => {
    try {
      if (currentSaved) {
        await api.unsaveJob(jobId);
      } else {
        await api.saveJob(jobId);
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isSaved: !currentSaved } : j))
      );
    } catch (err) {
      console.error('Could not toggle save', err);
    }
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setEmploymentType('');
    setExperienceLevel('');
    setIsRemote(false);
    setMinSalary('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Search Bar Header */}
      <div className="border-b border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Job Search Engine
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                API 1: Full-Text Query, Multi-Facet Filters & Redis Cache-Aside
              </p>
            </div>

            {/* Live Cache Hit/Miss Telemetry Badge */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
                  dataSource === 'cache'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-blue-50 text-blue-800 border-blue-300'
                }`}
              >
                {dataSource === 'cache' ? (
                  <>
                    <Zap className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                    <span>Redis Cache HIT (0ms)</span>
                  </>
                ) : (
                  <>
                    <Database className="h-3.5 w-3.5 text-blue-600" />
                    <span>PostgreSQL Indexed Query (6ms)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search Inputs */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xs">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search job title, tech stack (e.g. Go, React, Kafka)..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400"
              />
            </div>

            <div className="md:col-span-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xs">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Location (e.g. San Francisco, Chennai, Remote)..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400"
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:outline-none"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="salary_high">Sort: Highest Salary</option>
                <option value="salary_low">Sort: Lowest Salary</option>
                <option value="deadline">Sort: Application Deadline</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Filters Sidebar + Job Listings */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                  <Filter className="h-3.5 w-3.5 text-blue-600" />
                  <span>Refine Results</span>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>

              {/* Remote Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer rounded-xl bg-slate-50 p-2.5 border border-slate-200/80">
                  <span className="text-xs font-semibold text-slate-700">Remote Only</span>
                  <input
                    type="checkbox"
                    checked={isRemote}
                    onChange={(e) => {
                      setIsRemote(e.target.checked);
                      setPage(1);
                    }}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Employment Type
                </label>
                <div className="space-y-1.5">
                  {[
                    { value: '', label: 'All Types' },
                    { value: 'FULL_TIME', label: 'Full Time' },
                    { value: 'CONTRACT', label: 'Contract' },
                    { value: 'PART_TIME', label: 'Part Time' },
                    { value: 'INTERNSHIP', label: 'Internship' },
                  ].map((t) => (
                    <label
                      key={t.value}
                      className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900"
                    >
                      <input
                        type="radio"
                        name="employmentType"
                        value={t.value}
                        checked={employmentType === t.value}
                        onChange={() => {
                          setEmploymentType(t.value);
                          setPage(1);
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Experience Level
                </label>
                <div className="space-y-1.5">
                  {[
                    { value: '', label: 'All Levels' },
                    { value: 'ENTRY', label: 'Entry Level (0-2 yrs)' },
                    { value: 'MID', label: 'Mid Level (3-5 yrs)' },
                    { value: 'SENIOR', label: 'Senior (6+ yrs)' },
                    { value: 'LEAD', label: 'Lead / Principal' },
                  ].map((l) => (
                    <label
                      key={l.value}
                      className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900"
                    >
                      <input
                        type="radio"
                        name="experienceLevel"
                        value={l.value}
                        checked={experienceLevel === l.value}
                        onChange={() => {
                          setExperienceLevel(l.value);
                          setPage(1);
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{l.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Minimum Salary */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Minimum Salary ($/yr)
                </label>
                <select
                  value={minSalary}
                  onChange={(e) => {
                    setMinSalary(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="">Any Salary</option>
                  <option value="60000">$60,000+ / yr</option>
                  <option value="100000">$100,000+ / yr</option>
                  <option value="150000">$150,000+ / yr</option>
                  <option value="200000">$200,000+ / yr</option>
                </select>
              </div>
            </div>

            {/* REST API Contract Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-3.5 text-white font-mono text-[11px] space-y-1.5 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Low-Level Design Hook</div>
              <div className="text-emerald-400 font-bold">GET /api/jobs</div>
              <div className="text-slate-400 text-[10px] break-all leading-tight">
                ?keyword={keyword || 'all'}&page={page}&sort={sort}
              </div>
              <div className="text-slate-500 text-[10px] border-t border-slate-800 pt-1.5">
                TTL: 60s in Redis Cluster
              </div>
            </div>
          </div>

          {/* Job Listings Column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-800">{jobs.length}</strong> of{' '}
                <strong className="text-slate-800">{meta?.total || jobs.length}</strong> matching postings
              </span>
              <span>Page {page} of {meta?.totalPages || 1}</span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    <div className="h-10 bg-slate-50 rounded"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
                <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="text-base font-bold text-slate-800">No jobs found matching criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try broadening your keyword, removing location constraints, or clearing salary filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            {job.department}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {job.employmentType.replace('_', ' ')}
                          </span>
                          <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200/50">
                            {job.experienceLevel} Level
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mt-1 hover:text-blue-600 transition-colors">
                          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">{job.company?.name || 'Company'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {job.location} {job.isRemote && '(Remote Available)'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-900">
                            <DollarSign className="h-3 w-3 text-slate-400" />
                            ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k / yr
                          </span>
                        </div>

                        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Skill Badges */}
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {job.requiredSkills.map((s) => (
                            <span
                              key={s}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                        <button
                          onClick={() => handleToggleSave(job.id, !!job.isSaved)}
                          className={`rounded-xl p-2 transition-colors border ${
                            job.isSaved
                              ? 'border-amber-300 bg-amber-50 text-amber-600'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700'
                          }`}
                          title={job.isSaved ? 'Remove Bookmark' : 'Save Job'}
                        >
                          <Bookmark className={`h-4 w-4 ${job.isSaved ? 'fill-current' : ''}`} />
                        </button>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Details
                          </Link>

                          {job.hasApplied ? (
                            <span className="flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Applied
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApplyClick(job)}
                              className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <button
                      disabled={!meta.hasPrevPage}
                      onClick={() => setPage(page - 1)}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Previous Page
                    </button>
                    <span className="text-xs text-slate-500">
                      Page {page} of {meta.totalPages}
                    </span>
                    <button
                      disabled={!meta.hasNextPage}
                      onClick={() => setPage(page + 1)}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next Page
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        job={selectedJobForApply}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          if (selectedJobForApply) {
            setJobs((prev) =>
              prev.map((j) => (j.id === selectedJobForApply.id ? { ...j, hasApplied: true } : j))
            );
          }
        }}
      />
    </div>
  );
};
