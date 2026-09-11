import React from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, ArrowRight, Check } from 'lucide-react';
import { SiblingModelItem } from './types';

interface ProductVariantsAndModelsProps {
  currentModel?: string | null;
  currentName: string;
  siblingModels?: SiblingModelItem[];
  brandName?: string | null;
}

export const ProductVariantsAndModels: React.FC<ProductVariantsAndModelsProps> = ({
  currentModel,
  currentName,
  siblingModels,
  brandName,
}) => {
  if (!siblingModels || siblingModels.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center justify-center flex-shrink-0">
          <GitBranch className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">
            Modelos y Configuraciones de la Línea
          </h2>
          <p className="text-xs text-slate-500">
            Referencias alternativas homologadas por {brandName || 'el fabricante'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Current Active Model Card */}
        <div className="p-4 rounded-xl border-2 border-brand-navy bg-slate-50/70 relative">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-brand-navy uppercase tracking-wider">
              Modelo en Vista
            </span>
            <span className="w-5 h-5 rounded-full bg-brand-navy text-white flex items-center justify-center">
              <Check className="w-3 h-3" />
            </span>
          </div>
          <div className="font-bold text-slate-900 text-sm">{currentName}</div>
          {currentModel && (
            <span className="inline-block mt-2 text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
              Ref: {currentModel}
            </span>
          )}
        </div>

        {/* Other sibling models */}
        {siblingModels.map((item) => (
          <Link
            key={item.id}
            to={`/productos/${item.slug}`}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-brand-navy hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Referencia Alternativa
              </span>
              <div className="font-bold text-slate-800 group-hover:text-brand-navy text-sm mt-0.5 transition-colors">
                {item.name}
              </div>
              {item.model && (
                <span className="inline-block mt-2 text-xs font-mono font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                  Ref: {item.model}
                </span>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-navy">
              <span>Consultar Ficha</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
