import React from 'react';
import { ShieldCheck, Calendar, ExternalLink, Hash, Info, FileCheck2 } from 'lucide-react';
import { ProductDetailData, formatCatalogDate } from './types';

interface ProductTraceabilityProps {
  product: ProductDetailData;
}

export const ProductTraceability: React.FC<ProductTraceabilityProps> = ({ product }) => {
  const updateDate = formatCatalogDate(product.updatedAt || product.createdAt);
  
  // Real verification evaluation
  const isVerified = product.verificationStatus === 'VERIFIED';
  const confidence = product.confidenceLevel?.toUpperCase() || 'ESTÁNDAR';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">
            Trazabilidad y Control Documental
          </h2>
          <p className="text-xs text-slate-500">
            Información auditable del catálogo institucional IZCOR MEDIC
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Verification Status */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-slate-400 font-medium block mb-1">Estado de Homologación:</span>
          {isVerified ? (
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Verificado / Homologado</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <FileCheck2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>En Proceso de Revisión</span>
            </div>
          )}
          <span className="text-[11px] text-slate-500 mt-1 block">
            Nivel de confiabilidad técnica: {confidence}
          </span>
        </div>

        {/* Source */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-slate-400 font-medium block mb-1">Fuente de los Datos:</span>
          {product.sourceUrl ? (
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-brand-navy hover:underline flex items-center gap-1 truncate"
              title={product.sourceUrl}
            >
              <span className="truncate">Portal del Fabricante</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            </a>
          ) : (
            <span className="font-bold text-slate-800">
              Ficha Técnica del Catálogo IZCOR MEDIC
            </span>
          )}
          <span className="text-[11px] text-slate-500 mt-1 block">
            {product.brandName ? `Canal oficial ${product.brandName}` : 'Expediente institucional'}
          </span>
        </div>

        {/* Update Date (Only shown if real date is available) */}
        {updateDate && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 font-medium block mb-1">Última Actualización:</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>{updateDate}</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Registro del sistema biomédico
            </span>
          </div>
        )}

        {/* Catalog Identification */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-slate-400 font-medium block mb-1">Código de Registro:</span>
          <div className="flex items-center gap-1 font-mono font-bold text-slate-900 text-sm">
            <Hash className="w-4 h-4 text-slate-400" />
            <span>IZC-{product.id.toString().padStart(5, '0')}</span>
          </div>
          {product.catalogNumber && (
            <span className="text-[11px] font-mono text-slate-500 mt-1 block truncate">
              Ref Fab: {product.catalogNumber}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
