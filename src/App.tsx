import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { PublicLayout } from './layouts/PublicLayout.tsx';
import { DashboardLayout } from './layouts/DashboardLayout.tsx';

// Public Pages
import { LandingPage } from './pages/LandingPage.tsx';
import { JobSearchPage } from './pages/JobSearchPage.tsx';
import { JobDetailsPage } from './pages/JobDetailsPage.tsx';
import { CompaniesDirectoryPage } from './pages/CompaniesDirectoryPage.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { RegisterPage } from './pages/auth/RegisterPage.tsx';

// Job Seeker Pages
import { SeekerDashboardPage } from './pages/seeker/SeekerDashboardPage.tsx';
import { MyApplicationsPage } from './pages/seeker/MyApplicationsPage.tsx';
import { ApplicationTimelinePage } from './pages/seeker/ApplicationTimelinePage.tsx';
import { SavedJobsPage } from './pages/seeker/SavedJobsPage.tsx';
import { ResumeManagementPage } from './pages/seeker/ResumeManagementPage.tsx';
import { UserProfilePage } from './pages/seeker/UserProfilePage.tsx';

// Recruiter Pages
import { RecruiterDashboardPage } from './pages/recruiter/RecruiterDashboardPage.tsx';
import { ManageJobsPage } from './pages/recruiter/ManageJobsPage.tsx';
import { JobEditorPage } from './pages/recruiter/JobEditorPage.tsx';
import { ApplicantsPipelinePage } from './pages/recruiter/ApplicantsPipelinePage.tsx';
import { CompanyProfilePage } from './pages/recruiter/CompanyProfilePage.tsx';
import { RecruiterAnalyticsPage } from './pages/recruiter/RecruiterAnalyticsPage.tsx';

// Administrator Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.tsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.tsx';
import { AdminJobsPage } from './pages/admin/AdminJobsPage.tsx';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage.tsx';

// System Design Pages (HLD & LLD)
import { SystemArchitecturePage } from './pages/system/SystemArchitecturePage.tsx';
import { InfrastructureLabPage } from './pages/system/InfrastructureLabPage.tsx';
import { ApiExplorerPage } from './pages/system/ApiExplorerPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Views */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/jobs" element={<JobSearchPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
            <Route path="/companies" element={<CompaniesDirectoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Authenticated & Dashboard Views */}
          <Route element={<DashboardLayout />}>
            {/* Seeker Routes */}
            <Route path="/dashboard" element={<Navigate to="/seeker/dashboard" replace />} />
            <Route path="/seeker/dashboard" element={<SeekerDashboardPage />} />
            <Route path="/applications" element={<MyApplicationsPage />} />
            <Route path="/applications/:applicationId" element={<ApplicationTimelinePage />} />
            <Route path="/saved-jobs" element={<SavedJobsPage />} />
            <Route path="/resumes" element={<ResumeManagementPage />} />
            <Route path="/profile" element={<UserProfilePage />} />

            {/* Recruiter Routes */}
            <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
            <Route path="/recruiter/jobs" element={<ManageJobsPage />} />
            <Route path="/recruiter/jobs/new" element={<JobEditorPage />} />
            <Route path="/recruiter/jobs/:jobId/edit" element={<JobEditorPage />} />
            <Route path="/recruiter/applicants" element={<ApplicantsPipelinePage />} />
            <Route path="/recruiter/company" element={<CompanyProfilePage />} />
            <Route path="/recruiter/analytics" element={<RecruiterAnalyticsPage />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/companies" element={<CompaniesDirectoryPage />} />
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/analytics" element={<AdminDashboardPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />

            {/* System Design Round 2 & Round 3 Deliverables */}
            <Route path="/system/architecture" element={<SystemArchitecturePage />} />
            <Route path="/system/infrastructure" element={<InfrastructureLabPage />} />
            <Route path="/api-explorer" element={<ApiExplorerPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
