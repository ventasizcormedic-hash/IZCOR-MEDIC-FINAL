import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductImageItem } from '../../lib/images/types';
import { normalizeProductImages } from '../../lib/images/utils';
import { ProductMainImage } from './ProductMainImage';
import { ProductThumbnailList } from './ProductThumbnailList';
import { ProductImageViewer } from './ProductImageViewer';

export interface ProductImageGalleryProps {
  images?: any[];
  productId: number;
  productName: string;
  brandName?: string | null;
  model?: string | null;
  catalogNumber?: string | null;
  verificationStatus?: string | null;
  activeModelId?: string | number | null;
  activeVariantId?: string | number | null;
  allowSetPrimary?: boolean;
  className?: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images = [],
  productId,
  productName,
  brandName,
  model,
  catalogNumber,
  verificationStatus,
  activeModelId,
  activeVariantId,
  allowSetPrimary = true,
  className = '',
}) => {
  // Normalize raw image inputs according to strict data integrity rules
  const normalizedImages = useMemo(() => {
    return normalizeProductImages(images, {
      productId,
      productName,
      brandName,
      model,
      catalogNumber,
      activeModelId,
      activeVariantId,
    });
  }, [images, productId, productName, brandName, model, catalogNumber, activeModelId, activeVariantId]);

  // Gallery dynamic list (allows in-session primary reordering or selection)
  const [galleryImages, setGalleryImages] = useState<ProductImageItem[]>(normalizedImages);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  // Synchronize when incoming normalized images update
  useEffect(() => {
    setGalleryImages(normalizedImages);
    setActiveIndex(0);
  }, [normalizedImages]);

  const currentImage = galleryImages[activeIndex] || null;
  const total = galleryImages.length;

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  }, [total]);

  const handleSelectThumbnail = (index: number) => {
    if (index >= 0 && index < total) {
      setActiveIndex(index);
    }
  };

  const handleOpenLightbox = (index: number = activeIndex) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  // Allow setting the current active image as primary in the session
  const handleMarkAsPrimary = (index: number) => {
    if (index < 0 || index >= total) return;
    setGalleryImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* 1. Main Stage Viewport */}
      <ProductMainImage
        image={currentImage}
        totalImages={total}
        currentIndex={activeIndex}
        productName={productName}
        brandName={brandName}
        model={model}
        catalogNumber={catalogNumber}
        verificationStatus={verificationStatus}
        onOpenLightbox={handleOpenLightbox}
        onPrev={handlePrev}
        onNext={handleNext}
        onMarkAsPrimary={handleMarkAsPrimary}
        allowSetPrimary={allowSetPrimary}
        aspectRatio="square"
      />

      {/* 2. Thumbnails Strip (automatically hides if 0 or 1 image) */}
      <ProductThumbnailList
        images={galleryImages}
        activeIndex={activeIndex}
        onSelect={handleSelectThumbnail}
        productName={productName}
        orientation="horizontal"
      />

      {/* 3. Medical Fullscreen Lightbox & Deep Zoom Inspection */}
      <ProductImageViewer
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={galleryImages}
        initialIndex={activeIndex}
        productName={productName}
        brandName={brandName}
        model={model}
      />
    </div>
  );
};
