import React, { useState, useEffect } from 'react';
import { AlertOctagon, AlertTriangle, RefreshCw, CheckCircle2, ShieldAlert, Terminal, Copy, Check } from 'lucide-react';

interface ErrorCluster {
  id: string;
  source: string;
  errorType: string;
  severity: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  message: string;
  sampleUrl: string;
}

interface ErrorCenterManagerProps {
  user: any;
  onRetrySource?: (sourceName: string) => void;
}

export const ErrorCenterManager: React.FC<ErrorCenterManagerProps> = ({ user, onRetrySource }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchErrors = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/errors/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, [user]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Centro de Alertas, Errores &amp; Excepciones</h2>
          <p className="text-xs text-gray-500">
            Diagnóstico agrupado de incidencias técnicas, fallos de red en crawlers y anomalías de validación
          </p>
        </div>

        <button
          onClick={fetchErrors}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
          title="Recargar incidencias"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Cluster de Errores Agrupados */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Incidencias Activas por Fuente &amp; Patrón</h3>

        {isLoading ? (
          <div className="p-10 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Cargando telemetría de errores...
          </div>
        ) : !data?.clusters || data.clusters.length === 0 ? (
          <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-gray-200 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No hay errores activos o bloqueantes en el sistema. Todos los pipelines operan normalmente.
          </div>
        ) : (
          <div className="space-y-3">
            {data.clusters.map((c: ErrorCluster) => (
              <div 
                key={c.id} 
                className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-300 transition"
              >
                <div className="space-y-1.5 max-w-2xl text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.severity}
                    </span>
                    <span className="font-bold text-gray-900">{c.source}</span>
                    <span className="text-gray-400">&bull;</span>
                    <span className="font-mono text-gray-600">{c.errorType}</span>
                    <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold text-[10px]">
                      {c.occurrences} evento{c.occurrences > 1 ? 's' : ''}
                    </span>
                  </div>

                  <p className="text-gray-700 font-medium">{c.message}</p>
                  
                  <div className="font-mono text-[11px] text-gray-400 truncate max-w-lg">
                    Ejemplo: {c.sampleUrl}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(c.id, `${c.source} | ${c.errorType} | ${c.message}`)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs flex items-center gap-1.5"
                    title="Copiar diagnóstico"
                  >
                    {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === c.id ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={() => onRetrySource?.(c.source)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    Reintentar Fuente
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
