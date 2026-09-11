export type VerificationStatus = 'VERIFIED' | 'DRAFT' | 'PENDING REVIEW' | 'REJECTED' | 'OUTDATED';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ProductStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export interface Brand {
  id: number;
  name: string;
  slug: string;
  manufacturer?: string | null;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  sourceUrl?: string | null;
  status?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
  image?: string | null;
  status?: string | null;
  productCount?: number;
}

export interface CategoryWithSubcategories extends Category {
  subcategories?: Array<Category & { productCount?: number }>;
}

export interface CatalogFacets {
  totalProducts: number;
  categories: CategoryWithSubcategories[];
  allCategories: Category[];
  brands: Array<Brand & { productCount?: number }>;
  manufacturers: Array<{ manufacturer: string; count: number }>;
  clinicalApplications: string[];
  procedencias?: Array<{ procedencia: string; count: number }>;
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  sourceUrl?: string | null;
  altText?: string | null;
  filename?: string | null;
  licenseStatus?: string | null;
  sortOrder?: number | null;
}

export interface ProductDocument {
  id: number;
  productId: number;
  url: string;
  type?: string | null;
  sourceUrl?: string | null;
  title?: string | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  model?: string | null;
  catalogNumber?: string | null;
  brandId?: number | null;
  brandName?: string | null;
  manufacturer?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  subcategoryId?: number | null;
  description?: string | null;
  technicalSpecs?: string | null;
  application?: string | null;
  presentation?: string | null;
  status: ProductStatus;
  verificationStatus: VerificationStatus;
  confidenceLevel: ConfidenceLevel;
  featured?: boolean | null;
  sourceUrl?: string | null;
  imageUrl?: string | null;
  images?: ProductImage[];
  documents?: ProductDocument[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface QuoteItem {
  id: number;
  productId: number;
  name: string;
  brand: string;
  model?: string | null;
  quantity: number;
  imageUrl?: string | null;
  notes?: string | null;
}

export interface QuoteRequest {
  id?: number;
  name: string;
  company?: string | null;
  institution?: string | null;
  email: string;
  phone?: string | null;
  city?: string | null;
  message?: string | null;
  items: QuoteItem[];
}

export interface TdrSubmission {
  id?: number;
  name: string;
  institution: string;
  email: string;
  phone: string;
  description?: string;
  file?: File | null;
  fileUrl?: string;
}

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'STAFF';
  createdAt?: string | Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
  category?: string | number;
  brand?: string | number;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
