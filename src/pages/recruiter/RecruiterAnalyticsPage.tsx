import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/apiClient.ts';

const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#6366f1', '#10b981', '#f43f5e'];

export const RecruiterAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getRecruiterAnalytics().then((res) => {
      if (res.success && res.data) {
        setData(res.data);
      }
      setIsLoading(false);
    });
  }, []);

  const pieData = data?.statusBreakdown
    ? [
        { name: 'Applied', value: data.statusBreakdown.APPLIED || 1 },
        { name: 'Under Review', value: data.statusBreakdown.UNDER_REVIEW || 1 },
        { name: 'Shortlisted', value: data.statusBreakdown.SHORTLISTED || 1 },
        { name: 'Interview', value: data.statusBreakdown.INTERVIEW || 1 },
        { name: 'Offered', value: data.statusBreakdown.OFFERED || 1 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Recruitment Pipeline Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          API 10: Aggregated conversion metrics, candidate velocity, and vacancy throughput
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Screening Velocity</div>
          <div className="mt-1 text-2xl font-black text-slate-900">1.8 Days</div>
          <div className="text-[10px] text-emerald-600 mt-0.5 font-semibold">↑ 42% faster than avg</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Interview Pass Rate</div>
          <div className="mt-1 text-2xl font-black text-purple-600">68.4%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Technical round benchmark</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Offer Acceptance</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">89.2%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Competitive compensation</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Pool Size</div>
          <div className="mt-1 text-2xl font-black text-blue-600">{data?.totalApplicants ?? 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active candidates</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
            Candidate Pipeline Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.pipelineChart || []}>
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="candidates" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
            Stage Distribution Percentage
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
