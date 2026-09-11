import React from 'react';
import { Link } from 'react-router-dom';
import { Search, RotateCcw, ChevronRight, FileText, Sparkles, Stethoscope } from 'lucide-react';

interface EmptyCatalogStateProps {
  onClearFilters: () => void;
  onApplySuggestedSearch: (query: string) => void;
}

export function EmptyCatalogState({
  onClearFilters,
  onApplySuggestedSearch,
}: EmptyCatalogStateProps) {
  const suggestedTerms = [
    'Monitor Mindray',
    'Elisio',
    'Catéter',
    'Surdial',
    'Clorhexidina',
    'Ultrasonido',
    'Mobiliario Clínico',
  ];

  return (
    <div className="bg-white rounded-2xl p-8 md:p-14 text-center border border-slate-200/90 shadow-xs">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-400">
        <Search className="w-8 h-8 text-brand-navy" strokeWidth={1.75} />
      </div>

      <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">
        No se encontraron equipos o insumos con estos criterios
      </h3>

      <p className="text-slate-600 text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-6">
        No pudimos encontrar productos médicos que coincidan con todos los filtros activos o el término buscado.
      </p>

      {/* Suggested Search Pills */}
      <div className="mb-8">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
          Búsquedas técnicas sugeridas
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
          {suggestedTerms.map((term) => (
            <button
              key={term}
              onClick={() => onApplySuggestedSearch(term)}
              className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 hover:text-brand-navy active:bg-slate-100 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer todos los filtros</span>
        </button>

        <Link
          to="/cotizar"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-brand-navy hover:bg-brand-navy-light active:bg-brand-cyan text-white font-bold text-xs shadow-xs hover:shadow active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Cotizar Producto No Listado / A Medida</span>
        </Link>
      </div>
    </div>
  );
}
