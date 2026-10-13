# HireFlow — Online Job Search & Recruitment Platform
## Round 2 Low-Level Design (30 Marks) + Round 3 High-Level System Design (25 Marks)

HireFlow is an enterprise-grade recruitment and candidate tracking platform built to demonstrate high-concurrency software engineering, clean RESTful APIs, cache-aside topologies, and resilient asynchronous message processing.

---

## 🌟 Executive Summary & Hackathon Deliverables

### 1. Round 2: Low-Level Design (LLD)
- **10 Core REST APIs**: Fully implemented and documented in the interactive **API Explorer** (`/api-explorer`).
- **PostgreSQL ACID Persistence**: Data models for Users, Companies, Jobs, Resumes, Applications, Status Histories, Saved Jobs, Notifications, Audit Logs, and Outbox Events.
- **Idempotency & Duplicate Prevention**: Enforces composite unique constraints (`UNIQUE (userId, jobId)`) preventing multiple applications for the same job.
- **Role-Based Access Control (RBAC)**: Backend verification for 3 user roles:
  1. `JOB_SEEKER` (Alex Rivera - `seeker@hireflow.dev`)
  2. `RECRUITER` (Sarah Chen @ TechCorp - `recruiter@hireflow.dev`)
  3. `ADMIN` (Marcus Vance - `admin@hireflow.dev`)
- **Interactive Quick-Switch Persona Widget**: In the navigation bar, seamlessly switch between candidate, recruiter, and administrator with 1 click.

### 2. Round 3: High-Level System Design (HLD)
- **Interactive System Architecture Dashboard** (`/system/architecture`):
  - 5-Tier Architecture Topology: Client Tier ➔ Edge/API Gateway ➔ Domain Microservices ➔ Storage & Cache-Aside ➔ Asynchronous Event Brokers.
  - 8 Logical Microservices catalog with responsibilities, REST contracts, and scaling blueprints.
  - Relational Database Schema & ERD visualizer (10 normalized models with composite indexes).
  - Scalability & Reliability blueprints (horizontal replica pods, connection pooling with PgBouncer, token-bucket rate limiting, k6 load testing specification).
- **Redis & Outbox Laboratory** (`/system/infrastructure`):
  - **Live Cache-Aside Pattern**: Interactive cache test rig displaying Cache HIT (0ms) vs Cache MISS (PostgreSQL query), live memory usage, TTL countdown, and key invalidation.
  - **Transactional Outbox Event Bus**: RabbitMQ / Apache Kafka simulation with daemon worker, dead-letter queue, retry policies, and simulated Amazon SES email delivery logs.

---

## 🚀 Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router |
| **Backend & APIs** | Node.js, Express, TypeScript, RESTful JSON Envelopes, RBAC Middleware |
| **Persistence** | PostgreSQL Data Layer simulation with file-backed JSON (`src/backend/data/hireflow_db.json`) |
| **Caching** | Redis Cluster simulation (Cache-Aside pattern, TTL countdowns, pattern invalidation) |
| **Messaging** | Transactional Outbox pattern simulating RabbitMQ / Apache Kafka with At-Least-Once delivery |
| **Object Storage**| Amazon S3 storage key metadata layer for candidate PDF resumes |

---

## 🛠️ Implemented REST APIs (Round 2 LLD)

| API | HTTP Method & URI | Description |
|---|---|---|
| **API 1** | `GET /api/jobs` | Search & filter jobs by keyword, location, salary, experience, remote mode. Cache-aside in Redis. |
| **API 2** | `GET /api/jobs/:jobId` | Detailed job specification, required skills, salary bounds, and employer profile. |
| **API 3** | `POST /api/jobs/:jobId/applications` | Transactional job application submission with duplicate check and outbox event publication. |
| **API 4** | `GET /api/applications/:applicationId/status` | Current pipeline stage and timestamped state machine audit history. |
| **API 5** | `GET /api/users/me/applications` | Candidate application history with status progression and job details. |
| **API 6** | `POST /api/resumes` & `GET /api/resumes` | Candidate resume metadata management with Amazon S3 storage keys. |
| **API 7** | `POST /api/jobs`, `PATCH /api/jobs/:id`, `DELETE /api/jobs/:id` | Recruiter job vacancy lifecycle (Create, Edit, Publish, Close, Delete). |
| **API 8** | `GET /api/jobs/:id/applications` & `PATCH /api/applications/:id/status` | Recruiter candidate pipeline and stage advancement with reviewer notes. |
| **API 9** | `GET /api/notifications` | In-app notification retrieval delivered by asynchronous event bus. |
| **API 10** | `GET /api/analytics/recruiter` & `GET /api/analytics/admin` | Real aggregated pipeline funnels, conversion rates, and platform metrics. |

---

## 💻 Running the Application

### Development Mode (Full-Stack)
```bash
# Starts Express REST API and Vite SPA on port 3000
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Testing the User Journeys
1. **Candidate Journey**:
   - Open `/` or `/jobs`.
   - Search for "Distributed Systems" or filter by "Senior" level.
   - Click "Apply Now" ➔ Choose a resume file ➔ Enter cover note ➔ Submit.
   - Observe immediate status badge change and outbox event creation.
   - Navigate to `/applications` or click "Timeline" to inspect the audit history.
2. **Recruiter Journey**:
   - Use the Persona Switcher in the top bar to select **Sarah Chen (Recruiter @ TechCorp)**.
   - Navigate to `/recruiter/applicants`.
   - Click "Update Stage" on Alex Rivera's application ➔ Transition from `UNDER_REVIEW` to `SHORTLISTED` with a note.
   - Confirm candidate in-app notification and simulated email log generated.
3. **Admin & Architecture Review**:
   - Switch persona to **Marcus Vance (Admin)**.
   - Open `/system/architecture` to review the 9-microservice topology and database schema.
   - Open `/system/infrastructure` to inspect real-time Redis cache hit/miss queries and the Kafka/RabbitMQ outbox queue.
   - Open `/api-explorer` to trigger live HTTP requests against the Express server.
