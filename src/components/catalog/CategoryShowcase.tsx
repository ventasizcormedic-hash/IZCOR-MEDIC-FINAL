import React from 'react';
import { 
  Activity, HeartPulse, Stethoscope, Microscope, 
  Layers, ChevronRight, Sparkles 
} from 'lucide-react';
import { CategoryWithSubcategories } from '../../types';

interface CategoryShowcaseProps {
  categories: CategoryWithSubcategories[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryShowcase({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryShowcaseProps) {
  if (selectedCategory || categories.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-navy" />
            Líneas Clínicas Principales
          </h2>
          <p className="text-xs text-slate-500">
            Explora las divisiones médicas homologadas para compras hospitalarias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.slice(0, 6).map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id.toString())}
            className="p-3.5 bg-white border border-slate-200/90 hover:border-brand-navy/40 rounded-xl text-left transition-all hover:shadow-md group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-brand-navy/10 text-brand-navy flex items-center justify-center transition-colors">
                <Activity className="w-4 h-4" />
              </div>
              {cat.productCount !== undefined && (
                <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-brand-navy">
                  {cat.productCount}
                </span>
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-brand-navy line-clamp-2 leading-tight">
                {cat.name}
              </div>
              <span className="text-[10px] text-slate-400 font-medium inline-flex items-center gap-0.5 mt-0.5">
                Ver equipos <ChevronRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
