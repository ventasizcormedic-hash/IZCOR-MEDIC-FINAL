import { db } from '../db';
import { backgroundJobs, importRecords, products } from '../db/schema';
import { eq, desc, asc, and } from 'drizzle-orm';
import { validationService } from './validationService';

export class MassImportService {
  /**
   * Create an import job and load the records in 'import_records'
   */
  public async createImportJob(totalItems: number, payload: any = {}): Promise<any> {
    const [job] = await db.insert(backgroundJobs).values({
      jobType: 'MASS_IMPORT',
      status: 'PENDING',
      progress: 0,
      totalItems,
      processedItems: 0,
      errorCount: 0,
      payload,
      createdAt: new Date(),
    }).returning();

    return job;
  }

  /**
   * Append a chunk of raw records to a job
   */
  public async addChunk(jobId: number, records: any[]): Promise<number> {
    // We do a batch insert into import_records
    if (records.length === 0) return 0;
    
    // Map records to the db schema
    const inserts = records.map(record => ({
      jobId,
      rawData: record.raw || record,
      mappedData: record.mapped || null,
      status: 'PENDING',
    }));

    await db.insert(importRecords).values(inserts);
    return inserts.length;
  }

  /**
   * Starts or resumes a job
   */
  public async startOrResumeJob(jobId: number): Promise<void> {
    const [job] = await db.select().from(backgroundJobs).where(eq(backgroundJobs.id, jobId));
    if (!job || job.status === 'RUNNING' || job.status === 'COMPLETED' || job.status === 'CANCELLED') {
      return;
    }

    await db.update(backgroundJobs).set({
      status: 'RUNNING',
      startedAt: job.startedAt || new Date(),
    }).where(eq(backgroundJobs.id, jobId));

    // Kick off async processing
    this.processImportAsync(jobId);
  }

  /**
   * Pauses an active job
   */
  public async pauseJob(jobId: number): Promise<void> {
    await db.update(backgroundJobs).set({ status: 'PAUSED' }).where(eq(backgroundJobs.id, jobId));
  }

  /**
   * Cancels a job
   */
  public async cancelJob(jobId: number): Promise<void> {
    await db.update(backgroundJobs).set({ status: 'CANCELLED' }).where(eq(backgroundJobs.id, jobId));
  }

