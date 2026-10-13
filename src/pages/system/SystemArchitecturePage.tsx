import React, { useState, useEffect } from 'react';
import {
  Layers,
  Cpu,
  Database,
  Zap,
  Activity,
  HardDrive,
  ShieldCheck,
  Server,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  GitBranch,
  Terminal,
  ExternalLink,
  Table,
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';

export const SystemArchitecturePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagram' | 'services' | 'database' | 'scaling' | 'health'>('diagram');
  const [selectedService, setSelectedService] = useState<string>('api-gateway');
  const [healthData, setHealthData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getSystemHealth();
      if (res.success && res.data) {
        setHealthData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const SERVICES = [
    {
      id: 'api-gateway',
      name: 'API Gateway & Reverse Proxy',
      tech: 'Envoy / NGINX / Express',
      tier: 'Edge & Ingress Tier',
      responsibilities: [
        'JWT token validation & header propagation (Bearer tokens)',
        'Rate limiting (Token Bucket: 100 req/min per IP / User)',
        'CORS preflight & Security headers (HSTS, CSP, X-Frame-Options)',
        'SSL termination & reverse proxy routing to upstream microservices',
      ],
      restPaths: ['/api/auth/*', '/api/jobs/*', '/api/applications/*', '/api/resumes/*'],
      persistence: 'Stateless (stores no state; in-memory rate limit token buckets)',
      scaling: 'Autoscaled horizontally behind AWS ALB / Cloudflare Anycast',
    },
    {
      id: 'auth-service',
      name: 'Authentication & User Service',
      tech: 'Node.js / Express / TypeScript',
      tier: 'Core Domain Tier',
      responsibilities: [
        'Argon2id password hashing and constant-time verification',
        'JWT issuance with short-lived access tokens and refresh token rotation',
        'Role-Based Access Control (JOB_SEEKER, RECRUITER, ADMIN)',
        'User profile taxonomy and skills index',
      ],
      restPaths: ['POST /api/auth/login', 'POST /api/auth/register', 'GET /api/auth/me'],
      persistence: 'PostgreSQL "User" table (unique email index, argon2 hash)',
      scaling: 'Stateless CPU-bound workers; horizontal replica pods',
    },
    {
      id: 'job-service',
      name: 'Job Vacancy & Catalog Service',
      tech: 'Node.js / PostgreSQL / Redis',
      tier: 'Core Domain Tier',
      responsibilities: [
        'Job vacancy lifecycle (DRAFT -> PUBLISHED -> CLOSED)',
        'Company ownership verification for recruiter mutations',
        'Cache-aside population into Redis cluster with 60s - 180s TTLs',
        'Publishes job.published and job.closed events to outbox',
      ],
      restPaths: ['GET /api/jobs', 'GET /api/jobs/:id', 'POST /api/jobs', 'PATCH /api/jobs/:id'],
      persistence: 'PostgreSQL "Job" table + Redis cluster key "jobs:query:*"',
      scaling: 'Read-heavy: served 95% from Redis cache replicas',
    },
    {
      id: 'app-service',
      name: 'Application & State Machine Service',
      tech: 'Node.js / PostgreSQL ACID Transactions',
      tier: 'Core Domain Tier',
      responsibilities: [
        'Strict duplicate prevention check (User x Job unique constraint)',
        'Atomically writes Application row and ApplicationStatusHistory record',
        'Transactional Outbox table insert (application.created, application.status_changed)',
        'Validates recruiter authority over job posting company before status update',
      ],
      restPaths: ['POST /api/jobs/:id/applications', 'GET /api/applications/:id/status', 'PATCH /api/applications/:id/status'],
      persistence: 'PostgreSQL "Application", "ApplicationStatusHistory", "OutboxEvent"',
      scaling: 'Read-write transactions with connection pooling (PgBouncer)',
    },
    {
      id: 'resume-service',
      name: 'Resume & Document Service',
      tech: 'Node.js / Amazon S3 Object Storage',
      tier: 'Content & Storage Tier',
      responsibilities: [
        'Issues presigned S3 upload URLs to prevent Gateway buffer exhaustion',
        'Parses candidate skills, experience years, and text summaries',
        'Verifies resume ownership before candidate application submission',
        'Enforces 10MB size limits and PDF/DOCX MIME type safety',
      ],
      restPaths: ['POST /api/resumes', 'GET /api/resumes', 'DELETE /api/resumes/:id'],
      persistence: 'PostgreSQL "Resume" metadata + Amazon S3 / GCS object buckets',
      scaling: 'High throughput binary streams bypass app servers via S3 direct upload',
    },
    {
      id: 'search-service',
      name: 'Search & Filtering Service',
      tech: 'Elasticsearch 8.x / PostgreSQL Full-Text',
      tier: 'Query Optimization Tier',
      responsibilities: [
        'BM25 full-text relevance ranking across titles, descriptions, and skills',
        'Multi-facet filtering: salary range, experience, employment type, location',
        'Elasticsearch cluster synchronization via Outbox event consumer',
        'Graceful fallback to PostgreSQL GIN indexes if Elasticsearch is degraded',
      ],
      restPaths: ['GET /api/jobs?keyword=...&location=...'],
      persistence: 'Elasticsearch Index "hireflow-jobs-v1" + PG GIN tsvector',
      scaling: 'Elasticsearch 3-node cluster with primary and replica shards',
    },
    {
      id: 'notif-service',
      name: 'Notification & Outbox Consumer Service',
      tech: 'RabbitMQ / Kafka Worker / Node.js',
      tier: 'Asynchronous Event Tier',
      responsibilities: [
        'Background consumer daemon polling Transactional Outbox events',
        'Dispatches in-app notifications to candidate and recruiter accounts',
        'Simulated SMTP email dispatch (Amazon SES / SendGrid)',
        'Dead-letter queue handling and exponential backoff retry policies',
      ],
      restPaths: ['GET /api/notifications', 'PATCH /api/notifications/:id/read'],
      persistence: 'PostgreSQL "Notification" table + RabbitMQ outbox queue',
      scaling: 'Parallel consumer workers bound to partition keys',
    },
    {
      id: 'analytics-service',
      name: 'Analytics & Aggregation Service',
      tech: 'PostgreSQL Read Replicas / ClickHouse',
      tier: 'Data & Reporting Tier',
      responsibilities: [
        'Aggregates recruiter funnel conversion rates (Applied -> Interview -> Offered)',
        'Computes time-to-hire and candidate velocity percentiles',
        'Supplies platform-wide telemetry and audit log rollups for administrators',
      ],
      restPaths: ['GET /api/analytics/job-seeker', 'GET /api/analytics/recruiter', 'GET /api/analytics/admin'],
      persistence: 'PostgreSQL Read-Replicas with cached dashboard summaries',
      scaling: 'Read-only queries routed away from write-primary master database',
    },
  ];

  const DATABASE_MODELS = [
    {
      name: 'User',
      fields: 'id (PK), name, email (UNIQUE), passwordHash, role, companyId (FK), skills, createdAt, updatedAt',
      indexes: 'UNIQUE INDEX (email), INDEX (role), INDEX (companyId)',
      purpose: 'Stores seeker, recruiter, and admin credentials with Argon2 hashes',
    },
    {
      name: 'Company',
      fields: 'id (PK), name, description, industry, website, logoUrl, location, size, createdAt',
      indexes: 'INDEX (name)',
      purpose: 'Enterprise employer profiles and branding metadata',
    },
    {
      name: 'Job',
      fields: 'id (PK), companyId (FK), recruiterId (FK), title, department, description, responsibilities, requiredSkills, location, isRemote, employmentType, experienceLevel, salaryMin, salaryMax, status, applicationDeadline, createdAt',
      indexes: 'INDEX (companyId), INDEX (status), INDEX (createdAt), GIN INDEX (title, description, location)',
      purpose: 'Job postings catalog with salary bounds and status lifecycle',
    },
    {
      name: 'Resume',
      fields: 'id (PK), userId (FK), filename, storageKey, contentType, size, summary, skills, experienceYears, isDefault, createdAt',
      indexes: 'INDEX (userId), UNIQUE (storageKey)',
      purpose: 'Candidate resume files with Amazon S3 object references',
    },
    {
      name: 'Application',
      fields: 'id (PK), userId (FK), jobId (FK), resumeId (FK), coverLetter, status, appliedAt, updatedAt',
      indexes: 'UNIQUE INDEX (userId, jobId), INDEX (jobId), INDEX (status), INDEX (appliedAt)',
      purpose: 'Enforces idempotency: exactly one active application per candidate per job',
    },
    {
      name: 'ApplicationStatusHistory',
      fields: 'id (PK), applicationId (FK), previousStatus, newStatus, changedBy (FK), changedByName, changedByRole, changedAt, note',
      indexes: 'INDEX (applicationId), INDEX (changedAt)',
      purpose: 'Immutable state transition timeline with timestamped actor audit logs',
    },
    {
      name: 'SavedJob',
      fields: 'id (PK), userId (FK), jobId (FK), createdAt',
      indexes: 'UNIQUE INDEX (userId, jobId)',
      purpose: 'Candidate bookmarks for quick future application',
    },
    {
      name: 'Notification',
      fields: 'id (PK), userId (FK), type, title, message, isRead, link, createdAt',
      indexes: 'INDEX (userId, isRead), INDEX (createdAt)',
      purpose: 'In-app event notifications generated by outbox consumers',
    },
    {
      name: 'OutboxEvent',
      fields: 'id (PK), eventType, aggregateId, aggregateType, payload (JSONB), status, retryCount, createdAt, processedAt, error',
      indexes: 'INDEX (status, createdAt)',
      purpose: 'Transactional Outbox pattern ensuring zero-data-loss event publishing',
    },
    {
      name: 'AuditLog',
      fields: 'id (PK), actorId (FK), actorName, actorRole, action, resourceType, resourceId, details (JSONB), createdAt',
      indexes: 'INDEX (actorId), INDEX (resourceType, resourceId), INDEX (createdAt)',
      purpose: 'Security compliance and regulatory audit trail of all sensitive operations',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/30 border border-purple-300/30 px-3 py-0.5 text-xs font-semibold text-purple-200">
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              <span>Round 3 Deliverable (25 Marks)</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mt-2">
              High-Level System Design & Microservice Architecture
            </h1>
            <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
              Architectural blueprint of HireFlow for 100K+ concurrent applicants: Service mesh, Cache-Aside topology,
              Transactional Outbox pattern, and resilient PostgreSQL data modeling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchHealth}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Ping All Services</span>
            </button>
            <a
              href="/system/infrastructure"
              className="rounded-xl bg-purple-500 hover:bg-purple-600 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-xs"
            >
              Open Redis & Outbox Lab
            </a>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
        {[
          { id: 'diagram', label: 'Architecture Topology', icon: Layers },
          { id: 'services', label: 'Service Catalog (8 Modules)', icon: Cpu },
          { id: 'database', label: 'Database Schema & ERD (10 Tables)', icon: Table },
          { id: 'scaling', label: 'Scalability & Reliability Strategy', icon: Zap },
          { id: 'health', label: 'Live Cluster Health Status', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ARCHITECTURE TOPOLOGY DIAGRAM */}
      {activeTab === 'diagram' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  End-to-End Distributed Architecture Flow
                </h2>
                <p className="text-xs text-slate-500">
                  Request journey from browser SPA down to persistent databases and asynchronous event brokers
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                Stateless Services Behind Load Balancer
              </span>
            </div>

            {/* Interactive Visual Flow Diagram */}
            <div className="space-y-4">
              {/* Layer 1: Client Tier */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    Tier 1: Client & Ingress Tier
                  </span>
                  <span className="text-[10px] text-blue-600 font-mono">HTTPS / WSS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg bg-white p-3 border border-blue-200 text-center shadow-2xs">
                    <div className="font-bold text-slate-800">React 19 SPA (Vite)</div>
                    <div className="text-[10px] text-slate-500">Candidate & Recruiter UI</div>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-blue-200 text-center shadow-2xs">
                    <div className="font-bold text-slate-800">Cloudflare Anycast CDN</div>
                    <div className="text-[10px] text-slate-500">Static assets & Edge cache</div>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-blue-200 text-center shadow-2xs">
                    <div className="font-bold text-slate-800">AWS ALB Load Balancer</div>
                    <div className="text-[10px] text-slate-500">Round-Robin & Health Checks</div>
                  </div>
                </div>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center text-slate-400">
                <div className="h-6 w-0.5 bg-slate-300"></div>
              </div>

              {/* Layer 2: API Gateway */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                    Tier 2: API Gateway & Security Policy Enforcer
                  </span>
                  <span className="text-[10px] text-indigo-600 font-mono">Reverse Proxy</span>
                </div>
                <div className="rounded-lg bg-white p-3 border border-indigo-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">HireFlow API Gateway (Express / Envoy)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Rate Limiter (Token Bucket: 100/min) • JWT Auth Verification • CORS Policy • Request Envelope Standardizer
                    </div>
                  </div>
                  <span className="rounded bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[10px] font-bold">
                    Latency: ~3ms
                  </span>
                </div>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center text-slate-400">
                <div className="h-6 w-0.5 bg-slate-300"></div>
              </div>

              {/* Layer 3: Microservice Cluster */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
                    Tier 3: Domain Microservices Cluster (Node.js / TypeScript)
                  </span>
                  <span className="text-[10px] text-purple-600 font-mono">REST / gRPC Service Mesh</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { name: 'Auth & User Service', desc: 'RBAC, Argon2, Tokens' },
                    { name: 'Job Service', desc: 'Vacancies, Deadlines, CRUD' },
                    { name: 'Application Service', desc: 'Duplicate Check, Pipeline' },
                    { name: 'Resume Service', desc: 'S3 Presigned URLs, Skills' },
                    { name: 'Search Service', desc: 'Elasticsearch, Multi-facet' },
                    { name: 'Notification Service', desc: 'In-app, SMTP Email Outbox' },
                    { name: 'Company Service', desc: 'Branding, Directory' },
                    { name: 'Analytics Service', desc: 'Funnel, Velocity Rollup' },
                  ].map((s) => (
                    <div key={s.name} className="rounded-lg bg-white p-2.5 border border-purple-200 shadow-2xs">
                      <div className="font-bold text-slate-900 text-[11px]">{s.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center text-slate-400">
                <div className="h-6 w-0.5 bg-slate-300"></div>
              </div>

              {/* Layer 4: Storage & Caching */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* PostgreSQL */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                    <Database className="h-4 w-4 text-emerald-600" />
                    <span>PostgreSQL Cluster</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 leading-tight">
                    Primary Master (Writes) + 2 Read Replicas (PgBouncer connection pooling).
                    Source of truth for Users, Jobs, and Applications.
                  </p>
                </div>

                {/* Redis */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span>Redis Cluster (Cache-Aside)</span>
                  </div>
                  <p className="text-[10px] text-amber-700 leading-tight">
                    Sub-2ms cache for job queries (<code className="font-mono">jobs:query:*</code>) and
                    job details (<code className="font-mono">job:details:*</code>). 60s - 180s TTLs.
                  </p>
                </div>

                {/* RabbitMQ / Kafka */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 mb-1">
                    <HardDrive className="h-4 w-4 text-rose-600" />
                    <span>RabbitMQ / Kafka Outbox</span>
                  </div>
                  <p className="text-[10px] text-rose-700 leading-tight">
                    Transactional Outbox pattern daemon polling OutboxEvent table.
                    Ensures At-Least-Once notification and email dispatch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE CATALOG */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service Selector List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Logical Microservices
            </h3>
            {SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedService(s.id)}
                className={`w-full text-left rounded-xl p-3 text-xs transition-all border ${
                  selectedService === s.id
                    ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{s.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">
                    {s.tier.split(' ')[0]}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">{s.tech}</div>
              </button>
            ))}
          </div>

          {/* Selected Service Deep Dive Card */}
          <div className="lg:col-span-2">
            {(() => {
              const s = SERVICES.find((item) => item.id === selectedService) || SERVICES[0];
              return (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="rounded bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">
                        {s.tier}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-1">{s.name}</h2>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">Runtime: {s.tech}</div>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                      Status: Operational
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                      Core Responsibilities
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {s.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                      REST Endpoints Governed
                    </h4>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                      {s.restPaths.map((p) => (
                        <span key={p} className="rounded-md bg-slate-100 px-2 py-1 text-slate-800">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                      <div className="font-bold text-slate-800 mb-1">Persistence Mapping</div>
                      <p className="text-slate-600 text-[11px]">{s.persistence}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                      <div className="font-bold text-slate-800 mb-1">Horizontal Scaling Strategy</div>
                      <p className="text-slate-600 text-[11px]">{s.scaling}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE SCHEMA & ERD */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Relational PostgreSQL Schema & Constraints
                </h2>
                <p className="text-xs text-slate-500">
                  Normalized database entities with ACID guarantees, foreign keys, and optimized composite indexes
                </p>
              </div>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                Prisma ORM Compatible
              </span>
            </div>

            <div className="space-y-3">
              {DATABASE_MODELS.map((m) => (
                <div
                  key={m.name}
                  className="rounded-xl border border-slate-200 p-4 space-y-2 hover:border-blue-300 transition-colors bg-slate-50/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="h-4 w-4 text-blue-600" />
                      <h4 className="font-bold text-slate-900 text-sm font-mono">{m.name}</h4>
                    </div>
                    <span className="text-[11px] text-slate-500">{m.purpose}</span>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-slate-200 font-mono text-[11px] text-slate-800 break-all">
                    <strong className="text-blue-600">Fields:</strong> {m.fields}
                  </div>

                  <div className="rounded-lg bg-white p-2 border border-slate-200 font-mono text-[10px] text-slate-600">
                    <strong className="text-purple-600">Indexes & Constraints:</strong> {m.indexes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCALABILITY & RELIABILITY */}
      {activeTab === 'scaling' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>1. Cache-Aside Pattern (Redis Cluster)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Frequently browsed job listings and search queries are hashed and queried against Redis first. On miss,
                PostgreSQL is queried with connection pooling and the result is stored in Redis with 60s TTL.
                Whenever a recruiter creates, edits, or closes a job, affected cache keys (<code className="font-mono text-purple-600">jobs:*</code>)
                are invalidated immediately to prevent stale views.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <HardDrive className="h-4 w-4 text-purple-600" />
                <span>2. Transactional Outbox Pattern (RabbitMQ/Kafka)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rather than dual-writing directly to message brokers and risking dual-write inconsistencies, all
                events (<code className="font-mono text-purple-600">application.created</code>, <code className="font-mono text-purple-600">application.status_changed</code>)
                are written within the same database transaction as the business row into the <code className="font-mono">OutboxEvent</code> table.
                A polling daemon guarantees At-Least-Once delivery.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>3. Idempotency & Duplicate Protection</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Network retries or double-clicking by applicants will not create multiple submissions. We enforce
                a strict composite unique constraint on <code className="font-mono text-emerald-700">UNIQUE INDEX (userId, jobId)</code> in PostgreSQL
                and pre-validate active applications before entering the transaction.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Activity className="h-4 w-4 text-blue-600" />
                <span>4. k6 Load Testing & Benchmarking Plan</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Load simulation targets 10,000 requests/sec with k6:
                <br />
                • 70% Read queries (Job Search & Details) hitting Redis cache-aside (P99 latency &lt; 8ms).
                <br />
                • 25% Candidate applications testing connection pool queue depth and idempotency.
                <br />
                • 5% Recruiter state mutations benchmarking outbox event throughput.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE CLUSTER HEALTH STATUS */}
      {activeTab === 'health' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Service Mesh Observability</h2>
              <p className="text-xs text-slate-500">Real-time health check probes and ping latencies</p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={isRefreshing}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Ping Probes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {healthData?.services?.map((s: any) => (
              <div
                key={s.name}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{s.name}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {s.status}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px]">{s.details}</div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Ping: {s.latencyMs}ms</span>
                  <span>Uptime: {(s.uptimeSeconds / 3600).toFixed(1)} hrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
