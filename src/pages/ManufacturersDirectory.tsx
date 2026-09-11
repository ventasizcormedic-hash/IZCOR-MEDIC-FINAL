import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Building2, Search, ShieldCheck, Tag, Package, ChevronRight, 
  ExternalLink, Globe, AlertCircle, Loader2, ArrowUpDown, Layers 
} from 'lucide-react';
import { SeoHead } from '../components/seo/SeoHead';

interface ManufacturerItem {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  brandCount: number;
  brands: string[];
  categoryCount: number;
  informationStatus: string;
  peruPresenceStatus: string;
  source: string;
  updatedAt: string;
}

export function ManufacturersDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [manufacturers, setManufacturers] = useState<ManufacturerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 24;

  const fetchManufacturers = async (searchStr = '', pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchStr) params.set('search', searchStr);
      params.set('page', String(pageNum));
      params.set('limit', String(limit));

      const res = await fetch(`/api/manufacturers?${params.toString()}`);
      if (!res.ok) throw new Error('Error fetching manufacturers');
      const data = await res.json();
      setManufacturers(data.manufacturers || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchVal = searchParams.get('search') || '';
    setQuery(searchVal);
    fetchManufacturers(searchVal, page);
  }, [searchParams, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (query.trim()) {
      newParams.set('search', query.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <SeoHead
        title="Directorio de Fabricantes de Equipos Médicos | IZCOR MEDIC"
        description="Explora nuestro directorio de fabricantes internacionales de equipamiento, mobiliario e insumos médicos de alta calidad."
        canonicalUrl="/fabricantes"
        noindex={page > 1 || Boolean(searchParams.get('search'))}
      />
      <div className="min-h-screen bg-[#F6F8FC] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
            <li><Link to="/" className="hover:text-brand-navy transition-colors">Inicio</Link></li>
            <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
            <li className="text-slate-900 font-bold">Fabricantes y Marcas</li>
          </ol>
        </nav>

        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none hidden lg:block" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-brand-navy text-white mb-4 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              Directorio Médico Empresarial y Trazabilidad
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Directorio de Fabricantes y Marcas
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
              Explora fabricantes internacionales de tecnología médica e insumos hospitalarios. Cada fabricante se encuentra vinculado de forma inequívoca a su catálogo, marcas comerciales y registros de suministro verificado.
            </p>

            {/* Navigation Tabs between Manufacturers and Brands */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
              <Link 
                to="/fabricantes"
                className="px-4 py-2 rounded-xl bg-brand-navy text-white font-bold text-xs shadow-2xs"
              >
                Fabricantes
              </Link>
              <Link 
                to="/marcas"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Marcas Comerciales
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Stats Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por fabricante, marca o especialidad (ej. Philips, Mindray, Siemens)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 bg-slate-50/50 focus:bg-white text-slate-900 transition-all"
            />
          </form>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold px-2 flex-shrink-0">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-brand-navy" />
              <span>{total} Fabricantes Registrados</span>
            </span>
          </div>
        </div>

        {/* Grid or Loading State */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-brand-navy animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Cargando directorio de fabricantes...</p>
          </div>
        ) : manufacturers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">No se encontraron fabricantes</p>
            <p className="text-xs text-slate-500 mt-1">Intente con otro término de búsqueda o verifique la ortografía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {manufacturers.map((mfg) => (
              <div 
                key={mfg.id}
                onClick={() => navigate(`/fabricantes/${mfg.id}`)}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-brand-navy/30 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-brand-navy font-black text-lg group-hover:bg-brand-navy group-hover:text-white transition-colors">
                      {mfg.name.charAt(0)}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {mfg.informationStatus}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-navy transition-colors mb-2 line-clamp-1">
                    {mfg.name}
                  </h3>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Package className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span><strong>{mfg.productCount}</strong> productos en catálogo</span>
                    </div>
                    {mfg.brands.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="line-clamp-1">Marcas: <strong>{mfg.brands.join(', ')}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    {mfg.peruPresenceStatus}
                  </span>
                  <span className="font-bold text-brand-navy group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>Ver ficha</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-slate-600 px-3">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}

      </div>
    </div>
    </>
  );
}
