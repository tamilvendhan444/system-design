import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  User,
  Company,
  Job,
  Resume,
  Application,
  ApplicationStatusHistory,
  SavedJob,
  Notification,
  AuditLog,
  OutboxEvent,
  JobStatus,
  ApplicationStatus,
} from '../types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, 'data', 'hireflow_db.json');

export interface DatabaseSchema {
  users: User[];
  companies: Company[];
  jobs: Job[];
  resumes: Resume[];
  applications: Application[];
  statusHistories: ApplicationStatusHistory[];
  savedJobs: SavedJob[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  outbox: OutboxEvent[];
}

// Initial Seed Data
const INITIAL_USERS: User[] = [
  {
    id: 'user-seeker-1',
    name: 'Alex Rivera',
    email: 'seeker@hireflow.dev',
    role: 'JOB_SEEKER',
    headline: 'Senior Full Stack Engineer & Cloud Architect',
    bio: 'Passionate software craftsman with 6+ years building scalable microservices, distributed systems, and modern React interfaces.',
    location: 'San Francisco, CA (or Remote)',
    phone: '+1 (555) 234-5678',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'AWS'],
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'user-seeker-2',
    name: 'Maya Lin',
    email: 'maya.lin@hireflow.dev',
    role: 'JOB_SEEKER',
    headline: 'Machine Learning Engineer & Data Scientist',
    bio: 'Specializing in LLM fine-tuning, retrieval-augmented generation (RAG), and high-throughput vector search pipelines.',
    location: 'Austin, TX',
    phone: '+1 (555) 345-6789',
    skills: ['Python', 'PyTorch', 'FastAPI', 'LangChain', 'PostgreSQL', 'Milvus', 'AWS SageMaker'],
    createdAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-03-05T11:00:00.000Z',
  },
  {
    id: 'user-recruiter-1',
    name: 'Sarah Chen',
    email: 'recruiter@hireflow.dev',
    role: 'RECRUITER',
    companyId: 'comp-1',
    headline: 'Principal Technical Recruiter @ TechCorp Solutions',
    bio: 'Leading strategic talent acquisition across platform engineering, distributed systems, and AI infrastructure.',
    location: 'San Francisco, CA',
    phone: '+1 (555) 987-6543',
    skills: ['Talent Sourcing', 'System Architecture Interviewing', 'Executive Hiring', 'Tech Pipelines'],
    createdAt: '2025-11-20T10:00:00.000Z',
    updatedAt: '2026-02-18T14:30:00.000Z',
  },
  {
    id: 'user-recruiter-2',
    name: 'David Miller',
    email: 'david.miller@cloudscale.net',
    role: 'RECRUITER',
    companyId: 'comp-2',
    headline: 'Director of Talent @ CloudScale Dynamics',
    bio: 'Staffing high-performance cloud infrastructure, Site Reliability Engineering, and core backend teams.',
    location: 'Seattle, WA',
    phone: '+1 (555) 876-5432',
    skills: ['DevOps Recruiting', 'Engineering Management Recruiting', 'Compensation Benchmarking'],
    createdAt: '2025-12-05T11:00:00.000Z',
    updatedAt: '2026-01-25T16:00:00.000Z',
  },
  {
    id: 'user-admin-1',
    name: 'Marcus Vance',
    email: 'admin@hireflow.dev',
    role: 'ADMIN',
    headline: 'Platform Operations & System Architecture Lead',
    bio: 'Oversees HireFlow platform governance, infrastructure resilience, API reliability, and security moderation.',
    location: 'New York, NY',
    phone: '+1 (555) 111-2233',
    skills: ['Distributed Systems', 'Platform Reliability', 'Data Governance', 'System Design'],
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2026-01-10T12:00:00.000Z',
  },
];

