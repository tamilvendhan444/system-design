export type Role = 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';

export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type EventType =
  | 'application.created'
  | 'application.status_changed'
  | 'job.published'
  | 'job.closed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string; // For recruiters
  avatarUrl?: string;
  bio?: string;
  headline?: string;
  location?: string;
  phone?: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  industry: string;
  website: string;
  logoUrl: string;
  location: string;
  size: string;
  foundedYear: number;
  createdAt: string;
}

export interface Job {
  id: string;
  companyId: string;
  recruiterId: string;
  title: string;
  department: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  location: string;
  isRemote: boolean;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  status: JobStatus;
  applicationDeadline: string;
  createdAt: string;
  updatedAt: string;
  // Augmented properties
  company?: Company;
  applicantCount?: number;
  hasApplied?: boolean;
  isSaved?: boolean;
}

export interface Resume {
  id: string;
  userId: string;
  filename: string;
  storageKey: string;
  contentType: string;
  size: number; // in bytes
  summary?: string;
  skills: string[];
  experienceYears: number;
  isDefault: boolean;
  fileUrl?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  resumeId: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  // Augmented properties
  job?: Job;
  user?: User;
  resume?: Resume;
  company?: Company;
  statusHistory?: ApplicationStatusHistory[];
}

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  previousStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  changedBy: string; // User ID
  changedByName?: string;
  changedByRole?: Role;
  changedAt: string;
  note?: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
  job?: Job;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'APPLICATION_SUBMITTED' | 'STATUS_CHANGED' | 'JOB_ALERT' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  resourceType: 'JOB' | 'APPLICATION' | 'COMPANY' | 'USER' | 'RESUME';
  resourceId: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface OutboxEvent {
  id: string;
  eventType: EventType;
  aggregateId: string;
  aggregateType: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  retryCount: number;
  createdAt: string;
  processedAt?: string;
  error?: string;
}

export interface CacheEntryMetadata {
  key: string;
  ttlSeconds: number;
  expiresAt: number;
  sizeBytes: number;
  hitCount: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  keysCount: number;
  hitRatio: number;
  memoryUsedKb: number;
  evictionCount: number;
}

export interface ServiceHealth {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  version: string;
  uptimeSeconds: number;
  details: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: PaginationMeta;
  source?: 'cache' | 'database' | 'search-engine';
}
