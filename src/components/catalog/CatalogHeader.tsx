import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, X, ShieldCheck, ChevronRight, Grid3x3, List, 
  Filter, SlidersHorizontal, ArrowUpDown, History, Sparkles 
} from 'lucide-react';
import { ViewMode, SortOption } from './types';
import { MedicalSearchBox } from './MedicalSearchBox';

interface CatalogHeaderProps {
  searchTerm: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
  activeCategoryName?: string | null;
  activeSubcategoryName?: string | null;
  activeBrandName?: string | null;
  totalProducts: number;
  currentPage: number;
  itemsPerPage: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenMobileFilters: () => void;
  activeFiltersCount: number;
}

export function CatalogHeader({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  activeCategoryName,
  activeSubcategoryName,
  activeBrandName,
  totalProducts,
  currentPage,
  itemsPerPage,
  viewMode,
  onViewModeChange,
  sort,
  onSortChange,
  onOpenMobileFilters,
  activeFiltersCount,
}: CatalogHeaderProps) {
  const startCount = totalProducts === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endCount = Math.min(currentPage * itemsPerPage, totalProducts);

  return (
    <div className="space-y-6 mb-8">
      {/* 1. Navigable Breadcrumbs */}
      <nav className="flex text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1.5 md:space-x-2 flex-wrap">
          <li>
            <Link to="/" className="hover:text-brand-navy transition-colors">Inicio</Link>
          </li>
          <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
          <li>
            <Link to="/productos" className="hover:text-brand-navy transition-colors">Catálogo</Link>
          </li>

          {activeCategoryName && (
            <>
              <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
              <li className="text-slate-700 font-bold">{activeCategoryName}</li>
            </>
          )}

          {activeSubcategoryName && (
            <>
              <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
              <li className="text-brand-cyan font-bold">{activeSubcategoryName}</li>
            </>
          )}

          {activeBrandName && !activeCategoryName && (
            <>
              <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
              <li className="text-brand-cyan font-bold">Marca: {activeBrandName}</li>
            </>
          )}
        </ol>
      </nav>

      {/* 2. Corporate Institutional Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none hidden lg:block" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-[#2C3E50] text-white mb-3 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              Catálogo Oficial Multimarca de Suministro Médico
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#2C3E50] tracking-tight mb-2">
              Equipamiento, Insumos y Tecnología Hospitalaria
            </h1>

            <p className="text-slate-600 text-sm md:text-base max-w-3xl leading-relaxed">
              Base de datos integral preparada para licitaciones públicas (OSCE / Seace), compras corporativas y abastecimiento continuo para hospitales, clínicas y laboratorios clínicos a nivel nacional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <Link
              to="/tdr"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-cyan-50 text-cyan-800 hover:bg-cyan-100 active:bg-cyan-200 font-bold text-xs border border-cyan-200 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
            >
              Cargar TDR / Términos de Referencia
            </Link>
            <Link
              to="/cotizar"
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-brand-cyan hover:bg-[#0087a3] active:bg-[#00768e] text-white font-bold text-xs shadow-xs hover:shadow active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
            >
              Solicitar Cotización Formal
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Search and View Controls Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Specialized Medical Search Box with Autocomplete & Suggestions */}
          <div className="flex-1">
            <MedicalSearchBox
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              onSearchSubmit={() => {
                if (onSearchSubmit) onSearchSubmit();
              }}
              placeholder="Buscar por equipo, modelo, fabricante, SKU, marca o especialidad médica..."
            />
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 flex-shrink-0 min-w-0">
            
            {/* Mobile Filter Button */}
            <button
              onClick={onOpenMobileFilters}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold hover:bg-slate-100 transition-colors relative"
            >
              <Filter className="w-3.5 h-3.5 text-brand-navy" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-navy text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="hidden sm:inline">Ordenar:</span>
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="max-w-[calc(100vw-190px)] sm:max-w-none px-2.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:border-brand-navy cursor-pointer"
              >
                <option value="recent">Más recientes</option>
                <option value="name-asc">Nombre (A - Z)</option>
                <option value="name-desc">Nombre (Z - A)</option>
                <option value="brand-asc">Marca (A - Z)</option>
                <option value="manufacturer-asc">Fabricante (A - Z)</option>
                <option value="featured">Destacados primero</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid vs List) */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => onViewModeChange('grid')}
                aria-label="Vista en cuadrícula"
                title="Vista en cuadrícula"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-brand-navy shadow-2xs font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                aria-label="Vista detallada en lista"
                title="Vista técnica en lista"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-brand-navy shadow-2xs font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-600">
          <div>
            Mostrando <strong className="text-slate-900 font-extrabold">{startCount} - {endCount}</strong> de{' '}
            <strong className="text-slate-900 font-extrabold">{totalProducts.toLocaleString()}</strong> productos encontrados
          </div>
          <div className="hidden sm:block text-slate-400 text-[11px]">
            Suministro certificado DIGEMID • Asesoría biomédica incluida
          </div>
        </div>

      </div>
    </div>
  );
}