const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'TechCorp Solutions',
    description: 'Enterprise Cloud & AI software platform empowering over 1,500 Fortune 500 enterprises with real-time intelligence.',
    industry: 'Enterprise Software & Cloud',
    website: 'https://techcorp.example.com',
    logoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA',
    size: '1,000 - 5,000 employees',
    foundedYear: 2017,
    createdAt: '2025-11-01T00:00:00.000Z',
  },
  {
    id: 'comp-2',
    name: 'CloudScale Dynamics',
    description: 'Next-generation container orchestration, serverless mesh, and resilient multi-cloud edge infrastructure.',
    industry: 'Cloud Infrastructure & DevOps',
    website: 'https://cloudscale.example.com',
    logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&auto=format&fit=crop&q=80',
    location: 'Seattle, WA',
    size: '500 - 1,000 employees',
    foundedYear: 2019,
    createdAt: '2025-11-15T00:00:00.000Z',
  },
  {
    id: 'comp-3',
    name: 'FinTech Nexus',
    description: 'Ultra-low latency algorithmic settlement network handling $12B in daily cross-border digital transactions.',
    industry: 'Financial Technology',
    website: 'https://fintechnexus.example.com',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80',
    location: 'New York, NY',
    size: '250 - 500 employees',
    foundedYear: 2021,
    createdAt: '2025-12-01T00:00:00.000Z',
  },
  {
    id: 'comp-4',
    name: 'HealthBridge AI',
    description: 'Federated clinical intelligence and diagnostic AI models improving patient care in oncology and genomics.',
    industry: 'Healthcare Technology & AI',
    website: 'https://healthbridge.example.com',
    logoUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=128&auto=format&fit=crop&q=80',
    location: 'Boston, MA',
    size: '100 - 250 employees',
    foundedYear: 2022,
    createdAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'comp-5',
    name: 'CyberGuard Systems',
    description: 'Autonomous zero-trust threat response engine protecting modern Kubernetes clusters and serverless APIs.',
    industry: 'Cybersecurity',
    website: 'https://cyberguard.example.com',
    logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&auto=format&fit=crop&q=80',
    location: 'Austin, TX',
    size: '50 - 100 employees',
    foundedYear: 2023,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'job-101',
    companyId: 'comp-1',
    recruiterId: 'user-recruiter-1',
    title: 'Senior Distributed Systems Engineer',
    department: 'Platform Architecture',
    description: 'We are seeking a seasoned Distributed Systems Engineer to design, implement, and benchmark our mission-critical event log streaming pipeline processing 100K+ writes/sec. You will work closely with database architects to ensure zero-data-loss replication across AWS regions.',
    responsibilities: [
      'Architect resilient event streaming ingestion layers using Kafka and Go/Node.js',
      'Optimize PostgreSQL connection pooling, query plans, and transactional outbox queues',
      'Implement multi-level cache-aside strategies with Redis cluster topology',
      'Conduct rigorous chaos engineering and k6 benchmark testing before production release',
    ],
    requiredSkills: ['Distributed Systems', 'Go', 'Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'System Design'],
    location: 'San Francisco, CA',
    isRemote: true,
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salaryMin: 165000,
    salaryMax: 215000,
    currency: 'USD',
    status: 'PUBLISHED',
    applicationDeadline: '2026-12-31T23:59:59.000Z',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'job-102',
    companyId: 'comp-1',
    recruiterId: 'user-recruiter-1',
    title: 'Staff Full Stack Engineer (React & TypeScript)',
    department: 'Core Product Engineering',
    description: 'Lead the frontend architecture of our Enterprise Workspace application. Collaborate with product designers and backend microservice leads to deliver pixel-perfect, sub-100ms UI interactions.',
    responsibilities: [
      'Spearhead the design system implementation using modern React 19, TypeScript, and Tailwind CSS',
      'Architect robust client-side state caching, optimistic mutations, and real-time WebSocket syncing',
      'Partner with API Gateway teams to standardize OpenAPI REST contracts and error envelopes',
      'Mentor intermediate and junior frontend engineers in modern testing and bundle optimization',
    ],
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'REST APIs', 'State Management'],
    location: 'San Francisco, CA',
    isRemote: true,
    employmentType: 'FULL_TIME',
    experienceLevel: 'LEAD',
    salaryMin: 180000,
    salaryMax: 230000,
    currency: 'USD',
    status: 'PUBLISHED',
    applicationDeadline: '2026-11-30T23:59:59.000Z',
    createdAt: '2026-03-02T11:00:00.000Z',
    updatedAt: '2026-03-02T11:00:00.000Z',
  },
  {
    id: 'job-103',
    companyId: 'comp-2',
    recruiterId: 'user-recruiter-2',
    title: 'Site Reliability & Cloud Infrastructure Lead',
    department: 'Cloud Infrastructure',
    description: 'Drive high availability and 99.999% SLA targets for our global multi-tenant Kubernetes platform. Build automated canary deployments, telemetry dashboards, and incident response runbooks.',
    responsibilities: [
      'Manage multi-region EKS clusters with Terraform and GitOps (ArgoCD)',
      'Design comprehensive OpenTelemetry traces, Prometheus metrics, and automated alert paging',
      'Tune Linux kernel networking, eBPF probes, and Envoy ingress gateway routing',
      'Automate disaster recovery failover scenarios with zero customer disruption',
    ],
    requiredSkills: ['Kubernetes', 'Terraform', 'AWS', 'Prometheus', 'ArgoCD', 'Linux', 'Go'],
    location: 'Seattle, WA',
    isRemote: true,
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salaryMin: 170000,
    salaryMax: 220000,
    currency: 'USD',
    status: 'PUBLISHED',
    applicationDeadline: '2026-12-15T23:59:59.000Z',
    createdAt: '2026-03-03T14:00:00.000Z',
    updatedAt: '2026-03-03T14:00:00.000Z',
  },
  {
    id: 'job-104',
    companyId: 'comp-3',
    recruiterId: 'user-recruiter-1',
    title: 'Quantitative Backend Developer (High Frequency)',
    department: 'Trading Engines',
    description: 'Architect deterministic, microsecond-latency trading execution services in Rust and modern C++. Profile memory layout, lock-free ring buffers, and kernel bypass networking.',
    responsibilities: [
      'Develop low-latency market data handlers and order routing gateways',
      'Implement real-time risk checks with strict memory boundaries and zero heap allocations on hot paths',
      'Interface with PostgreSQL and TimescaleDB for post-trade analytics and compliance reporting',
      'Optimize cache hierarchy locality (L1/L2/L3) and branch prediction behavior',
    ],
    requiredSkills: ['Rust', 'C++', 'Low Latency', 'PostgreSQL', 'Linux', 'Memory Profiling'],
    location: 'New York, NY',
    isRemote: false,
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salaryMin: 220000,
    salaryMax: 310000,
    currency: 'USD',
    status: 'PUBLISHED',
    applicationDeadline: '2026-10-31T23:59:59.000Z',
    createdAt: '2026-03-04T09:30:00.000Z',
    updatedAt: '2026-03-04T09:30:00.000Z',
  },
  {
    id: 'job-105',
    companyId: 'comp-4',
    recruiterId: 'user-recruiter-1',
    title: 'Machine Learning Infrastructure Engineer',
    department: 'AI Platform',
    description: 'Scale our multi-GPU training clusters and low-latency inference serving pipeline for medical imaging and genomic foundation models.',
    responsibilities: [
      'Deploy vLLM and TensorRT-LLM model inference endpoints behind intelligent load balancers',
      'Build automated dataset sharding and checkpoint synchronization across Ray clusters',
      'Enforce HIPAA compliance, model watermarking, and adversarial prompt detection',
    ],
    requiredSkills: ['Python', 'PyTorch', 'vLLM', 'Docker', 'Kubernetes', 'Ray', 'CUDA'],
    location: 'Boston, MA',
    isRemote: true,
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryMin: 145000,
    salaryMax: 190000,
    currency: 'USD',
    status: 'PUBLISHED',
    applicationDeadline: '2026-11-15T23:59:59.000Z',
    createdAt: '2026-03-05T12:00:00.000Z',
    updatedAt: '2026-03-05T12:00:00.000Z',
  },
  {
    id: 'job-106',
    companyId: 'comp-5',
    recruiterId: 'user-recruiter-2',
    title: 'Cloud Security Architect (Zero-Trust)',
    department: 'Information Security',
    description: 'Define the architectural security blueprint across cloud VPCs, IAM policies, and mTLS microservice meshes for enterprise defense clients.',
    responsibilities: [
      'Architect SPIFFE/SPIRE workload attestation across hybrid Kubernetes clusters',
      'Conduct automated vulnerability scanning, threat modeling, and red team exercises',
      'Integrate SIEM event pipelines with Kafka and Elasticsearch indexing',
    ],
    requiredSkills: ['Cybersecurity', 'AWS IAM', 'Kubernetes', 'mTLS', 'OAuth', 'OpenID Connect'],
    location: 'Austin, TX',
    isRemote: true,
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salaryMin: 160000,
    salaryMax: 210000,
    currency: 'USD',
    status: 'PUBLISHED',
    applicationDeadline: '2026-12-01T23:59:59.000Z',
    createdAt: '2026-03-06T15:00:00.000Z',
    updatedAt: '2026-03-06T15:00:00.000Z',
  },
  {
    id: 'job-107',
    companyId: 'comp-1',
    recruiterId: 'user-recruiter-1',
    title: 'Software Development Engineer in Test (SDET)',
    department: 'Quality Engineering',
    description: 'Create automated end-to-end load testing and API contract test suites simulating 50,000 concurrent applicants.',
    responsibilities: [
      'Write automated Playwright and k6 load testing scripts for critical recruitment workflows',
      'Validate OpenAPI 3.0 contract schemas and backward compatibility checks in CI/CD',
      'Build mock microservice stubs for isolated component benchmarking',
    ],
    requiredSkills: ['TypeScript', 'Playwright', 'k6', 'Docker', 'CI/CD', 'API Testing'],
    location: 'Chennai, India',
    isRemote: true,
    employmentType: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: 65000,
    salaryMax: 95000,
    currency: 'USD',
    status: 'PUBLISHED',
    applicationDeadline: '2026-12-31T23:59:59.000Z',
    createdAt: '2026-03-07T08:00:00.000Z',
    updatedAt: '2026-03-07T08:00:00.000Z',
  },
  {
    id: 'job-108',
    companyId: 'comp-2',
    recruiterId: 'user-recruiter-2',
    title: 'DevOps & CI/CD Pipeline Contractor',
    department: 'Platform Delivery',
    description: '6-month contract role migrating monolithic GitHub Actions workflows into caching-optimized, containerized build pipelines.',
    responsibilities: [
      'Optimize Docker layer caching and artifact push speeds by 4x',
      'Configure self-hosted ephemeral runner autoscaling on AWS Spot instances',
      'Ensure secret rotation compliance and supply chain security (SLSA level 3)',
    ],
    requiredSkills: ['GitHub Actions', 'Docker', 'AWS', 'Bash', 'Security Scanning'],
    location: 'Seattle, WA',
    isRemote: true,
    employmentType: 'CONTRACT',
    experienceLevel: 'MID',
    salaryMin: 90000,
    salaryMax: 130000,
    currency: 'USD',
    status: 'PUBLISHED',
    applicationDeadline: '2026-11-20T23:59:59.000Z',
    createdAt: '2026-03-08T10:30:00.000Z',
    updatedAt: '2026-03-08T10:30:00.000Z',
  },
];

