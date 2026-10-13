import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Search, Trash2, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import type { Job } from '../../types/index.ts';

export const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getJobs({ limit: 50 });
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId: string) => {
    if (!confirm('Admin Moderation: Permanently delete this job vacancy and flush Redis keys?')) return;
    await api.deleteJob(jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const filtered = jobs.filter((j) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return j.title.toLowerCase().includes(q) || j.company?.name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Vacancy Moderation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Platform-wide job vacancy supervision, compliance monitoring, and cache purge
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs max-w-md">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Filter by job title or employer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 uppercase text-[10px]">
              <th className="py-3 px-4">Job Title</th>
              <th className="py-3 px-4">Employer</th>
              <th className="py-3 px-4">Salary Band</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Applicants</th>
              <th className="py-3 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((j) => (
              <tr key={j.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900">{j.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">ID: {j.id}</div>
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium">{j.company?.name || 'Company'}</td>
                <td className="py-3 px-4 text-slate-800 font-semibold">
                  ${(j.salaryMin / 1000).toFixed(0)}k - ${(j.salaryMax / 1000).toFixed(0)}k
                </td>
                <td className="py-3 px-4">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {j.status}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-blue-600">{j.applicantCount || 0}</td>
                <td className="py-3 px-4 text-right space-x-2">
                  <Link
                    to={`/jobs/${j.id}`}
                    className="inline-block rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                    title="View Job"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(j.id)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Job"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
