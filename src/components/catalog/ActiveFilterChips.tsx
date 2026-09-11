import React from 'react';
import { X, RotateCcw } from 'lucide-react';

interface ActiveFilterChipsProps {
  search: string;
  categoryName?: string | null;
  subcategoryName?: string | null;
  brandName?: string | null;
  manufacturer?: string | null;
  procedencia?: string | null;
  application?: string | null;
  verificationStatus?: string | null;
  onRemoveSearch: () => void;
  onRemoveCategory: () => void;
  onRemoveSubcategory: () => void;
  onRemoveBrand: () => void;
  onRemoveManufacturer: () => void;
  onRemoveProcedencia?: () => void;
  onRemoveApplication: () => void;
  onRemoveVerificationStatus: () => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  search,
  categoryName,
  subcategoryName,
  brandName,
  manufacturer,
  procedencia,
  application,
  verificationStatus,
  onRemoveSearch,
  onRemoveCategory,
  onRemoveSubcategory,
  onRemoveBrand,
  onRemoveManufacturer,
  onRemoveProcedencia,
  onRemoveApplication,
  onRemoveVerificationStatus,
  onClearAll,
}: ActiveFilterChipsProps) {
  const hasAnyFilter = Boolean(
    search ||
    categoryName ||
    subcategoryName ||
    brandName ||
    manufacturer ||
    procedencia ||
    application ||
    (verificationStatus && verificationStatus !== 'ALL')
  );

  if (!hasAnyFilter) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3 pb-1 border-t border-slate-100 text-xs">
      <span className="text-slate-500 font-semibold flex items-center gap-1">
        Filtros activos:
      </span>

      {/* Search Term Chip */}
      {search && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-medium border border-slate-200">
          <span>Búsqueda: <strong className="text-slate-900 font-bold">"{search}"</strong></span>
          <button
            onClick={onRemoveSearch}
            aria-label="Remover filtro de búsqueda"
            className="p-0.5 hover:bg-slate-200 rounded text-slate-500 hover:text-rose-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Category Chip */}
      {categoryName && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-navy/10 text-brand-navy font-medium border border-brand-navy/20">
          <span>Categoría: <strong className="font-bold">{categoryName}</strong></span>
          <button
            onClick={onRemoveCategory}
            aria-label="Remover categoría"
            className="p-0.5 hover:bg-brand-navy/20 rounded text-brand-navy hover:text-rose-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Subcategory Chip */}
      {subcategoryName && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-900 font-medium border border-cyan-200">
          <span>Subcategoría: <strong className="font-bold">{subcategoryName}</strong></span>
          <button
            onClick={onRemoveSubcategory}
            aria-label="Remover subcategoría"
            className="p-0.5 hover:bg-cyan-200 rounded text-cyan-700 hover:text-rose-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Brand Chip */}
      {brandName && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-800 font-medium border border-cyan-200">
          <span>Marca: <strong className="font-bold">{brandName}</strong></span>
          <button
            onClick={onRemoveBrand}
            aria-label="Remover marca"
            className="p-0.5 hover:bg-cyan-200 rounded text-cyan-800 hover:text-rose-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Manufacturer Chip */}
      {manufacturer && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 font-medium border border-amber-200">
          <span>Fabricante: <strong className="font-bold">{manufacturer}</strong></span>
          <button
            onClick={onRemoveManufacturer}
            aria-label="Remover fabricante"
            className="p-0.5 hover:bg-amber-200 rounded text-amber-700 hover:text-rose-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Procedencia (Country of Origin) Chip */}
      {procedencia && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 text-teal-900 font-medium border border-teal-200">
          <span>🌍 Procedencia: <strong className="font-bold">{procedencia}</strong></span>
          {onRemoveProcedencia && (
            <button
              onClick={onRemoveProcedencia}
              aria-label="Remover procedencia"
              className="p-0.5 hover:bg-teal-200 rounded text-teal-700 hover:text-rose-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      )}

      {/* Clinical Application Chip */}
      {application && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 font-medium border border-blue-200">
          <span>Área: <strong className="font-bold">{application}</strong></span>
          <button
            onClick={onRemoveApplication}
            aria-label="Remover área clínica"
            className="p-0.5 hover:bg-blue-200 rounded text-blue-700 hover:text-rose-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Verification Status Chip */}
      {verificationStatus && verificationStatus !== 'ALL' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 font-medium border border-emerald-200">
          <span>Estado: <strong className="font-bold">{verificationStatus}</strong></span>
          <button
            onClick={onRemoveVerificationStatus}
            aria-label="Remover estado de verificación"
            className="p-0.5 hover:bg-emerald-200 rounded text-emerald-700 hover:text-rose-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Reset All Filters Button */}
      <button
        onClick={onClearAll}
        className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-bold ml-1 transition-colors underline decoration-slate-300 hover:decoration-rose-600"
      >
        <RotateCcw className="w-3 h-3" />
        Limpiar todo
      </button>
    </div>
  );
}
