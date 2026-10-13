import React, { useState, useEffect } from 'react';
import { History, Shield, Calendar, User, Search } from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import type { AuditLog } from '../../types/index.ts';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs().then((res) => {
      if (res.success && res.data) {
        setLogs(res.data);
      }
      setIsLoading(false);
    });
  }, []);

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.actorName.toLowerCase().includes(q) ||
      l.resourceId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Security Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable event log tracking recruiter and administrative state transitions, uploads, and deletions
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs max-w-md">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by action, actor, or resource ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 uppercase text-[10px]">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Resource</th>
              <th className="py-3 px-4">Payload Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-800 font-sans">{log.actorName}</div>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                      log.actorRole === 'ADMIN'
                        ? 'bg-rose-100 text-rose-800'
                        : log.actorRole === 'RECRUITER'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {log.actorRole}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                <td className="py-3 px-4 text-blue-600">
                  {log.resourceType}:{log.resourceId}
                </td>
                <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                  {log.details ? JSON.stringify(log.details) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
