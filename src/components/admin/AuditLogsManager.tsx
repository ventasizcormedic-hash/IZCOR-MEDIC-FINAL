import React, { useState, useEffect } from 'react';
import { Clock, Shield, Filter, Search, RefreshCw, CheckCircle2, AlertOctagon, ArrowRight, User } from 'lucide-react';

interface AuditLog {
  id: number;
  jobId: string | null;
  productId: number | null;
  sourceId: number | null;
  action: string;
  decision: string;
  riskScore: string;
  ruleVersion: string;
  evidenceSummary: string | null;
  executedRules: any;
  timestamp: string;
}

interface AuditLogsManagerProps {
  user: any;
}

export const AuditLogsManager: React.FC<AuditLogsManagerProps> = ({ user }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/audit/logs?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const filtered = logs.filter(l => {
    if (filterAction !== 'ALL' && !l.action.includes(filterAction)) return false;
    if (searchTerm && !(
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.decision.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.evidenceSummary && l.evidenceSummary.toLowerCase().includes(searchTerm.toLowerCase()))
    )) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Historial &amp; Auditoría Central</h2>
          <p className="text-xs text-gray-500">
            Trazabilidad inmutable de decisiones del motor autónomo, modificaciones manuales de operadores y reglas ejecutadas
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
          title="Recargar auditoría"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por acción, decisión o texto explicativo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Todas las Acciones</option>
          <option value="AUTO_PUBLISH">Auto Publicación</option>
          <option value="MANUAL_EDIT">Edición Manual</option>
          <option value="DISCOVERY">Descubrimiento</option>
          <option value="VALIDATION">Validación de Calidad</option>
          <option value="ROLLBACK">Reversión (Rollback)</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Cargando bitácora de auditoría...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-xs">
            No se encontraron eventos de auditoría registrados con los criterios seleccionados.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      log.action.includes('PUBLISH') 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : log.action.includes('MANUAL') 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {log.action}
                    </span>

                    <span className="text-gray-400">&bull;</span>
                    <span className="font-semibold text-gray-800">{log.decision}</span>

                    {log.productId && (
                      <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        Prod #{log.productId}
                      </span>
                    )}

                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.riskScore === 'HIGH' || log.riskScore === 'CRITICAL'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      Riesgo: {log.riskScore || 'LOW'}
                    </span>
                  </div>

                  <p className="text-gray-600 leading-relaxed text-xs">
                    {log.evidenceSummary || 'Acción ejecutada y trazada en bitácora oficial del catálogo.'}
                  </p>
                </div>

                <div className="text-right text-[11px] text-gray-400 whitespace-nowrap">
                  <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                  <div>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
