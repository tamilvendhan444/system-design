import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import type { User, Role } from '../../types/index.ts';

export const AdminUsersPage: React.FC = () => {
  const { switchUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getDemoUsers().then((res) => {
      if (res.success && res.data) {
        setUsers(res.data);
      }
      setIsLoading(false);
    });
  }, []);

  const filtered = users.filter((u) => {
    if (filterRole && u.role !== filterRole) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Governance Directory</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Role-Based Access Control (RBAC) user database management and active persona switching
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:outline-none shadow-2xs"
          >
            <option value="">All Roles (Seeker, Recruiter, Admin)</option>
            <option value="JOB_SEEKER">Job Seekers</option>
            <option value="RECRUITER">Recruiters</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 uppercase text-[10px]">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Organization</th>
              <th className="py-3 px-4">Skills / Specialization</th>
              <th className="py-3 px-4 text-right">Switch Persona</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900">{u.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      u.role === 'ADMIN'
                        ? 'bg-rose-100 text-rose-800'
                        : u.role === 'RECRUITER'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {u.companyId ? 'TechCorp Solutions' : 'Independent Candidate'}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {u.headline || u.skills?.slice(0, 3).join(', ') || 'Software Engineer'}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => switchUser(u.id)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                  >
                    Act as User
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
