import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Globe, Plus, Search, Filter, RefreshCw, CheckCircle2, AlertTriangle, 
  Trash2, Edit, ExternalLink, ShieldCheck, Database, Layers, Check, X, Loader2
} from 'lucide-react';

interface Source {
  id: number;
  manufacturer: string | null;
  brandId: number | null;
  brandName: string | null;
  domain: string;
  url: string;
  productsUrl: string | null;
  sitemapUrl: string | null;
  country: string | null;
  priority: number;
  status: string;
  lastExtractionAt: string | null;
  lastCheckedAt: string | null;
  detectedProductCount: number;
  sourceType: string;
  verificationStatus: string;
  verificationSource: string | null;
  verificationDate: string | null;
}

interface SourcesManagerProps {
  user: User;
}

export const SourcesManager: React.FC<SourcesManagerProps> = ({ user }) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [formData, setFormData] = useState({
    manufacturer: '',
    brandName: '',
    domain: '',
    url: '',
    productsUrl: '',
    sitemapUrl: '',
    country: 'Internacional',
    priority: 2,
    status: 'ACTIVE',
    sourceType: 'OFFICIAL_MANUFACTURER',
    verificationStatus: 'UNVERIFIED',
    verificationSource: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (countryFilter !== 'ALL') params.set('country', countryFilter);
      if (sourceTypeFilter !== 'ALL') params.set('sourceType', sourceTypeFilter);

      const res = await fetch(`/api/admin/sources?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (e) {
      console.error('Error fetching sources:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [search, statusFilter, countryFilter, sourceTypeFilter]);

  const handleOpenCreate = () => {
    setEditingSource(null);
    setFormData({
      manufacturer: '',
      brandName: '',
      domain: '',
      url: '',
      productsUrl: '',
      sitemapUrl: '',
      country: 'Internacional',
      priority: 2,
      status: 'ACTIVE',
      sourceType: 'OFFICIAL_MANUFACTURER',
      verificationStatus: 'UNVERIFIED',
      verificationSource: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (source: Source) => {
    setEditingSource(source);
    setFormData({
      manufacturer: source.manufacturer || '',
      brandName: source.brandName || '',
      domain: source.domain || '',
      url: source.url || '',
      productsUrl: source.productsUrl || '',
      sitemapUrl: source.sitemapUrl || '',
      country: source.country || 'Internacional',
      priority: source.priority || 2,
      status: source.status || 'ACTIVE',
      sourceType: source.sourceType || 'OFFICIAL_MANUFACTURER',
      verificationStatus: source.verificationStatus || 'UNVERIFIED',
      verificationSource: source.verificationSource || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const url = editingSource ? `/api/admin/sources/${editingSource.id}` : '/api/admin/sources';
      const method = editingSource ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchSources();
        setActionMessage(editingSource ? 'Fuente actualizada correctamente' : 'Nueva fuente registrada correctamente');
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar fuente');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar o desactivar esta fuente de información?')) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/sources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSources();
        setActionMessage('Fuente eliminada correctamente');
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckSource = async (id: number) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/sources/${id}/check`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        fetchSources();
        setTimeout(() => setActionMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExtractSource = async (id: number) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/sources/${id}/extract`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        fetchSources();
        setTimeout(() => setActionMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Metrics summary
  const totalSources = sources.length;
  const activeSources = sources.filter(s => s.status === 'ACTIVE').length;
  const verifiedSources = sources.filter(s => s.verificationStatus === 'VERIFIED' || s.verificationStatus === 'OFFICIAL_REPRESENTATIVE_VERIFIED').length;
  const totalDetectedProducts = sources.reduce((acc, s) => acc + (s.detectedProductCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Globe className="w-7 h-7 text-brand-cyan" />
            Centro Central de Fuentes del Catálogo Médico
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administre, compruebe y configure fuentes de información autorizadas (fabricantes, marcas y catálogos globales y Perú).
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-cyan hover:bg-[#0087a3] text-white font-bold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Registrar Nueva Fuente
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fuentes Registradas</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalSources}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fuentes Activas</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeSources}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fuentes Verificadas</p>
          <p className="text-2xl font-black text-brand-cyan mt-1">{verifiedSources}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productos Detectados</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{totalDetectedProducts.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por dominio, fabricante o marca..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-cyan bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVE">Activa</option>
            <option value="INACTIVE">Inactiva</option>
            <option value="PENDING">Pendiente</option>
            <option value="ERROR">Error</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">Todos los Países</option>
            <option value="Perú">Perú</option>
            <option value="Internacional">Internacional</option>
            <option value="Estados Unidos">Estados Unidos</option>
            <option value="Europa">Europa</option>
          </select>

          <select
            value={sourceTypeFilter}
            onChange={(e) => setSourceTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">Tipo de Fuente</option>
            <option value="OFFICIAL_MANUFACTURER">Fabricante Oficial</option>
            <option value="DISTRIBUTOR">Distribuidor</option>
            <option value="CATALOG">Catálogo</option>
            <option value="SITEMAP">Sitemap</option>
          </select>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500 flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-brand-cyan" />
            <span className="text-sm font-medium">Cargando fuentes de información...</span>
          </div>
        ) : sources.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No se encontraron fuentes de información</p>
            <p className="text-xs text-slate-400 mt-1">Registre una nueva fuente para alimentar el catálogo médico.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="py-3.5 px-6">Fabricante / Marca</th>
                  <th className="py-3.5 px-4">Dominio & URL</th>
                  <th className="py-3.5 px-4">País & Tipo</th>
                  <th className="py-3.5 px-4">Prioridad</th>
                  <th className="py-3.5 px-4">Verificación</th>
                  <th className="py-3.5 px-4">Productos</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sources.map((src) => (
                  <tr key={src.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{src.manufacturer || 'Fabricante No Identificado'}</p>
                      {src.brandName && (
                        <p className="text-slate-500 font-medium text-[11px] mt-0.5">Marca: {src.brandName}</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-cyan hover:underline inline-flex items-center gap-1"
                      >
                        {src.domain}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate max-w-xs">{src.url}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {src.country || 'Internacional'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 capitalize font-medium">{src.sourceType?.replace('_', ' ')}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      P{src.priority || 2}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        src.verificationStatus === 'VERIFIED' || src.verificationStatus === 'OFFICIAL_REPRESENTATIVE_VERIFIED'
                          ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        {src.verificationStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-slate-900">
                      {src.detectedProductCount?.toLocaleString() || 0}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        src.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${src.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                        {src.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleCheckSource(src.id)}
                        title="Comprobar fuente técnica"
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExtractSource(src.id)}
                        title="Ejecutar extracción de productos"
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                      >
                        <Database className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(src)}
                        title="Editar configuración"
                        className="p-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(src.id)}
                        title="Eliminar fuente"
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit Source */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 bg-[#2C3E50] text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-cyan" />
                {editingSource ? 'Editar Fuente de Información' : 'Registrar Nueva Fuente de Información'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fabricante</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="Ej. Mindray Medical"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marca Asociada</label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="Ej. Mindray"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dominio Principal *</label>
                  <input
                    type="text"
                    required
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="Ej. mindray.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-cyan font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">País / Mercado</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none"
                  >
                    <option value="Internacional">Internacional</option>
                    <option value="Perú">Perú</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                    <option value="Europa">Europa</option>
                    <option value="Asia">Asia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Principal *</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://www.mindray.com/"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-cyan font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL de Productos / Catálogo</label>
                  <input
                    type="text"
                    value={formData.productsUrl}
                    onChange={(e) => setFormData({ ...formData, productsUrl: e.target.value })}
                    placeholder="https://www.mindray.com/na/products"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-cyan font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sitemap XML (Opcional)</label>
                  <input
                    type="text"
                    value={formData.sitemapUrl}
                    onChange={(e) => setFormData({ ...formData, sitemapUrl: e.target.value })}
                    placeholder="https://www.mindray.com/sitemap.xml"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-cyan font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioridad (1-3)</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none"
                  >
                    <option value={1}>1 - Alta (Oficial)</option>
                    <option value={2}>2 - Media (Autorizada)</option>
                    <option value={3}>3 - Baja (Secundaria)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none"
                  >
                    <option value="ACTIVE">Activa</option>
                    <option value="INACTIVE">Inactiva</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="ERROR">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Fuente</label>
                  <select
                    value={formData.sourceType}
                    onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none"
                  >
                    <option value="OFFICIAL_MANUFACTURER">Fabricante Oficial</option>
                    <option value="DISTRIBUTOR">Distribuidor</option>
                    <option value="CATALOG">Catálogo</option>
                    <option value="SITEMAP">Sitemap</option>
                    <option value="API">API Externa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado de Verificación</label>
                  <select
                    value={formData.verificationStatus}
                    onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none"
                  >
                    <option value="UNVERIFIED">No Verificado</option>
                    <option value="DETECTED">Detectado</option>
                    <option value="VERIFIED">Verificado</option>
                    <option value="OFFICIAL_REPRESENTATIVE_VERIFIED">Representación Oficial Verificada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fuente de Evidencia / URL</label>
                  <input
                    type="text"
                    value={formData.verificationSource}
                    onChange={(e) => setFormData({ ...formData, verificationSource: e.target.value })}
                    placeholder="Documento de respaldo o registro"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-[#0087a3] text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingSource ? 'Guardar Cambios' : 'Registrar Fuente'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
