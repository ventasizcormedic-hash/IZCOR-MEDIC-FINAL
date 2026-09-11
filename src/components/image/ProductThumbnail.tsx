import React, { useState } from 'react';
import { ProductImageItem } from '../../lib/images/types';
import { Activity, AlertTriangle } from 'lucide-react';

export interface ProductThumbnailProps {
  image: ProductImageItem;
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
  productName: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  image,
  index,
  isActive,
  onSelect,
  productName,
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses =
    size === 'sm'
      ? 'w-12 h-12 rounded-lg p-1'
      : size === 'lg'
      ? 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-2'
      : 'w-16 h-16 sm:w-18 sm:h-18 rounded-xl p-1.5';

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={`relative ${sizeClasses} overflow-hidden border-2 bg-white flex-shrink-0 transition-all flex items-center justify-center cursor-pointer ${
        isActive
          ? 'border-brand-navy ring-2 ring-brand-navy/20 shadow-sm opacity-100 scale-102'
          : 'border-slate-200 opacity-65 hover:opacity-100 hover:border-slate-300'
      }`}
      aria-label={`Seleccionar vista ${index + 1} de ${productName}`}
      aria-current={isActive ? 'true' : undefined}
    >
      {!hasError ? (
        <img
          src={image.thumbnailUrl || image.url}
          alt={image.altText || `Miniatura ${index + 1}`}
          onError={() => setHasError(true)}
          className="w-full h-full object-contain mix-blend-multiply select-none"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
          <Activity className="w-4 h-4" />
        </div>
      )}

      {/* Illustrative mini indicator */}
      {image.isIllustrative && (
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white"
          title="Imagen ilustrativa"
        />
      )}

      {/* Primary indicator dot */}
      {image.isPrimary && (
        <span
          className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-navy ring-1 ring-white"
          title="Imagen principal"
        />
      )}
    </button>
  );
};
