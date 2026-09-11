import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  ShieldAlert, ShieldCheck, Play, Pause, RefreshCw, AlertTriangle, 
  RotateCcw, CheckCircle2, XCircle, Settings2, Globe, Database, 
  Layers, Clock, ArrowRight, Eye, ChevronRight, Filter, 
  Sliders, Activity, Check, Info, FileText, Zap, AlertOctagon
} from 'lucide-react';

export interface AutonomousEngineManagerProps {
  user: User | null;
  onRefresh?: () => void;
}

export const AutonomousEngineManager: React.FC<AutonomousEngineManagerProps> = ({ user, onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'exceptions' | 'rollback' | 'sources' | 'settings'>('audit');
  const [runningCycle, setRunningCycle] = useState(false);
  const [cycleResult, setCycleResult] = useState<any>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);
  const [rollbackJobId, setRollbackJobId] = useState('');
  const [rollbackInProgress, setRollbackInProgress] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [stoppingEmergency, setStoppingEmergency] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/admin/autonomous/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
      
      const setRes = await fetch('/api/admin/autonomous/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const setJson = await setRes.json();
      if (setJson.success) {
        setSettings(setJson.settings);
      }
    } catch (e) {
      console.error('Error fetching autonomous dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const handleRunCycle = async () => {
    try {
      setRunningCycle(true);
      setActionMessage('Iniciando ciclo autónomo: descubrimiento, normalización, validación y publicación...');
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/admin/autonomous/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success) {
        setCycleResult(json.result);
        setActionMessage(`Ciclo completado. Auto-publicados: ${json.result.autoPublished}, Actualizados: ${json.result.autoUpdated}, En revisión: ${json.result.reviewRequired}`);
        fetchDashboard();
      } else {
        setActionMessage(`Error: ${json.error}`);
      }
    } catch (e: any) {
      setActionMessage(`Error de comunicación: ${e.message}`);
    } finally {
      setRunningCycle(false);
    }
  };

  const handleToggleEmergencyStop = async () => {
    if (!settings) return;
    try {
      setStoppingEmergency(true);
      const token = user ? await user.getIdToken() : '';
      const isCurrentlyStopped = settings.emergencyStop;
      const endpoint = isCurrentlyStopped ? '/api/admin/autonomous/resume' : '/api/admin/autonomous/emergency-stop';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Acción manual desde el panel de control administrativo' }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(json.message);
        fetchDashboard();
      }
    } catch (e: any) {
      setActionMessage(`Error: ${e.message}`);
    } finally {
      setStoppingEmergency(false);
    }
  };

  const handleUpdateMode = async (mode: string) => {
    try {
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/admin/autonomous/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ operatingMode: mode }),
      });
      const json = await res.json();
      if (json.success) {
        setSettings(json.settings);
        setActionMessage(`Modo operativo cambiado a: ${mode}`);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (newSettings: any) => {
    try {
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/admin/autonomous/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });
      const json = await res.json();
      if (json.success) {
        setSettings(json.settings);
        setActionMessage('Configuración de reglas actualizada correctamente.');
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleReconciliation = async () => {
    try {
      setReconciling(true);
      setActionMessage('Ejecutando reconciliación y auto-reparación determinista...');
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/admin/autonomous/reconciliation', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`Reconciliación completada. Revisados: ${json.checked}, Auto-reparados: ${json.repaired}.`);
        fetchDashboard();
      }
    } catch (e: any) {
      setActionMessage(`Error en reconciliación: ${e.message}`);
    } finally {
      setReconciling(false);
    }
  };

  const handleRollback = async () => {
    if (!rollbackJobId.trim()) return;
    try {
      setRollbackInProgress(true);
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/admin/autonomous/rollback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId: rollbackJobId.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`Rollback ejecutado con éxito. Se revirtieron ${json.revertedProducts} productos.`);
        setRollbackJobId('');
        fetchDashboard();
      } else {
        setActionMessage(`Error: ${json.error}`);
      }
    } catch (e: any) {
      setActionMessage(`Error: ${e.message}`);
    } finally {
      setRollbackInProgress(false);
    }
  };

  const handleApproveDraft = async (id: number) => {
    try {
      const token = user ? await user.getIdToken() : '';
      const res = await fetch(`/api/admin/autonomous/approve-draft/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(json.message);
        fetchDashboard();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleRejectDraft = async (id: number) => {
    try {
      const token = user ? await user.getIdToken() : '';
      const res = await fetch(`/api/admin/autonomous/reject-draft/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(json.message);
        fetchDashboard();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleApproveSource = async (id: number) => {
    try {
      const token = user ? await user.getIdToken() : '';
      const res = await fetch(`/api/admin/autonomous/source-candidates/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(json.message);
        fetchDashboard();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-navy mb-4" />
        <p className="font-semibold text-slate-700">Cargando telemetría del Motor Autónomo...</p>
      </div>
    );
  }

  const isEmergencyStop = settings?.emergencyStop;
  const currentMode = settings?.operatingMode || 'AUTO';

  return (
    <div className="space-y-6">
      
      {/* EMERGENCY STOP BANNER IF ACTIVE */}
      {isEmergencyStop && (
        <div className="bg-red-500 text-white p-5 rounded-2xl shadow-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white text-red-600 rounded-xl flex items-center justify-center font-black">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">PARADA DE EMERGENCIA ACTIVA (KILL SWITCH)</h3>
              <p className="text-red-100 text-sm">
                Todas las publicaciones automáticas, extracciones y tareas del motor autónomo están congeladas por seguridad.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleEmergencyStop}
            disabled={stoppingEmergency}
            className="bg-white text-red-600 hover:bg-red-50 font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            {stoppingEmergency ? 'Reanudando...' : 'Desactivar Parada y Reanudar'}
          </button>
        </div>
      )}

      {/* HEADER & MAIN CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Motor Autónomo de Catálogo Médico</h1>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    Reglas {settings?.currentRuleVersion || 'v1.0.0'}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-0.5">
                  Descubrimiento continuo, validación de 8 capas, deduplicación estricta y auto-publicación segura sin cuellos de botella.
                </p>
              </div>
            </div>
          </div>

          {/* MODE SELECTOR & ACTIONS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Pills */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
              {(['AUTO', 'SAFE_MODE', 'DRY_RUN', 'CANARY'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleUpdateMode(mode)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    currentMode === mode
                      ? 'bg-white text-slate-900 shadow-sm font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode === 'AUTO' && '⚡ AUTO'}
                  {mode === 'SAFE_MODE' && '🛡️ SAFE'}
                  {mode === 'DRY_RUN' && '🧪 DRY RUN'}
                  {mode === 'CANARY' && '🐤 CANARY'}
                </button>
              ))}
            </div>

            {/* Run Cycle Button */}
            <button
              onClick={handleRunCycle}
              disabled={runningCycle || isEmergencyStop}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <Play className={`w-3.5 h-3.5 ${runningCycle ? 'animate-spin' : ''}`} />
              {runningCycle ? 'Ejecutando...' : 'Ejecutar Ciclo Ahora'}
            </button>

            {/* Reconciliation Button */}
            <button
              onClick={handleReconciliation}
              disabled={reconciling || isEmergencyStop}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              title="Reconciliación y Auto-Reparación Determinista"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${reconciling ? 'animate-spin' : ''}`} />
              Auto-Reparar
            </button>

            {/* Emergency Kill Switch Button */}
            {!isEmergencyStop ? (
              <button
                onClick={handleToggleEmergencyStop}
                disabled={stoppingEmergency}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                title="Detener inmediatamente todas las operaciones autónomas"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                Kill Switch
              </button>
            ) : null}
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {actionMessage && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-blue-500 hover:text-blue-700">×</button>
          </div>
        )}
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Publicados Totales</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{data?.counts?.totalPublished || 0}</span>
          <span className="text-[11px] font-medium text-emerald-600 mt-1 block">Catálogo activo IZCOR</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Auto-Publicados</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">{data?.counts?.autoPublished || 0}</span>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">Tasa: {data?.rates?.autoPublishRate || 0}%</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Auto-Actualizados</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{data?.counts?.autoUpdated || 0}</span>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">Cambios no críticos</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">En Revisión</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{data?.counts?.reviewRequired || 0}</span>
          <span className="text-[11px] font-medium text-amber-700 mt-1 block">Cola excepciones</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Bloqueados</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">{data?.counts?.blockedOrRejected || 0}</span>
          <span className="text-[11px] font-medium text-rose-700 mt-1 block">Conflicto crítico</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Fuentes Activas</span>
          <span className="text-2xl font-black text-slate-800 mt-1 block">{data?.counts?.sourcesActive || 0}</span>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">+{data?.counts?.sourcesCandidate || 0} candidatas</span>
        </div>
      </div>

      {/* SUB TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'audit' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          Auditoría & Decisiones en Vivo
        </button>

        <button
          onClick={() => setActiveSubTab('exceptions')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'exceptions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Cola de Excepciones ({data?.counts?.reviewRequired || 0})
        </button>

        <button
          onClick={() => setActiveSubTab('rollback')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'rollback' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Versiones & Rollback Masivo
        </button>

        <button
          onClick={() => setActiveSubTab('sources')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'sources' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          Fuentes Descubiertas ({data?.counts?.sourcesCandidate || 0})
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Reglas & Umbrales
        </button>
      </div>

      {/* SUB-VIEW 1: AUDIT LOGS */}
      {activeSubTab === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Flujo de Decisiones Autónomas Trazables</h3>
              <button onClick={fetchDashboard} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Actualizar
              </button>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {(!data?.recentAuditLogs || data.recentAuditLogs.length === 0) ? (
                <div className="text-center p-8 text-slate-400 text-xs">
                  No hay eventos recientes en la bitácora. Ejecuta un ciclo autónomo.
                </div>
              ) : (
                data.recentAuditLogs.map((log: any) => {
                  const isSelected = selectedAuditLog?.id === log.id;
                  let badgeColor = 'bg-slate-100 text-slate-700';
                  if (log.decision === 'AUTO_PUBLISHED' || log.decision === 'AUTO_PUBLISH_SAFE') badgeColor = 'bg-emerald-100 text-emerald-800';
                  else if (log.decision === 'UPDATED') badgeColor = 'bg-blue-100 text-blue-800';
                  else if (log.decision === 'REVIEW_REQUIRED') badgeColor = 'bg-amber-100 text-amber-800';
                  else if (log.decision === 'BLOCKED' || log.decision === 'ANOMALY_HALT') badgeColor = 'bg-rose-100 text-rose-800';

                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedAuditLog(log)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${badgeColor}`}>
                            {log.decision}
                          </span>
                          <span className="font-semibold text-slate-500 text-[11px]">{log.action}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>

                      <p className="text-slate-800 font-medium line-clamp-2">{log.evidenceSummary || 'Sin resumen registrado.'}</p>
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                        <span>Job: {log.jobId || 'N/A'}</span>
                        <span className="font-mono">Riesgo: {log.riskScore}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* EXPLAINABILITY DRAWER / PANEL */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Detalle & Explicabilidad de la Decisión</h3>
            {selectedAuditLog ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Decisión:</span>
                    <span className="font-black text-slate-900">{selectedAuditLog.decision}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Nivel de Riesgo:</span>
                    <span className="font-bold text-slate-800">{selectedAuditLog.riskScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Versión de Reglas:</span>
                    <span className="font-mono text-slate-700">{selectedAuditLog.ruleVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">ID Producto:</span>
                    <span className="font-mono text-slate-700">{selectedAuditLog.productId || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Evidencia & Resumen:</span>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs leading-relaxed">
                    {selectedAuditLog.evidenceSummary}
                  </p>
                </div>

                {selectedAuditLog.executedRules && Array.isArray(selectedAuditLog.executedRules) && (
                  <div>
                    <span className="font-bold text-slate-700 block mb-2">Checklist de Reglas Evaluadas:</span>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {selectedAuditLog.executedRules.map((r: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg border border-slate-100 flex items-start gap-2 bg-slate-50/50">
                          {r.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-bold text-slate-800 block text-[11px]">{r.name}</span>
                            <span className="text-[10px] text-slate-500">{r.details}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 text-slate-400 text-xs">
                Selecciona cualquier evento de la bitácora a la izquierda para inspeccionar las reglas y la justificación algorítmica.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: EXCEPTION QUEUE */}
      {activeSubTab === 'exceptions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Cola de Excepciones & Ambigüedades ({data?.exceptionQueue?.length || 0})</h3>
              <p className="text-xs text-slate-500">
                Productos retenidos por conflictos de modelo, dudas en ficha técnica o fuentes no verificadas. Nunca se publican automáticamente.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(!data?.exceptionQueue || data.exceptionQueue.length === 0) ? (
              <div className="text-center p-12 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                No hay productos en espera de resolución humana. La cola de excepciones está limpia.
              </div>
            ) : (
              data.exceptionQueue.map((draft: any) => (
                <div key={draft.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        draft.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {draft.status}
                      </span>
                      <span className="text-xs font-black text-slate-900">{draft.name}</span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <span><strong>Modelo:</strong> {draft.model || 'N/D'}</span>
                      <span><strong>Marca:</strong> {draft.brand || draft.manufacturer || 'N/D'}</span>
                      <span><strong>Score:</strong> {draft.completenessScore || 0}/100</span>
                      {draft.sourceUrl && (
                        <a href={draft.sourceUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                          Fuente original ↗
                        </a>
                      )}
                    </div>

                    {draft.conflicts && Array.isArray(draft.conflicts) && draft.conflicts.length > 0 && (
                      <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-[11px]">
                        <strong>Conflicto detectado:</strong> {draft.conflicts.join('; ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveDraft(draft.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Aprobar & Publicar
                    </button>
                    <button
                      onClick={() => handleRejectDraft(draft.id)}
                      className="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: ROLLBACK & VERSION HISTORY */}
      {activeSubTab === 'rollback' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Ejecutar Rollback Masivo</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Permite revertir cualquier ciclo o lote de publicación automática. Si un lote produjo datos erróneos, introduce el Job ID para restaurar las instantáneas anteriores.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Job ID del lote:</label>
              <input
                type="text"
                value={rollbackJobId}
                onChange={(e) => setRollbackJobId(e.target.value)}
                placeholder="auto_cycle_171000..."
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleRollback}
              disabled={rollbackInProgress || !rollbackJobId.trim()}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${rollbackInProgress ? 'animate-spin' : ''}`} />
              {rollbackInProgress ? 'Revertiendo...' : 'Ejecutar Reversión de Lote'}
            </button>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Historial de Versiones & Instantáneas Recientes</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {(!data?.recentVersions || data.recentVersions.length === 0) ? (
                <div className="text-center p-8 text-slate-400 text-xs">
                  No hay versiones previas registradas aún.
                </div>
              ) : (
                data.recentVersions.map((v: any) => (
                  <div key={v.id} className="p-3 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Producto #{v.productId}</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded">
                          v{v.versionNumber}
                        </span>
                        <span className="text-slate-500 text-[11px]">{v.changeType}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Job: {v.jobId || 'N/A'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: SOURCE CANDIDATES */}
      {activeSubTab === 'sources' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Fuentes Descubiertas & Niveles de Confianza</h3>
              <p className="text-xs text-slate-500">
                Dominios identificados automáticamente. Las fuentes no verificadas se mantienen aisladas hasta recibir validación oficial.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {(!data?.sourceCandidatesList || data.sourceCandidatesList.length === 0) ? (
              <div className="text-center p-8 text-slate-400 text-xs">
                No hay fuentes pendientes de validación. Todas las fuentes actuales están bajo control.
              </div>
            ) : (
              data.sourceCandidatesList.map((cand: any) => (
                <div key={cand.id} className="p-3 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{cand.domain}</span>
                    <span className="text-slate-500 text-[11px] block">{cand.url}</span>
                    <span className="text-[10px] font-mono text-indigo-600 block mt-0.5">
                      Confianza: {cand.trustLevel} · Estado: {cand.status}
                    </span>
                  </div>

                  {cand.status === 'PENDING_VALIDATION' && (
                    <button
                      onClick={() => handleApproveSource(cand.id)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Aprobar Fuente
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: SETTINGS & THRESHOLDS */}
      {activeSubTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-2xl space-y-6">
          <h3 className="font-bold text-slate-900 text-sm">Configuración de Reglas y Umbrales del Motor Autónomo</h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="font-bold text-slate-700">Umbral Mínimo de Validación para Auto-Publicación:</label>
                <span className="font-black text-indigo-600 font-mono">{settings?.autoPublishMinScore || 85}/100</span>
              </div>
              <input
                type="range"
                min="70"
                max="98"
                value={settings?.autoPublishMinScore || 85}
                onChange={(e) => setSettings({ ...settings, autoPublishMinScore: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Puntajes inferiores a este valor se envían automáticamente a la Cola de Excepciones.
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="font-bold text-slate-700">Porcentaje de Detección de Anomalías (Circuit Breaker):</label>
                <span className="font-black text-rose-600 font-mono">{settings?.anomalyThresholdPercent || 40}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                value={settings?.anomalyThresholdPercent || 40}
                onChange={(e) => setSettings({ ...settings, anomalyThresholdPercent: Number(e.target.value) })}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Si más del porcentaje indicado presenta datos vacíos o corruptos, el lote se aborta por seguridad.
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="font-bold text-slate-700">Porcentaje de Muestra Canary (Modo CANARY):</label>
                <span className="font-black text-amber-600 font-mono">{settings?.canaryPercentage || 10}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={settings?.canaryPercentage || 10}
                onChange={(e) => setSettings({ ...settings, canaryPercentage: Number(e.target.value) })}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                En modo Canary, sólo este porcentaje del lote se publica directamente; el resto se mantiene en revisión.
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Versión del motor: {settings?.currentRuleVersion || 'v1.0.0'}</span>
              <button
                onClick={() => handleSaveSettings(settings)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
              >
                Guardar Parámetros
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
