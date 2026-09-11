import { Product, Brand, Category, CategoryWithSubcategories, VerificationStatus } from '../../types';

export type ViewMode = 'grid' | 'list';

export type SortOption = 
  | 'recent'
  | 'name-asc'
  | 'name-desc'
  | 'brand-asc'
  | 'manufacturer-asc'
  | 'featured';

export interface CatalogFilterState {
  search: string;
  category: string;
  subcategory: string;
  brand: string;
  manufacturer: string;
  application: string;
  verificationStatus: string;
  sort: SortOption;
  page: number;
  limit: number;
  viewMode: ViewMode;
}

export interface ComparisonProduct {
  id: number;
  name: string;
  slug: string;
  model?: string | null;
  catalogNumber?: string | null;
  brandName?: string | null;
  manufacturer?: string | null;
  categoryName?: string | null;
  imageUrl?: string | null;
  technicalSpecs?: string | null;
  application?: string | null;
  verificationStatus?: string | null;
  presentation?: string | null;
}
