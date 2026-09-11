import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShieldCheck, FileText, ArrowRight, Activity, Trash2, CheckCircle2 } from 'lucide-react';
import { ComparisonProduct } from './types';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ComparisonProduct[];
  onRemoveProduct: (productId: number) => void;
  onClearAll: () => void;
}

export function ComparisonModal({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onClearAll,
}: ComparisonModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
    >
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-brand-navy text-white mb-1">
              Matriz Comparativa Técnica
            </div>
            <h2 id="comparison-title" className="text-xl font-black text-slate-900">
              Comparativa de Equipamiento Médico ({products.length} de 4)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar matriz
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="overflow-x-auto flex-1 p-6">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold">No hay productos seleccionados para comparar.</p>
              <p className="text-slate-400 text-xs mt-1">Selecciona hasta 4 equipos desde el catálogo para visualizarlos lado a lado.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="w-48 p-4 bg-slate-100/70 text-slate-700 text-xs font-black uppercase tracking-wider rounded-tl-xl border-b border-slate-200">
                    Criterio Técnico
                  </th>
                  {products.map((p) => (
                    <th key={p.id} className="p-4 bg-slate-50 text-slate-900 border-b border-slate-200 relative min-w-[220px]">
                      <button
                        onClick={() => onRemoveProduct(p.id)}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white transition-colors"
                        title="Quitar de comparación"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Product Visual */}
                      <div className="w-24 h-24 bg-white rounded-lg p-2 border border-slate-200 flex items-center justify-center mx-auto mb-2 overflow-hidden">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                          <Activity className="w-8 h-8 text-slate-300" />
                        )}
                      </div>

                      <div className="text-center">
                        <span className="text-[10px] font-extrabold uppercase text-brand-cyan tracking-wider">
                          {p.brandName || 'IZCOR'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">
                          {p.name}
                        </h4>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {/* Brand & Manufacturer */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                    Fabricante / Marca
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-slate-800">
                      <div><strong className="text-slate-900">{p.brandName}</strong></div>
                      {p.manufacturer && (
                        <div className="text-slate-500 text-[11px]">Fab: {p.manufacturer}</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Model & SKU */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                    Modelo y Catálogo
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-slate-800 font-mono">
                      <div>Mod: <span className="font-bold">{p.model || 'Estándar'}</span></div>
                      {p.catalogNumber && (
                        <div className="text-slate-500 text-[11px]">SKU: {p.catalogNumber}</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                    Línea / Categoría
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700">
                      {p.categoryName || 'Equipamiento Médico'}
                    </td>
                  ))}
                </tr>

                {/* Clinical Applications */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                    Aplicaciones Clínicas
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700">
                      {p.application ? (
                        <div className="flex flex-wrap gap-1">
                          {p.application.split(/[,;]/).map((a, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded text-[10px] font-semibold">
                              {a.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No especificado</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Technical Specs */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/50 align-top">
                    Especificaciones Clave
                  </td>
                  {products.map((p) => {
                    let specs: string[] = [];
                    if (p.technicalSpecs) {
                      try {
                        const parsed = JSON.parse(p.technicalSpecs);
                        specs = Array.isArray(parsed) ? parsed : [p.technicalSpecs];
                      } catch {
                        specs = p.technicalSpecs.split('\n').filter(Boolean);
                      }
                    }
                    return (
                      <td key={p.id} className="p-4 text-slate-700 align-top">
                        {specs.length > 0 ? (
                          <ul className="space-y-1">
                            {specs.map((s, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-tight">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400 italic">Consulte ficha técnica</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Verification Status */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                    Registro y Verificación
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      {p.verificationStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          HOMOLOGADO
                        </span>
                      ) : (
                        <span className="text-slate-500 font-semibold">DISPONIBLE</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                    Acción de Adquisición
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/cotizar?product=${p.id}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy-light active:bg-brand-cyan shadow-xs hover:shadow active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Cotizar
                        </Link>
                        <Link
                          to={`/productos/${p.slug}`}
                          className="w-full inline-flex items-center justify-center gap-1 h-8 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-brand-navy active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        >
                          <span>Ver ficha</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Comparativa técnica orientativa para requerimientos hospitalarios y expedientes TDR.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