const INITIAL_RESUMES: Resume[] = [
  {
    id: 'resume-201',
    userId: 'user-seeker-1',
    filename: 'Alex_Rivera_Staff_Software_Engineer_Resume.pdf',
    storageKey: 'resumes/user-seeker-1/alex_rivera_staff_eng_2026.pdf',
    contentType: 'application/pdf',
    size: 245760, // ~240 KB
    summary: 'Senior Full Stack & Cloud Architect with 6+ years experience architecting fault-tolerant microservices, Kafka outbox patterns, and enterprise React web applications.',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'Docker', 'AWS'],
    experienceYears: 6,
    isDefault: true,
    fileUrl: '/resumes/alex_rivera_staff_eng_2026.pdf',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'resume-202',
    userId: 'user-seeker-1',
    filename: 'Alex_Rivera_Backend_Cloud_Architect.pdf',
    storageKey: 'resumes/user-seeker-1/alex_rivera_cloud_backend.pdf',
    contentType: 'application/pdf',
    size: 198400,
    summary: 'Backend-focused resume highlighting distributed consensus, database indexing, Redis cache-aside tuning, and high-concurrency Node.js / Go microservices.',
    skills: ['Go', 'Node.js', 'PostgreSQL', 'Redis', 'System Design', 'Kubernetes'],
    experienceYears: 6,
    isDefault: false,
    fileUrl: '/resumes/alex_rivera_cloud_backend.pdf',
    createdAt: '2026-02-20T14:30:00.000Z',
  },
  {
    id: 'resume-203',
    userId: 'user-seeker-2',
    filename: 'Maya_Lin_ML_Research_Engineer.pdf',
    storageKey: 'resumes/user-seeker-2/maya_lin_ml_eng.pdf',
    contentType: 'application/pdf',
    size: 312000,
    summary: 'Machine Learning Researcher and engineer with deep experience in LLM serving, retrieval augmented generation, and vector database architectures.',
    skills: ['Python', 'PyTorch', 'FastAPI', 'LangChain', 'Milvus', 'vLLM', 'PostgreSQL'],
    experienceYears: 4,
    isDefault: true,
    fileUrl: '/resumes/maya_lin_ml_eng.pdf',
    createdAt: '2026-02-18T11:00:00.000Z',
  },
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-9001',
    userId: 'user-seeker-1',
    jobId: 'job-101',
    resumeId: 'resume-201',
    coverLetter: 'I am deeply enthusiastic about the Senior Distributed Systems role at TechCorp. Having engineered transactional outbox event streams, Redis cache-aside topologies, and high-throughput PostgreSQL architectures, I am eager to contribute to your 100K writes/sec mission.',
    status: 'SHORTLISTED',
    appliedAt: '2026-03-02T14:20:00.000Z',
    updatedAt: '2026-03-05T09:00:00.000Z',
  },
  {
    id: 'app-9002',
    userId: 'user-seeker-1',
    jobId: 'job-102',
    resumeId: 'resume-201',
    coverLetter: 'Leading frontend teams to build clean, responsive, high-performance web products is my passion. My experience in React 19, Tailwind CSS, and resilient API gateways aligns with TechCorp.',
    status: 'UNDER_REVIEW',
    appliedAt: '2026-03-03T16:45:00.000Z',
    updatedAt: '2026-03-04T11:30:00.000Z',
  },
  {
    id: 'app-9003',
    userId: 'user-seeker-2',
    jobId: 'job-105',
    resumeId: 'resume-203',
    coverLetter: 'Excited about the ML Infrastructure position at HealthBridge AI. My background in vLLM serving, Ray clusters, and HIPAA-compliant data pipelines is a direct match.',
    status: 'INTERVIEW',
    appliedAt: '2026-03-06T13:10:00.000Z',
    updatedAt: '2026-03-08T15:00:00.000Z',
  },
];

