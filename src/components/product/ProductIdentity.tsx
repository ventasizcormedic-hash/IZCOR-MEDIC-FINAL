import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Tag, Layers, Hash, CheckCircle2, ShieldCheck, ExternalLink, Globe, Package } from 'lucide-react';
import { ProductDetailData } from './types';

interface ProductIdentityProps {
  product: ProductDetailData;
}

export const ProductIdentity: React.FC<ProductIdentityProps> = ({ product }) => {
  const brandDisplay = product.brandName || null;
  const manufacturerDisplay = product.manufacturer || product.brandManufacturer || null;
  const isDifferentManufacturer = 
    manufacturerDisplay && 
    brandDisplay && 
    manufacturerDisplay.trim().toLowerCase() !== brandDisplay.trim().toLowerCase();

  const procedenciaMatch = product.technicalSpecs?.match(/Procedencia:\s*([^\n\r]+)/i);
  const procedencia = procedenciaMatch ? procedenciaMatch[1].trim() : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Category & Brand Badges Header */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Brand Pill with optional real logo */}
        {brandDisplay && (
          <Link
            to={`/productos?brand=${encodeURIComponent(brandDisplay)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-brand-navy text-white hover:bg-brand-navy-light transition-colors shadow-2xs"
            title={`Ver todos los productos de la marca ${brandDisplay}`}
          >
            {product.brandLogo ? (
              <img 
                src={product.brandLogo} 
                alt={brandDisplay} 
                className="w-4 h-4 object-contain rounded-xs bg-white p-0.5" 
              />
            ) : (
              <Tag className="w-3.5 h-3.5" />
            )}
            <span>{brandDisplay}</span>
          </Link>
        )}

        {/* Clinical Category */}
        {product.categoryName && (
          <Link
            to={`/productos?category=${encodeURIComponent(product.categoryName)}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{product.categoryName}</span>
          </Link>
        )}

        {/* Subcategory */}
        {product.subcategory?.name && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            <span>{product.subcategory.name}</span>
          </span>
        )}

        {/* Verification status badge */}
        {product.verificationStatus === 'VERIFIED' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ficha Verificada</span>
          </span>
        )}

        {/* Country of origin badge */}
        {procedencia && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span>Procedencia: {procedencia}</span>
          </span>
        )}

        {/* Presentation badge */}
        {product.presentation && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs">
            <Package className="w-3.5 h-3.5 text-indigo-600" />
            <span>Unidad: {product.presentation}</span>
          </span>
        )}
      </div>

      {/* Official Product Name (Main Visual Anchor) */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
        {product.name}
      </h1>

      {/* Technical Identifiers Bar (Model, SKU, Catalog Number, Manufacturer, Procedencia, Unidad) */}
      <div className="flex items-center gap-y-2 gap-x-4 flex-wrap text-xs text-slate-600 pt-1 pb-2 border-b border-slate-100">
        {/* Model */}
        {product.model && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Modelo:</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {product.model}
            </span>
          </div>
        )}

        {/* Catalog Number / SKU */}
        {product.catalogNumber && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Nº Catálogo / SKU:</span>
            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {product.catalogNumber}
            </span>
          </div>
        )}

        {/* Procedencia */}
        {procedencia && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">País de Procedencia:</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
              <Globe className="w-3 h-3 text-teal-600" />
              {procedencia}
            </span>
          </div>
        )}

        {/* Presentación / Unidad */}
        {product.presentation && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Unidad de Manejo:</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
              <Package className="w-3 h-3 text-indigo-600" />
              {product.presentation}
            </span>
          </div>
        )}

        {/* Real Manufacturer (when available and different from brand or specified) */}
        {manufacturerDisplay && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Fabricante:</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {manufacturerDisplay}
            </span>
          </div>
        )}

        {/* Internal ID for audit / traceability */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Hash className="w-3 h-3" />
          <span>Ref. Catálogo: #{product.id}</span>
        </div>
      </div>
    </div>
  );
};
