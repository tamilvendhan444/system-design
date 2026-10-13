import React, { useState, useEffect } from 'react';
import {
  Zap,
  HardDrive,
  Trash2,
  RefreshCw,
  Mail,
  Send,
  Layers,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';

export const InfrastructureLabPage: React.FC = () => {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [eventStats, setEventStats] = useState<any>(null);
  const [testQuery, setTestQuery] = useState('distributed systems');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [cacheRes, eventRes] = await Promise.all([
        api.getCacheStats(),
        api.getSystemEvents(),
      ]);
      if (cacheRes.success && cacheRes.data) setCacheStats(cacheRes.data);
      if (eventRes.success && eventRes.data) setEventStats(eventRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleFlushCache = async () => {
    await api.flushCache();
    await fetchData();
    alert('Redis cache flushed! All subsequent queries will query PostgreSQL (Cache MISS).');
  };

  const handleTestQuery = async () => {
    setIsLoadingTest(true);
    try {
      const res = await api.getJobs({ keyword: testQuery, limit: 3 });
      setTestResult(res);
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTest(false);
    }
  };

  const handleManualDispatch = async () => {
    await api.dispatchEvents();
    await fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Redis Caching & Event Bus Laboratory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live inspection of Cache-Aside topology (Section 9) and Transactional Outbox queue processing (Section 11)
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Poll Telemetry</span>
          </button>
        </div>
      </div>

      {/* SECTION 9: REDIS CACHE-ASIDE TEST RIG */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Redis Cache-Aside Pattern</h2>
              <div className="text-xs text-slate-500">TTL Countdown, Key Invalidation, and Real-Time Hit Ratio</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
              Redis Cluster Simulation Active
            </span>
            <button
              onClick={handleFlushCache}
              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Flush All Keys</span>
            </button>
          </div>
        </div>

        {/* Cache Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Cache Hits</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {cacheStats?.metrics?.hits ?? 0}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Cache Misses</div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {cacheStats?.metrics?.misses ?? 0}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Hit Ratio</div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {((cacheStats?.metrics?.hitRatio ?? 0) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Active Keys</div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {cacheStats?.metrics?.keysCount ?? 0}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Memory (KB)</div>
            <div className="text-2xl font-black text-purple-600 mt-1">
              {cacheStats?.metrics?.memoryUsedKb ?? 0}
            </div>
          </div>
        </div>

        {/* Live Query Simulator */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Search className="h-4 w-4 text-blue-600" />
            <span>Interactive Cache-Aside Query Tester</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Submit a query to test cache behavior. The 1st request triggers a <strong>PostgreSQL Cache MISS</strong>.
            The 2nd identical request returns in <strong>0ms from Redis Cache HIT</strong>!
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Query keyword (e.g. distributed systems, react, lead)..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none"
            />
            <button
              onClick={handleTestQuery}
              disabled={isLoadingTest}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              {isLoadingTest ? 'Executing Query...' : 'Test Cache Lookup'}
            </button>
          </div>

          {testResult && (
            <div className="rounded-xl bg-white p-3 border border-slate-200 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Response Origin:</span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    testResult.source === 'cache'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {testResult.source === 'cache' ? '⚡ REDIS CACHE HIT (0ms)' : '🐘 POSTGRESQL QUERY (Cache Miss)'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Found {testResult.data?.length || 0} matching jobs in database. Key saved to Redis with 60s TTL.
              </div>
            </div>
          )}
        </div>

        {/* Live Redis Keys List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Live Cache Keys Stored in Memory
          </h4>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] text-emerald-400 space-y-1.5">
            {cacheStats?.keys?.length > 0 ? (
              cacheStats.keys.map((k: any) => (
                <div key={k.key} className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-200 truncate max-w-md">{k.key}</span>
                  <div className="flex items-center gap-3 shrink-0 text-slate-400 text-[10px]">
                    <span className="text-amber-400 font-semibold">{k.ttlSeconds}s TTL</span>
                    <span>{k.hitCount} Hits</span>
                    <span>{(k.sizeBytes / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center py-4">No active cache keys. Run a search to populate.</div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 11: TRANSACTIONAL OUTBOX & EVENT BROKER LAB */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Transactional Outbox & RabbitMQ / Kafka Stream
              </h2>
              <div className="text-xs text-slate-500">
                Reliable asynchronous message bus preventing dual-write state inconsistency
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualDispatch}
              className="flex items-center gap-1 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition-colors shadow-xs"
            >
              <Send className="h-3 w-3" />
              <span>Poll & Dispatch Worker</span>
            </button>
          </div>
        </div>

        {/* Queue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Pending in Outbox</div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {eventStats?.pendingCount ?? 0}
            </div>
            <div className="text-[10px] text-slate-400">Awaiting daemon poll</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Processed Events</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {eventStats?.processedTotal ?? 3}
            </div>
            <div className="text-[10px] text-slate-400">Delivered successfully</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Dead-Letter Queue</div>
            <div className="text-2xl font-black text-slate-700 mt-1">
              {eventStats?.deadLetterQueueCount ?? 0}
            </div>
            <div className="text-[10px] text-slate-400">Exceeded 3 retries</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Delivery Guarantee</div>
            <div className="text-base font-bold text-purple-700 mt-1">At-Least-Once</div>
            <div className="text-[10px] text-slate-400">Transactional ACID</div>
          </div>
        </div>

        {/* Stream of Recent Outbox Events */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Recent Event Bus Stream (Outbox Table)
          </h4>
          <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Aggregate ID</th>
                  <th className="py-2.5 px-3">Payload Preview</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {eventStats?.recentEvents?.map((evt: any) => (
                  <tr key={evt.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-purple-700">{evt.eventType}</td>
                    <td className="py-2.5 px-3 text-slate-700">{evt.aggregateId}</td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                      {JSON.stringify(evt.payload)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 text-[10px]">
                      {new Date(evt.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Simulated Email SMTP Logs */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-blue-600" />
            <span>Asynchronous Email Delivery Logs (Amazon SES / SMTP Simulation)</span>
          </h4>
          <div className="space-y-2">
            {eventStats?.smtpLogs?.length > 0 ? (
              eventStats.smtpLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs space-y-1 font-mono"
                >
                  <div className="flex items-center justify-between text-slate-700 font-bold">
                    <span>To: {log.to}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {new Date(log.sentAt).toLocaleTimeString()} • {log.provider}
                    </span>
                  </div>
                  <div className="text-blue-700 font-semibold">{log.subject}</div>
                  <div className="text-[11px] text-slate-600 whitespace-pre-line font-sans">
                    {log.body}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                No email dispatches yet. Submit an application to trigger email generation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
