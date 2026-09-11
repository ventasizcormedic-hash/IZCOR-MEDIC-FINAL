import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, ShieldCheck, Tag, Package, ChevronRight, 
  Globe, AlertCircle, Loader2, ArrowLeft, Layers, CheckCircle2 
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/seo/SeoHead';

export function ManufacturerDetail() {
  const { nameOrSlug } = useParams<{ nameOrSlug: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 24;

  useEffect(() => {
    if (!nameOrSlug) return;
    setLoading(true);
    fetch(`/api/manufacturers/${encodeURIComponent(nameOrSlug)}?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`)
      .then(res => {
        if (!res.ok) throw new Error('Manufacturer not found');
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
  }, [nameOrSlug, page, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-navy animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">Cargando ficha corporativa del fabricante...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.manufacturer) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">Fabricante no encontrado</h2>
          <p className="text-xs text-slate-500 mb-6">El fabricante solicitado no existe o no cuenta con registros en el catálogo actual.</p>
          <Link
            to="/fabricantes"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold shadow-sm"
          >
            Volver al Directorio
          </Link>
        </div>
      </div>
    );
  }

  const { manufacturer, products: productList, total } = data;
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <SeoHead
        title={`${manufacturer.name} | Fabricante Médico | IZCOR MEDIC`}
        description={`Equipos e insumos médicos fabricados por ${manufacturer.name}. Explora su catálogo completo y solicita cotizaciones para tu institución.`}
        canonicalUrl={`/fabricantes/${encodeURIComponent(manufacturer.name)}`}
        noindex={page > 1 || Boolean(searchTerm)}
        schemaObj={{
          "@context": "https://schema.org/",
          "@type": "Organization",
          "name": manufacturer.name,
          "description": "Fabricante Internacional de Equipamiento e Insumos Médicos"
        }}
      />
      <div className="min-h-screen bg-[#F6F8FC] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
            <li><Link to="/" className="hover:text-brand-navy transition-colors">Inicio</Link></li>
            <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
            <li><Link to="/fabricantes" className="hover:text-brand-navy transition-colors">Fabricantes</Link></li>
            <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
            <li className="text-slate-900 font-bold">{manufacturer.name}</li>
          </ol>
        </nav>

        {/* Corporate Profile Header */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-navy text-white flex items-center justify-center font-black text-2xl md:text-3xl shadow-md flex-shrink-0">
                {manufacturer.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {manufacturer.informationStatus}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {manufacturer.peruPresenceStatus}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#2C3E50] tracking-tight mb-2">
                  {manufacturer.name}
                </h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                  Fabricante Internacional de Equipamiento e Insumos Médicos
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/cotizar"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-brand-cyan hover:bg-[#0087a3] active:bg-[#00768e] text-white font-bold text-xs shadow-xs hover:shadow active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
              >
                Solicitar Cotización de Línea
              </Link>
            </div>
          </div>

          {/* Associated Brands List */}
          {manufacturer.brands && manufacturer.brands.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marcas Asociadas:</span>
              {manufacturer.brands.map((b: any) => (
                <Link
                  key={b.id}
                  to={`/marcas/${b.slug || b.id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Tag className="w-3 h-3 text-brand-cyan" />
                  <span>{b.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Productos Disponibles de {manufacturer.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mostrando {productList.length} de {total} registros oficiales en catálogo
              </p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar productos de este fabricante..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-navy bg-white"
              />
            </div>
          </div>

          {productList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">No se encontraron productos para este fabricante</p>
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

        {/* Source Disclosure Footer */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-brand-navy" />
            <span>Transparencia y Fuente de Información</span>
          </div>
          <p>
            <strong>Fuente oficial:</strong> {manufacturer.source}. Última actualización: {new Date().toLocaleDateString()}. Los estados de presencia comercial se basan estrictamente en trazabilidad documentada sin suposiciones de exclusividad.
          </p>
        </div>

      </div>
    </div>
    </>
  );
}
