import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Zap,
  Server,
  Layers,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/apiClient.ts';
import { useAuth } from '../context/AuthContext.tsx';
import type { Job, Company } from '../types/index.ts';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, switchUser } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobsRes, compsRes] = await Promise.all([
          api.getJobs({ limit: 4, sort: 'newest' }),
          api.getCompanies(),
        ]);
        if (jobsRes.success && jobsRes.data) {
          setFeaturedJobs(jobsRes.data);
        }
        if (compsRes.success && compsRes.data) {
          setCompanies(compsRes.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load landing data', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (location.trim()) params.append('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Hackathon Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 mb-6 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Round 2 (LLD 30 Marks) + Round 3 (HLD 25 Marks) System Design</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl max-w-4xl mx-auto">
            Where Elite Engineers Meet{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mission-Critical Infrastructure
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A production-ready recruitment platform engineered for scale. Built with clean RESTful API contracts,
            transactional outbox events, Redis cache-aside topology, and multi-tier microservice architecture.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 mx-auto max-w-3xl rounded-2xl bg-white p-2.5 shadow-xl border border-slate-200/90 flex flex-col md:flex-row gap-2"
          >
            <div className="flex flex-1 items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Job title, skills (e.g. Distributed Systems, React, Go)..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-1 items-center gap-2.5 px-3 py-2">
              <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Location or 'Remote'..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 shrink-0"
            >
              <span>Search Openings</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* System Design Persona Switch Shortcuts */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Quick Persona Test:</span>
            <button
              onClick={() => switchUser('user-seeker-1').then(() => navigate('/seeker/dashboard'))}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-2xs"
            >
              Candidate (Alex Rivera)
            </button>
            <button
              onClick={() => switchUser('user-recruiter-1').then(() => navigate('/recruiter/dashboard'))}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:border-purple-300 hover:text-purple-600 transition-colors shadow-2xs"
            >
              Recruiter (Sarah Chen @ TechCorp)
            </button>
            <button
              onClick={() => switchUser('user-admin-1').then(() => navigate('/admin/dashboard'))}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:border-rose-300 hover:text-rose-600 transition-colors shadow-2xs"
            >
              Admin (Marcus Vance)
            </button>
          </div>
        </div>
      </section>

      {/* Architecture Highlights Banner */}
      <section className="border-b border-slate-200 bg-slate-900 py-6 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-center">
            <div className="border-r border-slate-800 last:border-0 p-2">
              <div className="text-xl sm:text-2xl font-black text-blue-400">100K+ writes/s</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Target Scalability Design</div>
            </div>
            <div className="border-r border-slate-800 last:border-0 p-2">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">&lt; 10ms</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Redis Cache-Aside Latency</div>
            </div>
            <div className="border-r border-slate-800 last:border-0 p-2">
              <div className="text-xl sm:text-2xl font-black text-purple-400">At-Least-Once</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Transactional Outbox Delivery</div>
            </div>
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-black text-amber-400">Zero Duplicates</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Idempotency & PG Constraints</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Opportunities</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">High-impact engineering roles with verified salary bands</p>
          </div>
          <Link
            to="/jobs"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>View all 8+ jobs</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                      {job.department}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5 hover:text-blue-600 cursor-pointer">
                      <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-semibold">{job.company?.name || 'TechCorp'}</span>
                      <span>•</span>
                      <span>{job.location} {job.isRemote && '(Remote)'}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {job.employmentType.replace('_', ' ')}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {job.requiredSkills.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      {s}
                    </span>
                  ))}
                  {job.requiredSkills.length > 4 && (
                    <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">
                      +{job.requiredSkills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="text-xs font-bold text-slate-900">
                  ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                  <span className="text-[10px] font-normal text-slate-500"> / year</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Details
                  </Link>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Companies */}
      <section className="border-t border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Trusted by High-Growth Technology Leaders
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Top infrastructure and enterprise AI companies hiring on HireFlow
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {companies.map((c) => (
              <Link
                key={c.id}
                to={`/companies`}
                className="rounded-2xl border border-slate-200 p-4 text-center hover:border-blue-300 hover:shadow-xs transition-all bg-slate-50/50"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-2xs border border-slate-200 font-bold text-slate-800 text-sm">
                  {c.name.charAt(0)}
                </div>
                <div className="mt-2 text-xs font-bold text-slate-900 truncate">{c.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{c.industry}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* System Design Workflow (Section 6) */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-purple-800 mb-2">
              <Layers className="h-3.5 w-3.5 text-purple-600" />
              <span>Round 2 + Round 3 Specification</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              End-to-End Recruitment Workflow Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Deterministic state transitions backed by PostgreSQL, Redis Cache-Aside, and Transactional Outbox
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-3">Search & Caching</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Candidate queries jobs via <code className="text-blue-600 font-mono text-[11px]">GET /api/jobs</code>. Checked against Redis Cache-Aside with sub-5ms response time.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-3">Transactional Apply</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <code className="text-indigo-600 font-mono text-[11px]">POST /api/jobs/:id/applications</code> verifies resume ownership, enforces duplicate application checks, and records PostgreSQL row.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-3">Transactional Outbox</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Publishes <code className="text-purple-600 font-mono text-[11px]">application.created</code> event. Background daemon delivers notifications to Recruiter & Applicant asynchronously.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-3">Status Lifecycle</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Recruiter reviews resume and updates status to Shortlisted, Interview, or Offered with full audit log and candidate notification timeline.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/system/architecture"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-purple-800 transition-colors shadow-xs"
            >
              <span>Explore High-Level System Architecture</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-[11px]">
              H
            </div>
            <span className="font-bold text-slate-800">HireFlow Platform</span>
            <span>— System Design Hackathon Submission</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <Link to="/jobs" className="hover:text-blue-600">Jobs</Link>
            <Link to="/system/architecture" className="hover:text-blue-600">Architecture</Link>
            <Link to="/api-explorer" className="hover:text-blue-600">API Explorer</Link>
            <Link to="/system/infrastructure" className="hover:text-blue-600">Redis & Outbox Lab</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
