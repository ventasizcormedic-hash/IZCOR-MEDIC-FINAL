import { ProductImageItem, ImageContextOptions } from './types';

/**
 * Normalizes an array of product images strictly enforcing:
 * - Direct association to productId (and activeModelId / activeVariantId when provided)
 * - URL deduplication
 * - Explicit order (sortOrder ASC, id ASC)
 * - Primary image assignment
 * - Illustrative vs official detection
 */
export function normalizeProductImages(
  rawImages: Array<Partial<ProductImageItem> | any> | null | undefined,
  context: {
    productId: number;
    productName: string;
    brandName?: string | null;
    model?: string | null;
    catalogNumber?: string | null;
    activeModelId?: string | number | null;
    activeVariantId?: string | number | null;
  }
): ProductImageItem[] {
  if (!rawImages || !Array.isArray(rawImages) || rawImages.length === 0) {
    return [];
  }

  const seenUrls = new Set<string>();
  const validImages: ProductImageItem[] = [];

  for (let i = 0; i < rawImages.length; i++) {
    const raw = rawImages[i];
    if (!raw) continue;

    const url = typeof raw.url === 'string' ? raw.url.trim() : '';
    if (!url || !url.startsWith('http')) continue;

    // Guard: Prevent cross-product leakage.
    // If raw.productId exists, it MUST match the target productId!
    if (raw.productId && Number(raw.productId) !== Number(context.productId)) {
      console.warn(`[Image Security] Rejected cross-product image id ${raw.id} (productId: ${raw.productId}) for target product ${context.productId}`);
      continue;
    }

    // Guard: Prevent cross-model / cross-variant leakage when specific model/variant is queried
    if (context.activeModelId && raw.modelId && String(raw.modelId) !== String(context.activeModelId)) {
      continue;
    }
    if (context.activeVariantId && raw.variantId && String(raw.variantId) !== String(context.activeVariantId)) {
      continue;
    }

    // Deduplicate identical URLs within the same product
    if (seenUrls.has(url)) {
      continue;
    }
    seenUrls.add(url);

    // Detect if image is explicitly illustrative
    const isIllustrative = Boolean(
      raw.isIllustrative === true ||
      raw.licenseStatus?.toUpperCase() === 'ILLUSTRATIVE' ||
      raw.licenseStatus?.toUpperCase() === 'ILUSTRATIVA' ||
      raw.altText?.toLowerCase().includes('ilustrativa') ||
      raw.imageType === 'illustration'
    );

    // Detect explicit primary indicator
    const isExplicitPrimary = Boolean(
      raw.isPrimary === true ||
      raw.licenseStatus?.toUpperCase() === 'PRIMARY' ||
      raw.filename?.toLowerCase() === 'primary' ||
      raw.filename?.toLowerCase() === 'main'
    );

    const sortOrder = typeof raw.sortOrder === 'number' ? raw.sortOrder : i;

    // Formulate truthful ALT text based on official product metadata
    const altText = raw.altText && raw.altText.trim()
      ? raw.altText.trim()
      : buildDefaultAltText(context.productName, context.brandName, context.model, i, rawImages.length);

    validImages.push({
      id: raw.id || i + 1,
      productId: context.productId,
      modelId: raw.modelId || null,
      variantId: raw.variantId || null,
      url,
      thumbnailUrl: raw.thumbnailUrl || url,
      altText,
      filename: raw.filename || null,
      licenseStatus: raw.licenseStatus || null,
      sortOrder,
      isPrimary: isExplicitPrimary,
      isIllustrative,
      imageType: raw.imageType || (isIllustrative ? 'illustration' : 'product'),
      status: raw.status || 'available',
      source: raw.source || null,
      sourceUrl: raw.sourceUrl || null,
      createdAt: raw.createdAt || null,
      updatedAt: raw.updatedAt || null,
    });
  }

  // Sort images strictly: sortOrder ASC, then id ASC
  validImages.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.id - b.id;
  });

  // Ensure exactly ONE primary image is flagged
  if (validImages.length > 0) {
    const hasPrimary = validImages.some(img => img.isPrimary);
    if (!hasPrimary) {
      // First sorted image becomes the primary by rule
      validImages[0].isPrimary = true;
    } else {
      // Ensure only the FIRST matched primary retains the flag
      let foundFirst = false;
      for (const img of validImages) {
        if (img.isPrimary) {
          if (!foundFirst) {
            foundFirst = true;
          } else {
            img.isPrimary = false;
          }
        }
      }
    }
  }

  return validImages;
}

/**
 * Returns the primary image or null if no valid image exists.
 */
export function getPrimaryProductImage(
  images: Array<Partial<ProductImageItem> | any> | null | undefined,
  fallbackUrl?: string | null,
  context?: {
    productId?: number;
    productName?: string;
    brandName?: string | null;
  }
): ProductImageItem | null {
  if (images && images.length > 0) {
    const normalized = normalizeProductImages(images, {
      productId: context?.productId || 0,
      productName: context?.productName || 'Producto Médico',
      brandName: context?.brandName,
    });
    const primary = normalized.find(img => img.isPrimary) || normalized[0];
    if (primary) return primary;
  }

  if (fallbackUrl && typeof fallbackUrl === 'string' && fallbackUrl.startsWith('http')) {
    return {
      id: 0,
      productId: context?.productId || 0,
      url: fallbackUrl,
      thumbnailUrl: fallbackUrl,
      altText: context?.productName || 'Producto Médico',
      sortOrder: 0,
      isPrimary: true,
      isIllustrative: false,
      imageType: 'product',
      status: 'available',
    };
  }

  return null;
}

/**
 * Truthful, descriptive ALT text generator
 */
function buildDefaultAltText(
  productName: string, 
  brandName?: string | null, 
  model?: string | null,
  index: number = 0,
  total: number = 1
): string {
  const brandStr = brandName ? ` - ${brandName}` : '';
  const modelStr = model ? ` (${model})` : '';
  const viewStr = total > 1 ? ` - Vista ${index + 1}` : '';
  return `Fotografía técnica de ${productName}${modelStr}${brandStr}${viewStr}`;
}
