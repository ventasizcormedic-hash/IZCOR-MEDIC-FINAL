import { db } from '../db';
import { products, productImages, productDocuments } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export interface ValidationIssue {
  field: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
}

export interface ValidationResult {
  status: 'DRAFT' | 'REVIEW' | 'VERIFIED' | 'OUTDATED' | 'REJECTED';
  score: number;
  issues: ValidationIssue[];
}

export class ValidationService {
  /**
   * Run 8-layer validation on a product record
   */
  public async validateProduct(productId: number): Promise<ValidationResult> {
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) {
      throw new Error('Producto no encontrado para validación.');
    }

    const images = await db.select().from(productImages).where(eq(productImages.productId, productId));
    const documents = await db.select().from(productDocuments).where(eq(productDocuments.productId, productId));

    const issues: ValidationIssue[] = [];
    let score = 100;

    // Layer 1: Structure & Mandatory Fields
    if (!product.name || product.name.trim().length < 3) {
      issues.push({ field: 'name', severity: 'CRITICAL', message: 'El nombre comercial está ausente o es demasiado corto.' });
      score -= 30;
    }

    if (!product.model || product.model.trim() === '') {
      issues.push({ field: 'model', severity: 'HIGH', message: 'Falta el modelo del producto médico.' });
      score -= 20;
    }

    if (!product.manufacturer && !product.brandId) {
      issues.push({ field: 'manufacturer', severity: 'HIGH', message: 'No se ha identificado fabricante ni marca para este producto.' });
      score -= 20;
    }

    // Layer 2: Reference / Catalog Number
    if (!product.catalogNumber) {
      issues.push({ field: 'catalogNumber', severity: 'MEDIUM', message: 'Número de catálogo o referencia no especificado.' });
      score -= 10;
    }

    // Layer 3: Multimedia (Images & Docs)
    if (images.length === 0) {
      issues.push({ field: 'images', severity: 'MEDIUM', message: 'El producto no cuenta con imágenes asociadas.' });
      score -= 10;
    }

    if (documents.length === 0) {
      issues.push({ field: 'documents', severity: 'LOW', message: 'Sin fichas técnicas o documentos PDF vinculados.' });
      score -= 5;
    }

    // Layer 4: Source Provenance
    if (!product.sourceUrl) {
      issues.push({ field: 'sourceUrl', severity: 'CRITICAL', message: 'Falta la URL de procedencia o fuente original.' });
      score -= 20;
    }

    // Layer 5: Description & Clinical Context
    const descStr = (product.description || '').trim();
    if (!product.description || descStr.length < 20) {
      issues.push({ field: 'description', severity: 'MEDIUM', message: 'Falta descripción clínica o funcional (mínimo 20 caracteres).' });
      score -= 10;
    }

    // Layer 6: Specifications
    const specsStr = (product.technicalSpecs || '').trim();
    if (!specsStr || specsStr.length < 15) {
      issues.push({ field: 'specifications', severity: 'MEDIUM', message: 'Faltan especificaciones técnicas o parámetros cuantitativos.' });
      score -= 10;
    }

    // Layer 7: Outdated Check (> 90 days without check)
    const lastCheck = product.lastValidatedAt ? new Date(product.lastValidatedAt) : (product.updatedAt ? new Date(product.updatedAt) : new Date(product.createdAt));
    const daysSince = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60 * 24);
    if (product.verificationStatus === 'OUTDATED' || daysSince > 90) {
      issues.push({ field: 'outdated', severity: 'LOW', message: `Registro desactualizado (sin revisión en ${Math.round(daysSince)} días).` });
      score -= 5;
    }

    // Layer 8: Error & Reject Check
    if (product.verificationStatus === 'REJECTED') {
      issues.push({ field: 'errors', severity: 'CRITICAL', message: `Producto marcado como rechazado: ${product.rejectionReason || 'Sin motivo especificado'}.` });
      score -= 30;
    }

    // Determine Status based on issues and current status
    let newStatus: 'DRAFT' | 'REVIEW' | 'VERIFIED' | 'OUTDATED' | 'REJECTED' = product.verificationStatus as any || 'DRAFT';

    // Innegotiable Rule: Automatic extraction can NEVER set VERIFIED directly.
    if (newStatus === 'VERIFIED' && issues.some(i => i.severity === 'CRITICAL' || i.severity === 'HIGH')) {
      newStatus = 'REVIEW';
    } else if (newStatus === 'DRAFT' && issues.length > 0 && issues.some(i => i.severity === 'CRITICAL' || i.severity === 'HIGH')) {
      newStatus = 'REVIEW';
    }

    const finalScore = Math.max(0, score);

    // Save validation results to db
    await db.update(products).set({
      verificationStatus: newStatus,
      validationIssues: issues,
      validationScore: finalScore,
      lastValidatedAt: new Date(),
      updatedAt: new Date()
    }).where(eq(products.id, productId));

    return {
      status: newStatus,
      score: finalScore,
      issues
    };
  }

  /**
   * Human verification action (Sets status to VERIFIED with audit signature)
   */
  public async verifyProduct(productId: number, userEmail: string): Promise<boolean> {
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) throw new Error('Producto no encontrado.');

    await db.update(products).set({
      verificationStatus: 'VERIFIED',
      verifiedBy: userEmail,
      verifiedAt: new Date(),
      updatedAt: new Date()
    }).where(eq(products.id, productId));

    return true;
  }

  /**
   * Reject product with reason
   */
  public async rejectProduct(productId: number, reason: string, userEmail: string): Promise<boolean> {
    await db.update(products).set({
      verificationStatus: 'REJECTED',
      rejectionReason: reason,
      updatedAt: new Date()
    }).where(eq(products.id, productId));

    return true;
  }
}

export const validationService = new ValidationService();