  /**
   * Main Async Worker for import processing
   */
  private async processImportAsync(jobId: number): Promise<void> {
    try {
      const batchSize = 50; // Configure according to memory/DB limits
      let running = true;

      while (running) {
        // 1. Check if job is still in RUNNING state (Handling pauses/cancellations)
        const [currentJob] = await db.select({ status: backgroundJobs.status, processedItems: backgroundJobs.processedItems, errorCount: backgroundJobs.errorCount, totalItems: backgroundJobs.totalItems }).from(backgroundJobs).where(eq(backgroundJobs.id, jobId));
        
        if (!currentJob || currentJob.status !== 'RUNNING') {
          running = false;
          break; // Stop processing, we've been interrupted/paused/cancelled
        }

        // 2. Fetch the next batch of PENDING records (This is the CHECKPOINT logic automatically!)
        const batch = await db.select().from(importRecords)
          .where(and(eq(importRecords.jobId, jobId), eq(importRecords.status, 'PENDING')))
          .orderBy(asc(importRecords.id))
          .limit(batchSize);

        if (batch.length === 0) {
          // Finished all records
          const status = currentJob.errorCount && currentJob.errorCount > 0 ? 'COMPLETED_WITH_WARNINGS' : 'COMPLETED';
          await db.update(backgroundJobs).set({
            status,
            progress: 100,
            finishedAt: new Date()
          }).where(eq(backgroundJobs.id, jobId));
          running = false;
          break;
        }

        // 3. Process the batch
        let newProcessed = currentJob.processedItems || 0;
        let newErrors = currentJob.errorCount || 0;

        for (const record of batch) {
          try {
            const mapped = record.mappedData as any;
            if (!mapped || !mapped.name) {
              throw new Error('Falta el nombre (campo obligatorio) después del mapeo.');
            }

            // Simple idempotency / duplicate check by catalogNumber or name+model
            let existingProduct;
            if (mapped.catalogNumber) {
              const res = await db.select().from(products).where(eq(products.catalogNumber, mapped.catalogNumber)).limit(1);
              existingProduct = res[0];
            }
            if (!existingProduct && mapped.model && mapped.name) {
              const res = await db.select().from(products).where(and(eq(products.name, mapped.name), eq(products.model, mapped.model))).limit(1);
              existingProduct = res[0];
            }

            let finalProductId;

            if (existingProduct) {
              // Update existing product (or mark as duplicate based on config)
              // For simplicity, we just log it and potentially update fields if it's safe
              // Let's do a safe update (upsert)
              const [updated] = await db.update(products).set({
                ...mapped,
                updatedAt: new Date(),
                importJobId: jobId
              }).where(eq(products.id, existingProduct.id)).returning({ id: products.id });
              finalProductId = updated.id;
              
              await db.update(importRecords).set({
                status: 'IMPORTED', // Or DUPLICATE if we chose to skip
                productId: finalProductId,
                processedAt: new Date()
              }).where(eq(importRecords.id, record.id));
              
            } else {
              // Create new product
              // Innegotiable rule: Must be DRAFT
              const slugBase = (mapped.name + '-' + (mapped.model || '')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              const slug = `${slugBase}-${Date.now()}`; // Ensure uniqueness

              const [inserted] = await db.insert(products).values({
                ...mapped,
                slug,
                verificationStatus: 'DRAFT',
                importJobId: jobId,
                createdAt: new Date(),
                updatedAt: new Date()
              }).returning({ id: products.id });
              finalProductId = inserted.id;

              await db.update(importRecords).set({
                status: 'IMPORTED',
                productId: finalProductId,
                processedAt: new Date()
              }).where(eq(importRecords.id, record.id));
            }

            newProcessed++;

            // Optionally: trigger validation async for this new product
            // validationService.validateProduct(finalProductId).catch(console.error);

          } catch (e: any) {
            newErrors++;
            await db.update(importRecords).set({
              status: 'FAILED',
              errorMessage: e.message || 'Error desconocido',
              processedAt: new Date()
            }).where(eq(importRecords.id, record.id));
            newProcessed++; // We processed it, even if it failed
          }
        }

        // 4. Update Job Progress Checkpoint
        const total = currentJob.totalItems || 1;
        const progress = Math.min(100, Math.round((newProcessed / total) * 100));

        await db.update(backgroundJobs).set({
          processedItems: newProcessed,
          errorCount: newErrors,
          progress,
        }).where(eq(backgroundJobs.id, jobId));

        // Yield execution to avoid blocking the Node.js event loop
        await new Promise(resolve => setTimeout(resolve, 50));
      }

    } catch (e: any) {
      console.error(`Mass Import Job ${jobId} failed completely:`, e);
      await db.update(backgroundJobs).set({
        status: 'FAILED',
        finishedAt: new Date(),
        errorLog: [{ message: e.message || 'Error catastrófico en el worker' }]
      }).where(eq(backgroundJobs.id, jobId));
    }
  }

  /**
   * Get paginated records for a job
   */
  public async getJobRecords(jobId: number, status?: string, page: number = 1, limit: number = 50): Promise<any> {
    const offset = (page - 1) * limit;
    let query = db.select().from(importRecords).where(eq(importRecords.jobId, jobId));
    
    // In Drizzle, dynamic queries need to be built carefully.
    if (status) {
      query = db.select().from(importRecords).where(and(eq(importRecords.jobId, jobId), eq(importRecords.status, status)));
    }

    const records = await query.limit(limit).offset(offset).orderBy(asc(importRecords.id));
    return records;
  }
}

export const massImportService = new MassImportService();