const INITIAL_STATUS_HISTORIES: ApplicationStatusHistory[] = [
  {
    id: 'hist-1',
    applicationId: 'app-9001',
    previousStatus: null,
    newStatus: 'APPLIED',
    changedBy: 'user-seeker-1',
    changedByName: 'Alex Rivera',
    changedByRole: 'JOB_SEEKER',
    changedAt: '2026-03-02T14:20:00.000Z',
    note: 'Initial application submitted with resume-201',
  },
  {
    id: 'hist-2',
    applicationId: 'app-9001',
    previousStatus: 'APPLIED',
    newStatus: 'UNDER_REVIEW',
    changedBy: 'user-recruiter-1',
    changedByName: 'Sarah Chen',
    changedByRole: 'RECRUITER',
    changedAt: '2026-03-03T10:15:00.000Z',
    note: 'Resume passed initial automated skill matching (8/8 skills match)',
  },
  {
    id: 'hist-3',
    applicationId: 'app-9001',
    previousStatus: 'UNDER_REVIEW',
    newStatus: 'SHORTLISTED',
    changedBy: 'user-recruiter-1',
    changedByName: 'Sarah Chen',
    changedByRole: 'RECRUITER',
    changedAt: '2026-03-05T09:00:00.000Z',
    note: 'Candidate advanced to Technical System Architecture Round',
  },
  {
    id: 'hist-4',
    applicationId: 'app-9002',
    previousStatus: null,
    newStatus: 'APPLIED',
    changedBy: 'user-seeker-1',
    changedByName: 'Alex Rivera',
    changedByRole: 'JOB_SEEKER',
    changedAt: '2026-03-03T16:45:00.000Z',
    note: 'Application submitted for Staff Full Stack Engineer',
  },
  {
    id: 'hist-5',
    applicationId: 'app-9002',
    previousStatus: 'APPLIED',
    newStatus: 'UNDER_REVIEW',
    changedBy: 'user-recruiter-1',
    changedByName: 'Sarah Chen',
    changedByRole: 'RECRUITER',
    changedAt: '2026-03-04T11:30:00.000Z',
    note: 'Recruiter review initiated for engineering portfolio',
  },
  {
    id: 'hist-6',
    applicationId: 'app-9003',
    previousStatus: null,
    newStatus: 'APPLIED',
    changedBy: 'user-seeker-2',
    changedByName: 'Maya Lin',
    changedByRole: 'JOB_SEEKER',
    changedAt: '2026-03-06T13:10:00.000Z',
    note: 'Application submitted for ML Infrastructure Engineer',
  },
  {
    id: 'hist-7',
    applicationId: 'app-9003',
    previousStatus: 'APPLIED',
    newStatus: 'UNDER_REVIEW',
    changedBy: 'user-recruiter-1',
    changedByName: 'Sarah Chen',
    changedByRole: 'RECRUITER',
    changedAt: '2026-03-07T10:00:00.000Z',
    note: 'Portfolio and research papers reviewed',
  },
  {
    id: 'hist-8',
    applicationId: 'app-9003',
    previousStatus: 'UNDER_REVIEW',
    newStatus: 'INTERVIEW',
    changedBy: 'user-recruiter-1',
    changedByName: 'Sarah Chen',
    changedByRole: 'RECRUITER',
    changedAt: '2026-03-08T15:00:00.000Z',
    note: 'Panel interview scheduled with Head of AI Research',
  },
];

