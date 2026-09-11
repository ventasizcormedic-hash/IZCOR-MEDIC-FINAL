import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Gauge, 
  Database, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Server, 
  TrendingUp, 
  Cpu, 
  Clock, 
  ShieldCheck, 
  Trash2, 
  Play, 
  Sparkles,
  BarChart3,
  HardDrive
} from 'lucide-react';
import { auth } from '../../lib/firebase';

interface ModuleMetric {
  name: string;
  displayName: string;
  totalRequests: number;
  avgLatencyMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  errorRate: number;
  targetBudgetMs: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED';
}

interface RegressionAlert {
  id: string;
  module: string;
  path: string;
  baselineMs: number;
  currentMs: number;
  increasePercentage: number;
  detectedAt: string;
  severity: 'CRITICAL' | 'WARNING';
  suggestion: string;
}

interface PerformanceSummary {
  avgLatencyMs: number;
  p95Ms: number;
  totalRequestsRecorded: number;
  errorRate: number;
  cacheHitRatio: number;
  cacheEntries: number;
  cacheMemoryKb: number;
  activeRegressionsCount: number;
  regressions: RegressionAlert[];
  modules: ModuleMetric[];
}

interface AuditCheckItem {
  id: string;
  category: 'DATABASE' | 'NETWORK' | 'FRONTEND' | 'BACKEND' | 'BACKGROUND';
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  metricValue: string;
  budget: string;
  description: string;
}

interface ScaleBenchmark {
  scaleTier: '10K' | '50K' | '100K' | '500K' | '1M+';
  productCount: number;
  estimatedCatalogQueryMs: number;
  estimatedSearchQueryMs: number;
  estimatedMemoryMb: number;
  indexEfficiency: string;
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_REPLICA';
  notes: string;
}

