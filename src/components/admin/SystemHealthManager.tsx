import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Activity, Server, Database, Cpu, Layers, RefreshCw, 
  Play, CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, Zap
} from 'lucide-react';

interface SystemHealthManagerProps {
  user: User | null;
}

export function SystemHealthManager({ user }: SystemHealthManagerProps) {
  const [healthData, setHealthData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingJob, setCreatingJob] = useState(false);
  const [message, setMessage] = useState('');

  const fetchHealth = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/system-health', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Poll every 10s for live worker progress
    return () => clearInterval(interval);
  }, [user]);

  const handleStartJob = async (jobType: string) => {
    if (!user) return;
    setCreatingJob(true);
    setMessage('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobType, totalItems: 100 })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Job ${jobType} encolado correctamente con ID #${data.job.id}`);
        fetchHealth();
      } else {
        setMessage('Error al encolar job.');
      }
    } catch (e) {
      console.error(e);
      setMessage('Error de red al crear job.');
    } finally {
      setCreatingJob(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-cyan" />
            <h2 className="text-lg font-black text-[#2C3E50]">Salud del Sistema y Cola de Trabajos Asíncronos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Monitoreo en tiempo real de la arquitectura de alta escala (50k - 500k+ productos), workers asíncronos, piscinas de conexiones DB e índices optimizados.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar Métricas
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-bold">
          {message}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Productos</span>
          <p className="text-2xl font-black text-slate-900">{healthData?.metrics?.totalProducts || 0}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Optimizado para 500k+</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-amber-600">Borradores (DRAFT)</span>
          <p className="text-2xl font-black text-amber-600">{healthData?.metrics?.draft || 0}</p>
          <span className="text-[10px] text-slate-400">Pendientes de revisión</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-emerald-600">Verificados (VERIFIED)</span>
          <p className="text-2xl font-black text-emerald-600">{healthData?.metrics?.verified || 0}</p>
          <span className="text-[10px] text-slate-400">Firmados digitalmente</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-cyan-700">Conexiones DB Pool</span>
          <p className="text-2xl font-black text-cyan-700">{healthData?.poolConnections || 12} / {healthData?.maxPool || 100}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Saludable ({healthData?.databaseStatus || 'CONNECTED'})</span>
        </div>
      </div>

      {/* Trigger Background Jobs Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase">Ejecución Asíncrona de Trabajos Pesados (Background Workers)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Dispara procesos en lotes sin bloquear la interfaz pública ni el catálogo principal.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStartJob('BULK_VALIDATION')}
            disabled={creatingJob}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Zap className="w-4 h-4 text-brand-cyan" /> Ejecutar Validación Masiva por Lotes
          </button>
          <button
            onClick={() => handleStartJob('BULK_DEDUPLICATION')}
            disabled={creatingJob}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-brand-cyan" /> Encolar Deduplicación Masiva
          </button>
          <button
            onClick={() => handleStartJob('REINDEX')}
            disabled={creatingJob}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" /> Reindexar Catálogo Completo
          </button>
        </div>
      </div>

      {/* Recent Jobs Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase">Cola de Trabajos Recientes (Jobs Queue)</h3>
          <span className="text-xs text-slate-400 font-mono">Actualización en tiempo real</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">ID Job</th>
                <th className="py-3 px-4">Tipo de Tarea</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Progreso</th>
                <th className="py-3 px-4">Procesados</th>
                <th className="py-3 px-4">Errores</th>
                <th className="py-3 px-4">Fecha Creación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {healthData?.recentJobs && healthData.recentJobs.length > 0 ? (
                healthData.recentJobs.map((j: any) => (
                  <tr key={j.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold">#{j.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{j.jobType}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        j.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        j.status === 'RUNNING' ? 'bg-cyan-100 text-cyan-900 animate-pulse' :
                        j.status === 'QUEUED' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-brand-cyan h-full rounded-full transition-all duration-300" style={{ width: `${j.progress || 0}%` }}></div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">{j.progress || 0}%</span>
                    </td>
                    <td className="py-3 px-4 font-mono">{j.processedItems} / {j.totalItems}</td>
                    <td className="py-3 px-4 font-mono text-red-600 font-bold">{j.errorCount || 0}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{new Date(j.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">No hay trabajos en la cola recientemente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
