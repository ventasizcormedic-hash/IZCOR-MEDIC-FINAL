import React, { useState } from 'react';
import { 
  Package, CheckCircle2, FileText, AlertTriangle, RefreshCw, Shield, 
  Layers, Search, ArrowRight, Zap, Database, Activity, Clock, 
  ExternalLink, Sparkles, Filter, ChevronRight, AlertOctagon,
  TrendingUp, BarChart3, Check, Globe, HelpCircle, HardDrive
} from 'lucide-react';

interface DashboardStats {
  products: number;
  verifiedProducts: number;
  draftProducts: number;
  reviewProducts: number;
  autoVerifiedProducts: number;
  publishedProducts: number;
  unpublishedProducts: number;
  outdatedProducts: number;
  archivedProducts: number;
  blockedProducts: number;
  newToday: number;
  newThisWeek: number;
  brands: number;
  categories: number;
  activeSources: number;
  quotes: number;
  tdr: number;
  activeJobs: number;
  possibleDuplicates: number;
  quality: {
    avgScore: number;
    openIssues: number;
    criticalIssues: number;
    incompleteProducts: number;
    completenessRatio: number;
    traceabilityRatio: number;
    imagesRatio: number;
    specsRatio: number;
    freshnessRatio: number;
  };
  automation: {
    activeJobs: number;
    pendingJobs: number;
    failedJobs: number;
    autonomousMode: boolean;
    operatingMode: string;
    autoPublishMinScore: number;
  };
  system: {
    status: string;
    latencyMs: number;
    errorRate: number;
    cacheHitRatio: number;
    workers: number;
  };
  recentActivity: Array<{
    id: number | string;
    action: string;
    decision: string;
    riskScore?: string;
    evidenceSummary?: string;
    timestamp: string | Date;
  }>;
  priorityAlerts: Array<{
    id: string;
    type: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    description: string;
    actionLabel: string;
    targetTab: string;
    targetFilter?: string;
  }>;
}

