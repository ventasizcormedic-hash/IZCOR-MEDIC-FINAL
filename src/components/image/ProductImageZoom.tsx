import React from 'react';

export interface ProductImageZoomProps {
  imageUrl: string;
  lensPosition: { x: number; y: number };
  zoomLevel?: number;
  isActive: boolean;
}

export const ProductImageZoom: React.FC<ProductImageZoomProps> = ({
  imageUrl,
  lensPosition,
  zoomLevel = 240,
  isActive,
}) => {
  if (!isActive) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none bg-white bg-no-repeat transition-opacity duration-150 rounded-2xl z-15"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundPosition: `${lensPosition.x}% ${lensPosition.y}%`,
        backgroundSize: `${zoomLevel}%`,
      }}
      aria-hidden="true"
    />
  );
};
