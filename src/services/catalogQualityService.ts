import { db } from '../db';
import { products, productImages, productDocuments, duplicateCases, brands, categories } from '../db/schema';
import { eq, desc, sql, or, and, inArray } from 'drizzle-orm';

export type QualityIncidentType = 
  | 'MISSING_IMAGE'
  | 'MISSING_MODEL'
  | 'MISSING_DESCRIPTION'
  | 'MISSING_SPECS'
  | 'MISSING_SOURCE'
  | 'POSSIBLE_DUPLICATE'
  | 'OUTDATED'
  | 'HAS_ERRORS';

export interface QualityIncident {
  id: string;
  type: QualityIncidentType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  recommendation: string;
  detectedAt: string;
  metadata?: Record<string, any>;
}

export interface ProductQualityReport {
  productId: number;
  productName: string;
  slug: string;
  model: string | null;
  catalogNumber: string | null;
  manufacturer: string | null;
  brandName: string | null;
  categoryName: string | null;
  sourceUrl: string | null;
  imageCount: number;
  primaryImage: string | null;
  verificationStatus: string;
  publicationStatus: string;
  validationScore: number;
  updatedAt: string | null;
  lastValidatedAt: string | null;
  incidents: QualityIncident[];
  hasCritical: boolean;
  hasHigh: boolean;
  incidentCount: number;
}

export interface CatalogQualitySummary {
  totalProducts: number;
  cleanProductsCount: number;
  productsWithIncidentsCount: number;
  overallHealthScore: number; // 0 - 100
  breakdown: {
    missingImage: { count: number; percentage: number; severity: 'HIGH' };
    missingModel: { count: number; percentage: number; severity: 'HIGH' };
    missingDescription: { count: number; percentage: number; severity: 'MEDIUM' };
    missingSpecs: { count: number; percentage: number; severity: 'MEDIUM' };
    missingSource: { count: number; percentage: number; severity: 'CRITICAL' };
    possibleDuplicate: { count: number; percentage: number; severity: 'CRITICAL' };
    outdated: { count: number; percentage: number; severity: 'MEDIUM' };
    hasErrors: { count: number; percentage: number; severity: 'CRITICAL' };
  };
  severityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  lastScannedAt: string;
}

export class CatalogQualityService {
  /**
   * Evaluates a single product and returns all detected incidents
   */
  public evaluateProduct(
    product: any,
    imageCount: number,
    duplicateMatches: any[] = []
  ): QualityIncident[] {
    const incidents: QualityIncident[] = [];
    const now = new Date().toISOString();

    // 1. PRODUCTOS SIN IMAGEN
    if (imageCount === 0) {
      incidents.push({
        id: `INC-${product.id}-IMG`,
        type: 'MISSING_IMAGE',
        severity: 'HIGH',
        title: 'Producto sin imagen',
        message: 'No cuenta con fotografía clínica ni imagen principal vinculada.',
        recommendation: 'Añadir al menos 1 fotografía con fondo neutro o render oficial del fabricante.',
        detectedAt: now,
      });
    }

    // 2. PRODUCTOS SIN MODELO
    const modelStr = (product.model || '').trim().toLowerCase();
    const isModelMissing = !product.model || modelStr === '' || modelStr === 'n/d' || modelStr === 'n/a' || modelStr === 'sin modelo' || modelStr === 'no especificado';
    if (isModelMissing) {
      incidents.push({
        id: `INC-${product.id}-MDL`,
        type: 'MISSING_MODEL',
        severity: 'HIGH',
        title: 'Producto sin modelo',
        message: 'Falta el modelo exacto del equipo o insumo médico.',
        recommendation: 'Ingresar el modelo unívoco del fabricante para habilitar cotización y búsqueda técnica.',
        detectedAt: now,
      });
    }

    // 3. PRODUCTOS SIN DESCRIPCIÓN
    const descStr = (product.description || '').trim();
    const isDescMissing = !product.description || descStr.length < 20 || descStr.toLowerCase() === 'n/d' || descStr.toLowerCase() === 'sin descripcion';
    if (isDescMissing) {
      incidents.push({
        id: `INC-${product.id}-DSC`,
        type: 'MISSING_DESCRIPTION',
        severity: 'MEDIUM',
        title: 'Producto sin descripción',
        message: descStr.length > 0 ? 'Descripción excesivamente breve (< 20 caracteres).' : 'Carece completamente de descripción clínica o funcional.',
        recommendation: 'Redactar una descripción detallada que especifique indicación de uso, principio de funcionamiento y características.',
        detectedAt: now,
      });
    }

    // 4. PRODUCTOS SIN ESPECIFICACIONES
    const specsStr = (product.technicalSpecs || '').trim();
    let hasValidSpecs = false;
    if (specsStr.length >= 20) {
      try {
        const parsed = JSON.parse(specsStr);
        if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
          hasValidSpecs = true;
        }
      } catch {
        // If it's plain text with substantial technical content
        if (specsStr.length >= 30) {
          hasValidSpecs = true;
        }
      }
    }