const INITIAL_SAVED_JOBS: SavedJob[] = [
  {
    id: 'saved-1',
    userId: 'user-seeker-1',
    jobId: 'job-103',
    createdAt: '2026-03-04T18:00:00.000Z',
  },
  {
    id: 'saved-2',
    userId: 'user-seeker-1',
    jobId: 'job-106',
    createdAt: '2026-03-06T20:15:00.000Z',
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-seeker-1',
    type: 'STATUS_CHANGED',
    title: 'Application Shortlisted 🎉',
    message: 'Your application for Senior Distributed Systems Engineer at TechCorp Solutions has been moved to SHORTLISTED.',
    isRead: false,
    link: '/applications/app-9001',
    createdAt: '2026-03-05T09:00:00.000Z',
  },
  {
    id: 'notif-2',
    userId: 'user-seeker-1',
    type: 'APPLICATION_SUBMITTED',
    title: 'Application Submitted',
    message: 'We successfully received your application for Staff Full Stack Engineer at TechCorp Solutions.',
    isRead: true,
    link: '/applications/app-9002',
    createdAt: '2026-03-03T16:45:00.000Z',
  },
  {
    id: 'notif-3',
    userId: 'user-recruiter-1',
    type: 'APPLICATION_SUBMITTED',
    title: 'New Applicant Received',
    message: 'Alex Rivera submitted an application for Senior Distributed Systems Engineer.',
    isRead: false,
    link: '/recruiter/applicants',
    createdAt: '2026-03-02T14:20:00.000Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    actorId: 'user-recruiter-1',
    actorName: 'Sarah Chen',
    actorRole: 'RECRUITER',
    action: 'JOB_CREATED',
    resourceType: 'JOB',
    resourceId: 'job-101',
    details: { title: 'Senior Distributed Systems Engineer', company: 'TechCorp Solutions' },
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'audit-2',
    actorId: 'user-seeker-1',
    actorName: 'Alex Rivera',
    actorRole: 'JOB_SEEKER',
    action: 'APPLICATION_CREATED',
    resourceType: 'APPLICATION',
    resourceId: 'app-9001',
    details: { jobId: 'job-101', resumeId: 'resume-201' },
    createdAt: '2026-03-02T14:20:00.000Z',
  },
  {
    id: 'audit-3',
    actorId: 'user-recruiter-1',
    actorName: 'Sarah Chen',
    actorRole: 'RECRUITER',
    action: 'STATUS_UPDATED',
    resourceType: 'APPLICATION',
    resourceId: 'app-9001',
    details: { previousStatus: 'UNDER_REVIEW', newStatus: 'SHORTLISTED' },
    createdAt: '2026-03-05T09:00:00.000Z',
  },
];

