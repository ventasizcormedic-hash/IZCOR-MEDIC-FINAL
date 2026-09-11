import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, ArrowRight, ShieldCheck, Activity, Eye, 
  Layers, Check, ShoppingBag, Sparkles
} from 'lucide-react';
import { ProductQuickActions } from './product/ProductQuickActions';
import { useQuote } from '../context/QuoteContext';

export interface ProductCardProps {
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
  images?: Array<{ id: number; url: string; isPrimary?: boolean }> | null;
  verificationStatus?: string | null;
  isFeatured?: boolean;
  technicalSpecs?: string | null;
  application?: string | null;
  presentation?: string | null;
  isCompared?: boolean;
  onToggleCompare?: (product: any) => void;
}

export function ProductCard({
  id,
  name,
  slug,
  brandName,
  manufacturer,
  model,
  catalogNumber,
  categoryName,
  imageUrl,
  images,
  verificationStatus,
  isFeatured = false,
  technicalSpecs,
  application,
  presentation,
  isCompared = false,
  onToggleCompare,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { addItem, isInTray, justAddedId } = useQuote();

  const displayBrand = brandName?.trim() || 'IZCOR MEDIC';
  const displayManufacturer = manufacturer?.trim() || null;
  const displayModel = model?.trim() || null;
  const procedenciaMatch = technicalSpecs?.match(/Procedencia:\s*([^\n\r]+)/i);
  const displayProcedencia = procedenciaMatch ? procedenciaMatch[1].trim() : null;
  const isVerified = verificationStatus === 'VERIFIED';
  const inTray = isInTray(id);
  const wasJustAdded = justAddedId === id;
  
  // Resolve image URL
  const activeImageUrl = imageUrl || (images && images.length > 0 ? images[0]?.url : null);

  const comparisonData = {
    id,
    name,
    slug,
    model,
    catalogNumber,
    brandName: displayBrand,
    manufacturer: displayManufacturer,
    categoryName,
    imageUrl: activeImageUrl,
    technicalSpecs,
    application,
    verificationStatus,
    presentation,
  };

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
      name,
      brandName: displayBrand,
      model: displayModel,
      imageUrl: activeImageUrl,
      slug,
      categoryName: categoryName || '',
    });
  };

  // Map category slug to AI conceptual image for fallback
  const getCategoryFallbackImage = (catName?: string | null) => {
    if (!catName) return null;
    const cat = catName.toLowerCase();
    if (cat.includes('equipo') || cat.includes('uci') || cat.includes('monitor') || cat.includes('ventilador') || cat.includes('bomba')) {
      return '/assets/ai/cat_equipos_uci.jpg';
    }
    if (cat.includes('mobiliario') || cat.includes('cama') || cat.includes('camilla') || cat.includes('quirófano')) {
      return '/assets/ai/cat_mobiliario_clinico.jpg';
    }
    if (cat.includes('diagn') || cat.includes('ecograf') || cat.includes('electro') || cat.includes('monitor')) {
      return '/assets/ai/cat_diagnostico_monitoreo.jpg';
    }
    if (cat.includes('instrumental') || cat.includes('quirurg') || cat.includes('pinza') || cat.includes('tijera')) {
      return '/assets/ai/cat_instrumental_quirurgico.jpg';
    }
    if (cat.includes('laboratorio') || cat.includes('microscopio') || cat.includes('centrif')) {
      return '/assets/ai/cat_laboratorio_diagnostico.jpg';
    }
    if (cat.includes('insumo') || cat.includes('descartable') || cat.includes('guante') || cat.includes('jeringa') || cat.includes('sonda')) {
      return '/assets/ai/cat_insumos_descartables.jpg';
    }
    return null;
  };

  const conceptualFallback = !activeImageUrl || imageError ? getCategoryFallbackImage(categoryName) : null;
  const showConceptualImage = conceptualFallback !== null;

  return (
    <div 
      id={`product-card-${id}`}
      className="group bg-white border border-slate-200/90 rounded-2xl flex flex-col h-full overflow-hidden relative product-card-elevated"
    >
      {/* Real Product Photography Canvas */}
      <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-50/70 to-slate-100/40 flex items-center justify-center overflow-hidden border-b border-slate-100/80">
        <Link 
          to={`/productos/${slug}`}
          className="w-full h-full flex items-center justify-center"
          aria-label={`Ver ficha de ${name}`}
        >
          {activeImageUrl && !imageError ? (
            <img
              src={activeImageUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 ease-out p-5"
            />
          ) : showConceptualImage ? (
            /* Conceptual AI image for product with no official photography */
            <div className="relative w-full h-full">
              <img
                src={conceptualFallback!}
                alt={`Visual conceptual referencial - ${categoryName}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-brand-navy transition-colors p-5">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Activity className="w-7 h-7 text-slate-400 group-hover:text-brand-cyan transition-colors" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {displayBrand}
              </span>
            </div>
          )}
        </Link>

        {/* Top Badges (Left) */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 pointer-events-none z-10">
          {/* Conceptual visual badge — shown ONLY when using AI fallback, NOT when real photo */}
          {showConceptualImage && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/90 text-white shadow-xs backdrop-blur-xs">
              Visual Referencial
            </span>
          )}
          {isFeatured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#20384D] text-white shadow-2xs font-heading">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B9D8] animate-pulse"></span>
              DESTACADO
            </span>
          ) : isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs font-heading">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              HOMOLOGACIÓN DIGEMID
            </span>
          ) : null}

          {categoryName && (
            <span className="truncate max-w-[130px] px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-white/95 text-slate-700 border border-slate-200/80 shadow-2xs">
              {categoryName}
            </span>
          )}
        </div>

        {/* Quick Actions (Top Right) */}
        <div className="absolute top-3 right-3 z-10">
          <ProductQuickActions
            product={{
              id,
              name,
              slug,
              brandName: displayBrand,
              model: displayModel,
              imageUrl: activeImageUrl,
              categoryName,
            }}
            layout="floating"
          />
        </div>

        {/* Quick View Floating Hint */}
        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-slate-700 text-xs font-semibold shadow-sm border border-slate-200/70 transform translate-y-1 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-[#2C3E50]" />
            Explorar ficha
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3.5">
        <div>
          {/* Brand & Reference Code */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider truncate font-heading">
              {displayBrand}
            </span>
            {displayModel && (
              <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-mono font-medium tracking-tight truncate max-w-[130px]" title={displayModel}>
                Mod: {displayModel}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug line-clamp-2 group-hover:text-cyan-800 transition-colors mb-1.5 font-heading">
            <Link to={`/productos/${slug}`}>
              {name}
            </Link>
          </h3>

          {/* Metadata Bar (SKU, Procedencia, Unidad) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-slate-500 mt-1">
            {catalogNumber && (
              <span>SKU: {catalogNumber}</span>
            )}
            {displayProcedencia && (
              <span className="inline-flex items-center gap-0.5 font-sans text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-teal-100">
                <span>🌍</span>
                <span>{displayProcedencia}</span>
              </span>
            )}
            {presentation && (
              <span className="inline-flex items-center font-sans text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                {presentation}
              </span>
            )}
          </div>
        </div>

        {/* Specifications or Category Footer + Compare Action */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          {onToggleCompare ? (
            <button
              type="button"
              onClick={() => onToggleCompare(comparisonData)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold transition-all py-1 px-2.5 rounded-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan cursor-pointer ${
                isCompared
                  ? 'bg-[#2C3E50] text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:text-[#2C3E50] hover:bg-slate-100 border border-slate-200/80'
              }`}
              title={isCompared ? 'Quitar de la matriz de comparación' : 'Añadir a la matriz de comparación'}
            >
              {isCompared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Comparando</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Comparar</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-xs text-slate-500 font-medium">
              Suministro Institucional
            </div>
          )}

          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            Cotización Inmediata
          </span>
        </div>

        {/* Action Buttons: AGREGAR A COTIZACIÓN / VER FICHA */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Secondary Action: Ver Ficha Técnica */}
          <Link
            to={`/productos/${slug}`}
            id={`btn-view-${id}`}
            className="inline-flex items-center justify-center gap-1.5 h-9.5 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-[#2C3E50] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 font-heading"
            title={`Ver ficha técnica de ${name}`}
          >
            <span>Ver Ficha</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </Link>

          {/* Primary Action: AGREGAR A COTIZACIÓN with Instant Feedback */}
          <button
            type="button"
            onClick={handleAddToQuote}
            id={`btn-add-quote-${id}`}
            className={`inline-flex items-center justify-center gap-1.5 h-9.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan font-heading cursor-pointer ${
              wasJustAdded
                ? 'bg-emerald-600 text-white shadow-sm'
                : inTray
                ? 'bg-cyan-800 text-white hover:bg-cyan-900'
                : 'bg-[#00B9D8] hover:bg-[#00a2be] active:bg-[#008fa8] text-[#0D2232] font-black shadow-xs hover:shadow'
            }`}
            title={`Agregar ${name} a la bandeja de cotización`}
          >
            {wasJustAdded ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0 animate-bounce" />
                <span>¡Agregado!</span>
              </>
            ) : inTray ? (
              <>
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>En Bandeja</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>Cotizar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