    if (!hasValidSpecs) {
      incidents.push({
        id: `INC-${product.id}-SPC`,
        type: 'MISSING_SPECS',
        severity: 'MEDIUM',
        title: 'Producto sin especificaciones',
        message: 'No posee ficha técnica ni parámetros cuantificables (dimensiones, voltaje, peso, rango, etc.).',
        recommendation: 'Extraer y cargar la tabla de especificaciones técnicas desde el manual o ficha del fabricante.',
        detectedAt: now,
      });
    }

    // 5. PRODUCTOS SIN FUENTE
    const sourceUrl = (product.sourceUrl || '').trim();
    const hasSource = sourceUrl.length > 5 && (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://'));
    if (!hasSource) {
      incidents.push({
        id: `INC-${product.id}-SRC`,
        type: 'MISSING_SOURCE',
        severity: 'CRITICAL',
        title: 'Producto sin fuente',
        message: 'No posee URL de origen ni procedencia documental registrada.',
        recommendation: 'Vincular el enlace oficial del fabricante o catálogo distribuidor para respaldar trazabilidad.',
        detectedAt: now,
      });
    }

    // 6. PRODUCTOS POSIBLEMENTE DUPLICADOS
    if (duplicateMatches.length > 0) {
      const matchNames = duplicateMatches.map(m => `#${m.id} (${m.name})`).join(', ');
      incidents.push({
        id: `INC-${product.id}-DUP`,
        type: 'POSSIBLE_DUPLICATE',
        severity: 'CRITICAL',
        title: 'Producto posiblemente duplicado',
        message: `Coincide en modelo, referencia o alta similitud con: ${matchNames}.`,
        recommendation: 'Revisar en el módulo de Deduplicación para unificar o distinguir como variante legítima.',
        detectedAt: now,
        metadata: { duplicateIds: duplicateMatches.map(m => m.id) },
      });
    }

    // 7. PRODUCTOS DESACTUALIZADOS
    const lastCheckDate = product.lastValidatedAt ? new Date(product.lastValidatedAt) : (product.updatedAt ? new Date(product.updatedAt) : new Date(product.createdAt));
    const daysSinceCheck = (Date.now() - lastCheckDate.getTime()) / (1000 * 60 * 60 * 24);
    const isExplicitlyOutdated = product.verificationStatus === 'OUTDATED';

    if (isExplicitlyOutdated || daysSinceCheck > 90) {
      incidents.push({
        id: `INC-${product.id}-OUT`,
        type: 'OUTDATED',
        severity: 'MEDIUM',
        title: 'Producto desactualizado',
        message: isExplicitlyOutdated 
          ? 'Marcado manualmente como desactualizado / obsoleto.'
          : `Sin verificación ni re-inspección de fuente en los últimos ${Math.round(daysSinceCheck)} días.`,
        recommendation: 'Ejecutar re-scraping o confirmar vigencia comercial con el catálogo del fabricante.',
        detectedAt: now,
        metadata: { daysSinceCheck: Math.round(daysSinceCheck) },
      });
    }

    // 8. PRODUCTOS CON ERRORES
    const isRejected = product.verificationStatus === 'REJECTED';
    const validationIssues = (product.validationIssues as any[]) || [];
    const hasCriticalIssues = validationIssues.some(i => i.severity === 'CRITICAL');
    const hasEncodingError = /(&amp;|&lt;|&gt;|&#\d+;|undefined|null|\ufffd)/i.test(product.name || '');
    const hasBrokenUrl = product.sourceUrl && !product.sourceUrl.startsWith('http');
    const scrapErrorPhrases = /(404 not found|access denied|error 500|cloudflare|captcha|page not found)/i;
    const descHasScrapError = scrapErrorPhrases.test(product.description || '');

    if (isRejected || hasCriticalIssues || hasEncodingError || hasBrokenUrl || descHasScrapError) {
      const errorReasons: string[] = [];
      if (isRejected) errorReasons.push(`Estado RECHAZADO (${product.rejectionReason || 'Sin motivo'})`);
      if (hasCriticalIssues) errorReasons.push('Posee fallas de validación críticas');
      if (hasEncodingError) errorReasons.push('Texto con caracteres corruptos o entidades HTML escapadas');
      if (hasBrokenUrl) errorReasons.push('URL de fuente inválida');
      if (descHasScrapError) errorReasons.push('Descripción contiene respuestas de error HTTP/bloqueo de scraper');

      incidents.push({
        id: `INC-${product.id}-ERR`,
        type: 'HAS_ERRORS',
        severity: 'CRITICAL',
        title: 'Producto con errores',
        message: errorReasons.join('. '),
        recommendation: 'Corregir los campos erróneos manualmente o re-extraer desde una fuente limpia.',
        detectedAt: now,
        metadata: { errorReasons },
      });
    }

    return incidents;
  }

  /**
   * Runs complete catalog quality inspection across all products
   */
  public async runFullCatalogQualityAudit(): Promise<{
    summary: CatalogQualitySummary;
    reports: ProductQualityReport[];
  }> {
    // 1. Fetch all products, images, and existing duplicate cases
    const allProducts = await db.select().from(products).orderBy(desc(products.id));
    const allImages = await db.select().from(productImages);
    const pendingDuplicates = await db.select().from(duplicateCases).where(
      or(eq(duplicateCases.status, 'PENDING_REVIEW'), eq(duplicateCases.status, 'CONFIRMED_DUPLICATE'))
    );
    const allBrands = await db.select().from(brands);
    const allCategories = await db.select().from(categories);

    // Map images by productId
    const imageCountMap = new Map<number, { count: number; primary: string | null }>();
    for (const img of allImages) {
      const existing = imageCountMap.get(img.productId) || { count: 0, primary: null };
      existing.count += 1;
      if (!existing.primary) existing.primary = img.url;
      imageCountMap.set(img.productId, existing);
    }

    // Map brands and categories by ID
    const brandMap = new Map<number, string>();
    for (const b of allBrands) brandMap.set(b.id, b.name);

    const categoryMap = new Map<number, string>();
    for (const c of allCategories) categoryMap.set(c.id, c.name);

    // Map potential duplicates by model and catalogNumber
    const modelIndex = new Map<string, any[]>();
    for (const p of allProducts) {
      const m = (p.model || '').trim().toLowerCase();
      if (m && m.length > 2 && m !== 'n/d' && m !== 'n/a') {
        const list = modelIndex.get(m) || [];
        list.push(p);
        modelIndex.set(m, list);
      }
    }

    // Map duplicate cases
    const duplicateCaseMap = new Map<number, number[]>();
    for (const dc of pendingDuplicates) {
      const listA = duplicateCaseMap.get(dc.productAId) || [];
      listA.push(dc.productBId);
      duplicateCaseMap.set(dc.productAId, listA);

      const listB = duplicateCaseMap.get(dc.productBId) || [];
      listB.push(dc.productAId);
      duplicateCaseMap.set(dc.productBId, listB);
    }

    const reports: ProductQualityReport[] = [];
    let countMissingImage = 0;
    let countMissingModel = 0;
    let countMissingDesc = 0;
    let countMissingSpecs = 0;
    let countMissingSource = 0;
    let countPossibleDuplicate = 0;
    let countOutdated = 0;
    let countHasErrors = 0;

    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const prod of allProducts) {
      const imgData = imageCountMap.get(prod.id) || { count: 0, primary: null };

      // Find duplicate matches
      const mKey = (prod.model || '').trim().toLowerCase();
      let dupeMatches = (mKey && modelIndex.get(mKey) ? modelIndex.get(mKey)!.filter(x => x.id !== prod.id) : []);

      const caseMatches = duplicateCaseMap.get(prod.id) || [];
      if (caseMatches.length > 0) {
        const extraDupes = allProducts.filter(p => caseMatches.includes(p.id) && !dupeMatches.some(dm => dm.id === p.id));
        dupeMatches = [...dupeMatches, ...extraDupes];
      }

      const incidents = this.evaluateProduct(prod, imgData.count, dupeMatches);

      let hasCritical = false;
      let hasHigh = false;

      for (const inc of incidents) {
        if (inc.type === 'MISSING_IMAGE') countMissingImage++;
        if (inc.type === 'MISSING_MODEL') countMissingModel++;
        if (inc.type === 'MISSING_DESCRIPTION') countMissingDesc++;
        if (inc.type === 'MISSING_SPECS') countMissingSpecs++;
        if (inc.type === 'MISSING_SOURCE') countMissingSource++;
        if (inc.type === 'POSSIBLE_DUPLICATE') countPossibleDuplicate++;
        if (inc.type === 'OUTDATED') countOutdated++;
        if (inc.type === 'HAS_ERRORS') countHasErrors++;

        if (inc.severity === 'CRITICAL') {
          criticalCount++;
          hasCritical = true;
        } else if (inc.severity === 'HIGH') {
          highCount++;
          hasHigh = true;
        } else if (inc.severity === 'MEDIUM') {
          mediumCount++;
        } else {
          lowCount++;
        }
      }

      reports.push({
        productId: prod.id,
        productName: prod.name,
        slug: prod.slug,
        model: prod.model,
        catalogNumber: prod.catalogNumber,
        manufacturer: prod.manufacturer,
        brandName: prod.brandId ? brandMap.get(prod.brandId) || null : null,
        categoryName: prod.categoryId ? categoryMap.get(prod.categoryId) || null : null,
        sourceUrl: prod.sourceUrl,
        imageCount: imgData.count,
        primaryImage: imgData.primary,
        verificationStatus: prod.verificationStatus || 'DRAFT',
        publicationStatus: prod.publicationStatus || 'UNPUBLISHED',
        validationScore: prod.validationScore || 0,
        updatedAt: prod.updatedAt ? new Date(prod.updatedAt).toISOString() : null,
        lastValidatedAt: prod.lastValidatedAt ? new Date(prod.lastValidatedAt).toISOString() : null,
        incidents,
        hasCritical,
        hasHigh,
        incidentCount: incidents.length,
      });
    }

    const total = allProducts.length;
    const cleanProductsCount = reports.filter(r => r.incidentCount === 0).length;
    const productsWithIncidentsCount = total - cleanProductsCount;

    // Overall Health Score: proportion of clean products weighted by incident severity
    const totalDeduction = (criticalCount * 25) + (highCount * 15) + (mediumCount * 5) + (lowCount * 2);
    const maxScore = total > 0 ? total * 100 : 100;
    const overallHealthScore = total > 0 ? Math.max(0, Math.min(100, Math.round(((maxScore - totalDeduction) / maxScore) * 100))) : 100;

    const summary: CatalogQualitySummary = {
      totalProducts: total,
      cleanProductsCount,
      productsWithIncidentsCount,
      overallHealthScore,
      breakdown: {
        missingImage: {
          count: countMissingImage,
          percentage: total > 0 ? Math.round((countMissingImage / total) * 100) : 0,
          severity: 'HIGH',
        },
        missingModel: {
          count: countMissingModel,
          percentage: total > 0 ? Math.round((countMissingModel / total) * 100) : 0,
          severity: 'HIGH',
        },
        missingDescription: {
          count: countMissingDesc,
          percentage: total > 0 ? Math.round((countMissingDesc / total) * 100) : 0,
          severity: 'MEDIUM',
        },
        missingSpecs: {
          count: countMissingSpecs,
          percentage: total > 0 ? Math.round((countMissingSpecs / total) * 100) : 0,
          severity: 'MEDIUM',
        },
        missingSource: {
          count: countMissingSource,
          percentage: total > 0 ? Math.round((countMissingSource / total) * 100) : 0,
          severity: 'CRITICAL',
        },
        possibleDuplicate: {
          count: countPossibleDuplicate,
          percentage: total > 0 ? Math.round((countPossibleDuplicate / total) * 100) : 0,
          severity: 'CRITICAL',
        },
        outdated: {
          count: countOutdated,
          percentage: total > 0 ? Math.round((countOutdated / total) * 100) : 0,
          severity: 'MEDIUM',
        },
        hasErrors: {
          count: countHasErrors,
          percentage: total > 0 ? Math.round((countHasErrors / total) * 100) : 0,
          severity: 'CRITICAL',
        },
      },
      severityDistribution: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
      lastScannedAt: new Date().toISOString(),
    };

    return { summary, reports };
  }

