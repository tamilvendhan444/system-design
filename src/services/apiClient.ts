import type {
  User,
  Company,
  Job,
  Resume,
  Application,
  Notification,
  AuditLog,
  ApiResponse,
  PaginationMeta,
} from '../types/index.ts';

class ApiClient {
  private token: string | null = null;
  private currentUserId: string = 'user-seeker-1';

  constructor() {
    const savedToken = localStorage.getItem('hireflow_token');
    const savedUserId = localStorage.getItem('hireflow_user_id');
    if (savedToken) this.token = savedToken;
    if (savedUserId) this.currentUserId = savedUserId;
  }

  public setAuth(token: string, userId: string): void {
    this.token = token;
    this.currentUserId = userId;
    localStorage.setItem('hireflow_token', token);
    localStorage.setItem('hireflow_user_id', userId);
  }

  public clearAuth(): void {
    this.token = null;
    this.currentUserId = 'user-seeker-1';
    localStorage.removeItem('hireflow_token');
    localStorage.removeItem('hireflow_user_id');
  }

  public getUserId(): string {
    return this.currentUserId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    } else {
      headers['X-User-Id'] = this.currentUserId;
    }

    try {
      const res = await fetch(`/api${endpoint}`, {
        ...options,
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${res.status}`,
          message: data.message || 'An error occurred during request',
        };
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: err.message || 'Failed to connect to HireFlow API server',
      };
    }
  }

  // Auth
  public async getMe() {
    return this.request<User & { company?: Company }>('/auth/me');
  }

  public async getDemoUsers() {
    return this.request<Array<User & { company?: Company }>>('/auth/demo-users');
  }

  public async login(email: string, password = 'password123') {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  public async register(payload: { name: string; email: string; role: string; password?: string; companyName?: string; skills?: string[] }) {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateProfile(payload: Partial<User>) {
    return this.request<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Jobs
  public async getJobs(params: Record<string, any> = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) q.append(k, String(v));
    });
    return this.request<Job[]>(`/jobs?${q.toString()}`);
  }

  public async getJob(id: string) {
    return this.request<Job>(`/jobs/${id}`);
  }

  public async createJob(payload: Partial<Job>) {
    return this.request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateJob(id: string, payload: Partial<Job>) {
    return this.request<Job>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  public async deleteJob(id: string) {
    return this.request<{ message: string }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  public async saveJob(id: string) {
    return this.request<any>(`/jobs/${id}/save`, { method: 'POST' });
  }

  public async unsaveJob(id: string) {
    return this.request<any>(`/jobs/${id}/save`, { method: 'DELETE' });
  }

  public async getSavedJobs() {
    return this.request<any[]>('/saved-jobs');
  }

  // Applications
  public async applyForJob(jobId: string, payload: { resumeId: string; coverLetter?: string }) {
    return this.request<{ applicationId: string; jobId: string; status: string }>(
      `/jobs/${jobId}/applications`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  public async getApplicationStatus(applicationId: string) {
    return this.request<any>(`/applications/${applicationId}/status`);
  }

  public async getMyApplications(params: Record<string, any> = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) q.append(k, String(v));
    });
    return this.request<Application[]>(`/users/me/applications?${q.toString()}`);
  }

  public async getRecruiterApplications() {
    return this.request<Application[]>('/recruiter/all-applications');
  }

  public async getJobApplications(jobId: string) {
    return this.request<Application[]>(`/jobs/${jobId}/applications`);
  }

  public async updateApplicationStatus(applicationId: string, status: string, note?: string) {
    return this.request<Application>(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }

  // Resumes
  public async getResumes() {
    return this.request<Resume[]>('/resumes');
  }

  public async uploadResume(payload: { filename: string; summary?: string; skills?: string[]; experienceYears?: number }) {
    return this.request<Resume>('/resumes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async deleteResume(resumeId: string) {
    return this.request<any>(`/resumes/${resumeId}`, {
      method: 'DELETE',
    });
  }

  // Companies
  public async getCompanies() {
    return this.request<Company[]>('/companies');
  }

  public async getCompany(id: string) {
    return this.request<Company & { jobs?: Job[] }>(`/companies/${id}`);
  }

  public async updateCompany(id: string, payload: Partial<Company>) {
    return this.request<Company>(`/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Notifications
  public async getNotifications() {
    return this.request<{ notifications: Notification[]; unreadCount: number }>('/notifications');
  }

  public async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  public async markAllNotificationsRead() {
    return this.request<any>('/notifications/mark-all-read', { method: 'POST' });
  }

  // Analytics
  public async getSeekerAnalytics() {
    return this.request<any>('/analytics/job-seeker');
  }

  public async getRecruiterAnalytics() {
    return this.request<any>('/analytics/recruiter');
  }

  public async getAdminAnalytics() {
    return this.request<any>('/analytics/admin');
  }

  // System Health & Infrastructure
  public async getSystemHealth() {
    return this.request<any>('/system/health');
  }

  public async getCacheStats() {
    return this.request<any>('/system/cache-stats');
  }

  public async flushCache() {
    return this.request<any>('/system/cache/flush', { method: 'POST' });
  }

  public async getSystemEvents() {
    return this.request<any>('/system/events');
  }

  public async dispatchEvents() {
    return this.request<any>('/system/events/dispatch', { method: 'POST' });
  }

  public async getAuditLogs() {
    return this.request<AuditLog[]>('/system/audit-logs');
  }

  public async resetDemoData() {
    return this.request<any>('/system/reset-demo', { method: 'POST' });
  }
}

export const api = new ApiClient();