const INITIAL_OUTBOX: OutboxEvent[] = [
  {
    id: 'evt-101',
    eventType: 'job.published',
    aggregateId: 'job-101',
    aggregateType: 'Job',
    payload: { jobId: 'job-101', title: 'Senior Distributed Systems Engineer', recruiterId: 'user-recruiter-1' },
    status: 'PROCESSED',
    retryCount: 0,
    createdAt: '2026-03-01T10:00:00.000Z',
    processedAt: '2026-03-01T10:00:00.120Z',
  },
  {
    id: 'evt-102',
    eventType: 'application.created',
    aggregateId: 'app-9001',
    aggregateType: 'Application',
    payload: { applicationId: 'app-9001', userId: 'user-seeker-1', jobId: 'job-101' },
    status: 'PROCESSED',
    retryCount: 0,
    createdAt: '2026-03-02T14:20:00.000Z',
    processedAt: '2026-03-02T14:20:00.080Z',
  },
  {
    id: 'evt-103',
    eventType: 'application.status_changed',
    aggregateId: 'app-9001',
    aggregateType: 'Application',
    payload: { applicationId: 'app-9001', newStatus: 'SHORTLISTED', previousStatus: 'UNDER_REVIEW', changedBy: 'user-recruiter-1' },
    status: 'PROCESSED',
    retryCount: 0,
    createdAt: '2026-03-05T09:00:00.000Z',
    processedAt: '2026-03-05T09:00:00.095Z',
  },
];

class DatabaseManager {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = {
      users: [...INITIAL_USERS],
      companies: [...INITIAL_COMPANIES],
      jobs: [...INITIAL_JOBS],
      resumes: [...INITIAL_RESUMES],
      applications: [...INITIAL_APPLICATIONS],
      statusHistories: [...INITIAL_STATUS_HISTORIES],
      savedJobs: [...INITIAL_SAVED_JOBS],
      notifications: [...INITIAL_NOTIFICATIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      outbox: [...INITIAL_OUTBOX],
    };
    this.loadFromFile();
  }

