import React, { useState } from 'react';
import { 
  Filter, RotateCcw, ChevronDown, ChevronRight, CheckCircle2, 
  Search, ShieldCheck, Stethoscope, Factory, Tag, Layers, Globe
} from 'lucide-react';
import { CategoryWithSubcategories, Brand } from '../../types';

interface FilterSidebarProps {
  categories: CategoryWithSubcategories[];
  brands: Array<Brand & { productCount?: number }>;
  manufacturers: Array<{ manufacturer: string; count: number }>;
  clinicalApplications: string[];
  procedencias?: Array<{ procedencia: string; count: number }>;
  selectedCategory: string;
  selectedSubcategory: string;
  selectedBrand: string;
  selectedManufacturer: string;
  selectedApplication: string;
  selectedVerificationStatus: string;
  selectedProcedencia?: string;
  onSelectCategory: (idOrSlug: string) => void;
  onSelectSubcategory: (idOrSlug: string) => void;
  onSelectBrand: (idOrSlug: string) => void;
  onSelectManufacturer: (name: string) => void;
  onSelectApplication: (app: string) => void;
  onSelectVerificationStatus: (status: string) => void;
  onSelectProcedencia?: (p: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export function FilterSidebar({
  categories,
  brands,
  manufacturers,
  clinicalApplications,
  procedencias = [],
  selectedCategory,
  selectedSubcategory,
  selectedBrand,
  selectedManufacturer,
  selectedApplication,
  selectedVerificationStatus,
  selectedProcedencia = '',
  onSelectCategory,
  onSelectSubcategory,
  onSelectBrand,
  onSelectManufacturer,
  onSelectApplication,
  onSelectVerificationStatus,
  onSelectProcedencia,
  onClearAll,
  hasActiveFilters,
}: FilterSidebarProps) {
  const [brandSearch, setBrandSearch] = useState('');
  const [mfgSearch, setMfgSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});

  const toggleCategoryExpand = (catId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(brandSearch.toLowerCase().trim())
  );

  const filteredManufacturers = manufacturers.filter(m => 
    m.manufacturer.toLowerCase().includes(mfgSearch.toLowerCase().trim())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-brand-navy" />
          <span>Filtros Especializados</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* 1. Categorías y Subcategorías */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-navy" />
            Líneas y Categorías
          </h3>
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {/* Todas las categorías */}
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
              selectedCategory === '' && selectedSubcategory === ''
                ? 'bg-brand-navy text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Todas las líneas</span>
          </button>

          {categories.map((cat) => {
            const isCatSelected = selectedCategory === cat.id.toString() || selectedCategory === cat.slug;
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;
            const isExpanded = expandedCats[cat.id] || isCatSelected;

            return (
              <div key={cat.id} className="space-y-0.5">
                <div
                  className={`w-full rounded-lg transition-colors flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
                    isCatSelected && selectedSubcategory === ''
                      ? 'bg-brand-navy text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => onSelectCategory(cat.id.toString())}
                >
                  <span className="truncate flex-1 pr-1">{cat.name}</span>
                  
                  <div className="flex items-center gap-1">
                    {cat.productCount !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isCatSelected && selectedSubcategory === '' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {cat.productCount}
                      </span>
                    )}

                    {hasSubs && (
                      <button
                        onClick={(e) => toggleCategoryExpand(cat.id, e)}
                        className="p-0.5 hover:bg-white/30 rounded"
                        aria-label="Expandir subcategorías"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Subcategories list */}
                {hasSubs && isExpanded && (
                  <div className="pl-3.5 ml-2 border-l-2 border-slate-200 space-y-0.5 py-1">
                    {cat.subcategories!.map((sub) => {
                      const isSubSelected = selectedSubcategory === sub.id.toString() || selectedSubcategory === sub.slug;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => onSelectSubcategory(sub.id.toString())}
                          className={`w-full text-left px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center justify-between ${
                            isSubSelected
                              ? 'bg-cyan-50 text-cyan-950 font-bold border border-cyan-200'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate pr-1">{sub.name}</span>
                          {isSubSelected && (
                            <CheckCircle2 className="w-3 h-3 text-cyan-700 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Fabricantes (Manufacturers) */}
      {manufacturers.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Factory className="w-3.5 h-3.5 text-brand-navy" />
            Fabricante
          </h3>

          {manufacturers.length > 5 && (
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Buscar fabricante..."
                value={mfgSearch}
                onChange={(e) => setMfgSearch(e.target.value)}
                className="w-full text-xs pl-7 pr-2 py-1.5 bg-slate-50 rounded-md border border-slate-200 focus:outline-none focus:border-brand-navy"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          )}

          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            <button
              onClick={() => onSelectManufacturer('')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                selectedManufacturer === ''
                  ? 'bg-brand-navy text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Todos los fabricantes</span>
            </button>

            {filteredManufacturers.map((m) => {
              const isSelected = selectedManufacturer === m.manufacturer;
              return (
                <button
                  key={m.manufacturer}
                  onClick={() => onSelectManufacturer(isSelected ? '' : m.manufacturer)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-navy text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-2">{m.manufacturer}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {m.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Marcas (Brands) */}
      {brands.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-brand-navy" />
            Marcas
          </h3>

          {brands.length > 5 && (
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Buscar marca..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full text-xs pl-7 pr-2 py-1.5 bg-slate-50 rounded-md border border-slate-200 focus:outline-none focus:border-brand-navy"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          )}

          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            <button
              onClick={() => onSelectBrand('')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                selectedBrand === ''
                  ? 'bg-brand-navy text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Todas las marcas</span>
            </button>

            {filteredBrands.map((b) => {
              const isSelected = selectedBrand === b.id.toString() || selectedBrand === b.slug;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBrand(isSelected ? '' : b.id.toString())}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-navy text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-2">{b.name}</span>
                  {b.productCount !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {b.productCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Aplicaciones Clínicas */}
      {clinicalApplications.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-brand-navy" />
            Área o Especialidad Clínica
          </h3>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            <button
              onClick={() => onSelectApplication('')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                selectedApplication === ''
                  ? 'bg-brand-navy text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Todas las áreas</span>
            </button>

            {clinicalApplications.map((app) => {
              const isSelected = selectedApplication === app;
              return (
                <button
                  key={app}
                  onClick={() => onSelectApplication(isSelected ? '' : app)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-2">{app}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-200 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Estado Regulatorio y Certificación */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-navy" />
          Validación Regulatoria
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onSelectVerificationStatus('')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
              selectedVerificationStatus === '' || selectedVerificationStatus === 'ALL'
                ? 'bg-brand-navy text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Todos los productos</span>
          </button>
          <button
            onClick={() => onSelectVerificationStatus('VERIFIED')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
              selectedVerificationStatus === 'VERIFIED'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Homologados / Verificados
            </span>
          </button>
        </div>
      </div>
      {/* 6. Procedencia (Country of Origin) — built from real Excel data */}
      {procedencias.length > 0 && onSelectProcedencia && (
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            País de Procedencia
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => onSelectProcedencia('')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                selectedProcedencia === ''
                  ? 'bg-brand-navy text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Todos los países</span>
            </button>
            {procedencias.slice(0, 20).map(({ procedencia, count }) => {
              const isSelected = selectedProcedencia === procedencia;
              return (
                <button
                  key={procedencia}
                  onClick={() => onSelectProcedencia(isSelected ? '' : procedencia)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-700 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-2">{procedencia}</span>
                  <span className={`text-[10px] font-bold rounded px-1 flex-shrink-0 ${
                    isSelected ? 'bg-teal-600 text-white' : 'text-slate-400'
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