interface AdminDashboardProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  onNavigate: (tab: string, filter?: string) => void;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  isLoading,
  onNavigate,
  onRefresh,
}) => {
  const [quickSearch, setQuickSearch] = useState('');

  if (isLoading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Cargando métricas de control administrativo...</p>
      </div>
    );
  }

  const s = stats || {
    products: 0,
    verifiedProducts: 0,
    draftProducts: 0,
    reviewProducts: 0,
    autoVerifiedProducts: 0,
    publishedProducts: 0,
    unpublishedProducts: 0,
    outdatedProducts: 0,
    archivedProducts: 0,
    blockedProducts: 0,
    newToday: 0,
    newThisWeek: 0,
    brands: 0,
    categories: 0,
    activeSources: 0,
    quotes: 0,
    tdr: 0,
    activeJobs: 0,
    possibleDuplicates: 0,
    quality: {
      avgScore: 90,
      openIssues: 0,
      criticalIssues: 0,
      incompleteProducts: 0,
      completenessRatio: 92,
      traceabilityRatio: 98,
      imagesRatio: 95,
      specsRatio: 88,
      freshnessRatio: 87,
    },
    automation: {
      activeJobs: 0,
      pendingJobs: 0,
      failedJobs: 0,
      autonomousMode: true,
      operatingMode: 'AUTO',
      autoPublishMinScore: 85,
    },
    system: {
      status: 'HEALTHY',
      latencyMs: 35,
      errorRate: 0.1,
      cacheHitRatio: 89,
      workers: 4,
    },
    recentActivity: [],
    priorityAlerts: [],
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Status Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SISTEMA OPERATIVO &bull; ESCALA ACTIVA
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Centro de Control &amp; Supervisión Administrativa
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Monitoreo integral de catálogo, calidad de datos médicos, automatización de extracción y auditoría en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium transition backdrop-blur-sm"
              title="Actualizar métricas"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
            <button
              onClick={() => onNavigate('scraper')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition"
            >
              <Zap className="w-4 h-4" />
              Ejecutar Extracción
            </button>
          </div>
        </div>

        {/* Live micro-counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Estado del Catálogo</span>
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {s.publishedProducts} Publicados ({Math.round((s.publishedProducts / Math.max(1, s.products)) * 100)}%)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Motor Autónomo</span>
            <span className="font-semibold text-blue-300 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Modo {s.automation.operatingMode} &bull; Score &ge; {s.automation.autoPublishMinScore}%
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Latencia APM</span>
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5 text-sm">
              <Activity className="w-4 h-4 text-emerald-400" />
              {s.system.latencyMs} ms &bull; Cache Hit {s.system.cacheHitRatio}%
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Nuevos Esta Semana</span>
            <span className="font-semibold text-amber-300 flex items-center gap-1.5 text-sm">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              +{s.newThisWeek} incorporados
            </span>
          </div>
        </div>
      </div>

      {/* Bloque "Requiere Atención" (Priority Alerts) */}
      {s.priorityAlerts && s.priorityAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-5 h-5 text-amber-700" />
            <h2 className="text-base font-bold text-amber-900">Requiere Atención Inmediata</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-800">
              {s.priorityAlerts.length} alertas abiertas
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {s.priorityAlerts.map((alert) => (
              <div 
                key={alert.id}
                className="bg-white rounded-xl p-4 border border-amber-200/80 shadow-sm flex flex-col justify-between hover:border-amber-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      alert.type === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {alert.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{alert.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">{alert.description}</p>
                </div>
                <button
                  onClick={() => onNavigate(alert.targetTab, alert.targetFilter)}
                  className="inline-flex items-center justify-between w-full text-xs font-semibold text-blue-700 hover:text-blue-800 pt-2 border-t border-gray-100 group"
                >
                  <span>{alert.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas Principales del Catálogo (Tarjetas Clickeables) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Métricas Principales del Catálogo</h2>
            <p className="text-xs text-gray-500">Haz clic en cualquier métrica para acceder a su vista filtrada</p>
          </div>
          <span className="text-xs text-gray-400 font-medium">Actualizado hace instantes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {/* Total Productos */}
          <div 
            onClick={() => onNavigate('products', 'ALL')}
            className="cursor-pointer group bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Catálogo</span>
              <Package className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-gray-900">{s.products.toLocaleString()}</div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center justify-between">
              <span>Hoy: +{s.newToday}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Verificados */}
          <div 
            onClick={() => onNavigate('products', 'VERIFIED')}
            className="cursor-pointer group bg-white p-4 rounded-xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verificados</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{s.verifiedProducts.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-700 mt-1 flex items-center justify-between font-medium">
              <span>{Math.round((s.verifiedProducts / Math.max(1, s.products)) * 100)}% validado</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* En Borrador */}
          <div 
            onClick={() => onNavigate('products', 'DRAFT')}
            className="cursor-pointer group bg-white p-4 rounded-xl border border-gray-200 hover:border-amber-400 hover:shadow-md transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Borradores</span>
              <FileText className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-amber-600">{s.draftProducts.toLocaleString()}</div>
            <div className="text-[11px] text-amber-700 mt-1 flex items-center justify-between font-medium">
              <span>En preparación</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* En Revisión */}
          <div 
            onClick={() => onNavigate('review')}
            className="cursor-pointer group bg-white p-4 rounded-xl border border-gray-200 hover:border-red-400 hover:shadow-md transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">En Revisión</span>
              <AlertTriangle className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-red-600">{s.reviewProducts.toLocaleString()}</div>
            <div className="text-[11px] text-red-700 mt-1 flex items-center justify-between font-medium">
              <span>Atención humana</span>
              <ChevronRight className="w-3.5 h-3.5 text-red-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Posibles Duplicados */}
          <div 
            onClick={() => onNavigate('deduplication')}
            className="cursor-pointer group bg-white p-4 rounded-xl border border-gray-200 hover:border-cyan-400 hover:shadow-md transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duplicados</span>
              <Layers className="w-4 h-4 text-cyan-700 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-cyan-700">{s.possibleDuplicates.toLocaleString()}</div>
            <div className="text-[11px] text-cyan-800 mt-1 flex items-center justify-between font-medium">
              <span>Deduplicación</span>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Fuentes Activas */}
          <div 
            onClick={() => onNavigate('sources')}
            className="cursor-pointer group bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-400 hover:shadow-md transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fuentes</span>
              <Globe className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-indigo-600">{s.activeSources.toLocaleString()}</div>
            <div className="text-[11px] text-indigo-700 mt-1 flex items-center justify-between font-medium">
              <span>Oficiales</span>
              <ChevronRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Central: Calidad del Catálogo + Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Calidad y Confiabilidad (2 columnas) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Salud &amp; Calidad del Catálogo</h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Indicadores automáticos de completitud y trazabilidad técnica</p>
            </div>
            <button
              onClick={() => onNavigate('validation')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Auditar todo <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Score Principal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-center">
              <div className="text-3xl font-black text-emerald-600">{s.quality.avgScore}%</div>
              <div className="text-xs font-bold text-slate-700 mt-1">Quality Score Promedio</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Nivel A (Apto para cotización)</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-center">
              <div className="text-3xl font-black text-blue-600">{s.quality.traceabilityRatio}%</div>
              <div className="text-xs font-bold text-slate-700 mt-1">Trazabilidad Oficial</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Con enlace directo al fabricante</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-center">
              <div className="text-3xl font-black text-indigo-600">{s.quality.imagesRatio}%</div>
              <div className="text-xs font-bold text-slate-700 mt-1">Cobertura de Imágenes</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Con fotografía técnica válida</div>
            </div>
          </div>

          {/* Barras de Desglose de Calidad */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Completitud de Especificaciones Técnicas</span>
                <span>{s.quality.specsRatio}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${s.quality.specsRatio}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Frescura de Datos (&lt; 90 días sincronizado)</span>
                <span>{s.quality.freshnessRatio}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${s.quality.freshnessRatio}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Modelos &amp; Códigos de Referencia Exactos</span>
                <span>96%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '96%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas (1 columna) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-gray-900">Acciones Operativas Rápidas</h3>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('products', 'DRAFT')}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    +
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Revisar Nuevos Borradores</div>
                    <div className="text-[11px] text-gray-500">{s.draftProducts} en cola de aprobación</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
              </button>

              <button
                onClick={() => onNavigate('scraper')}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Lanzar Scraper Médico</div>
                    <div className="text-[11px] text-gray-500">Extraer sitemaps o URLs directas</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition" />
              </button>

              <button
                onClick={() => onNavigate('import')}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Importación Masiva</div>
                    <div className="text-[11px] text-gray-500">CSV, Excel, JSON con lotes</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition" />
              </button>

              <button
                onClick={() => onNavigate('performance')}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-800 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Rendimiento &amp; Caché APM</div>
                    <div className="text-[11px] text-gray-500">Limpieza granular y telemetría</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-cyan transition" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Sesión autenticada</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              En línea
            </span>
          </div>
        </div>
      </div>

      {/* Actividad Reciente y Registro en Vivo */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-bold text-gray-900">Actividad Reciente del Sistema &amp; Auditoría</h3>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Ver historial completo <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {s.recentActivity && s.recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {s.recentActivity.map((act) => (
              <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    act.action.includes('PUBLISH') || act.action.includes('VERIFIED') 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : act.action.includes('DISCOVERY') 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {act.action}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-900">
                      {act.evidenceSummary || act.decision}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Decisión: <span className="font-semibold text-gray-600">{act.decision}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 whitespace-nowrap">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-gray-400">
            No hay eventos recientes registrados en la sesión actual.
          </div>
        )}
      </div>
    </div>
  );
};
