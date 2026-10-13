import { db } from './db.ts';
import { cache } from './cache.ts';
import type { EventType, OutboxEvent } from '../types/index.ts';

type EventHandler = (event: OutboxEvent) => Promise<void> | void;

class EventBusManager {
  private handlers: Map<EventType, EventHandler[]> = new Map();
  private isWorkerRunning = true;
  private processedCounter = 3;
  private failedCounter = 0;
  private simulatedSmtpLogs: Array<{
    id: string;
    to: string;
    subject: string;
    body: string;
    sentAt: string;
    provider: string;
  }> = [];

  constructor() {
    this.registerDefaultHandlers();
    this.startOutboxWorker();
  }

  public subscribe(eventType: EventType, handler: EventHandler): void {
    const list = this.handlers.get(eventType) || [];
    list.push(handler);
    this.handlers.set(eventType, list);
  }

  public async publish(eventType: EventType, aggregateId: string, aggregateType: string, payload: Record<string, any>): Promise<OutboxEvent> {
    // Transactional Outbox: Write to outbox table
    const event = db.createOutboxEvent({
      eventType,
      aggregateId,
      aggregateType,
      payload,
    });

    // In a microservice outbox architecture, the worker asynchronously polls and publishes.
    // Trigger dispatch asynchronously to avoid blocking the caller
    setTimeout(() => {
      this.dispatchPendingEvents();
    }, 50);

    return event;
  }

  private registerDefaultHandlers(): void {
    // 1. application.created handler
    this.subscribe('application.created', async (evt) => {
      const { applicationId, userId, jobId } = evt.payload;
      const job = db.getJobById(jobId);
      const seeker = db.getUserById(userId);
      const recruiter = job?.recruiterId ? db.getUserById(job.recruiterId) : undefined;

      // Invalidate relevant job cache
      cache.delete(`job:details:${jobId}`);

      // Notify Applicant
      db.createNotification({
        userId,
        type: 'APPLICATION_SUBMITTED',
        title: 'Application Received ✅',
        message: `Your application for "${job?.title || 'Job'}" was submitted successfully and queued for recruiter review.`,
        isRead: false,
        link: `/applications/${applicationId}`,
      });

      // Notify Recruiter
      if (recruiter) {
        db.createNotification({
          userId: recruiter.id,
          type: 'APPLICATION_SUBMITTED',
          title: 'New Applicant Received 📥',
          message: `${seeker?.name || 'A candidate'} just applied for "${job?.title || 'Job'}".`,
          isRead: false,
          link: '/recruiter/applicants',
        });
      }

      // Simulated SMTP Email Dispatch
      if (seeker?.email) {
        this.simulatedSmtpLogs.unshift({
          id: `email-${Date.now().toString(36)}`,
          to: seeker.email,
          subject: `Confirmation: Application for ${job?.title || 'Job'}`,
          body: `Hi ${seeker.name},\n\nWe received your application for the ${job?.title} role at ${job?.company?.name || 'our company'}. You can track status updates in your HireFlow dashboard.`,
          sentAt: new Date().toISOString(),
          provider: 'Amazon SES (Simulated)',
        });
      }
    });

    // 2. application.status_changed handler
    this.subscribe('application.status_changed', async (evt) => {
      const { applicationId, newStatus, previousStatus, changedBy } = evt.payload;
      const app = db.getApplicationById(applicationId);
      if (!app) return;

      const seeker = db.getUserById(app.userId);
      const job = db.getJobById(app.jobId);

      // Invalidate app cache
      cache.delete(`app:status:${applicationId}`);

      const statusEmoji = newStatus === 'OFFERED' ? '🎉' : newStatus === 'SHORTLISTED' ? '⭐' : newStatus === 'REJECTED' ? 'ℹ️' : '📋';

      // Notify Seeker
      db.createNotification({
        userId: app.userId,
        type: 'STATUS_CHANGED',
        title: `Application Status: ${newStatus} ${statusEmoji}`,
        message: `Your application for "${job?.title || 'Role'}" moved from ${previousStatus || 'PENDING'} to ${newStatus}.`,
        isRead: false,
        link: `/applications/${applicationId}`,
      });

      // Simulated Email
      if (seeker?.email) {
        this.simulatedSmtpLogs.unshift({
          id: `email-${Date.now().toString(36)}`,
          to: seeker.email,
          subject: `Status Update: ${job?.title || 'Application'} - ${newStatus}`,
          body: `Hi ${seeker.name},\n\nYour application status for ${job?.title} has been updated to ${newStatus}.`,
          sentAt: new Date().toISOString(),
          provider: 'Amazon SES (Simulated)',
        });
      }
    });

    // 3. job.published handler
    this.subscribe('job.published', async (evt) => {
      const { jobId } = evt.payload;
      // Invalidate all job listings caches
      cache.invalidatePattern('jobs:*');
    });

    // 4. job.closed handler
    this.subscribe('job.closed', async (evt) => {
      const { jobId } = evt.payload;
      cache.invalidatePattern('jobs:*');
      cache.delete(`job:details:${jobId}`);
    });
  }

  private startOutboxWorker(): void {
    // Poller runs every 2 seconds to simulate Kafka/RabbitMQ consumer daemon
    setInterval(() => {
      if (this.isWorkerRunning) {
        this.dispatchPendingEvents();
      }
    }, 2000);
  }

  public async dispatchPendingEvents(): Promise<number> {
    const events = db.getOutboxEvents().filter((e) => e.status === 'PENDING');
    let processed = 0;

    for (const evt of events) {
      try {
        const handlers = this.handlers.get(evt.eventType) || [];
        for (const handler of handlers) {
          await handler(evt);
        }
        db.updateOutboxEventStatus(evt.id, 'PROCESSED');
        this.processedCounter++;
        processed++;
      } catch (err: any) {
        console.error(`[EventBus] Error processing event ${evt.id}:`, err);
        db.updateOutboxEventStatus(evt.id, 'FAILED', err?.message || 'Dispatch error');
        this.failedCounter++;
      }
    }

    return processed;
  }

  public getQueueStats() {
    const all = db.getOutboxEvents(100);
    const pending = all.filter((e) => e.status === 'PENDING').length;
    const processed = all.filter((e) => e.status === 'PROCESSED').length;
    const failed = all.filter((e) => e.status === 'FAILED').length;

    return {
      broker: 'RabbitMQ / Apache Kafka (Simulated Event Bus)',
      outboxPattern: 'Transactional Outbox with At-Least-Once Delivery',
      isWorkerRunning: this.isWorkerRunning,
      pendingCount: pending,
      processedTotal: this.processedCounter + processed,
      failedTotal: this.failedCounter + failed,
      deadLetterQueueCount: failed,
      recentEvents: all.slice(0, 15),
      smtpLogs: this.simulatedSmtpLogs.slice(0, 10),
    };
  }

  public toggleWorker(): boolean {
    this.isWorkerRunning = !this.isWorkerRunning;
    return this.isWorkerRunning;
  }
}

export const eventBus = new EventBusManager();
