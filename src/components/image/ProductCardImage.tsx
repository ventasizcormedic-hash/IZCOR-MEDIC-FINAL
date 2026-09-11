import React, { useState } from 'react';
import { getPrimaryProductImage } from '../../lib/images/utils';
import { ProductImageFallback } from './ProductImageFallback';
import { AlertTriangle } from 'lucide-react';

export interface ProductCardImageProps {
  imageUrl?: string | null;
  images?: any[];
  productName: string;
  brandName?: string | null;
  model?: string | null;
  catalogNumber?: string | null;
  isIllustrative?: boolean;
  aspectRatio?: '4/3' | 'square';
  priority?: boolean;
  className?: string;
}

export const ProductCardImage: React.FC<ProductCardImageProps> = ({
  imageUrl,
  images,
  productName,
  brandName,
  model,
  catalogNumber,
  isIllustrative: explicitIsIllustrative,
  aspectRatio = '4/3',
  priority = false,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  // Extract strictly the primary image
  const primaryItem = getPrimaryProductImage(images, imageUrl, {
    productName,
    brandName,
  });

  const activeUrl = primaryItem?.url || imageUrl;
  const isIllustrative = explicitIsIllustrative ?? primaryItem?.isIllustrative ?? false;
  const altText = primaryItem?.altText || `Fotografía de ${productName}`;

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-4/3';

  return (
    <div
      className={`relative w-full ${aspectClass} bg-gradient-to-b from-slate-50/80 to-slate-100/60 flex items-center justify-center p-4 sm:p-6 overflow-hidden border-b border-slate-100 select-none ${className}`}
    >
      {activeUrl && !hasError ? (
        <>
          <img
            src={activeUrl}
            alt={altText}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setHasError(true)}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Illustrative badge if applicable */}
          {isIllustrative && (
            <div
              className="absolute bottom-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-white shadow-xs backdrop-blur-xs"
              title="Imagen ilustrativa referencial"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Ilustrativa</span>
            </div>
          )}
        </>
      ) : (
        <ProductImageFallback
          productName={productName}
          brandName={brandName}
          model={model}
          catalogNumber={catalogNumber}
          size="sm"
          reason={hasError ? 'broken' : 'missing'}
        />
      )}
    </div>
  );
};
