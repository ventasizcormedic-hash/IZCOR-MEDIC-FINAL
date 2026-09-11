import React from 'react';
import { ViewMode } from './types';

interface CatalogSkeletonProps {
  viewMode: ViewMode;
  count?: number;
}

export function CatalogSkeleton({ viewMode, count = 6 }: CatalogSkeletonProps) {
  const items = Array.from({ length: count });

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {items.map((_, i) => (
          <div 
            key={i}
            className="bg-white border border-slate-200/90 rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-5 animate-pulse"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-slate-100 flex-shrink-0" />
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-3.5 bg-slate-100 rounded w-24" />
                <div className="h-3.5 bg-slate-100 rounded w-16" />
              </div>
              <div className="h-5 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-4 bg-slate-100 rounded w-20" />
                <div className="h-4 bg-slate-100 rounded w-24" />
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto pt-2 md:pt-0">
              <div className="h-9 bg-slate-100 rounded-lg w-20" />
              <div className="h-9 bg-slate-100 rounded-lg w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((_, i) => (
        <div 
          key={i} 
          className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs animate-pulse flex flex-col h-96"
        >
          <div className="bg-slate-100 rounded-lg aspect-[4/3] mb-4" />
          <div className="bg-slate-100 h-3 w-1/3 rounded mb-2" />
          <div className="bg-slate-100 h-5 w-4/5 rounded mb-4" />
          <div className="mt-auto pt-3 border-t border-slate-100 flex gap-2">
            <div className="bg-slate-100 h-9 flex-1 rounded-lg" />
            <div className="bg-slate-100 h-9 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
