import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { NavProductItem } from './types';

interface ProductBreadcrumbProps {
  categoryName?: string | null;
  categorySlug?: string | null;
  subcategoryName?: string | null;
  subcategorySlug?: string | null;
  productName: string;
  prevProduct?: NavProductItem | null;
  nextProduct?: NavProductItem | null;
}

export const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({
  categoryName,
  categorySlug,
  subcategoryName,
  subcategorySlug,
  productName,
  prevProduct,
  nextProduct,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
      {/* Contextual Nav Trail */}
      <nav 
        aria-label="Ruta de navegación" 
        className="flex items-center text-xs font-semibold text-slate-500 flex-wrap gap-1.5"
      >
        <Link 
          to="/" 
          className="inline-flex items-center gap-1 hover:text-brand-navy text-slate-500 transition-colors"
          title="Ir a página de inicio"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Inicio</span>
        </Link>

        <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />

        <Link 
          to="/productos" 
          className="hover:text-brand-navy transition-colors text-slate-600"
        >
          Catálogo
        </Link>

        {categoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            <Link
              to={categorySlug ? `/categorias/${categorySlug}` : `/productos?category=${encodeURIComponent(categoryName)}`}
              className="hover:text-brand-navy transition-colors text-slate-600 max-w-[160px] sm:max-w-none truncate"
            >
              {categoryName}
            </Link>
          </>
        )}

        {subcategoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            <Link
              to={subcategorySlug ? `/categorias/${subcategorySlug}` : `/productos?category=${encodeURIComponent(categoryName || '')}&subcat=${encodeURIComponent(subcategorySlug || subcategoryName)}`}
              className="hover:text-brand-navy transition-colors text-slate-600 max-w-[160px] sm:max-w-none truncate"
            >
              {subcategoryName}
            </Link>
          </>
        )}

        <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
        <span className="text-slate-900 font-bold max-w-[220px] sm:max-w-xs truncate" title={productName}>
          {productName}
        </span>
      </nav>

      {/* Sibling Products Quick Navigation */}
      {(prevProduct || nextProduct) && (
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-medium text-slate-600">
          {prevProduct ? (
            <Link
              to={`/productos/${prevProduct.slug}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-brand-navy transition-colors shadow-2xs"
              title={`Anterior: ${prevProduct.name}`}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline text-[11px] text-slate-500">Anterior:</span>
              <span className="font-semibold text-slate-700 max-w-[100px] truncate">{prevProduct.model || prevProduct.name}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-slate-300 text-[11px] cursor-not-allowed">
              <ArrowLeft className="w-3 h-3" />
              <span>Primero</span>
            </span>
          )}

          {nextProduct ? (
            <Link
              to={`/productos/${nextProduct.slug}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-brand-navy transition-colors shadow-2xs"
              title={`Siguiente: ${nextProduct.name}`}
            >
              <span className="hidden md:inline text-[11px] text-slate-500">Siguiente:</span>
              <span className="font-semibold text-slate-700 max-w-[100px] truncate">{nextProduct.model || nextProduct.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-slate-300 text-[11px] cursor-not-allowed">
              <span>Último</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>
      )}
    </div>
  );
};
