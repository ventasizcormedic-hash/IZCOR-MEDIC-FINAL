import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Globe, Plus, Search, Filter, RefreshCw, CheckCircle2, AlertTriangle, 
  Trash2, Edit, ExternalLink, ShieldCheck, Database, Play, Pause, 
  Check, X, Loader2, FileText, Image as ImageIcon, Layers, Cpu, Sparkles, AlertCircle
} from 'lucide-react';

interface ScraperUrl {
  id: number;
  sourceId: number | null;
  url: string;
  manufacturer: string | null;
  brandName: string | null;
  country: string | null;
  sourceType: string;
  priority: number;
  status: string;
  lastExtractionAt: string | null;
  detectedProducts: number;
  errorsCount: number;
  notes: string | null;
}

interface ScrapingJob {
  id: number;
  jobId: string;
  status: string;
  progressPercent: number;
  totalFound: number;
  validCount: number;
  duplicatesCount: number;
  errorsCount: number;
  imagesFound: number;
  documentsFound: number;
  executionTimeMs: number;
  createdAt: string;
}

interface DraftProduct {
  id: number;
  jobId: string | null;
  productUrl?: string | null;
  sourceUrl?: string | null;
  name: string;
  brand: string | null;
  manufacturer: string | null;
  model: string | null;
  reference: string | null;
  description: string | null;
  specifications: any;
  applications: string | null;
  presentation: string | null;
  images: string[] | null;
  documents: any[] | null;
  variants: any[] | null;
  accessories: any[] | null;
  configurations: any[] | null;
  auditReport: any;
  completenessScore: number;
  status: string;
  duplicateStatus: string;
  originalData: any;
  normalizedData: any;
  createdAt: string;
}

interface ScraperManagerProps {
  user: User;
}

