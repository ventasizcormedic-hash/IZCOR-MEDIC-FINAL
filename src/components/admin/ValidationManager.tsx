import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, 
  Image as ImageIcon, FileText, Tag, Globe, Copy, Clock, 
  Search, RefreshCw, Eye, Edit3, ExternalLink, Download, 
  Filter, Check, X, AlertOctagon, Wrench, ArrowRight,
  Layers, ChevronDown, CheckCheck
} from 'lucide-react';

interface ValidationManagerProps {
  user: User | null;
}

export type IncidentCategoryFilter = 
  | 'ALL'
  | 'MISSING_IMAGE'
  | 'MISSING_MODEL'
  | 'MISSING_DESCRIPTION'
  | 'MISSING_SPECS'
  | 'MISSING_SOURCE'
  | 'POSSIBLE_DUPLICATE'
  | 'OUTDATED'
  | 'HAS_ERRORS';

export function ValidationManager({ user }: ValidationManagerProps) {
  // State
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [savingFix, setSavingFix] = useState(false);
  
  const [summary, setSummary] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategoryFilter>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal & Selection
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    model: '',
    description: '',
    technicalSpecs: '',
    sourceUrl: '',
    imageUrl: '',
    verificationStatus: 'REVIEW'
  });
  
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch quality audit data
  const fetchQualityAudit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('type', selectedCategory);
      if (selectedSeverity !== 'ALL') params.append('severity', selectedSeverity);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/quality/audit?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setReports(data.reports);
      }
    } catch (e) {
      console.error("Error fetching quality audit:", e);
      setActionFeedback({ message: 'Error al consultar auditoría de calidad.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityAudit();
  }, [user, selectedCategory, selectedSeverity, selectedStatus]);

  // Run full catalog scan
  const handleRunFullScan = async () => {
    if (!user) return;
    setScanning(true);
    setActionFeedback({ message: 'Iniciando escaneo automático de las 8 incidencias de calidad...', type: 'info' });
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/quality/run-scan', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback({ message: data.message || 'Escaneo de calidad completado con éxito.', type: 'success' });
        setSummary(data.summary);
        fetchQualityAudit();
      } else {
        setActionFeedback({ message: data.error || 'Error al ejecutar escaneo.', type: 'error' });
      }
    } catch (e: any) {
      setActionFeedback({ message: `Error: ${e.message}`, type: 'error' });
    } finally {
      setScanning(false);
    }
  };

  // Open Inspector / Fixer Modal
  const handleOpenInspector = (report: any) => {
    setSelectedProduct(report);
    setEditFormData({
      model: report.model || '',
      description: '',
      technicalSpecs: '',
      sourceUrl: report.sourceUrl || '',
      imageUrl: '',
      verificationStatus: report.verificationStatus || 'REVIEW'
    });
  };

  // Save quick fixes for a product
  const handleSaveQuickFix = async () => {
    if (!selectedProduct || !user) return;
    setSavingFix(true);
    try {
      const token = await user.getIdToken();
      const payload: any = {};
      if (editFormData.model.trim()) payload.model = editFormData.model.trim();
      if (editFormData.description.trim()) payload.description = editFormData.description.trim();
      if (editFormData.technicalSpecs.trim()) payload.technicalSpecs = editFormData.technicalSpecs.trim();
      if (editFormData.sourceUrl.trim()) payload.sourceUrl = editFormData.sourceUrl.trim();
      if (editFormData.imageUrl.trim()) payload.imageUrl = editFormData.imageUrl.trim();
      if (editFormData.verificationStatus) payload.verificationStatus = editFormData.verificationStatus;

      const res = await fetch(`/api/admin/quality/quick-fix/${selectedProduct.productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback({ message: `Producto #${selectedProduct.productId} corregido y re-evaluado con éxito.`, type: 'success' });
        setSelectedProduct(null);
        fetchQualityAudit();
      } else {
        alert(data.error || 'Error al guardar corrección.');
      }
    } catch (e: any) {
      alert(`Error de comunicación: ${e.message}`);
    } finally {
      setSavingFix(false);
    }
  };

  // Quick verify
  const handleQuickVerify = async (productId: number) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/validation/${productId}/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback({ message: 'Producto aprobado y verificado correctamente.', type: 'success' });
        if (selectedProduct?.productId === productId) {
          setSelectedProduct(null);
        }
        fetchQualityAudit();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export report to CSV
  const handleExportCSV = () => {
    if (reports.length === 0) return;
    const headers = ['ID', 'Producto', 'Modelo', 'Fabricante', 'Score', 'Estado', 'Incidencias Detectadas', 'Fuente'];
    const rows = reports.map(r => [
      r.productId,
      `"${(r.productName || '').replace(/"/g, '""')}"`,
      `"${(r.model || 'N/D').replace(/"/g, '""')}"`,
      `"${(r.manufacturer || r.brandName || 'N/D').replace(/"/g, '""')}"`,
      r.validationScore,
      r.verificationStatus,
      `"${r.incidents.map((i: any) => i.title).join('; ')}"`,
      `"${r.sourceUrl || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `control_calidad_izcor_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const breakdown = summary?.breakdown || {
    missingImage: { count: 0, percentage: 0 },
    missingModel: { count: 0, percentage: 0 },
    missingDescription: { count: 0, percentage: 0 },
    missingSpecs: { count: 0, percentage: 0 },
    missingSource: { count: 0, percentage: 0 },
    possibleDuplicate: { count: 0, percentage: 0 },
    outdated: { count: 0, percentage: 0 },
    hasErrors: { count: 0, percentage: 0 },
  };

  // The 8 requested automatic detectors
  const detectorCards = [
    {
      id: 'MISSING_IMAGE' as IncidentCategoryFilter,
      title: 'Sin Imagen',
      count: breakdown.missingImage.count,
      pct: breakdown.missingImage.percentage,
      severity: 'HIGH',
      icon: ImageIcon,
      color: 'rose',
      border: 'border-rose-200',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      desc: 'Productos sin foto ni render'
    },
    {
      id: 'MISSING_MODEL' as IncidentCategoryFilter,
      title: 'Sin Modelo',
      count: breakdown.missingModel.count,
      pct: breakdown.missingModel.percentage,
      severity: 'HIGH',
      icon: Tag,
      color: 'amber',
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      desc: 'Falta modelo unívoco médico'
    },
    {
      id: 'MISSING_DESCRIPTION' as IncidentCategoryFilter,
      title: 'Sin Descripción',
      count: breakdown.missingDescription.count,
      pct: breakdown.missingDescription.percentage,
      severity: 'MEDIUM',
      icon: FileText,
      color: 'orange',
      border: 'border-orange-200',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      desc: 'Sin texto clínico o < 20 caracteres'
    },
    {
      id: 'MISSING_SPECS' as IncidentCategoryFilter,
      title: 'Sin Especificaciones',
      count: breakdown.missingSpecs.count,
      pct: breakdown.missingSpecs.percentage,
      severity: 'MEDIUM',
      icon: Layers,
      color: 'indigo',
      border: 'border-indigo-200',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      desc: 'Sin tabla técnica ni parámetros'
    },
    {
      id: 'MISSING_SOURCE' as IncidentCategoryFilter,
      title: 'Sin Fuente',
      count: breakdown.missingSource.count,
      pct: breakdown.missingSource.percentage,
      severity: 'CRITICAL',
      icon: Globe,
      color: 'red',
      border: 'border-red-300',
      bg: 'bg-red-50',
      text: 'text-red-800',
      desc: 'Sin enlace oficial de origen'
    },
    {
      id: 'POSSIBLE_DUPLICATE' as IncidentCategoryFilter,
      title: 'Posibles Duplicados',
      count: breakdown.possibleDuplicate.count,
      pct: breakdown.possibleDuplicate.percentage,
      severity: 'CRITICAL',
      icon: Copy,
      color: 'cyan',
      border: 'border-cyan-200',
      bg: 'bg-cyan-50',
      text: 'text-cyan-800',
      desc: 'Coincidencia en modelo o ref'
    },
    {
      id: 'OUTDATED' as IncidentCategoryFilter,
      title: 'Desactualizados',
      count: breakdown.outdated.count,
      pct: breakdown.outdated.percentage,
      severity: 'MEDIUM',
      icon: Clock,
      color: 'slate',
      border: 'border-slate-300',
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      desc: '>90 días sin re-inspección'
    },
    {
      id: 'HAS_ERRORS' as IncidentCategoryFilter,
      title: 'Con Errores',
      count: breakdown.hasErrors.count,
      pct: breakdown.hasErrors.percentage,
      severity: 'CRITICAL',
      icon: AlertOctagon,
      color: 'rose',
      border: 'border-rose-300',
      bg: 'bg-rose-100',
      text: 'text-rose-900',
      desc: 'Rechazados o datos corruptos'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER & TOP CONTROLS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center text-indigo-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Control de Calidad del Catálogo</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  8 Detectores Activos
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Detección automática de inconsistencias, vacíos de identidad y anomalías técnicas en todo el catálogo de equipamiento e insumos médicos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={reports.length === 0}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Exportar CSV
          </button>

          <button
            onClick={handleRunFullScan}
            disabled={scanning}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Escaneando Catálogo...' : 'Escanear Catálogo Ahora'}
          </button>
        </div>
      </div>

      {/* ACTION FEEDBACK ALERT */}
      {actionFeedback && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
          actionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          actionFeedback.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
          'bg-indigo-50 text-indigo-800 border border-indigo-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-4">✕</button>
        </div>
      )}

      {/* HEALTH KPI BAR & SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Health Score Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Salud Global del Catálogo</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-black ${
                (summary?.overallHealthScore || 0) >= 80 ? 'text-emerald-600' :
                (summary?.overallHealthScore || 0) >= 60 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {summary?.overallHealthScore || 0}%
              </span>
              <span className="text-xs font-semibold text-slate-400">índice de calidad</span>
            </div>
            <div className="w-44 bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  (summary?.overallHealthScore || 0) >= 80 ? 'bg-emerald-500' :
                  (summary?.overallHealthScore || 0) >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`} 
                style={{ width: `${summary?.overallHealthScore || 0}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 font-black">
            <CheckCheck className="w-6 h-6 text-indigo-600" />
          </div>
        </div>

        {/* Clean Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Productos Sin Incidencias</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{summary?.cleanProductsCount || 0}</p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">100% listos para cotización oficial</span>
        </div>

        {/* Products With Incidents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Con Incidencias Detectadas</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{summary?.productsWithIncidentsCount || 0}</p>
          <span className="text-[11px] font-medium text-amber-700 mt-1 block">Requieren completar datos o revisión</span>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distribución de Gravedad</span>
          <div className="flex items-center gap-3 mt-2">
            <div className="text-center">
              <span className="text-xs font-black text-rose-600 block">{summary?.severityDistribution?.critical || 0}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Críticas</span>
            </div>
            <div className="text-center border-l border-slate-200 pl-3">
              <span className="text-xs font-black text-amber-600 block">{summary?.severityDistribution?.high || 0}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Altas</span>
            </div>
            <div className="text-center border-l border-slate-200 pl-3">
              <span className="text-xs font-black text-blue-600 block">{summary?.severityDistribution?.medium || 0}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Medias</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 AUTOMATIC DETECTOR CARDS (CLICK TO FILTER) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Detectores Automáticos de Calidad ({detectorCards.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Haz clic en cualquier detector para filtrar la lista</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {detectorCards.map((card) => {
            const Icon = card.icon;
            const isSelected = selectedCategory === card.id;

            return (
              <button
                key={card.id}
                onClick={() => setSelectedCategory(isSelected ? 'ALL' : card.id)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? 'ring-2 ring-indigo-600 border-indigo-600 bg-white shadow-md' 
                    : 'bg-white hover:border-slate-300 border-slate-200 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.bg} ${card.text}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    card.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                    card.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {card.severity}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-800 block truncate" title={card.title}>
                    {card.title}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-black text-slate-900 leading-none">{card.count}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({card.pct}%)</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-600 rounded-bl-md" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por producto, modelo, catálogo, fabricante o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchQualityAudit()}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Severity & Status Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Todas las Gravedades</option>
            <option value="CRITICAL">Solo Críticas</option>
            <option value="HIGH">Solo Altas</option>
            <option value="MEDIUM">Solo Medias</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="DRAFT">DRAFT (Borrador)</option>
            <option value="REVIEW">REVIEW (En Revisión)</option>
            <option value="VERIFIED">VERIFIED (Verificado)</option>
            <option value="OUTDATED">OUTDATED (Desactualizado)</option>
            <option value="REJECTED">REJECTED (Rechazado)</option>
          </select>

          {(selectedCategory !== 'ALL' || selectedSeverity !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedSeverity('ALL');
                setSelectedStatus('ALL');
                setSearchQuery('');
              }}
              className="px-3 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* INCIDENT PRODUCTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-xs">
              Registros Evaluados: {reports.length}
            </span>
            {selectedCategory !== 'ALL' && (
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-200">
                Filtro activo: {detectorCards.find(c => c.id === selectedCategory)?.title}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            {summary?.lastScannedAt ? `Último análisis: ${new Date(summary.lastScannedAt).toLocaleTimeString()}` : ''}
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <span>Consultando diagnósticos de calidad del catálogo...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-bold text-slate-700 text-sm">Sin incidencias para este filtro</p>
            <p className="text-slate-400 mt-1">Todos los productos cumplen con los estándares de calidad seleccionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4 w-12">Foto</th>
                  <th className="py-3 px-4">Producto / Identidad</th>
                  <th className="py-3 px-4">Modelo / Ref</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Incidencias Detectadas</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.productId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      {report.primaryImage ? (
                        <img
                          src={report.primaryImage}
                          alt={report.productName}
                          className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white p-0.5"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-500" title="Sin imagen">
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-[8px] font-black leading-none mt-0.5">VACÍO</span>
                        </div>
                      )}
                    </td>

                    {/* Product Name & Brand */}
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-bold text-slate-900 block truncate" title={report.productName}>
                        {report.productName}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>ID: #{report.productId}</span>
                        {report.manufacturer && <span>• {report.manufacturer}</span>}
                        {report.categoryName && <span>• {report.categoryName}</span>}
                      </div>
                    </td>

                    {/* Model & Catalog */}
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {report.model ? (
                        <span className="font-bold text-slate-800">{report.model}</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                          FALTA MODELO
                        </span>
                      )}
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Ref: {report.catalogNumber || 'N/D'}
                      </span>
                    </td>

                    {/* Validation Score */}
                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                        report.validationScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
                        report.validationScore >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {report.validationScore}/100
                      </span>
                    </td>

                    {/* Incidents Badges */}
                    <td className="py-3 px-4">
                      {report.incidents.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sin Incidencias
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {report.incidents.map((inc: any) => (
                            <span
                              key={inc.id}
                              title={inc.message}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
                                inc.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {inc.type === 'MISSING_IMAGE' && '📷 Sin Imagen'}
                              {inc.type === 'MISSING_MODEL' && '🏷️ Sin Modelo'}
                              {inc.type === 'MISSING_DESCRIPTION' && '📝 Sin Descrip.'}
                              {inc.type === 'MISSING_SPECS' && '⚙️ Sin Specs'}
                              {inc.type === 'MISSING_SOURCE' && '🌐 Sin Fuente'}
                              {inc.type === 'POSSIBLE_DUPLICATE' && '👥 Duplicado'}
                              {inc.type === 'OUTDATED' && '⏳ Desactualizado'}
                              {inc.type === 'HAS_ERRORS' && '⚠️ Con Errores'}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Verification Status */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        report.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                        report.verificationStatus === 'REVIEW' ? 'bg-amber-100 text-amber-800' :
                        report.verificationStatus === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        report.verificationStatus === 'OUTDATED' ? 'bg-slate-200 text-slate-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {report.verificationStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenInspector(report)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Wrench className="w-3.5 h-3.5" /> Reparar
                        </button>
                        {report.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleQuickVerify(report.productId)}
                            title="Aprobar y verificar directamente"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INSPECTOR & QUICK FIX MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-brand-cyan">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Inspección & Corrección: {selectedProduct.productName}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>ID #{selectedProduct.productId}</span>
                    <span>• Score de Calidad: <strong className="text-white">{selectedProduct.validationScore}/100</strong></span>
                    <span>• Estado: <strong className="text-brand-cyan">{selectedProduct.verificationStatus}</strong></span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50/50 text-xs">
              
              {/* Detected Incidents Diagnostic Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Incidencias Detectadas ({selectedProduct.incidents.length})
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-400">Diagnóstico automático</span>
                </div>

                {selectedProduct.incidents.length === 0 ? (
                  <p className="text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Este producto no tiene incidencias pendientes. Cumple con todos los estándares.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedProduct.incidents.map((inc: any) => (
                      <div
                        key={inc.id}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                          inc.severity === 'CRITICAL' ? 'bg-red-50/70 border-red-200 text-red-900' :
                          inc.severity === 'HIGH' ? 'bg-amber-50/70 border-amber-200 text-amber-900' :
                          'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                              inc.severity === 'CRITICAL' ? 'bg-red-200 text-red-900' :
                              inc.severity === 'HIGH' ? 'bg-amber-200 text-amber-900' :
                              'bg-slate-200 text-slate-800'
                            }`}>
                              {inc.severity}
                            </span>
                            <span className="font-bold text-xs">{inc.title}</span>
                          </div>
                          <p className="text-[11px] opacity-90">{inc.message}</p>
                          <p className="text-[10px] font-medium text-slate-500 italic mt-0.5">
                            Sugerencia: {inc.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* In-place Quick Fix Form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  Corregir Datos del Producto en 1 Clic
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Modelo */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Modelo Exacto del Fabricante:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. ECG-1200G, MA300..."
                      value={editFormData.model}
                      onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* URL de Fuente */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      URL de Fuente Oficial / Fabricante:
                    </label>
                    <input
                      type="text"
                      placeholder="https://fabricante.com/producto/..."
                      value={editFormData.sourceUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, sourceUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Nueva URL de Imagen */}
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Añadir Imagen (URL directa):
                  </label>
                  <input
                    type="text"
                    placeholder="https://.../foto-producto.jpg"
                    value={editFormData.imageUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Se vinculará a la galería multimedia oficial del producto.
                  </span>
                </div>

                {/* Descripción Clínica */}
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Descripción Técnica / Clínica (mínimo 20 caracteres):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descripción funcional, principios de operación y aplicaciones hospitalarias..."
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Especificaciones Técnicas */}
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Especificaciones Técnicas (Parámetros / Ficha):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Voltaje: 220V; Canales: 12; Peso: 3.2 kg; Pantalla: 7 pulgadas LCD..."
                    value={editFormData.technicalSpecs}
                    onChange={(e) => setEditFormData({ ...editFormData, technicalSpecs: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Estado de Verificación */}
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Estado de Verificación:
                  </label>
                  <select
                    value={editFormData.verificationStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, verificationStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="DRAFT">DRAFT (Borrador)</option>
                    <option value="REVIEW">REVIEW (En Revisión Técnica)</option>
                    <option value="VERIFIED">VERIFIED (Verificado y Aprobado)</option>
                    <option value="OUTDATED">OUTDATED (Desactualizado)</option>
                    <option value="REJECTED">REJECTED (Rechazado)</option>
                  </select>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
              >
                Cerrar
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickVerify(selectedProduct.productId)}
                  className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar Como Verificado
                </button>

                <button
                  onClick={handleSaveQuickFix}
                  disabled={savingFix}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Wrench className={`w-3.5 h-3.5 ${savingFix ? 'animate-spin' : ''}`} />
                  {savingFix ? 'Guardando & Re-evaluando...' : 'Guardar y Re-evaluar Incidencias'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
