import React, { useState, MouseEvent } from 'react';
import { ProductImageItem } from '../../lib/images/types';
import { ProductImageFallback } from './ProductImageFallback';
import { ProductImageBadge } from './ProductImageBadge';
import { ProductImageZoom } from './ProductImageZoom';
import { ProductImageSkeleton } from './ProductImageSkeleton';
import { Maximize2, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export interface ProductMainImageProps {
  image?: ProductImageItem | null;
  totalImages?: number;
  currentIndex?: number;
  productName: string;
  brandName?: string | null;
  model?: string | null;
  catalogNumber?: string | null;
  verificationStatus?: string | null;
  onOpenLightbox?: (index: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onMarkAsPrimary?: (index: number) => void;
  allowSetPrimary?: boolean;
  aspectRatio?: 'square' | '4/3';
  className?: string;
}

export const ProductMainImage: React.FC<ProductMainImageProps> = ({
  image,
  totalImages = 0,
  currentIndex = 0,
  productName,
  brandName,
  model,
  catalogNumber,
  verificationStatus,
  onOpenLightbox,
  onPrev,
  onNext,
  onMarkAsPrimary,
  allowSetPrimary = false,
  aspectRatio = 'square',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showZoomLens, setShowZoomLens] = useState(false);
  const [lensCoords, setLensCoords] = useState({ x: 50, y: 50 });

  // Reset states when image changes
  React.useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setShowZoomLens(false);
  }, [image?.url]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!image || hasError) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setLensCoords({ x, y });
  };

  const isVerified = verificationStatus === 'VERIFIED';
  const hasMultiple = totalImages > 1;

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-4/3';

  return (
    <div className={`relative w-full ${className}`}>
      <div
        id="product-main-image-viewport"
        className={`relative w-full ${aspectClass} bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex items-center justify-center overflow-hidden shadow-xs select-none transition-shadow hover:shadow-md ${
          image && !hasError ? 'cursor-crosshair' : ''
        }`}
        onMouseEnter={() => image && !hasError && setShowZoomLens(true)}
        onMouseLeave={() => setShowZoomLens(false)}
        onMouseMove={handleMouseMove}
        onClick={() => {
          if (image && !hasError && onOpenLightbox) {
            onOpenLightbox(currentIndex);
          }
        }}
      >
        {image && !hasError ? (
          <>
            {/* Loading Skeleton */}
            {isLoading && (
              <div className="absolute inset-0 z-10">
                <ProductImageSkeleton aspectRatio={aspectRatio} />
              </div>
            )}

            {/* Official Product Photo */}
            <img
              src={image.url}
              alt={image.altText || productName}
              loading="eager"
              decoding="async"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-200 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Hover Magnifier View (Desktop Only) */}
            <ProductImageZoom
              imageUrl={image.url}
              lensPosition={lensCoords}
              zoomLevel={240}
              isActive={showZoomLens && !isLoading}
            />

            {/* Badges: Illustrative or Homologated & Counter */}
            <ProductImageBadge
              isIllustrative={image.isIllustrative}
              isVerified={isVerified}
              currentIndex={currentIndex}
              totalImages={totalImages}
              position="top-left"
            />

            {/* Lightbox / Zoom Open Action Button */}
            {onOpenLightbox && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox(currentIndex);
                }}
                className="absolute bottom-3 right-3 z-20 p-2.5 rounded-xl bg-white/95 backdrop-blur-xs text-slate-700 hover:text-brand-navy hover:bg-white border border-slate-200 shadow-sm transition-all hover:scale-105"
                title="Ampliar imagen en pantalla completa"
                aria-label="Ampliar fotografía técnica"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}

            {/* Optional "Definir como Principal" button if allowed (Rule 3) */}
            {allowSetPrimary && onMarkAsPrimary && !image.isPrimary && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsPrimary(currentIndex);
                }}
                className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 hover:bg-white text-slate-700 hover:text-brand-navy border border-slate-200 shadow-xs transition-colors backdrop-blur-xs"
                title="Fijar como imagen principal de referencia"
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>Hacer principal</span>
              </button>
            )}

            {/* Stage Navigation Arrows */}
            {hasMultiple && (
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
                {onPrev && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrev();
                    }}
                    className="p-2 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-brand-navy border border-slate-200 shadow-sm transition-all pointer-events-auto hover:scale-105 active:scale-95"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {onNext && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext();
                    }}
                    className="p-2 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-brand-navy border border-slate-200 shadow-sm transition-all pointer-events-auto hover:scale-105 active:scale-95"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          /* Institutional Neutral Fallback */
          <ProductImageFallback
            productName={productName}
            brandName={brandName}
            model={model}
            catalogNumber={catalogNumber}
            size="lg"
            reason={hasError ? 'broken' : 'missing'}
          />
        )}
      </div>
    </div>
  );
};
