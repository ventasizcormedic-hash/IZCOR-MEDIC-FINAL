import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { RelatedProductItem } from './types';

interface ProductRelatedProps {
  relatedProducts?: RelatedProductItem[];
  categoryName?: string | null;
}

export const ProductRelated: React.FC<ProductRelatedProps> = ({
  relatedProducts,
  categoryName,
}) => {
  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Productos Relacionados de la Línea
            </h2>
            <p className="text-xs text-slate-500">
              Equipamiento e insumos homologados en {categoryName || 'el catálogo'}
            </p>
          </div>
        </div>

        {categoryName && (
          <Link
            to={`/productos?category=${encodeURIComponent(categoryName)}`}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-brand-navy hover:underline"
          >
            <span>Ver más en {categoryName}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedProducts.map((rel) => (
          <Link
            key={rel.id}
            to={`/productos/${rel.slug}`}
            className="group p-4 rounded-xl border border-slate-200 bg-white hover:border-brand-navy hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Product Thumbnail with Fallback */}
              <div className="aspect-4/3 w-full bg-slate-50 rounded-lg p-2 flex items-center justify-center mb-3 overflow-hidden border border-slate-100">
                {rel.imageUrl ? (
                  <img
                    src={rel.imageUrl}
                    alt={rel.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <Activity className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-mono text-slate-400">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* Brand & Model */}
              <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
                <span className="font-bold text-brand-navy uppercase tracking-wider truncate">
                  {rel.brandName || 'IZCOR'}
                </span>
                {rel.model && (
                  <span className="font-mono text-slate-500 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded truncate">
                    {rel.model}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 group-hover:text-brand-navy transition-colors">
                {rel.name}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-brand-navy">
              <span>Ver Ficha Técnica</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
