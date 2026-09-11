import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, CheckCircle2, ListFilter } from 'lucide-react';
import { ParsedSpecs } from './types';

interface ProductTechnicalSpecsProps {
  parsedSpecs: ParsedSpecs | null;
  rawSpecs?: string | null;
}

export const ProductTechnicalSpecs: React.FC<ProductTechnicalSpecsProps> = ({
  parsedSpecs,
  rawSpecs,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  if (!parsedSpecs && !rawSpecs) {
    return null;
  }

  // 1. If specs are in Table form ({ key, value }[])
  if (parsedSpecs?.type === 'table') {
    const allRows = parsedSpecs.rows;
    const filteredRows = filterQuery.trim()
      ? allRows.filter(
          r =>
            r.key.toLowerCase().includes(filterQuery.toLowerCase()) ||
            r.value.toLowerCase().includes(filterQuery.toLowerCase())
        )
      : allRows;

    const INITIAL_LIMIT = 10;
    const isLong = filteredRows.length > INITIAL_LIMIT;
    const displayRows = isLong && !expanded ? filteredRows.slice(0, INITIAL_LIMIT) : filteredRows;

    return (
      <div id="product-specs-section" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center flex-shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Especificaciones Técnicas</h2>
              <p className="text-xs text-slate-500">
                {allRows.length} parámetros técnicos homologados disponibles
              </p>
            </div>
          </div>

          {/* Search/filter within specs if more than 8 rows */}
          {allRows.length > 8 && (
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filtrar parámetro técnico..."
                className="w-full text-xs px-3 py-1.5 pl-8 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-slate-50"
              />
              <ListFilter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          )}
        </div>

        {/* Dynamic Responsive Specifications Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/90 scrollbar-thin">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th scope="col" className="px-5 py-3 w-2/5 sm:w-1/3 bg-slate-100/70 border-r border-slate-200">
                  Parámetro / Componente
                </th>
                <th scope="col" className="px-5 py-3">
                  Valor / Detalle Técnico Homologado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-900 bg-slate-50/40 border-r border-slate-200 align-top">
                    {row.key}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium leading-relaxed align-top whitespace-pre-line">
                    {row.value}
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-5 py-6 text-center text-slate-400">
                    No se encontraron especificaciones con el término buscado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Expand / Collapse Control */}
        {isLong && (
          <div className="mt-4 pt-3 flex justify-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-navy hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
            >
              <span>
                {expanded
                  ? 'Mostrar menos especificaciones'
                  : `Ver todas las especificaciones (${filteredRows.length})`}
              </span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. If specs are in List form (Array of strings / highlights)
  if (parsedSpecs?.type === 'list') {
    return (
      <div id="product-specs-section" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center flex-shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Características y Especificaciones Técnicas</h2>
            <p className="text-xs text-slate-500">Parámetros registrados del fabricante</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {parsedSpecs.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Fallback: text or HTML formatted specs
  return (
    <div id="product-specs-section" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center flex-shrink-0">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Especificaciones Técnicas</h2>
          <p className="text-xs text-slate-500">Ficha técnica detallada</p>
        </div>
      </div>

      <div
        className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm"
        dangerouslySetInnerHTML={{ __html: rawSpecs || parsedSpecs?.content || '' }}
      />
    </div>
  );
};
