import React from 'react';
import { Activity, AlertCircle, ShieldAlert } from 'lucide-react';

export interface ProductImageFallbackProps {
  productName?: string;
  brandName?: string | null;
  model?: string | null;
  catalogNumber?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  reason?: 'missing' | 'broken' | 'unverified';
}

export const ProductImageFallback: React.FC<ProductImageFallbackProps> = ({
  productName,
  brandName,
  model,
  catalogNumber,
  size = 'md',
  className = '',
  reason = 'missing',
}) => {
  const isCompact = size === 'sm';
  const isLarge = size === 'lg' || size === 'full';

  return (
    <div
      role="img"
      aria-label={`Imagen no disponible para ${productName || 'el producto'}`}
      className={`relative w-full h-full bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-100 flex flex-col items-center justify-center text-center select-none border border-slate-200/80 p-4 transition-colors ${className}`}
    >
      {/* Visual Technical Icon Container */}
      <div
        className={`rounded-2xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-400 mb-2.5 ${
          isCompact ? 'w-10 h-10 mb-1' : isLarge ? 'w-20 h-20 mb-3.5' : 'w-14 h-14'
        }`}
      >
        {reason === 'broken' ? (
          <AlertCircle className={isCompact ? 'w-5 h-5 text-amber-500' : isLarge ? 'w-9 h-9 text-amber-500' : 'w-6 h-6 text-amber-500'} strokeWidth={1.5} />
        ) : (
          <Activity className={isCompact ? 'w-5 h-5 text-slate-400' : isLarge ? 'w-9 h-9 text-slate-400' : 'w-6 h-6 text-slate-400'} strokeWidth={1.5} />
        )}
      </div>

      {/* Brand & Reference Labels */}
      {brandName && (
        <span className="text-[10px] sm:text-[11px] font-bold text-brand-navy uppercase tracking-wider line-clamp-1 max-w-[90%]">
          {brandName}
        </span>
      )}

      {/* Main Status Text */}
      <span
        className={`font-semibold text-slate-600 line-clamp-1 ${
          isCompact ? 'text-[10px] mt-0.5' : isLarge ? 'text-xs sm:text-sm mt-1' : 'text-xs mt-1'
        }`}
      >
        {reason === 'broken' ? 'Enlace en mantenimiento' : 'Fotografía en homologación'}
      </span>

      {/* Medical Catalog Badge */}
      {!isCompact && (
        <div className="mt-2 flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 shadow-2xs">
            Imagen no disponible
          </span>
          {model && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
              Ref: {model}
            </span>
          )}
        </div>
      )}

      {/* Institutional Guarantee Note for Large Stage */}
      {isLarge && (
        <p className="text-[11px] text-slate-400 mt-2 max-w-xs leading-relaxed hidden sm:block">
          Consulte la ficha técnica o contacte a soporte técnico biomédico para solicitar el plano o fotografía de referencia oficial.
        </p>
      )}
    </div>
  );
};
