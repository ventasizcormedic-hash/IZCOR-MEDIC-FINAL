import React from 'react';

export interface ProductImageSkeletonProps {
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto';
  className?: string;
}

export const ProductImageSkeleton: React.FC<ProductImageSkeletonProps> = ({
  aspectRatio = 'square',
  className = '',
}) => {
  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === '4/3'
      ? 'aspect-4/3'
      : aspectRatio === '16/9'
      ? 'aspect-video'
      : '';

  return (
    <div
      className={`w-full ${aspectClass} bg-slate-100 rounded-2xl animate-pulse flex flex-col items-center justify-center p-6 border border-slate-200 ${className}`}
      aria-hidden="true"
    >
      <div className="w-16 h-16 rounded-xl bg-slate-200/80 mb-3" />
      <div className="h-3 w-28 bg-slate-200/80 rounded mb-1.5" />
      <div className="h-2.5 w-20 bg-slate-200/60 rounded" />
    </div>
  );
};
