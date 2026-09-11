import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, MessageCircle, Download, Clock, ChevronDown 
} from 'lucide-react';
import { ProductDetailData, ProductDocument } from './types';
import { ProductQuickActions } from './ProductQuickActions';

interface ProductQuickOverviewProps {
  product: ProductDetailData;
  datasheetDoc?: ProductDocument | null;
  onScrollToSpecs?: () => void;
  isCompared?: boolean;
  onToggleCompare?: (product: any) => void;
}

export const ProductQuickOverview: React.FC<ProductQuickOverviewProps> = ({
  product,
  datasheetDoc,
  onScrollToSpecs,
  isCompared = false,
  onToggleCompare,
}) => {
  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Estimados IZCOR MEDIC, requiero cotización institucional y sustento técnico del equipo: ${product.name} (Ref: ${product.model || `#${product.id}`}).`
    );
    return `https://wa.me/51928130349?text=${text}`;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Short Summary (Only if real description exists) */}
      {product.description && (
        <div className="text-slate-700 text-sm sm:text-base leading-relaxed">
          <p className="line-clamp-3 text-slate-700 font-normal">
            {product.description}
          </p>
          {product.description.length > 200 && onScrollToSpecs && (
            <button
              type="button"
              onClick={onScrollToSpecs}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-navy hover:underline mt-1.5 cursor-pointer"
            >
              <span>Ver descripción completa y especificaciones</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Presentation or Packaging summary if exists */}
      {product.presentation && (
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
          <span className="font-semibold text-blue-700">Presentación Oficial:</span>
          <span className="font-bold">{product.presentation}</span>
        </div>
      )}

      {/* Primary Commercial Call To Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Primary Action: Solicitar Cotización Formal */}
          <Link
            to={`/cotizar?product=${product.id}`}
            id="btn-product-quote"
            className="flex items-center justify-center gap-2 h-12 px-5 bg-brand-navy hover:bg-brand-navy-light active:bg-brand-cyan text-white rounded-xl font-bold text-sm shadow-xs hover:shadow-md active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-navy"
            title={`Solicitar cotización institucional de ${product.name}`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Solicitar Cotización Formal</span>
          </Link>

          {/* Direct WhatsApp Consultation */}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            id="btn-product-whatsapp"
            className="flex items-center justify-center gap-2 h-12 px-5 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-white rounded-xl font-bold text-sm shadow-xs hover:shadow-md active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
            title="Consultar disponibilidad por WhatsApp"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>

        {/* Quick Utility Actions Row: Favoritos, Compartir, Comparar */}
        <div className="pt-1">
          <ProductQuickActions
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              brandName: product.brandName,
              model: product.model,
              imageUrl: product.images?.[0]?.url,
              categoryName: product.categoryName,
            }}
            isCompared={isCompared}
            onToggleCompare={onToggleCompare}
            layout="inline"
          />
        </div>

        {/* Datasheet Quick Access if real datasheet exists */}
        {datasheetDoc && (
          <a
            href={datasheetDoc.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 hover:text-brand-navy border border-slate-200 text-xs font-bold text-slate-800 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            title="Descargar ficha técnica oficial en formato PDF"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-brand-navy shrink-0" />
              <span>{datasheetDoc.title || 'Descargar Ficha Técnica Oficial (PDF)'}</span>
            </div>
            <span className="text-[11px] font-bold text-brand-navy uppercase tracking-wider">
              Descargar PDF →
            </span>
          </a>
        )}

        {/* Procurement / Institutional notice */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Atención prioritaria para compras hospitalarias
          </span>
          <Link to="/tdr" className="font-semibold text-brand-navy hover:underline">
            Cargar Bases / TDR →
          </Link>
        </div>
      </div>
    </div>
  );
};
