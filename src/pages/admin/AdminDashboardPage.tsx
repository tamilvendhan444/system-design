import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Building,
  Briefcase,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Terminal,
  ArrowRight,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/apiClient.ts';

export const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [anaRes, healthRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getSystemHealth(),
      ]);
      if (anaRes.success && anaRes.data) setAnalytics(anaRes.data);
      if (healthRes.success && healthRes.data) setHealth(healthRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetDemo = async () => {
    if (!confirm('Reset all PostgreSQL records and Redis cache to initial pristine hackathon demo seed?')) return;
    await api.resetDemoData();
    await fetchData();
    alert('Database and cache reset to default demo seed!');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-700 to-indigo-900 p-6 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-rose-100">
              <ShieldAlert className="h-3 w-3" />
              Platform Governance & Architecture
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">
              HireFlow Administrator Console
            </h1>
            <p className="text-xs text-rose-100 mt-0.5 max-w-xl">
              Platform-wide moderation, RBAC user governance, distributed system observability, and cache health.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/system/architecture"
              className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-rose-800 hover:bg-rose-50 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Layers className="h-4 w-4" />
              <span>HLD System Design</span>
            </Link>
            <button
              onClick={handleResetDemo}
              className="rounded-xl bg-rose-600/60 border border-white/30 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-600/80 transition-colors flex items-center gap-1.5"
              title="Reset DB & Cache to default seed"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Demo Seed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Platform-wide Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Registered Users</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {analytics?.totalUsers ?? 5}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {analytics?.userRoleBreakdown?.seekers || 2} Seekers • {analytics?.userRoleBreakdown?.recruiters || 2} Recruiters
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Partner Companies</span>
            <Building className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600">
            {analytics?.totalCompanies ?? 5}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Enterprise verified employers</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Platform Job Vacancies</span>
            <Briefcase className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {analytics?.totalJobs ?? 8}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {analytics?.jobStatusBreakdown?.published || 8} Published live
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Submissions</span>
            <FileText className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">
            {analytics?.totalApplications ?? 3}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Audited application rows</div>
        </div>
      </div>

      {/* Growth Trends & Service Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trends Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Platform Application Volume & Job Scale
              </h3>
              <p className="text-[11px] text-slate-400">Monthly throughput trendline</p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">PostgreSQL Aggregates</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.trends || []}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="jobs" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Service Health preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              <span>Microservice Cluster Health</span>
            </h3>
            <Link to="/system/architecture" className="text-[10px] text-blue-600 hover:underline">
              Full Mesh
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {health?.services?.slice(0, 5).map((srv: any) => (
              <div key={srv.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">{srv.name}</div>
                  <div className="text-[10px] text-slate-400">{srv.latencyMs}ms latency</div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                  {srv.status}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Cache hit ratio:</span>
            <strong className="text-slate-800 font-mono">
              {((health?.cacheMetrics?.hitRatio || 0) * 100).toFixed(1)}%
            </strong>
          </div>
        </div>
      </div>

      {/* Governance Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-300 transition-all flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-slate-900 text-sm">User Directory</div>
            <div className="text-[11px] text-slate-500">Manage candidate and recruiter credentials</div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </Link>

        <Link
          to="/admin/jobs"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-purple-300 transition-all flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-slate-900 text-sm">Job Moderation</div>
            <div className="text-[11px] text-slate-500">Review, flag, and remove listings</div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
        </Link>

        <Link
          to="/admin/audit-logs"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-rose-300 transition-all flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-slate-900 text-sm">Audit Trail</div>
            <div className="text-[11px] text-slate-500">Inspect sensitive state mutations</div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
};
