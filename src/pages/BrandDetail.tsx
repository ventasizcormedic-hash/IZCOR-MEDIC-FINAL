import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Tag, ShieldCheck, Building2, Package, ChevronRight, 
  ExternalLink, AlertCircle, Loader2, Globe 
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/seo/SeoHead';

export function BrandDetail() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 24;

  useEffect(() => {
    if (!idOrSlug) return;
    setLoading(true);
    fetch(`/api/brands/${encodeURIComponent(idOrSlug)}?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`)
      .then(res => {
        if (!res.ok) throw new Error('Brand not found');
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [idOrSlug, page, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-cyan animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#2C3E50]">Cargando ficha de marca...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.brand) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#2C3E50] mb-2">Marca no encontrada</h2>
          <Link
            to="/marcas"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#2C3E50] text-white text-xs font-bold shadow-sm mt-4 hover:bg-[#1E2B37]"
          >
            Volver al Directorio de Marcas
          </Link>
        </div>
      </div>
    );
  }

  const { brand, products: productList, total } = data;
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <SeoHead
        title={`${brand.name} | Equipos Médicos en Perú | IZCOR MEDIC`}
        description={brand.description ? brand.description.substring(0, 150) + "..." : `Equipamiento médico y productos de la marca ${brand.name}. Encuentra especificaciones y solicita una cotización en Izcor Medic.`}
        canonicalUrl={`/marcas/${brand.slug || encodeURIComponent(brand.name)}`}
        noindex={page > 1 || Boolean(searchTerm)}
        schemaObj={{
          "@context": "https://schema.org/",
          "@type": "Brand",
          "name": brand.name,
          "description": brand.description || undefined,
          "url": brand.website || undefined
        }}
      />
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
            <li><Link to="/" className="hover:text-[#2C3E50] transition-colors">Inicio</Link></li>
            <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
            <li><Link to="/marcas" className="hover:text-[#2C3E50] transition-colors">Marcas</Link></li>
            <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
            <li className="text-[#2C3E50] font-bold">{brand.name}</li>
          </ol>
        </nav>

        {/* Brand Header */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-100 border border-slate-200 text-[#2C3E50] flex items-center justify-center font-black text-2xl md:text-3xl shadow-xs flex-shrink-0">
                {brand.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-[#2C3E50] border border-slate-200">
                    {brand.informationStatus}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {brand.peruPresenceStatus}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#2C3E50] tracking-tight mb-2">
                  {brand.name}
                </h1>
                {brand.manufacturer && (
                  <p className="text-xs md:text-sm text-slate-600 font-medium">
                    Fabricante Asociado: <Link to={`/fabricantes/${encodeURIComponent(brand.manufacturer)}`} className="text-[#2C3E50] font-bold hover:underline">{brand.manufacturer}</Link>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-slate-100 text-[#2C3E50] hover:bg-slate-200 font-bold text-xs border border-slate-200 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C3E50]"
                >
                  <Globe className="w-4 h-4" />
                  <span>Sitio Oficial</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <Link
                to="/cotizar"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-brand-cyan hover:bg-[#0087a3] active:bg-[#00768e] text-white font-bold text-xs shadow-xs hover:shadow active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
              >
                Solicitar Cotización de Marca
              </Link>
            </div>
          </div>

          {brand.description && (
            <div className="mt-6 pt-6 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
              {brand.description}
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#2C3E50] tracking-tight">
                Productos de la Marca {brand.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mostrando {productList.length} de {total} registros en catálogo
              </p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar productos de esta marca..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-cyan bg-white"
              />
            </div>
          </div>

          {productList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#2C3E50]">No se encontraron productos para esta marca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productList.map((prod: any) => (
                <ProductCard key={prod.id} {...prod} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs font-bold text-slate-600 px-3">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Source Disclosure */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#2C3E50]">
            <ShieldCheck className="w-4 h-4 text-brand-cyan" />
            <span>Transparencia y Fuente de Información</span>
          </div>
          <p>
            <strong>Fuente oficial:</strong> Catálogo de Suministro Médico IZCOR. Los productos presentados corresponden estrictamente a registros auditados sin suposiciones de representación exclusiva.
          </p>
        </div>

      </div>
    </div>
    </>
  );
}
