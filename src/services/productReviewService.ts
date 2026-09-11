import { db } from '../db';
import { products } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export class ProductReviewService {
  /**
   * Update product attributes with manual edit tracking & history
   */
  public async updateProduct(productId: number, updates: any, userEmail: string, changeReason: string): Promise<any> {
    const [existing] = await db.select().from(products).where(eq(products.id, productId));
    if (!existing) throw new Error('Producto no encontrado.');

    // Prepare history entry
    const historyEntry = {
      timestamp: new Date().toISOString(),
      user: userEmail,
      action: 'MANUAL_EDIT',
      reason: changeReason || 'Actualización administrativa desde centro de revisión',
      previousValues: {
        name: existing.name,
        brandId: existing.brandId,
        manufacturer: existing.manufacturer,
        model: existing.model,
        catalogNumber: existing.catalogNumber,
        description: existing.description,
        technicalSpecs: existing.technicalSpecs,
        application: existing.application,
        presentation: existing.presentation,
      },
      newValues: {
        name: updates.name !== undefined ? updates.name : existing.name,
        brandId: updates.brandId !== undefined ? updates.brandId : existing.brandId,
        manufacturer: updates.manufacturer !== undefined ? updates.manufacturer : existing.manufacturer,
        model: updates.model !== undefined ? updates.model : existing.model,
        catalogNumber: updates.catalogNumber !== undefined ? updates.catalogNumber : existing.catalogNumber,
        description: updates.description !== undefined ? updates.description : existing.description,
        technicalSpecs: updates.technicalSpecs !== undefined ? updates.technicalSpecs : existing.technicalSpecs,
        application: updates.application !== undefined ? updates.application : existing.application,
        presentation: updates.presentation !== undefined ? updates.presentation : existing.presentation,
      }
    };

    const existingAudit = (existing.auditReport as any) || { history: [] };
    const updatedHistory = [...(existingAudit.history || []), historyEntry];

    const updatedData = await db.update(products).set({
      name: updates.name !== undefined ? updates.name : existing.name,
      brandId: updates.brandId !== undefined ? updates.brandId : existing.brandId,
      manufacturer: updates.manufacturer !== undefined ? updates.manufacturer : existing.manufacturer,
      model: updates.model !== undefined ? updates.model : existing.model,
      catalogNumber: updates.catalogNumber !== undefined ? updates.catalogNumber : existing.catalogNumber,
      description: updates.description !== undefined ? updates.description : existing.description,
      technicalSpecs: updates.technicalSpecs !== undefined ? updates.technicalSpecs : existing.technicalSpecs,
      application: updates.application !== undefined ? updates.application : existing.application,
      presentation: updates.presentation !== undefined ? updates.presentation : existing.presentation,
      auditReport: { ...existingAudit, history: updatedHistory },
      updatedAt: new Date(),
    }).where(eq(products.id, productId)).returning();

    return updatedData[0];
  }

  /**
   * Change product review status (DRAFT, REVIEW, VERIFIED, OUTDATED, REJECTED)
   */
  public async setStatus(productId: number, newStatus: string, userEmail: string, notes?: string): Promise<any> {
    const [existing] = await db.select().from(products).where(eq(products.id, productId));
    if (!existing) throw new Error('Producto no encontrado.');

    // Innegotiable Rule: Automatic extraction / save can NEVER set VERIFIED directly without explicit verification rules or approval.
    const updatePayload: any = {
      verificationStatus: newStatus,
      updatedAt: new Date(),
    };

    if (newStatus === 'VERIFIED') {
      updatePayload.verifiedBy = userEmail;
      updatePayload.verifiedAt = new Date();
    } else if (newStatus === 'REJECTED') {
      updatePayload.rejectionReason = notes || 'Rechazado en centro de revisión';
    }

    const updated = await db.update(products).set(updatePayload).where(eq(products.id, productId)).returning();
    return updated[0];
  }
}

export const productReviewService = new ProductReviewService();
