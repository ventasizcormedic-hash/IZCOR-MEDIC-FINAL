import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
          <div className="h-4 w-16 bg-slate-200 rounded"></div>
          <div className="h-4 w-4 bg-slate-200 rounded"></div>
          <div className="h-4 w-20 bg-slate-200 rounded"></div>
          <div className="h-4 w-4 bg-slate-200 rounded"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
          {/* Gallery skeleton */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="aspect-square bg-slate-200 rounded-2xl"></div>
            <div className="flex gap-2">
              <div className="w-18 h-18 bg-slate-200 rounded-xl"></div>
              <div className="w-18 h-18 bg-slate-200 rounded-xl"></div>
              <div className="w-18 h-18 bg-slate-200 rounded-xl"></div>
            </div>
          </div>

          {/* Identity & summary skeleton */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-slate-200 rounded-md"></div>
              <div className="h-6 w-32 bg-slate-200 rounded-md"></div>
            </div>
            <div className="h-10 w-4/5 bg-slate-200 rounded-lg"></div>
            <div className="h-6 w-1/2 bg-slate-200 rounded"></div>
            <div className="h-20 w-full bg-slate-200 rounded-xl mt-4"></div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="h-12 bg-slate-200 rounded-xl"></div>
              <div className="h-12 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Specifications skeleton */}
        <div className="h-64 bg-slate-200 rounded-2xl mb-8"></div>
      </div>
    </main>
  );
};