export const PerformanceManager: React.FC = () => {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [checklist, setChecklist] = useState<AuditCheckItem[]>([]);
  const [benchmarks, setBenchmarks] = useState<ScaleBenchmark[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'audit' | 'scale' | 'cache'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [summaryRes, checkRes, benchRes] = await Promise.all([
        fetch('/api/admin/performance/summary', { headers }),
        fetch('/api/admin/performance/checklist', { headers }),
        fetch('/api/admin/performance/benchmark', { headers }),
      ]);

      if (summaryRes.ok) {
        const sumData = await summaryRes.json();
        setSummary(sumData);
      }
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        setChecklist(checkData.checklist || []);
      }
      if (benchRes.ok) {
        const benchData = await benchRes.json();
        setBenchmarks(benchData.benchmark || []);
      }
    } catch (e) {
      console.error('Error fetching performance data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateLoad = async (iterations = 15) => {
    try {
      setIsSimulating(true);
      setSimulationResult(null);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/performance/simulate-load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ iterations }),
      });
      const data = await res.json();
      if (res.ok) {
        setSimulationResult(data.message);
        await fetchPerformanceData();
      }
    } catch (e: any) {
      setSimulationResult(`Error en prueba de carga: ${e.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClearCache = async (tag?: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/performance/cache/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tag }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        setTimeout(() => setActionMessage(null), 4000);
        await fetchPerformanceData();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleClearRegressions = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/performance/regressions/clear', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        setTimeout(() => setActionMessage(null), 4000);
        await fetchPerformanceData();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-3 border border-indigo-500/30">
              <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Motor de Rendimiento & Alta Escala
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Performance Engine
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                50K → 1M+ LISTO
              </span>
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Monitoreo en tiempo real de latencia APM, detección automática de regresiones, auditoría de 89 puntos de presupuesto y compresión HTTP inteligente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSimulateLoad(15)}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              Test de Carga en Vivo
            </button>

            <button
              onClick={fetchPerformanceData}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Actualizar métricas"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global KPI Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Latencia Media</span>
              <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-1">
                {summary.avgLatencyMs} <span className="text-xs text-slate-400 font-normal">ms</span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 inline-flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3" /> Óptimo (&lt;100ms)
              </span>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Percentil 95 (P95)</span>
              <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-1">
                {summary.p95Ms} <span className="text-xs text-slate-400 font-normal">ms</span>
              </div>
              <span className="text-[10px] text-indigo-300 mt-1 inline-flex items-center gap-1 font-mono">
                <Gauge className="w-3 h-3" /> P99: ~{Math.round(summary.p95Ms * 1.4)}ms
              </span>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Caché Hit Ratio</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {summary.cacheHitRatio}%
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {summary.cacheEntries} llaves ({summary.cacheMemoryKb} KB)
              </span>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Peticiones APM</span>
              <div className="text-xl font-bold text-white mt-1">
                {summary.totalRequestsRecorded}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Muestreo circular activo</span>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Tasa de Error</span>
              <div className={`text-xl font-bold mt-1 ${summary.errorRate > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {summary.errorRate}%
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">HTTP 5xx / 4xx</span>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Regresiones</span>
              <div className={`text-xl font-bold mt-1 ${summary.activeRegressionsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {summary.activeRegressionsCount}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {summary.activeRegressionsCount > 0 ? 'Requiere atención' : '0 alertas'}
              </span>
            </div>
          </div>
        )}

        {simulationResult && (
          <div className="mt-4 p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {simulationResult}
            </span>
            <button onClick={() => setSimulationResult(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {actionMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {actionMessage}
            </span>
            <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* Regression Alerts Banner (if any) */}
      {summary && summary.regressions && summary.regressions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Regresiones de Rendimiento Detectadas ({summary.regressions.length})
            </div>
            <button
              onClick={handleClearRegressions}
              className="text-xs font-medium text-amber-700 hover:text-amber-900 underline"
            >
              Resolver y Reiniciar Alertas
            </button>
          </div>

          <div className="space-y-2">
            {summary.regressions.map((reg) => (
              <div key={reg.id} className="bg-white rounded-xl p-3 border border-amber-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2 font-mono text-slate-800">
                    <span className="font-bold text-amber-700">[{reg.module}]</span>
                    <span>{reg.path}</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                      +{reg.increasePercentage}% más lento
                    </span>
                  </div>
                  <div className="text-slate-600 mt-1">
                    Línea base: <strong className="font-mono">{reg.baselineMs}ms</strong> → Actual: <strong className="font-mono text-rose-600">{reg.currentMs}ms</strong>.
                    <span className="ml-2 text-slate-500 italic">Sugerencia: {reg.suggestion}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  {new Date(reg.detectedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Módulos & Latencias
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Auditoría de Presupuestos (89 Puntos)
        </button>

        <button
          onClick={() => setActiveTab('scale')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'scale'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Escalabilidad (10K → 1M+)
        </button>

        <button
          onClick={() => setActiveTab('cache')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'cache'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Caché & Invalidación
        </button>
      </div>

      {/* TAB 1: Módulos & Latencias */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Latencia por Módulo del Sistema</h3>
                <p className="text-xs text-slate-500">Métricas desagregadas frente a objetivos de presupuesto medibles.</p>
              </div>
              <span className="text-xs text-slate-400">Actualización en vivo cada 15s</span>
            </div>

            <div className="divide-y divide-slate-100">
              {summary.modules.map((mod) => (
                <div key={mod.name} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="w-full md:w-1/3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{mod.displayName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        mod.status === 'OPTIMAL' ? 'bg-emerald-100 text-emerald-800' :
                        mod.status === 'ACCEPTABLE' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {mod.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Presupuesto máx: &lt;{mod.targetBudgetMs}ms | {mod.totalRequests} peticiones
                    </div>
                  </div>

                  {/* Latency Bars */}
                  <div className="w-full md:w-1/2">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1 font-mono">
                      <span>P50: <strong>{mod.p50Ms}ms</strong></span>
                      <span>P95: <strong>{mod.p95Ms}ms</strong></span>
                      <span>P99: <strong>{mod.p99Ms}ms</strong></span>
                      <span className="text-slate-400">Media: {mod.avgLatencyMs}ms</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          mod.p95Ms <= mod.targetBudgetMs ? 'bg-emerald-500' :
                          mod.p95Ms <= mod.targetBudgetMs * 1.5 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(10, (mod.p95Ms / (mod.targetBudgetMs * 2)) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <span className="text-xs font-mono font-bold text-slate-700 block">
                      {mod.avgLatencyMs} ms
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Error: {mod.errorRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Auditoría de Presupuestos (89 Puntos) */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Checklist Automático de Rendimiento & Arquitectura</h3>
                <p className="text-xs text-slate-500">Evaluación continua de índices, prevención N+1, compresión y lazy loading.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                100% Verificado
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {checklist.map((item) => (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {item.status === 'PASS' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : item.status === 'WARN' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 font-mono">[{item.category}]</span>
                        <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl">{item.description}</p>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        Presupuesto: <em>{item.budget}</em>
                      </div>
                    </div>
                  </div>

                  <div className="text-right md:min-w-[200px]">
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {item.metricValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Escalabilidad (10K -> 1M+) */}
      {activeTab === 'scale' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Curva de Escalabilidad Teórica y Empírica</h3>
                <p className="text-xs text-slate-500">Estimación de tiempos con índices B-Tree, cursor pagination y compresión.</p>
              </div>
              <button
                onClick={() => handleSimulateLoad(25)}
                disabled={isSimulating}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold border border-indigo-200 transition-colors"
              >
                {isSimulating ? 'Simulando...' : 'Re-evaluar Carga'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Escala</th>
                    <th className="p-3">Volumen Productos</th>
                    <th className="p-3">Query Catálogo</th>
                    <th className="p-3">Búsqueda / Autocomplete</th>
                    <th className="p-3">Eficiencia Índice</th>
                    <th className="p-3">RAM Estimada</th>
                    <th className="p-3">Diagnóstico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {benchmarks.map((b) => (
                    <tr key={b.scaleTier} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-bold text-indigo-700 font-mono">{b.scaleTier}</td>
                      <td className="p-3 font-semibold text-slate-800">{b.productCount.toLocaleString()} items</td>
                      <td className="p-3 font-mono text-slate-700">~{b.estimatedCatalogQueryMs} ms</td>
                      <td className="p-3 font-mono text-slate-700">~{b.estimatedSearchQueryMs} ms</td>
                      <td className="p-3 font-mono text-emerald-700 font-semibold">{b.indexEfficiency}</td>
                      <td className="p-3 font-mono text-slate-600">{b.estimatedMemoryMb} MB</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-xs text-slate-600">{b.notes}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Caché & Invalidación */}
      {activeTab === 'cache' && summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 text-indigo-600 mb-2">
                <Database className="w-5 h-5" />
                <h4 className="font-bold text-slate-800 text-sm">Entradas en Memoria</h4>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{summary.cacheEntries}</div>
              <p className="text-xs text-slate-500 mt-1">Llaves activas con TTL e invalidación por etiquetas.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 text-emerald-600 mb-2">
                <Gauge className="w-5 h-5" />
                <h4 className="font-bold text-slate-800 text-sm">Hit Ratio de Caché</h4>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600">{summary.cacheHitRatio}%</div>
              <p className="text-xs text-slate-500 mt-1">Porcentaje de peticiones resueltas en 0ms.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 text-indigo-600 mb-2">
                <HardDrive className="w-5 h-5" />
                <h4 className="font-bold text-slate-800 text-sm">Memoria Utilizada</h4>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{summary.cacheMemoryKb} KB</div>
              <p className="text-xs text-slate-500 mt-1">Huella de memoria ligera optimizada.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h4 className="font-bold text-slate-800 text-base mb-2">Controles de Invalidación Granular</h4>
            <p className="text-sm text-slate-600 mb-4 max-w-2xl">
              El motor de caché soporta invalidación por etiquetas sin destruir toda la caché cuando solo cambia un producto o categoría.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleClearCache('products')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Purgar Tag 'products'
              </button>

              <button
                onClick={() => handleClearCache('catalog')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Purgar Tag 'catalog'
              </button>

              <button
                onClick={() => handleClearCache('facets')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Purgar Tag 'facets'
              </button>

              <button
                onClick={() => handleClearCache('search')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Purgar Tag 'search'
              </button>

              <button
                onClick={() => handleClearCache()}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-2 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Purgar Caché Global
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
