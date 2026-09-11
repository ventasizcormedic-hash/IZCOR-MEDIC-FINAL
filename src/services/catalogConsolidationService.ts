import { eq, ilike, sql } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { products, brands, categories, productImages, productDocuments } from '../db/schema.ts';
import type { ScrapedProduct } from './scraperService.ts';

export interface ConsolidationOptions {
  targetVerificationStatus?: 'VERIFIED' | 'DRAFT' | 'PENDING REVIEW';
  confidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ConsolidationResult {
  productId: number;
  slug: string;
  name: string;
  brandName: string;
  verificationStatus: string;
  isNew: boolean;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 200);
}

export class CatalogConsolidationService {
  /**
   * Resolves an existing brand or creates a new one in the database
   */
  async resolveBrand(brandName: string): Promise<number> {
    const cleanName = brandName.trim();
    const existing = await db
      .select({ id: brands.id, name: brands.name })
      .from(brands)
      .where(ilike(brands.name, cleanName))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].id;
    }

    // Create new brand
    const baseSlug = slugify(cleanName) || 'marca';
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const [newBrand] = await db
      .insert(brands)
      .values({
        name: cleanName,
        slug: slug.substring(0, 255),
        manufacturer: cleanName,
        status: 'ACTIVE',
      })
      .returning({ id: brands.id });

    return newBrand.id;
  }

  /**
   * Resolves an existing category or maps to a sensible default category
   */
  async resolveCategory(categoryName?: string, subcategoryName?: string): Promise<{ categoryId: number; subcategoryId: number | null }> {
    const rawCategory = categoryName && categoryName !== 'Sin categoría' && categoryName !== 'Categoría por definir'
      ? categoryName.trim()
      : 'Equipos Médicos';

    // Find category
    let matchedCategory = await db
      .select({ id: categories.id })
      .from(categories)
      .where(ilike(categories.name, rawCategory))
      .limit(1);

    let categoryId: number;
    if (matchedCategory.length > 0) {
      categoryId = matchedCategory[0].id;
    } else {
      const baseSlug = slugify(rawCategory) || 'categoria';
      const [newCat] = await db
        .insert(categories)
        .values({
          name: rawCategory,
          slug: `${baseSlug}-${Date.now().toString().slice(-4)}`.substring(0, 255),
          status: 'ACTIVE',
        })
        .returning({ id: categories.id });
      categoryId = newCat.id;
    }

    // Resolve subcategory if provided
    let subcategoryId: number | null = null;
    if (subcategoryName && subcategoryName !== 'Sin subcategoría' && subcategoryName !== rawCategory) {
      const cleanSub = subcategoryName.trim();
      const matchedSub = await db
        .select({ id: categories.id })
        .from(categories)
        .where(ilike(categories.name, cleanSub))
        .limit(1);

      if (matchedSub.length > 0) {
        subcategoryId = matchedSub[0].id;
      } else {
        const subSlug = slugify(cleanSub) || 'subcategoria';
        const [newSub] = await db
          .insert(categories)
          .values({
            name: cleanSub,
            slug: `${subSlug}-${Date.now().toString().slice(-4)}`.substring(0, 255),
            parentId: categoryId,
            status: 'ACTIVE',
          })
          .returning({ id: categories.id });
        subcategoryId = newSub.id;
      }
    }

    return { categoryId, subcategoryId };
  }

  /**
   * Calculates confidence level based on quality of extracted data
   */
  calculateConfidence(product: ScrapedProduct): 'HIGH' | 'MEDIUM' | 'LOW' {
    const hasModel = Boolean(product.model && product.model.trim().length > 0);
    const hasLongDesc = Boolean(product.description && product.description.length >= 100);
    const hasSpecs = Boolean(product.features && product.features.length >= 3);
    const hasImage = Boolean(product.imageUrl);

    if (hasModel && hasLongDesc && hasSpecs && hasImage) {
      return 'HIGH';
    }
    if ((hasModel && hasSpecs) || (hasLongDesc && hasImage)) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  /**
   * Consolidates a single scraped product into the official database,
   * setting its verificationStatus to VERIFIED or DRAFT.
   */
  async consolidateProduct(
    product: ScrapedProduct,
    options: ConsolidationOptions = {}
  ): Promise<ConsolidationResult> {
    const targetStatus = options.targetVerificationStatus || 'VERIFIED';
    const confidence = options.confidenceLevel || this.calculateConfidence(product);

    // 1. Resolve Brand
    const brandId = await this.resolveBrand(product.brand);

    // 2. Resolve Category & Subcategory
    const { categoryId, subcategoryId } = await this.resolveCategory(product.category, product.subcategory);

    // 3. Generate consistent slug
    const brandPart = slugify(product.brand);
    const namePart = slugify(product.name);
    const modelPart = product.model ? `-${slugify(product.model)}` : '';
    let baseSlug = `${brandPart}-${namePart}${modelPart}`.substring(0, 230);

    // 4. Check if product already exists by sourceUrl or exact slug
    let existingProduct = await db
      .select({ id: products.id, slug: products.slug })
      .from(products)
      .where(sql`${products.sourceUrl} = ${product.sourceUrl} OR ${products.slug} = ${baseSlug}`)
      .limit(1);

    let productId: number;
    let finalSlug: string;
    let isNew = false;

    const technicalSpecsString = Array.isArray(product.features) && product.features.length > 0
      ? JSON.stringify(product.features)
      : null;

    const appString = Array.isArray(product.application) && product.application.length > 0
      ? product.application.join(', ')
      : null;

    if (existingProduct.length > 0) {
      // Update existing product
      productId = existingProduct[0].id;
      finalSlug = existingProduct[0].slug;

      await db
        .update(products)
        .set({
          brandId,
          manufacturer: product.brand,
          name: product.name.substring(0, 255),
          model: product.model ? product.model.substring(0, 255) : null,
          categoryId,
          subcategoryId,
          description: product.description || null,
          technicalSpecs: technicalSpecsString,
          application: appString,
          presentation: product.presentation ? product.presentation.substring(0, 255) : null,
          status: targetStatus === 'VERIFIED' ? 'PUBLISHED' : 'DRAFT',
          verificationStatus: targetStatus,
          confidenceLevel: confidence,
          sourceUrl: product.sourceUrl,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));
    } else {
      // Insert new product
      isNew = true;
      // Ensure unique slug
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`.substring(0, 255);

      const [newProd] = await db
        .insert(products)
        .values({
          brandId,
          manufacturer: product.brand,
          name: product.name.substring(0, 255),
          model: product.model ? product.model.substring(0, 255) : null,
          categoryId,
          subcategoryId,
          description: product.description || null,
          technicalSpecs: technicalSpecsString,
          application: appString,
          presentation: product.presentation ? product.presentation.substring(0, 255) : null,
          status: targetStatus === 'VERIFIED' ? 'PUBLISHED' : 'DRAFT',
          verificationStatus: targetStatus,
          confidenceLevel: confidence,
          slug: finalSlug,
          sourceUrl: product.sourceUrl,
        })
        .returning({ id: products.id });

      productId = newProd.id;
    }

    // 5. Store image if available
    if (product.imageUrl) {
      const existingImage = await db
        .select({ id: productImages.id })
        .from(productImages)
        .where(sql`${productImages.productId} = ${productId} AND ${productImages.url} = ${product.imageUrl}`)
        .limit(1);

      if (existingImage.length === 0) {
        await db.insert(productImages).values({
          productId,
          url: product.imageUrl,
          sourceUrl: product.sourceUrl,
          altText: product.name.substring(0, 255),
          sortOrder: 0,
        });
      }
    }

    // 6. Store datasheet document if available
    if (product.datasheetUrl) {
      const existingDoc = await db
        .select({ id: productDocuments.id })
        .from(productDocuments)
        .where(sql`${productDocuments.productId} = ${productId} AND ${productDocuments.url} = ${product.datasheetUrl}`)
        .limit(1);

      if (existingDoc.length === 0) {
        await db.insert(productDocuments).values({
          productId,
          url: product.datasheetUrl,
          type: 'DATASHEET',
          sourceUrl: product.sourceUrl,
          title: `Ficha Técnica - ${product.name}`.substring(0, 255),
        });
      }
    }

    return {
      productId,
      slug: finalSlug,
      name: product.name,
      brandName: product.brand,
      verificationStatus: targetStatus,
      isNew,
    };
  }

  /**
   * Bulk consolidates an array of scraped products into the database
   */
  async bulkConsolidate(
    scrapedItems: ScrapedProduct[],
    options: ConsolidationOptions = {}
  ): Promise<{
    total: number;
    consolidatedCount: number;
    results: ConsolidationResult[];
    errors: { product: string; error: string }[];
  }> {
    const results: ConsolidationResult[] = [];
    const errors: { product: string; error: string }[] = [];

    for (const item of scrapedItems) {
      try {
        const result = await this.consolidateProduct(item, options);
        results.push(result);
      } catch (err: any) {
        console.error(`Error consolidando producto ${item.name}:`, err);
        errors.push({
          product: item.name,
          error: err.message || 'Error desconocido al consolidar',
        });
      }
    }

    return {
      total: scrapedItems.length,
      consolidatedCount: results.length,
      results,
      errors,
    };
  }
}

export const catalogConsolidationService = new CatalogConsolidationService();
