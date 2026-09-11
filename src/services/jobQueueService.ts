import { db } from '../db';
import { backgroundJobs, products } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { validationService } from './validationService';

export class JobQueueService {
  /**
   * Create a new background job
   */
  public async createJob(jobType: string, totalItems: number, payload: any = {}): Promise<any> {
    const [job] = await db.insert(backgroundJobs).values({
      jobType,
      status: 'QUEUED',
      progress: 0,
      totalItems,
      processedItems: 0,
      errorCount: 0,
      payload,
      createdAt: new Date(),
    }).returning();

    // Trigger async worker execution in background
    this.processJobAsync(job.id);

    return job;
  }

  /**
   * Get job status and metrics
   */
  public async getJob(jobId: number): Promise<any> {
    const [job] = await db.select().from(backgroundJobs).where(eq(backgroundJobs.id, jobId));
    return job;
  }

  /**
   * List recent jobs
   */
  public async listJobs(limit = 20): Promise<any[]> {
    return await db.select().from(backgroundJobs).orderBy(desc(backgroundJobs.createdAt)).limit(limit);
  }

  /**
   * Async Worker runner with batching and checkpoints
   */
  private async processJobAsync(jobId: number): Promise<void> {
    try {
      await db.update(backgroundJobs).set({
        status: 'RUNNING',
        startedAt: new Date(),
      }).where(eq(backgroundJobs.id, jobId));

      const [job] = await db.select().from(backgroundJobs).where(eq(backgroundJobs.id, jobId));
      if (!job) return;

      const total = job.totalItems || 10;
      let processed = 0;
      let errors = 0;
      const errorLog: string[] = [];

      // Simulate batch processing by chunks (e.g., 20 items per batch)
      const batchSize = 20;
      const allProds = await db.select({ id: products.id }).from(products).limit(total);

      for (let i = 0; i < allProds.length; i += batchSize) {
        const chunk = allProds.slice(i, i + batchSize);
        
        for (const p of chunk) {
          try {
            if (job.jobType === 'BULK_VALIDATION') {
              await validationService.validateProduct(p.id);
            }
            // Other job types can execute here
            processed++;
          } catch (e: any) {
            errors++;
            errorLog.push(`Prod ID ${p.id}: ${e.message}`);
          }
        }

        const progress = Math.min(100, Math.round((processed / allProds.length) * 100));

        await db.update(backgroundJobs).set({
          processedItems: processed,
          errorCount: errors,
          progress,
          errorLog: errorLog.slice(0, 50),
        }).where(eq(backgroundJobs.id, jobId));

        // Yield execution briefly to prevent thread starvation
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await db.update(backgroundJobs).set({
        status: errors > 0 ? 'COMPLETED_WITH_WARNINGS' : 'COMPLETED',
        progress: 100,
        finishedAt: new Date(),
        resultSummary: { processed, errors, message: 'Job completed successfully with batching.' }
      }).where(eq(backgroundJobs.id, jobId));

    } catch (e: any) {
      console.error(`Job ${jobId} failed:`, e);
      await db.update(backgroundJobs).set({
        status: 'FAILED',
        finishedAt: new Date(),
        errorLog: [{ message: e.message }]
      }).where(eq(backgroundJobs.id, jobId));
    }
  }
}

export const jobQueueService = new JobQueueService();
