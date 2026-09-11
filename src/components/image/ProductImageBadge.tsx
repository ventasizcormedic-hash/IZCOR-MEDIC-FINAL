import React from 'react';
import { AlertTriangle, ShieldCheck, Camera, Sparkles } from 'lucide-react';

export interface ProductImageBadgeProps {
  isIllustrative?: boolean;
  isVerified?: boolean;
  currentIndex?: number;
  totalImages?: number;
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const ProductImageBadge: React.FC<ProductImageBadgeProps> = ({
  isIllustrative,
  isVerified,
  currentIndex,
  totalImages,
  className = '',
  position = 'top-left',
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-3 right-3';
      case 'bottom-left':
        return 'bottom-3 left-3';
      case 'bottom-right':
        return 'bottom-3 right-3';
      case 'top-left':
      default:
        return 'top-3 left-3';
    }
  };

  return (
    <div className={`absolute ${getPositionClasses()} z-20 flex flex-col gap-1.5 pointer-events-none ${className}`}>
      {/* 1. Mandatory Illustrative Image Warning Badge (Rules 15, 16, 55) */}
      {isIllustrative && (
        <div
          role="status"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-amber-500/95 text-white shadow-sm backdrop-blur-xs border border-amber-600/30 animate-fadeIn"
          title="Esta imagen es una representación visual y no sustituye la fotografía oficial del producto"
        >
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Imagen Ilustrativa</span>
        </div>
      )}

      {/* 2. Official Sanitary Verification Badge */}
      {!isIllustrative && isVerified && (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-emerald-50/95 text-emerald-800 border border-emerald-200 shadow-2xs backdrop-blur-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Foto Homologada</span>
        </div>
      )}

      {/* 3. Subtle Counter Badge if multiple images */}
      {typeof currentIndex === 'number' && typeof totalImages === 'number' && totalImages > 1 && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900/75 text-white backdrop-blur-xs shadow-2xs w-fit">
          <Camera className="w-3 h-3 text-slate-300" />
          <span>
            {currentIndex + 1} / {totalImages}
          </span>
        </div>
      )}
    </div>
  );
};
