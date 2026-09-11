import React from 'react';
import { Stethoscope, Package, Check } from 'lucide-react';
import { parseApplications } from './types';

interface ProductClinicalApplicationsProps {
  application?: string | null;
  presentation?: string | null;
}

export const ProductClinicalApplications: React.FC<ProductClinicalApplicationsProps> = ({
  application,
  presentation,
}) => {
  const appList = parseApplications(application);

  if (!appList && !presentation) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Applications Block (Only if exists) */}
      {appList && appList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Aplicaciones y Áreas Clínicas</h3>
              <p className="text-[11px] text-slate-400">Entornos de uso homologados</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {appList.map((appItem, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
              >
                <Check className="w-3.5 h-3.5 text-teal-600" />
                <span>{appItem}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Presentation Block (Only if exists) */}
      {presentation && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Presentación y Embalaje</h3>
              <p className="text-[11px] text-slate-400">Formato comercial de suministro</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium block mb-1">Formato registrado:</span>
            <span className="text-sm font-bold text-slate-900">{presentation}</span>
          </div>
        </div>
      )}
    </div>
  );
};