  /**
   * Quick resolution of an incident by updating product fields
   */
  public async quickFixProduct(
    productId: number,
    data: {
      model?: string;
      description?: string;
      technicalSpecs?: string;
      sourceUrl?: string;
      imageUrl?: string;
      verificationStatus?: string;
    },
    userEmail: string
  ): Promise<boolean> {
    const [prod] = await db.select().from(products).where(eq(products.id, productId));
    if (!prod) throw new Error('Producto no encontrado');

    const updateFields: any = {
      updatedAt: new Date(),
      lastValidatedAt: new Date(),
    };

    if (data.model !== undefined) updateFields.model = data.model;
    if (data.description !== undefined) updateFields.description = data.description;
    if (data.technicalSpecs !== undefined) updateFields.technicalSpecs = data.technicalSpecs;
    if (data.sourceUrl !== undefined) updateFields.sourceUrl = data.sourceUrl;
    if (data.verificationStatus !== undefined) {
      updateFields.verificationStatus = data.verificationStatus;
      if (data.verificationStatus === 'VERIFIED') {
        updateFields.verifiedBy = userEmail;
        updateFields.verifiedAt = new Date();
      }
    }

    await db.update(products).set(updateFields).where(eq(products.id, productId));

    // If image was provided, insert it
    if (data.imageUrl && data.imageUrl.trim().length > 0) {
      await db.insert(productImages).values({
        productId,
        url: data.imageUrl.trim(),
        altText: prod.name,
        sortOrder: 0,
      });
    }

    return true;
  }
}

export const catalogQualityService = new CatalogQualityService();
