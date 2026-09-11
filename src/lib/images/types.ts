/**
 * IZCOR MEDIC - Medical Product Images Architectural Types
 * Strictly ensures:
 * 1. Product/Model/Variant unequivocal relationship
 * 2. Primary image determination logic (isPrimary, sortOrder, manual selection)
 * 3. Support for 1 to 100+ images per product with consistent performance
 * 4. Distinct handling for Official vs Illustrative images
 * 5. Safe institutional fallbacks (no fake or cross-product images)
 */

export type ImageType = 
  | 'product' 
  | 'packaging' 
  | 'label' 
  | 'technical' 
  | 'accessory' 
  | 'illustration';

export type ImageStatus = 
  | 'available' 
  | 'invalid' 
  | 'pending' 
  | 'unavailable';

export interface ProductImageItem {
  id: number;
  productId: number;
  modelId?: string | number | null;
  variantId?: string | number | null;
  url: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  filename?: string | null;
  licenseStatus?: string | null;
  sortOrder: number;
  isPrimary?: boolean;
  isIllustrative?: boolean;
  imageType?: ImageType;
  status?: ImageStatus;
  source?: string | null;
  sourceUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ImageContextOptions {
  productName: string;
  brandName?: string | null;
  model?: string | null;
  catalogNumber?: string | null;
  activeModelId?: string | number | null;
  activeVariantId?: string | number | null;
}
