import React from 'react';
import { X, RotateCcw, Filter, Check } from 'lucide-react';
import { FilterSidebar } from './FilterSidebar';
import { CategoryWithSubcategories, Brand } from '../../types';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryWithSubcategories[];
  brands: Array<Brand & { productCount?: number }>;
  manufacturers: Array<{ manufacturer: string; count: number }>;
  procedencias?: Array<{ procedencia: string; count: number }>;
  clinicalApplications: string[];
  selectedCategory: string;
  selectedSubcategory: string;
  selectedBrand: string;
  selectedManufacturer: string;
  selectedProcedencia?: string;
  selectedApplication: string;
  selectedVerificationStatus: string;
  onSelectCategory: (idOrSlug: string) => void;
  onSelectSubcategory: (idOrSlug: string) => void;
  onSelectBrand: (idOrSlug: string) => void;
  onSelectManufacturer: (name: string) => void;
  onSelectProcedencia?: (proc: string) => void;
  onSelectApplication: (app: string) => void;
  onSelectVerificationStatus: (status: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  totalResults: number;
}

export function FilterDrawer({
  isOpen,
  onClose,
  categories,
  brands,
  manufacturers,
  procedencias,
  clinicalApplications,
  selectedCategory,
  selectedSubcategory,
  selectedBrand,
  selectedManufacturer,
  selectedProcedencia = '',
  selectedApplication,
  selectedVerificationStatus,
  onSelectCategory,
  onSelectSubcategory,
  onSelectBrand,
  onSelectManufacturer,
  onSelectProcedencia = () => {},
  onSelectApplication,
  onSelectVerificationStatus,
  onClearAll,
  hasActiveFilters,
  totalResults,
}: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-brand-navy" />
              <h2 className="text-base font-black text-slate-900">
                Filtros del Catálogo
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Cerrar filtros"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Filters Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <FilterSidebar
              categories={categories}
              brands={brands}
              manufacturers={manufacturers}
              procedencias={procedencias}
              clinicalApplications={clinicalApplications}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              selectedBrand={selectedBrand}
              selectedManufacturer={selectedManufacturer}
              selectedProcedencia={selectedProcedencia}
              selectedApplication={selectedApplication}
              selectedVerificationStatus={selectedVerificationStatus}
              onSelectCategory={onSelectCategory}
              onSelectSubcategory={onSelectSubcategory}
              onSelectBrand={onSelectBrand}
              onSelectManufacturer={onSelectManufacturer}
              onSelectProcedencia={onSelectProcedencia}
              onSelectApplication={onSelectApplication}
              onSelectVerificationStatus={onSelectVerificationStatus}
              onClearAll={onClearAll}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearAll}
                className="h-11 px-4 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 active:scale-[0.98] flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Limpiar</span>
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 px-4 bg-brand-navy hover:bg-brand-navy-light active:bg-brand-cyan text-white font-bold text-xs rounded-xl shadow-xs hover:shadow active:scale-[0.98] flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy cursor-pointer"
            >
              <Check className="w-4 h-4 text-cyan-300" />
              <span>Ver {totalResults.toLocaleString()} resultados</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
