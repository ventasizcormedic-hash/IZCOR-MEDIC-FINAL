import React from 'react';
import { Layers, X, ArrowRight, Trash2 } from 'lucide-react';
import { ComparisonProduct } from './types';

interface ComparisonBarProps {
  products: ComparisonProduct[];
  onOpenModal: () => void;
  onRemoveProduct: (productId: number) => void;
  onClearAll: () => void;
}

export function ComparisonBar({
  products,
  onOpenModal,
  onRemoveProduct,
  onClearAll,
}: ComparisonBarProps) {
  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-3xl px-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-brand-navy text-white rounded-2xl shadow-2xl p-3 sm:p-4 border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Indicator & Thumbnails */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 bg-brand-navy-light rounded-xl hidden sm:flex items-center justify-center">
            <Layers className="w-5 h-5 text-cyan-300" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                Comparador Técnico
              </span>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                {products.length}/4
              </span>
            </div>
            <p className="text-xs text-slate-300 hidden md:block">
              {products.length === 1 ? 'Seleccione otro equipo para comparar' : 'Equipos listos para análisis lado a lado'}
            </p>
          </div>

          {/* Mini product avatars */}
          <div className="flex items-center -space-x-2 ml-auto sm:ml-2">
            {products.map((p) => (
              <div 
                key={p.id}
                className="relative group w-9 h-9 rounded-lg bg-white p-1 border-2 border-brand-navy overflow-hidden shadow-xs"
                title={p.name}
              >
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => onRemoveProduct(p.id)}
                  aria-label="Quitar producto"
                  className="absolute inset-0 bg-rose-900/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onClearAll}
            className="h-9 px-3 text-xs font-bold text-slate-300 hover:text-white active:scale-95 transition-all rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={onOpenModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-brand-cyan hover:bg-[#00a3b8] active:bg-[#008f9f] text-brand-navy font-black text-xs shadow-xs hover:shadow active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan cursor-pointer"
          >
            <span>Comparar ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>

      </div>
    </div>
  );
}