export const ScraperManager: React.FC<ScraperManagerProps> = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'urls' | 'drafts' | 'jobs'>('dashboard');
  const [urls, setUrls] = useState<ScraperUrl[]>([]);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [draftStatusFilter, setDraftStatusFilter] = useState('ALL');

  // Modal State for URL
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlFormData, setUrlFormData] = useState({
    url: '',
    manufacturer: '',
    brandName: '',
    country: 'Perú',
    sourceType: 'PRODUCT_LIST',
    priority: 2,
    notes: ''
  });

  // Modal State for Draft Review
  const [selectedDraft, setSelectedDraft] = useState<DraftProduct | null>(null);
  const [viewMode, setViewMode] = useState<'normalized' | 'original'>('normalized');

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const [urlsRes, jobsRes, draftsRes] = await Promise.all([
        fetch('/api/admin/scraper/urls', { headers }),
        fetch('/api/admin/scraper/jobs', { headers }),
        fetch('/api/admin/scraper/drafts', { headers })
      ]);

      if (urlsRes.ok) setUrls(await urlsRes.json());
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (draftsRes.ok) setDrafts(await draftsRes.json());
    } catch (e) {
      console.error('Error fetching scraper data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/scraper/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(urlFormData)
      });
      if (res.ok) {
        setIsUrlModalOpen(false);
        setUrlFormData({ url: '', manufacturer: '', brandName: '', country: 'Perú', sourceType: 'PRODUCT_LIST', priority: 2, notes: '' });
        fetchData();
        setActionMessage('URL de scraping registrada correctamente');
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleValidateUrl = async (id: number) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/scraper/urls/${id}/validate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        fetchData();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUrl = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta URL del scraper?')) return;
    try {
      const token = await user.getIdToken();
      await fetch(`/api/admin/scraper/urls/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartExtraction = async () => {
    setExtracting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/scraper/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        fetchData();
        setTimeout(() => setActionMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExtracting(false);
    }
  };

  const handleApproveDraft = async (id: number) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/scraper/drafts/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        setSelectedDraft(null);
        setActionMessage('Producto DRAFT aprobado correctamente');
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublishDraft = async (id: number) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/scraper/drafts/${id}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        fetchData();
        setSelectedDraft(null);
        setActionMessage(data.message);
        setTimeout(() => setActionMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectDraft = async (id: number) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/scraper/drafts/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        setSelectedDraft(null);
        setActionMessage('Producto DRAFT rechazado.');
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pendingDraftsCount = drafts.filter(d => d.status === 'DRAFT').length;
  const duplicateDraftsCount = drafts.filter(d => d.duplicateStatus === 'POSSIBLE_DUPLICATE').length;
  const totalJobsCount = jobs.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Cpu className="w-7 h-7 text-brand-cyan" />
            Web Scraper Profesional & Ingesta Controlada
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistema de descubrimiento, extracción, validación y control de calidad. Ningún producto se publica automáticamente (modo DRAFT estricto).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartExtraction}
            disabled={extracting}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>Iniciar Extracción Masiva</span>
          </button>
          <button
            onClick={() => setIsUrlModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-cyan hover:bg-[#0087a3] text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar URL
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeSubTab === 'dashboard' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Dashboard General
        </button>
        <button
          onClick={() => setActiveSubTab('urls')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeSubTab === 'urls' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          URLs Registradas ({urls.length})
        </button>
        <button
          onClick={() => setActiveSubTab('drafts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeSubTab === 'drafts' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Productos DRAFT ({pendingDraftsCount})
        </button>
        <button
          onClick={() => setActiveSubTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeSubTab === 'jobs' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Historial de Trabajos ({totalJobsCount})
        </button>
      </div>

      {/* DASHBOARD VIEW */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">URLs Monitoreadas</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{urls.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Borradores DRAFT</p>
              <p className="text-2xl font-black text-brand-cyan mt-1">{pendingDraftsCount}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posibles Duplicados</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{duplicateDraftsCount}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trabajos Ejecutados</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{totalJobsCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Drafts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Últimos Productos DRAFT Encontrados</span>
                <button onClick={() => setActiveSubTab('drafts')} className="text-xs text-brand-cyan font-semibold hover:underline">Ver todos</button>
              </h2>
              <div className="divide-y divide-slate-100">
                {drafts.slice(0, 5).map(d => (
                  <div key={d.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{d.name}</p>
                      <p className="text-[11px] text-slate-500">{d.brand || 'Marca no identificada'} • Modelo: {d.model || 'N/D'}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {d.completenessScore}% Completo
                      </span>
                      <button
                        onClick={() => setSelectedDraft(d)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Revisar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Historial Reciente de Scraping</span>
                <button onClick={() => setActiveSubTab('jobs')} className="text-xs text-brand-cyan font-semibold hover:underline">Ver todos</button>
              </h2>
              <div className="divide-y divide-slate-100">
                {jobs.slice(0, 5).map(j => (
                  <div key={j.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-mono font-bold text-slate-800">{j.jobId}</p>
                      <p className="text-[11px] text-slate-500">Detectados: {j.totalFound} • Válidos: {j.validCount}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {j.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* URLS TAB */}
      {activeSubTab === 'urls' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900">URLs Registradas para Descubrimiento y Extracción</h2>
            <button
              onClick={() => setIsUrlModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-cyan hover:bg-[#0087a3] text-white text-xs font-bold inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar URL
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="py-3.5 px-6">URL & Dominio</th>
                  <th className="py-3.5 px-4">Fabricante / Marca</th>
                  <th className="py-3.5 px-4">País & Tipo</th>
                  <th className="py-3.5 px-4">Prioridad</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {urls.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <a href={u.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-cyan hover:underline inline-flex items-center gap-1">
                        {u.url}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {u.manufacturer || 'No identificado'} {u.brandName && `(${u.brandName})`}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">{u.country}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-700">P{u.priority}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">{u.status}</span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleValidateUrl(u.id)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Validar URL"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUrl(u.id)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                        title="Eliminar URL"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRAFTS TAB */}
      {activeSubTab === 'drafts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900">Productos en Estado DRAFT (Requieren Revisión Humana antes de Publicar)</h2>
            <select
              value={draftStatusFilter}
              onChange={(e) => setDraftStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="DRAFT">Pendientes (DRAFT)</option>
              <option value="APPROVED">Aprobados</option>
              <option value="PUBLISHED">Publicados</option>
              <option value="REJECTED">Rechazados</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="py-3.5 px-6">Imagen</th>
                  <th className="py-3.5 px-4">Producto / Modelo</th>
                  <th className="py-3.5 px-4">Marca & Fabricante</th>
                  <th className="py-3.5 px-4">Completitud</th>
                  <th className="py-3.5 px-4">Estado DRAFT</th>
                  <th className="py-3.5 px-6 text-right">Acciones de Revisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {drafts.filter(d => draftStatusFilter === 'ALL' || d.status === draftStatusFilter).map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-6">
                      {d.images && d.images[0] ? (
                        <img src={d.images[0]} alt={d.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 line-clamp-1">{d.name}</p>
                      <p className="text-[11px] text-slate-500">Modelo: {d.model || 'N/D'} • Ref: {d.reference || 'N/D'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{d.brand || 'No especificada'}</p>
                      <p className="text-[11px] text-slate-400">{d.manufacturer}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-brand-cyan h-full rounded-full" style={{ width: `${d.completenessScore}%` }} />
                        </div>
                        <span className="font-black text-slate-700 text-[11px]">{d.completenessScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        d.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' :
                        d.status === 'APPROVED' ? 'bg-blue-50 text-blue-700' :
                        d.status === 'REJECTED' ? 'bg-red-50 text-red-600' :
                        'bg-cyan-50 text-cyan-800 border border-cyan-200'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedDraft(d)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                      >
                        Revisar
                      </button>
                      {d.status !== 'PUBLISHED' && (
                        <button
                          onClick={() => handlePublishDraft(d.id)}
                          className="px-3 py-1.5 rounded-lg bg-brand-cyan hover:bg-[#0087a3] text-white font-bold transition-colors"
                        >
                          Publicar Oficial
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JOBS TAB */}
      {activeSubTab === 'jobs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900">Historial de Trabajos de Scraping & Ingesta</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="py-3.5 px-6">Job ID</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Detectados</th>
                  <th className="py-3.5 px-4">Válidos</th>
                  <th className="py-3.5 px-4">Imágenes / Docs</th>
                  <th className="py-3.5 px-6">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{j.jobId}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">{j.status}</span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{j.totalFound}</td>
                    <td className="py-3.5 px-4 font-bold text-brand-cyan">{j.validCount}</td>
                    <td className="py-3.5 px-4 text-slate-600">{j.imagesFound} imgs / {j.documentsFound} docs</td>
                    <td className="py-3.5 px-6 text-slate-500 font-mono">{(j.executionTimeMs / 1000).toFixed(2)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add URL */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-cyan" />
                Registrar URL para el Scraper
              </h3>
              <button onClick={() => setIsUrlModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUrl} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Objetivo *</label>
                <input
                  type="url"
                  required
                  value={urlFormData.url}
                  onChange={(e) => setUrlFormData({ ...urlFormData, url: e.target.value })}
                  placeholder="https://www.fabricante.com/catalogo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fabricante</label>
                  <input
                    type="text"
                    value={urlFormData.manufacturer}
                    onChange={(e) => setUrlFormData({ ...urlFormData, manufacturer: e.target.value })}
                    placeholder="Ej. Mindray"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={urlFormData.brandName}
                    onChange={(e) => setUrlFormData({ ...urlFormData, brandName: e.target.value })}
                    placeholder="Ej. Mindray"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">País</label>
                  <select
                    value={urlFormData.country}
                    onChange={(e) => setUrlFormData({ ...urlFormData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Perú">Perú</option>
                    <option value="Internacional">Internacional</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioridad</label>
                  <select
                    value={urlFormData.priority}
                    onChange={(e) => setUrlFormData({ ...urlFormData, priority: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value={1}>1 - Alta</option>
                    <option value={2}>2 - Media</option>
                    <option value={3}>3 - Baja</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-[#0087a3] text-white font-bold text-xs"
                >
                  Guardar URL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Draft Review - Deep Dossier */}
      {selectedDraft && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col">
            <div className="px-6 py-5 bg-[#2C3E50] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-cyan" />
                <div>
                  <h3 className="font-bold text-base">Expediente de Producto DRAFT #{selectedDraft.id}</h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">{selectedDraft.productUrl || selectedDraft.sourceUrl}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDraft(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-2.5 bg-slate-800 text-white flex items-center justify-between border-t border-slate-700 text-xs flex-shrink-0">
              <span className="text-slate-300 font-medium">Motor de Normalización (Trazabilidad Activa):</span>
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => setViewMode('normalized')}
                  className={`px-3 py-1 rounded-md font-bold transition-colors ${viewMode === 'normalized' ? 'bg-brand-cyan text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                >
                  Vista Normalizada
                </button>
                <button
                  onClick={() => setViewMode('original')}
                  className={`px-3 py-1 rounded-md font-bold transition-colors ${viewMode === 'original' ? 'bg-brand-cyan text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                >
                  Datos Originales
                </button>
              </div>
            </div>

            {(() => {
              const activeData = viewMode === 'normalized' ? (selectedDraft.normalizedData || selectedDraft) : (selectedDraft.originalData || selectedDraft);
              const displayName = selectedDraft.name;
              const displayBrand = activeData.brand || selectedDraft.brand;
              const displayMfg = activeData.manufacturer || selectedDraft.manufacturer;
              const displayCategory = activeData.category || 'Equipamiento Médico General';
              const displaySpecs = activeData.specifications || selectedDraft.specifications;
              const displayPresentation = activeData.presentation || selectedDraft.presentation;
              const displayApplications = Array.isArray(activeData.applications) ? activeData.applications.join(', ') : (activeData.applications || selectedDraft.applications);

              return (
                <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50/50">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      {selectedDraft.images && selectedDraft.images[0] ? (
                        <img src={selectedDraft.images[0]} alt={displayName} className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-xs" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-48 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-10 h-10" />
                        </div>
                      )}
                      <div className="mt-3 p-3 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-cyan-800 uppercase">Completitud</p>
                          <p className="text-lg font-black text-brand-cyan">{selectedDraft.completenessScore}%</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-cyan text-white">{selectedDraft.duplicateStatus}</span>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Nombre Comercial Oficial (Intacto)</label>
                        <p className="text-base font-bold text-slate-900">{displayName}</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">Marca</span>
                          <span className="text-xs font-bold text-slate-800">{displayBrand || 'N/D'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">Fabricante</span>
                          <span className="text-xs font-bold text-slate-800">{displayMfg || 'N/D'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">Categoría</span>
                          <span className="text-xs font-bold text-slate-800 truncate block" title={displayCategory}>{displayCategory}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">Modelo / Ref</span>
                          <span className="text-xs font-bold text-slate-800">{selectedDraft.model || selectedDraft.reference || 'N/D'}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">Presentación</span>
                          <span className="text-xs font-semibold text-slate-700">{displayPresentation || 'Unidad'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">Aplicaciones</span>
                          <span className="text-xs font-semibold text-slate-700 truncate block" title={displayApplications}>{displayApplications || 'General'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Descripción</label>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">{selectedDraft.description || 'Sin descripción'}</p>
                      </div>
                    </div>
                  </div>

                  {displaySpecs && Array.isArray(displaySpecs) && displaySpecs.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                        <span>Especificaciones Técnicas ({viewMode === 'normalized' ? 'Normalizadas con Unidades' : 'Valores Originales'})</span>
                        <span className="text-slate-400 text-[11px]">{displaySpecs.length} atributos</span>
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-500 uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-6">Atributo</th>
                            <th className="py-2.5 px-4">Valor</th>
                            <th className="py-2.5 px-4">Unidad</th>
                            <th className="py-2.5 px-6">Fuente / Trazabilidad</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displaySpecs.map((spec: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2.5 px-6 font-bold text-slate-800">{spec.name}</td>
                              <td className="py-2.5 px-4 text-slate-700 font-semibold">{spec.normalizedValue || spec.value}</td>
                              <td className="py-2.5 px-4 font-mono text-cyan-800 font-bold">{spec.unit || '-'}</td>
                              <td className="py-2.5 px-6 text-slate-500 text-[11px] italic">{spec.source || 'Fuente Oficial'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Variants, Accessories, Configurations */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase mb-3 flex items-center justify-between">
                        <span>Variantes Detectadas</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">{selectedDraft.variants?.length || 0}</span>
                      </h4>
                      {selectedDraft.variants && selectedDraft.variants.length > 0 ? (
                        <ul className="space-y-2 text-xs">
                          {selectedDraft.variants.map((v: any, idx: number) => (
                            <li key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                              <span className="font-bold text-slate-800">{v.name}</span>
                              <span className="font-mono text-[10px] text-slate-500">{v.ref}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Ninguna variante adicional detectada.</p>
                      )}
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase mb-3 flex items-center justify-between">
                        <span>Accesorios & Consumibles</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">{selectedDraft.accessories?.length || 0}</span>
                      </h4>
                      {selectedDraft.accessories && selectedDraft.accessories.length > 0 ? (
                        <ul className="space-y-2 text-xs">
                          {selectedDraft.accessories.map((acc: any, idx: number) => (
                            <li key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                              <span className="font-semibold text-slate-800">{acc.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">{acc.type}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Sin accesorios registrados.</p>
                      )}
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase mb-3 flex items-center justify-between">
                        <span>Configuraciones</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">{selectedDraft.configurations?.length || 0}</span>
                      </h4>
                      {selectedDraft.configurations && selectedDraft.configurations.length > 0 ? (
                        <ul className="space-y-2 text-xs">
                          {selectedDraft.configurations.map((cfg: any, idx: number) => (
                            <li key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="font-bold text-slate-800 block">{cfg.name}</span>
                              <span className="text-[11px] text-slate-500">{cfg.desc}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Configuración única estándar.</p>
                      )}
                    </div>
                  </div>

                  {/* Documents & Audit Report */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase mb-3">Documentación Técnica Vinculada</h4>
                      {selectedDraft.documents && selectedDraft.documents.length > 0 ? (
                        <div className="space-y-2">
                          {selectedDraft.documents.map((doc: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-brand-cyan" />
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                                  <span className="text-[10px] text-slate-400 uppercase font-mono">{doc.type}</span>
                                </div>
                              </div>
                              <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1">
                                Ver PDF <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Sin documentos PDF vinculados.</p>
                      )}
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase mb-3">Reporte de Auditoría de Profundidad</h4>
                      {selectedDraft.auditReport ? (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(selectedDraft.auditReport).map(([key, val]: [string, any], idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span className={`font-bold text-[11px] ${val ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {val ? '✓ Investigado' : '— N/D'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Auditoría estándar completada.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <button
                onClick={() => handleRejectDraft(selectedDraft.id)}
                className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors"
              >
                Rechazar Borrador
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleApproveDraft(selectedDraft.id)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition-colors shadow-xs"
                >
                  Aprobar Borrador
                </button>
                <button
                  onClick={() => handlePublishDraft(selectedDraft.id)}
                  className="px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-[#0087a3] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Publicar en Catálogo Oficial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
