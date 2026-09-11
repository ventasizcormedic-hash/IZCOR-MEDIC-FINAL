import { db } from '../db';
import { products, duplicateCases, productMergeHistory } from '../db/schema';
import { eq, or, and, sql, desc, ne } from 'drizzle-orm';

export interface ProductEntity {
  id: number;
  name: string;
  brand?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  reference?: string | null;
  catalogNumber?: string | null;
  sourceUrl?: string | null;
  description?: string | null;
  category?: string | null;
  images?: any;
  documents?: any;
}

export class DeduplicationService {
  /**
   * Normalize string for matching comparison
   */
  public normalizeString(str?: string | null): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9]/g, '') // keep only alphanumeric
      .trim();
  }

  /**
   * Stage 1: Candidate Generation
   * Finds potential duplicate candidates for a product based on reference, SKU, model, brand, manufacturer, or normalized name.
   */
  public async findCandidates(target: ProductEntity, existingProducts: ProductEntity[]): Promise<any[]> {
    const candidates: any[] = [];
    const targetNormName = this.normalizeString(target.name);
    const targetRef = this.normalizeString(target.reference || target.catalogNumber);
    const targetModel = this.normalizeString(target.model);
    const targetMfg = this.normalizeString(target.manufacturer);
    const targetBrand = this.normalizeString(target.brand);

    for (const p of existingProducts) {
      if (p.id === target.id) continue;

      let score = 0;
      const matchingSignals: string[] = [];
      const conflictingSignals: string[] = [];

      const pRef = this.normalizeString(p.reference || p.catalogNumber);
      const pModel = this.normalizeString(p.model);
      const pMfg = this.normalizeString(p.manufacturer);
      const pBrand = this.normalizeString(p.brand);
      const pNormName = this.normalizeString(p.name);

      // Conflict Check: Different Model / Reference is a major divergence rule!
      let hasModelConflict = false;
      let hasReferenceConflict = false;

      if (targetModel && pModel) {
        if (targetModel === pModel) {
          score += 25;
          matchingSignals.push('Modelo exacto (' + p.model + ')');
        } else {
          hasModelConflict = true;
          conflictingSignals.push(`Modelos diferentes (${target.model} vs ${p.model})`);
        }
      }

      if (targetRef && pRef) {
        if (targetRef === pRef) {
          score += 40;
          matchingSignals.push('Referencia / Catálogo exacto (' + (p.reference || p.catalogNumber) + ')');
        } else {
          hasReferenceConflict = true;
          conflictingSignals.push(`Referencias diferentes (${target.reference || target.catalogNumber || 'N/D'} vs ${p.reference || p.catalogNumber || 'N/D'})`);
        }
      }

      if (targetMfg && pMfg) {
        if (targetMfg === pMfg) {
          score += 15;
          matchingSignals.push('Fabricante coincidente (' + p.manufacturer + ')');
        } else {
          conflictingSignals.push(`Fabricantes diferentes (${target.manufacturer} vs ${p.manufacturer})`);
        }
      }

      if (targetBrand && pBrand) {
        if (targetBrand === pBrand) {
          score += 10;
          matchingSignals.push('Marca coincidente (' + p.brand + ')');
        }
      }

      // Name similarity heuristic
      if (targetNormName && pNormName && targetNormName === pNormName) {
        score += 10;
        matchingSignals.push('Nombre comercial idéntico');
      } else if (targetNormName && pNormName && (targetNormName.includes(pNormName) || pNormName.includes(targetNormName))) {
        score += 5;
        matchingSignals.push('Similitud alta en nombre');
      }

      // Classification & Confidence
      let classification = 'LOW_PROBABILITY';
      let status = 'PENDING_REVIEW';
      let recommendation = 'Mantener separados (baja probabilidad)';

      if (hasModelConflict || hasReferenceConflict) {
        classification = 'IDENTITY_CONFLICT';
        status = 'DIFFERENT_MODELS';
        recommendation = 'Conflicto crítico de identidad: NO fusionar (modelos o referencias distintas)';
      } else if (score >= 60) {
        classification = 'HIGH_PROBABILITY';
        status = 'PENDING_REVIEW';
        recommendation = 'Alta probabilidad de duplicado. Revisión recomendada antes de fusionar.';
      } else if (score >= 35) {
        classification = 'MEDIUM_PROBABILITY';
        status = 'PENDING_REVIEW';
        recommendation = 'Posible duplicado. Verificar especificaciones e imágenes.';
      }

      if (score >= 30 || hasModelConflict) {
        candidates.push({
          productAId: target.id,
          productBId: p.id,
          duplicateScore: score,
          classification,
          matchingSignals,
          conflictingSignals,
          status,
          recommendation,
          targetProduct: target,
          candidateProduct: p
        });
      }
    }

    return candidates.sort((a, b) => b.duplicateScore - a.duplicateScore);
  }

  /**
   * Run full deduplication audit scan on catalog products
   */
  public async runCatalogAudit(): Promise<{ analyzed: number; candidatesFound: number }> {
    const allProds = await db.select().from(products);
    let candidatesFound = 0;

    for (let i = 0; i < allProds.length; i++) {
      const prod = allProds[i];
      const candidates = await this.findCandidates(prod, allProds);

      for (const cand of candidates) {
        // Check if duplicate case already exists
        const existing = await db.select().from(duplicateCases).where(
          or(
            and(eq(duplicateCases.productAId, cand.productAId), eq(duplicateCases.productBId, cand.productBId)),
            and(eq(duplicateCases.productAId, cand.productBId), eq(duplicateCases.productBId, cand.productAId))
          )
        );

        if (existing.length === 0) {
          await db.insert(duplicateCases).values({
            productAId: cand.productAId,
            productBId: cand.productBId,
            productAType: 'CATALOG',
            productBType: 'CATALOG',
            duplicateScore: cand.duplicateScore,
            classification: cand.classification,
            matchingSignals: cand.matchingSignals,
            conflictingSignals: cand.conflictingSignals,
            status: cand.status,
            recommendation: cand.recommendation,
          });
          candidatesFound++;
        }
      }
    }

    return { analyzed: allProds.length, candidatesFound };
  }

  /**
   * Secure Merge: Consolidates secondary product into primary product without losing source traceability, images, or documents.
   * Official commercial name remains intact.
   */
  public async secureMerge(primaryId: number, secondaryId: number, userId: string, reason: string): Promise<boolean> {
    const [primary] = await db.select().from(products).where(eq(products.id, primaryId));
    const [secondary] = await db.select().from(products).where(eq(products.id, secondaryId));

    if (!primary || !secondary) {
      throw new Error('Producto principal o secundario no encontrado.');
    }

    // Safety check: Never merge if models conflict strongly unless explicitly overridden
    if (primary.model && secondary.model && primary.model !== secondary.model) {
      throw new Error('Regla de seguridad: No se pueden fusionar automáticamente productos con modelos distintos.');
    }

    // Record merge history
    await db.insert(productMergeHistory).values({
      primaryProductId: primaryId,
      secondaryProductId: secondaryId,
      mergedDataSnapshot: { primary, secondary },
      reason,
      userId,
    });

    // Archive or update secondary product state to MERGED
    await db.update(products).set({
      status: 'ARCHIVED',
      verificationStatus: 'MERGED',
      description: `${secondary.description || ''}\n[Fusionado con Producto ID ${primaryId}: ${reason}]`.trim(),
      updatedAt: new Date(),
    }).where(eq(products.id, secondaryId));

    // Update duplicate case status
    await db.update(duplicateCases).set({
      status: 'MERGED',
      notes: `Fusionado exitosamente en Producto ID ${primaryId}`,
      updatedAt: new Date(),
    }).where(
      or(
        and(eq(duplicateCases.productAId, primaryId), eq(duplicateCases.productBId, secondaryId)),
        and(eq(duplicateCases.productAId, secondaryId), eq(duplicateCases.productBId, primaryId))
      )
    );

    return true;
  }
}

export const deduplicationService = new DeduplicationService();
