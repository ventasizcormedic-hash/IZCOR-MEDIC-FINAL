import React, { useState, useEffect, useCallback, useRef, MouseEvent, TouchEvent } from 'react';
import { ProductImageItem } from '../../lib/images/types';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  RotateCcw, Maximize2, ShieldCheck, AlertTriangle 
} from 'lucide-react';

export interface ProductImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: ProductImageItem[];
  initialIndex?: number;
  productName: string;
  brandName?: string | null;
  model?: string | null;
}

export const ProductImageViewer: React.FC<ProductImageViewerProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  productName,
  brandName,
  model,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const touchStartXRef = useRef<number | null>(null);

  // Sync index on open
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  const currentImage = images[currentIndex];
  const total = images.length;

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, [total]);

  // Zoom helpers
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(3.5, prev + 0.5));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(1, prev - 0.5);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleResetZoom();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  // Preload adjacent images (Rule 39: Precarga inteligente)
  useEffect(() => {
    if (!isOpen || total <= 1) return;
    const nextIdx = (currentIndex + 1) % total;
    const prevIdx = (currentIndex - 1 + total) % total;

    if (images[nextIdx]?.url) {
      const imgNext = new Image();
      imgNext.src = images[nextIdx].url;
    }
    if (images[prevIdx]?.url) {
      const imgPrev = new Image();
      imgPrev.src = images[prevIdx].url;
    }
  }, [isOpen, currentIndex, images, total]);

  // Pan / Drag handlers when zoomed
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (zoomScale > 1) return;
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (zoomScale > 1 || touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Visor técnico de fotografía biomédica"
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 bg-slate-900/80 border-b border-slate-800 text-white z-20">
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-navy bg-white px-2 py-0.5 rounded shadow-xs flex-shrink-0">
            {brandName || 'IZCOR MEDIC'}
          </span>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
              {productName}
            </h3>
            {model && (
              <span className="text-[11px] font-mono text-slate-400">
                Modelo: {model}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-700">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Acercar (+)"
              aria-label="Acercar imagen"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomScale <= 1}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Alejar (-)"
              aria-label="Alejar imagen"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            {zoomScale > 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Restablecer escala (0)"
                aria-label="Restablecer tamaño original"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Counter Indicator */}
          {total > 1 && (
            <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
              {currentIndex + 1} / {total}
            </span>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Cerrar visor (Esc)"
            aria-label="Cerrar visor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Main Stage with Pan/Zoom Canvas */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden p-4 sm:p-8 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-xl transition-all hover:scale-105"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-xl transition-all hover:scale-105"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Displayed Image */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
          }}
        >
          <img
            src={currentImage.url}
            alt={currentImage.altText || productName}
            className="max-h-[72vh] max-w-[90vw] object-contain rounded-lg shadow-2xl select-none"
            draggable={false}
          />
        </div>

        {/* Badge in top left corner of image viewport */}
        {currentImage.isIllustrative && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase bg-amber-500 text-white shadow-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>Imagen Ilustrativa</span>
          </div>
        )}
      </div>

      {/* 3. Footer Strip with Thumbnails */}
      {total > 1 && (
        <div className="bg-slate-900/85 border-t border-slate-800 p-3 flex items-center justify-center gap-2 overflow-x-auto z-20">
          {images.map((img, idx) => (
            <button
              key={img.id || `${img.url}-${idx}`}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setZoomScale(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${
                currentIndex === idx
                  ? 'border-cyan-400 ring-2 ring-cyan-400/30 scale-105 opacity-100'
                  : 'border-slate-700 opacity-60 hover:opacity-90'
              }`}
              aria-label={`Ir a la toma ${idx + 1}`}
            >
              <img
                src={img.thumbnailUrl || img.url}
                alt=""
                className="w-full h-full object-contain p-1"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
