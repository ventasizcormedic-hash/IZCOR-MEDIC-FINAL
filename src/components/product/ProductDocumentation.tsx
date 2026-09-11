import React from 'react';
import { FileText, Download, ExternalLink, ShieldCheck, FileSpreadsheet, Award } from 'lucide-react';
import { ProductDocument } from './types';

interface ProductDocumentationProps {
  documents?: ProductDocument[];
  sourceUrl?: string | null;
}

export const ProductDocumentation: React.FC<ProductDocumentationProps> = ({
  documents,
  sourceUrl,
}) => {
  const hasDocuments = documents && documents.length > 0;

  if (!hasDocuments && !sourceUrl) {
    return null;
  }

  const getDocIcon = (type?: string | null) => {
    const t = type?.toUpperCase() || '';
    if (t.includes('DATASHEET') || t.includes('FICHA')) return <FileText className="w-5 h-5 text-red-600" />;
    if (t.includes('CERT')) return <Award className="w-5 h-5 text-amber-600" />;
    if (t.includes('MANUAL')) return <FileText className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-slate-600" />;
  };

  const getDocBadge = (type?: string | null) => {
    const t = type?.toUpperCase() || '';
    if (t.includes('DATASHEET')) return 'Ficha Técnica Oficial';
    if (t.includes('MANUAL')) return 'Manual de Usuario / Técnico';
    if (t.includes('CERT')) return 'Certificado de Conformidad';
    return type || 'Documento Técnico';
  };

  return (
    <div id="product-documentation-section" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Documentación Oficial y Descargas</h2>
          <p className="text-xs text-slate-500">Expediente técnico y archivos homologados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hasDocuments &&
          documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-brand-navy hover:shadow-xs transition-all flex flex-col justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  {getDocIcon(doc.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                    {getDocBadge(doc.type)}
                  </span>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm mt-1.5 line-clamp-2" title={doc.title || ''}>
                    {doc.title || 'Documento Técnico de Referencia'}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:text-brand-navy hover:border-brand-navy/50 hover:bg-slate-50 transition-all shadow-2xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                  title={`Descargar ${doc.title || 'documento'}`}
                >
                  <Download className="w-3.5 h-3.5 text-brand-navy shrink-0" />
                  <span>Descargar PDF</span>
                </a>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded font-mono">
                  PDF
                </span>
              </div>
            </div>
          ))}

        {/* External Source Documentation link if sourceUrl exists */}
        {sourceUrl && (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs text-brand-navy">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                  Fabricante Original
                </span>
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-1.5">
                  Portal Oficial de Especificaciones
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Consulta de trazabilidad y manuales en la fuente oficial.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:text-brand-navy hover:border-brand-navy/50 hover:bg-slate-50 transition-all shadow-2xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
              >
                <span>Abrir portal del fabricante</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
