import React, { useState, MouseEvent, useEffect, useCallback } from 'react';
import { 
  Maximize2, X, ChevronLeft, ChevronRight, 
  ShieldCheck, AlertCircle, Eye, Activity
} from 'lucide-react';
import { ProductImage } from './types';

interface ProductGalleryProps {
  images?: ProductImage[];
  productName: string;
  brandName?: string | null;
  verificationStatus?: string | null;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  productName,
  brandName,
  verificationStatus,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Zoom lens state for desktop hover
  const [showLens, setShowLens] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 50, y: 50 });

  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[activeIndex]?.url : null;
  const currentAlt = hasImages ? images[activeIndex]?.altText || productName : productName;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setLensPosition({ x, y });
  };

  const handlePrev = useCallback(() => {
    if (!hasImages) return;
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setImageError(false);
  }, [hasImages, images.length]);

  const handleNext = useCallback(() => {
    if (!hasImages) return;
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setImageError(false);
  }, [hasImages, images.length]);

  // Keyboard navigation inside lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, handlePrev, handleNext]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Stage */}
      <div className="relative">
        <div
          id="product-main-image-stage"
          className={`relative aspect-square w-full bg-white border border-slate-200/90 rounded-2xl p-6 flex items-center justify-center overflow-hidden shadow-xs ${
            hasImages && !imageError ? 'cursor-crosshair' : ''
          }`}
          onMouseEnter={() => hasImages && !imageError && setShowLens(true)}
          onMouseLeave={() => setShowLens(false)}
          onMouseMove={handleMouseMove}
        >
          {hasImages && currentImage && !imageError ? (
            <>
              <img
                src={currentImage}
                alt={currentAlt}
                onError={() => setImageError(true)}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-200 select-none"
                loading="eager"
              />

              {/* Magnifier View */}
              {showLens && (
                <div
                  className="absolute inset-0 pointer-events-none bg-white bg-no-repeat transition-opacity duration-150 rounded-2xl"
                  style={{
                    backgroundImage: `url(${currentImage})`,
                    backgroundPosition: `${lensPosition.x}% ${lensPosition.y}%`,
                    backgroundSize: '240%',
                    zIndex: 15,
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Quick Lightbox Trigger */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-3 right-3 z-20 p-2.5 rounded-xl bg-white/95 backdrop-blur-xs text-slate-700 hover:text-brand-navy hover:bg-white border border-slate-200 shadow-sm transition-all"
                title="Ampliar imagen en pantalla completa"
                aria-label="Ampliar fotografía técnica"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Previous/Next On Stage if multiple images */}
              {images.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="p-2 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-brand-navy border border-slate-200 shadow-sm transition-all pointer-events-auto hover:scale-105"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="p-2 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-brand-navy border border-slate-200 shadow-sm transition-all pointer-events-auto hover:scale-105"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Institutional Fallback when image does not exist or fails */
            <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 select-none">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                <Activity className="w-9 h-9 text-slate-300" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {brandName || 'Registro Médico Oficial'}
              </span>
              <p className="text-[12px] text-slate-400 mt-1 max-w-[220px]">
                Fotografía técnica en proceso de homologación
              </p>
              <span className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                Imagen no disponible
              </span>
            </div>
          )}

          {/* Verification Badge Over Image */}
          {verificationStatus === 'VERIFIED' ? (
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-50/95 text-emerald-800 border border-emerald-200 shadow-2xs backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Homologado</span>
            </div>
          ) : (
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100/95 text-slate-600 border border-slate-200 shadow-2xs backdrop-blur-xs">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>En Revisión</span>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails Carousel (Only rendered if 2 or more images exist) */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => {
                setActiveIndex(idx);
                setImageError(false);
              }}
              className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${
                activeIndex === idx
                  ? 'border-brand-navy shadow-sm ring-2 ring-brand-navy/20'
                  : 'border-slate-200 opacity-65 hover:opacity-100'
              }`}
              aria-label={`Ver imagen ${idx + 1} de ${images.length}`}
            >
              <img
                src={img.url}
                alt={img.altText || `Vista ${idx + 1}`}
                className="w-full h-full object-contain p-2"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && currentImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Visor de fotografía técnica"
        >
          <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Lightbox Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-navy bg-navy-50 px-2.5 py-1 rounded border border-brand-navy/20">
                  {brandName || 'IZCOR MEDIC'}
                </span>
                <span className="text-xs text-slate-500 font-medium truncate max-w-md">
                  {productName} {images.length > 1 ? `(${activeIndex + 1}/${images.length})` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors"
                aria-label="Cerrar visor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Body */}
            <div className="relative flex-1 p-8 flex items-center justify-center bg-white min-h-[400px]">
              <img
                src={currentImage}
                alt={currentAlt}
                className="max-h-[65vh] w-auto max-w-full object-contain select-none"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white shadow-lg transition-all"
                    aria-label="Fotografía anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white shadow-lg transition-all"
                    aria-label="Fotografía siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Footer Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 border-t border-slate-200 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`w-12 h-12 rounded-lg border-2 overflow-hidden bg-white ${
                      activeIndex === idx ? 'border-brand-navy shadow-xs' : 'border-slate-300 opacity-60'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