  private loadFromFile(): void {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.jobs) {
          this.data = parsed;
          this.isLoaded = true;
          return;
        }
      }
      this.saveToFile();
      this.isLoaded = true;
    } catch (err) {
      console.warn('[DatabaseManager] Failed to load disk state, using in-memory defaults:', err);
    }
  }

  public saveToFile(): void {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DatabaseManager] Failed to save state to disk:', err);
    }
  }

  public resetToDefault(): void {
    this.data = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      companies: JSON.parse(JSON.stringify(INITIAL_COMPANIES)),
      jobs: JSON.parse(JSON.stringify(INITIAL_JOBS)),
      resumes: JSON.parse(JSON.stringify(INITIAL_RESUMES)),
      applications: JSON.parse(JSON.stringify(INITIAL_APPLICATIONS)),
      statusHistories: JSON.parse(JSON.stringify(INITIAL_STATUS_HISTORIES)),
      savedJobs: JSON.parse(JSON.stringify(INITIAL_SAVED_JOBS)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
      outbox: JSON.parse(JSON.stringify(INITIAL_OUTBOX)),
    };
    this.saveToFile();
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      id: `user-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.saveToFile();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToFile();
    return this.data.users[idx];
  }

  // --- Companies ---
  public getCompanies(): Company[] {
    return this.data.companies;
  }

  public getCompanyById(id: string): Company | undefined {
    return this.data.companies.find((c) => c.id === id);
  }

  public createCompany(company: Omit<Company, 'id' | 'createdAt'>): Company {
    const newCompany: Company = {
      ...company,
      id: `comp-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.companies.push(newCompany);
    this.saveToFile();
    return newCompany;
  }

  public updateCompany(id: string, updates: Partial<Company>): Company | undefined {
    const idx = this.data.companies.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.companies[idx] = { ...this.data.companies[idx], ...updates };
    this.saveToFile();
    return this.data.companies[idx];
  }

  // --- Jobs ---
  public getJobs(): Job[] {
    return this.data.jobs;
  }

  public getJobById(id: string): Job | undefined {
    const job = this.data.jobs.find((j) => j.id === id);
    if (!job) return undefined;
    const company = this.getCompanyById(job.companyId);
    const applicantCount = this.data.applications.filter((a) => a.jobId === id).length;
    return {
      ...job,
      company,
      applicantCount,
    };
  }

  public createJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job {
    const newJob: Job = {
      ...job,
      id: `job-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.jobs.unshift(newJob);
    this.saveToFile();
    return newJob;
  }

  public updateJob(id: string, updates: Partial<Job>): Job | undefined {
    const idx = this.data.jobs.findIndex((j) => j.id === id);
    if (idx === -1) return undefined;
    this.data.jobs[idx] = {
      ...this.data.jobs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToFile();
    return this.data.jobs[idx];
  }

  public deleteJob(id: string): boolean {
    const prevLen = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter((j) => j.id !== id);
    if (this.data.jobs.length !== prevLen) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  // --- Resumes ---
  public getResumes(userId?: string): Resume[] {
    if (userId) {
      return this.data.resumes.filter((r) => r.userId === userId);
    }
    return this.data.resumes;
  }

  public getResumeById(id: string): Resume | undefined {
    return this.data.resumes.find((r) => r.id === id);
  }

  public createResume(resume: Omit<Resume, 'id' | 'createdAt'>): Resume {
    if (resume.isDefault) {
      this.data.resumes.forEach((r) => {
        if (r.userId === resume.userId) r.isDefault = false;
      });
    }
    const newResume: Resume = {
      ...resume,
      id: `resume-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.resumes.unshift(newResume);
    this.saveToFile();
    return newResume;
  }

  public deleteResume(id: string, userId: string): boolean {
    const idx = this.data.resumes.findIndex((r) => r.id === id && r.userId === userId);
    if (idx === -1) return false;
    this.data.resumes.splice(idx, 1);
    this.saveToFile();
    return true;
  }

  // --- Applications ---
  public getApplications(): Application[] {
    return this.data.applications;
  }

  public getApplicationById(id: string): Application | undefined {
    const app = this.data.applications.find((a) => a.id === id);
    if (!app) return undefined;

    const job = this.getJobById(app.jobId);
    const user = this.getUserById(app.userId);
    const resume = this.getResumeById(app.resumeId);
    const company = job?.companyId ? this.getCompanyById(job.companyId) : undefined;
    const statusHistory = this.data.statusHistories.filter((h) => h.applicationId === id);

    return {
      ...app,
      job,
      user,
      resume,
      company,
      statusHistory,
    };
  }

  public hasApplied(userId: string, jobId: string): boolean {
    return this.data.applications.some(
      (a) => a.userId === userId && a.jobId === jobId && a.status !== 'WITHDRAWN'
    );
  }

  public createApplication(data: {
    userId: string;
    jobId: string;
    resumeId: string;
    coverLetter?: string;
  }): Application {
    const newApp: Application = {
      id: `app-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      userId: data.userId,
      jobId: data.jobId,
      resumeId: data.resumeId,
      coverLetter: data.coverLetter,
      status: 'APPLIED',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.applications.unshift(newApp);

    // Initial status history
    const user = this.getUserById(data.userId);
    const history: ApplicationStatusHistory = {
      id: `hist-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 4)}`,
      applicationId: newApp.id,
      previousStatus: null,
      newStatus: 'APPLIED',
      changedBy: data.userId,
      changedByName: user?.name || 'Applicant',
      changedByRole: 'JOB_SEEKER',
      changedAt: new Date().toISOString(),
      note: 'Application submitted',
    };
    this.data.statusHistories.unshift(history);

    this.saveToFile();
    return newApp;
  }

  public updateApplicationStatus(data: {
    applicationId: string;
    newStatus: ApplicationStatus;
    changedBy: string;
    changedByName: string;
    changedByRole: 'RECRUITER' | 'ADMIN';
    note?: string;
  }): Application | undefined {
    const app = this.data.applications.find((a) => a.id === data.applicationId);
    if (!app) return undefined;

    const prevStatus = app.status;
    app.status = data.newStatus;
    app.updatedAt = new Date().toISOString();

    const history: ApplicationStatusHistory = {
      id: `hist-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 4)}`,
      applicationId: app.id,
      previousStatus: prevStatus,
      newStatus: data.newStatus,
      changedBy: data.changedBy,
      changedByName: data.changedByName,
      changedByRole: data.changedByRole,
      changedAt: new Date().toISOString(),
      note: data.note || `Status transitioned from ${prevStatus} to ${data.newStatus}`,
    };
    this.data.statusHistories.unshift(history);

    this.saveToFile();
    return app;
  }

  // --- Saved Jobs ---
  public getSavedJobs(userId: string): SavedJob[] {
    return this.data.savedJobs
      .filter((s) => s.userId === userId)
      .map((s) => ({
        ...s,
        job: this.getJobById(s.jobId),
      }));
  }

  public isJobSaved(userId: string, jobId: string): boolean {
    return this.data.savedJobs.some((s) => s.userId === userId && s.jobId === jobId);
  }

  public saveJob(userId: string, jobId: string): SavedJob {
    const existing = this.data.savedJobs.find((s) => s.userId === userId && s.jobId === jobId);
    if (existing) return existing;

    const saved: SavedJob = {
      id: `saved-${Date.now().toString(36)}`,
      userId,
      jobId,
      createdAt: new Date().toISOString(),
    };
    this.data.savedJobs.unshift(saved);
    this.saveToFile();
    return saved;
  }

  public unsaveJob(userId: string, jobId: string): boolean {
    const prevLen = this.data.savedJobs.length;
    this.data.savedJobs = this.data.savedJobs.filter(
      (s) => !(s.userId === userId && s.jobId === jobId)
    );
    if (this.data.savedJobs.length !== prevLen) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  // --- Notifications ---
  public getNotifications(userId: string): Notification[] {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  public createNotification(notif: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    this.saveToFile();
    return newNotif;
  }

  public markNotificationRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      this.saveToFile();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId: string): number {
    let count = 0;
    this.data.notifications.forEach((n) => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        count++;
      }
    });
    if (count > 0) this.saveToFile();
    return count;
  }

  // --- Audit Logs ---
  public getAuditLogs(limit = 50): AuditLog[] {
    return this.data.auditLogs.slice(0, limit);
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    this.saveToFile();
    return newLog;
  }

  // --- Outbox Events ---
  public getOutboxEvents(limit = 50): OutboxEvent[] {
    return this.data.outbox.slice(0, limit);
  }

  public createOutboxEvent(event: Omit<OutboxEvent, 'id' | 'createdAt' | 'status' | 'retryCount'>): OutboxEvent {
    const newEvent: OutboxEvent = {
      ...event,
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 4)}`,
      status: 'PENDING',
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.outbox.unshift(newEvent);
    this.saveToFile();
    return newEvent;
  }

  public updateOutboxEventStatus(
    id: string,
    status: 'PROCESSED' | 'FAILED',
    error?: string
  ): void {
    const evt = this.data.outbox.find((e) => e.id === id);
    if (evt) {
      evt.status = status;
      if (status === 'PROCESSED') {
        evt.processedAt = new Date().toISOString();
      }
      if (error) {
        evt.error = error;
        evt.retryCount += 1;
      }
      this.saveToFile();
    }
  }
}

export const db = new DatabaseManager();
