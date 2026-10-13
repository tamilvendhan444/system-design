import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Bell,
  Cpu,
  Layers,
  UserCheck,
  ChevronDown,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/apiClient.ts';
import type { Notification } from '../types/index.ts';

export const Navbar: React.FC = () => {
  const { user, role, demoUsers, unreadNotifsCount, switchUser, refreshNotifs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

  const handleOpenNotifs = async () => {
    setShowNotifMenu(!showNotifMenu);
    if (!showNotifMenu) {
      setIsLoadingNotifs(true);
      try {
        const res = await api.getNotifications();
        if (res.success && res.data) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {
        // ignore
      } finally {
        setIsLoadingNotifs(false);
      }
    }
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    await refreshNotifs();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleSelectRoleUser = async (userId: string) => {
    setShowRoleMenu(false);
    await switchUser(userId);
    // Route to appropriate dashboard
    const target = demoUsers.find((u) => u.id === userId);
    if (target?.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (target?.role === 'RECRUITER') {
      navigate('/recruiter/dashboard');
    } else {
      navigate('/seeker/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900">HireFlow</span>
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                  LLD + HLD
                </span>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/jobs"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                location.pathname.startsWith('/jobs')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Explore Jobs
            </Link>
            <Link
              to="/companies"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                location.pathname.startsWith('/companies')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Companies
            </Link>

            {/* Quick dashboard link according to active role */}
            <Link
              to={
                role === 'ADMIN'
                  ? '/admin/dashboard'
                  : role === 'RECRUITER'
                  ? '/recruiter/dashboard'
                  : '/seeker/dashboard'
              }
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                location.pathname.includes('/dashboard')
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {role === 'ADMIN' ? 'Admin Portal' : role === 'RECRUITER' ? 'Recruiter Hub' : 'My Dashboard'}
            </Link>
          </nav>
        </div>

        {/* Center: System Design Highlights Badge */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            to="/system/architecture"
            className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50/70 px-2.5 py-1 text-xs font-medium text-purple-800 hover:bg-purple-100 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-purple-600" />
            <span>HLD Architecture</span>
          </Link>
          <Link
            to="/api-explorer"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Cpu className="h-3.5 w-3.5 text-emerald-600" />
            <span>LLD REST APIs</span>
          </Link>
          <Link
            to="/system/infrastructure"
            className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Redis & Outbox Lab</span>
          </Link>
        </div>

        {/* Right: Notifications, Active Persona Switcher, Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={handleOpenNotifs}
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                  </div>
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {isLoadingNotifs ? (
                    <div className="p-4 text-center text-xs text-slate-400">Loading events...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`rounded-lg p-2.5 text-xs transition-colors ${
                          n.isRead ? 'bg-slate-50/60 text-slate-600' : 'bg-blue-50/80 text-slate-800 border-l-2 border-blue-600'
                        }`}
                      >
                        <div className="font-medium text-slate-900 mb-0.5">{n.title}</div>
                        <p className="text-slate-600 line-clamp-2">{n.message}</p>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {n.link && (
                            <Link
                              to={n.link}
                              onClick={() => setShowNotifMenu(false)}
                              className="text-blue-600 hover:underline flex items-center gap-0.5"
                            >
                              View details <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Persona Switcher Widget */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-left text-xs hover:border-slate-300 hover:bg-slate-100 transition-all shadow-xs"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs ${
                  role === 'ADMIN'
                    ? 'bg-rose-600'
                    : role === 'RECRUITER'
                    ? 'bg-purple-600'
                    : 'bg-blue-600'
                }`}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-slate-900 leading-tight flex items-center gap-1">
                  {user?.name || 'User'}
                  <span
                    className={`rounded px-1 text-[9px] font-bold uppercase tracking-wider ${
                      role === 'ADMIN'
                        ? 'bg-rose-100 text-rose-800'
                        : role === 'RECRUITER'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {role === 'ADMIN' ? 'Admin' : role === 'RECRUITER' ? 'Recruiter' : 'Seeker'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {role === 'RECRUITER' ? user?.company?.name || 'Recruiter' : user?.email}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Persona Switch Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Persona
                </div>
                <div className="space-y-1 mt-1">
                  {demoUsers.map((u) => {
                    const isSelected = u.id === user?.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectRoleUser(u.id)}
                        className={`w-full flex items-center justify-between rounded-lg p-2 text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-900 border border-blue-200 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white ${
                              u.role === 'ADMIN'
                                ? 'bg-rose-600'
                                : u.role === 'RECRUITER'
                                ? 'bg-purple-600'
                                : 'bg-blue-600'
                            }`}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{u.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {u.role === 'ADMIN'
                                ? 'Platform Governance'
                                : u.role === 'RECRUITER'
                                ? `Recruiter @ ${u.company?.name || 'TechCorp'}`
                                : 'Candidate / Engineer'}
                            </div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 border-t border-slate-100 pt-2 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowRoleMenu(false)}
                    className="block rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Manage Profile & Skills
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setShowRoleMenu(false)}
                    className="block rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Sign In with Another Account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
