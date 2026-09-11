import React, { useRef } from 'react';
import { ProductImageItem } from '../../lib/images/types';
import { ProductThumbnail } from './ProductThumbnail';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export interface ProductThumbnailListProps {
  images: ProductImageItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  productName: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ProductThumbnailList: React.FC<ProductThumbnailListProps> = ({
  images,
  activeIndex,
  onSelect,
  productName,
  orientation = 'horizontal',
  className = '',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Automatically hide if fewer than 2 images exist
  if (!images || images.length <= 1) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -180 : 180;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const isVertical = orientation === 'vertical';

  return (
    <div className={`relative ${isVertical ? 'flex flex-col' : 'w-full'} ${className}`}>
      {/* Scroll Controls for 6+ images in horizontal mode */}
      {!isVertical && images.length > 5 && (
        <div className="hidden sm:flex items-center justify-between pointer-events-none absolute -top-8 right-0 gap-1 z-10">
          <span className="text-[11px] text-slate-400 font-medium mr-2 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>{images.length} tomas técnicas</span>
          </span>
          <button
            type="button"
            onClick={() => scroll('left')}
            className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-brand-navy shadow-2xs pointer-events-auto transition-colors"
            aria-label="Desplazar miniaturas a la izquierda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-brand-navy shadow-2xs pointer-events-auto transition-colors"
            aria-label="Desplazar miniaturas a la derecha"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Thumbnail items list container */}
      <div
        ref={scrollContainerRef}
        className={`flex gap-2.5 pb-1 scrollbar-thin ${
          isVertical
            ? 'flex-col max-h-[500px] overflow-y-auto pr-1'
            : 'flex-row overflow-x-auto scroll-smooth items-center'
        }`}
      >
        {images.map((img, idx) => (
          <ProductThumbnail
            key={img.id || `${img.url}-${idx}`}
            image={img}
            index={idx}
            isActive={activeIndex === idx}
            onSelect={onSelect}
            productName={productName}
          />
        ))}
      </div>
    </div>
  );
};
