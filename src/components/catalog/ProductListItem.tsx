import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowRight, Activity, Check, Layers } from 'lucide-react';
import { ComparisonProduct } from './types';
import { ProductQuickActions } from '../product/ProductQuickActions';

export interface ProductListItemProps {
  key?: React.Key;
  id: number;
  name: string;
  slug: string;
  brandName?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  catalogNumber?: string | null;
  categoryName?: string | null;
  imageUrl?: string | null;
  technicalSpecs?: string | null;
  application?: string | null;
  presentation?: string | null;
  verificationStatus?: string | null;
  isCompared?: boolean;
  onToggleCompare?: (product: ComparisonProduct) => void;
}

export function ProductListItem({
  id,
  name,
  slug,
  brandName,
  manufacturer,
  model,
  catalogNumber,
  categoryName,
  imageUrl,
  technicalSpecs,
  application,
  presentation,
  verificationStatus,
  isCompared = false,
  onToggleCompare,
}: ProductListItemProps) {
  const [imageError, setImageError] = useState(false);

  const displayBrand = brandName?.trim() || 'IZCOR MEDIC';
  const displayManufacturer = manufacturer?.trim() || null;
  const isVerified = verificationStatus === 'VERIFIED';
  const procedenciaMatch = technicalSpecs?.match(/Procedencia:\s*([^\n\r]+)/i);
  const displayProcedencia = procedenciaMatch ? procedenciaMatch[1].trim() : null;

  // Parse technical specs if stringified JSON array
  let specsList: string[] = [];
  if (technicalSpecs) {
    try {
      const parsed = JSON.parse(technicalSpecs);
      if (Array.isArray(parsed)) {
        specsList = parsed.slice(0, 3);
      } else if (typeof parsed === 'string') {
        specsList = [parsed];
      }
    } catch {
      specsList = technicalSpecs.split('\n').filter(Boolean).slice(0, 2);
    }
  }

  // Parse applications if string
  let appTags: string[] = [];
  if (application) {
    appTags = application.split(/[,;]/).map(s => s.trim()).filter(Boolean).slice(0, 3);
  }

  const comparisonData: ComparisonProduct = {
    id,
    name,
    slug,
    model,
    catalogNumber,
    brandName: displayBrand,
    manufacturer: displayManufacturer,
    categoryName,
    imageUrl,
    technicalSpecs,
    application,
    verificationStatus,
    presentation,
  };

  return (
    <div 
      id={`product-row-${id}`}
      className="group bg-white border border-slate-200/90 rounded-xl p-4 md:p-5 transition-all duration-200 hover:shadow-md hover:border-brand-navy/30 flex flex-col md:flex-row items-start md:items-center gap-5"
    >
      {/* Product Thumbnail */}
      <Link 
        to={`/productos/${slug}`}
        className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center justify-center overflow-hidden group-hover:border-slate-200 transition-colors relative"
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <Activity className="w-8 h-8 text-slate-400 group-hover:text-brand-cyan transition-colors" />
            <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase truncate max-w-[80px]">
              {displayBrand}
            </span>
          </div>
        )}

        {isVerified && (
          <span 
            title="Verificado institucionalmente"
            className="absolute top-1.5 left-1.5 bg-emerald-50 text-emerald-700 p-0.5 rounded shadow-2xs border border-emerald-200"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
        )}
      </Link>

      {/* Main Content / Technical Information */}
      <div className="flex-1 min-w-0">
        {/* Brand, Manufacturer & Model Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs">
          <span className="font-extrabold text-brand-cyan uppercase tracking-wider">
            {displayBrand}
          </span>
          {displayManufacturer && displayManufacturer !== displayBrand && (
            <span className="text-slate-500 font-medium">
              (Fab: {displayManufacturer})
            </span>
          )}
          {model && (
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[11px]">
              Mod: {model}
            </span>
          )}
          {catalogNumber && (
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
              SKU: {catalogNumber}
            </span>
          )}
          {displayProcedencia && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-sans font-semibold text-[11px] border border-teal-200">
              <span>🌍</span>
              <span>{displayProcedencia}</span>
            </span>
          )}
          {presentation && (
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-sans text-[11px] border border-slate-200">
              {presentation}
            </span>
          )}
          {categoryName && (
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              • {categoryName}
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug group-hover:text-brand-navy transition-colors mb-2">
          <Link to={`/productos/${slug}`}>
            {name}
          </Link>
        </h3>

        {/* Technical Specs bullets (if available) */}
        {specsList.length > 0 && (
          <ul className="space-y-1 mb-2.5">
            {specsList.map((spec, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5 line-clamp-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-navy/60 flex-shrink-0"></span>
                <span>{spec}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Clinical Application Tags */}
        {appTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {appTags.map((tag, i) => (
              <span 
                key={i} 
                className="text-[10px] font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right Procurement Action Column */}
      <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
        
        {/* Quick Utility Actions (Favorites, Share, Compare) */}
        <div className="flex items-center gap-2">
          <ProductQuickActions
            product={{
              id,
              name,
              slug,
              brandName: displayBrand,
              model,
              imageUrl,
              categoryName,
            }}
            layout="compact"
          />

          {/* Compare Toggle Button */}
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(comparisonData)}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy cursor-pointer ${
                isCompared 
                  ? 'bg-brand-navy text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-brand-navy'
              }`}
              title={isCompared ? 'Quitar de la matriz de comparación' : 'Añadir a la matriz de comparación'}
            >
              {isCompared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="hidden sm:inline">Comparando</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Comparar</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Primary and Secondary Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Secondary Action: Ver Ficha Técnica */}
          <Link
            to={`/productos/${slug}`}
            className="inline-flex items-center justify-center gap-1.5 h-9.5 px-3.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-brand-navy active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            title={`Ver ficha técnica de ${name}`}
          >
            <span>Ver Ficha</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          {/* Primary Action: Solicitar Cotización */}
          <Link
            to={`/cotizar?product=${id}`}
            className="inline-flex items-center justify-center gap-1.5 h-9.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy-light active:bg-brand-cyan shadow-xs hover:shadow-md active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
            title={`Solicitar cotización formal de ${name}`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Cotizar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
