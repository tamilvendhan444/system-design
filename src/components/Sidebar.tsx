import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  User,
  PlusCircle,
  Users,
  Building,
  BarChart3,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Briefcase,
  History,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const Sidebar: React.FC = () => {
  const { role, user } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-xs font-semibold'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* Role Portal Banner */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Active Workspace
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              {role === 'ADMIN'
                ? 'Platform Administrator'
                : role === 'RECRUITER'
                ? `${user?.company?.name || 'Recruiter'} Hub`
                : 'Job Seeker Portal'}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                role === 'ADMIN'
                  ? 'bg-rose-100 text-rose-800'
                  : role === 'RECRUITER'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {role}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation according to Role */}
        {role === 'JOB_SEEKER' && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Candidate Workspace
            </div>
            <NavLink to="/seeker/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard Overview</span>
            </NavLink>
            <NavLink to="/jobs" className={navLinkClass}>
              <Search className="h-4 w-4" />
              <span>Search & Filter Jobs</span>
            </NavLink>
            <NavLink to="/applications" className={navLinkClass}>
              <FileText className="h-4 w-4" />
              <span>My Applications & Status</span>
            </NavLink>
            <NavLink to="/saved-jobs" className={navLinkClass}>
              <Bookmark className="h-4 w-4" />
              <span>Saved Jobs</span>
            </NavLink>
            <NavLink to="/resumes" className={navLinkClass}>
              <Briefcase className="h-4 w-4" />
              <span>Resume Management</span>
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              <User className="h-4 w-4" />
              <span>My Profile & Skills</span>
            </NavLink>
          </div>
        )}

        {role === 'RECRUITER' && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Recruiter Workspace
            </div>
            <NavLink to="/recruiter/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Recruiter Dashboard</span>
            </NavLink>
            <NavLink to="/recruiter/jobs" className={navLinkClass}>
              <Briefcase className="h-4 w-4" />
              <span>Manage Job Postings</span>
            </NavLink>
            <NavLink to="/recruiter/jobs/new" className={navLinkClass}>
              <PlusCircle className="h-4 w-4" />
              <span>Post New Job</span>
            </NavLink>
            <NavLink to="/recruiter/applicants" className={navLinkClass}>
              <Users className="h-4 w-4" />
              <span>Candidate Pipeline</span>
            </NavLink>
            <NavLink to="/recruiter/company" className={navLinkClass}>
              <Building className="h-4 w-4" />
              <span>Company Profile</span>
            </NavLink>
            <NavLink to="/recruiter/analytics" className={navLinkClass}>
              <BarChart3 className="h-4 w-4" />
              <span>Recruitment Analytics</span>
            </NavLink>
          </div>
        )}

        {role === 'ADMIN' && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Administration
            </div>
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </NavLink>
            <NavLink to="/admin/users" className={navLinkClass}>
              <Users className="h-4 w-4" />
              <span>User Governance</span>
            </NavLink>
            <NavLink to="/admin/companies" className={navLinkClass}>
              <Building className="h-4 w-4" />
              <span>Company Directory</span>
            </NavLink>
            <NavLink to="/admin/jobs" className={navLinkClass}>
              <Briefcase className="h-4 w-4" />
              <span>Job Moderation</span>
            </NavLink>
            <NavLink to="/admin/analytics" className={navLinkClass}>
              <BarChart3 className="h-4 w-4" />
              <span>Platform Metrics</span>
            </NavLink>
            <NavLink to="/admin/audit-logs" className={navLinkClass}>
              <History className="h-4 w-4" />
              <span>Audit Trail</span>
            </NavLink>
          </div>
        )}

        {/* System Design Sections (Mandatory Hackathon deliverables) */}
        <div className="pt-2 border-t border-slate-100 space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-2 flex items-center justify-between">
            <span>System Design Lab</span>
            <span className="rounded bg-purple-100 px-1 py-0.2 text-[8px] text-purple-700">R2 + R3</span>
          </div>
          <NavLink to="/system/architecture" className={navLinkClass}>
            <Layers className="h-4 w-4 text-purple-500" />
            <span>HLD Architecture</span>
          </NavLink>
          <NavLink to="/system/infrastructure" className={navLinkClass}>
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Redis & Outbox Lab</span>
          </NavLink>
          <NavLink to="/api-explorer" className={navLinkClass}>
            <Terminal className="h-4 w-4 text-emerald-500" />
            <span>LLD REST API Explorer</span>
          </NavLink>
        </div>
      </div>

      {/* System Health Status Footer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-slate-700">Microservices: Online</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Latency: ~6ms</span>
          <span className="font-mono">Cluster: OK</span>
        </div>
      </div>
    </aside>
  );
};
