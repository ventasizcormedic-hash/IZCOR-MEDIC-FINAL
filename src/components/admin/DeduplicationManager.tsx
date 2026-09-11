import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  ShieldCheck, AlertTriangle, GitMerge, CheckCircle, XCircle, 
  Search, RefreshCw, Layers, ExternalLink, ArrowRight, Eye, ShieldAlert, Check, X
} from 'lucide-react';

interface DeduplicationManagerProps {
  user: User | null;
}

export function DeduplicationManager({ user }: DeduplicationManagerProps) {
  const [duplicateCases, setDuplicateCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [mergeReason, setMergeReason] = useState('Mismo producto detectado en fuentes/idiomas diferentes con identidad confirmada');
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchDuplicateCases = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/duplicates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDuplicateCases(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicateCases();
  }, [user]);

  const handleRunScan = async () => {
    if (!user) return;
    setScanning(true);
    setMessage({ text: '', type: '' });
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/duplicates/scan', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessage({ text: `Escaneo completado. Analizados: ${data.analyzed}, Nuevos candidatos detectados: ${data.candidatesFound}`, type: 'success' });
        fetchDuplicateCases();
      } else {
        setMessage({ text: 'Error al ejecutar el escaneo de duplicados.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setMessage({ text: 'Error de red durante el escaneo.', type: 'error' });
    } finally {
      setScanning(false);
    }
  };

  const handleSecureMerge = async (primaryId: number, secondaryId: number) => {
    if (!user) return;
    if (!confirm('¿Estás seguro de realizar la Fusión Segura? El producto secundario se archivará conservando su trazabilidad histórica.')) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/duplicates/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ primaryId, secondaryId, reason: mergeReason })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Fusión completada con éxito.');
        setSelectedCase(null);
        fetchDuplicateCases();
      } else {
        alert(data.error || 'Error al fusionar productos.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de red al fusionar.');
    }
  };

  const handleUpdateStatus = async (caseId: number, newStatus: string, notes?: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/duplicates/${caseId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, notes })
      });
      if (res.ok) {
        setSelectedCase(null);
        fetchDuplicateCases();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCases = duplicateCases.filter(c => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  const stats = {
    total: duplicateCases.length,
    pending: duplicateCases.filter(c => c.status === 'PENDING_REVIEW').length,
    high: duplicateCases.filter(c => c.classification === 'HIGH_PROBABILITY').length,
    conflict: duplicateCases.filter(c => c.classification === 'IDENTITY_CONFLICT').length,
    merged: duplicateCases.filter(c => c.status === 'MERGED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header & Scan */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-cyan" />
            <h2 className="text-lg font-black text-[#2C3E50]">Motor Avanzado de Deduplicación e Identidad Médica</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Detecta duplicados entre distintas fuentes, idiomas y categorías protegiendo la identidad. Nunca fusiona automáticamente modelos o referencias diferentes.
          </p>
        </div>
        <button
          onClick={handleRunScan}
          disabled={scanning}
          className="px-5 py-2.5 rounded-xl bg-brand-cyan hover:bg-[#0087a3] text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Analizando Catálogo...' : 'Ejecutar Auditoría de Duplicidad'}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Casos Analizados</span>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase">Pendientes de Revisión</span>
          <p className="text-xl font-black text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-cyan-700 uppercase">Alta Probabilidad</span>
          <p className="text-xl font-black text-cyan-700 mt-1">{stats.high}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-red-600 uppercase">Conflictos de Modelo</span>
          <p className="text-xl font-black text-red-600 mt-1">{stats.conflict}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Fusionados Seguros</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{stats.merged}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['ALL', 'PENDING_REVIEW', 'DIFFERENT_MODELS', 'FALSE_POSITIVE', 'MERGED'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterStatus === status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {status === 'ALL' ? 'Todos los Casos' : status === 'PENDING_REVIEW' ? 'Pendientes' : status === 'DIFFERENT_MODELS' ? 'Modelos Distintos (Bloqueados)' : status === 'FALSE_POSITIVE' ? 'Falsos Positivos' : 'Fusionados'}
          </button>
        ))}
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Cargando casos de duplicidad...</div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No hay casos de duplicidad en esta categoría. Ejecuta una auditoría para escanear el catálogo.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Clasificación</th>
                  <th className="py-3 px-4">Producto A (Principal)</th>
                  <th className="py-3 px-4">Producto B (Candidato)</th>
                  <th className="py-3 px-4">Señales / Recomendación</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-black text-brand-cyan">
                      {c.duplicateScore}/100
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.classification === 'HIGH_PROBABILITY' ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' :
                        c.classification === 'IDENTITY_CONFLICT' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {c.classification}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.productA?.name || `ID #${c.productAId}`}
                      <span className="block text-[10px] text-slate-400 font-mono">ID: {c.productAId} | Ref: {c.productA?.reference || 'N/D'}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.productB?.name || `ID #${c.productBId}`}
                      <span className="block text-[10px] text-slate-400 font-mono">ID: {c.productBId} | Ref: {c.productB?.reference || 'N/D'}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-700 truncate">{c.recommendation}</p>
                      <span className="text-[10px] text-slate-400 italic">Coincidencias: {c.matchingSignals?.length || 0} | Conflictos: {c.conflictingSignals?.length || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        c.status === 'MERGED' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'DIFFERENT_MODELS' ? 'bg-red-50 text-red-600 border border-red-200' :
                        c.status === 'FALSE_POSITIVE' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCase(c)}
                        className="px-3 py-1.5 rounded-lg bg-[#2C3E50] hover:bg-[#1e2b37] text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side-by-Side Review Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#2C3E50] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <GitMerge className="w-5 h-5 text-brand-cyan" />
                <div>
                  <h3 className="font-bold text-base">Auditoría de Caso de Duplicidad #{selectedCase.id}</h3>
                  <p className="text-[11px] text-slate-400">Score de Coincidencia: <span className="font-bold text-white">{selectedCase.duplicateScore}/100</span> | Clasificación: {selectedCase.classification}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50/50">
              {/* Side-by-Side Product Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product A */}
                <div className="bg-white p-5 rounded-2xl border-2 border-brand-cyan/40 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold text-brand-cyan uppercase bg-cyan-50 px-2 py-0.5 rounded">Producto A (Principal / Canónico)</span>
                    <span className="text-xs font-mono text-slate-400">ID: {selectedCase.productAId}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{selectedCase.productA?.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedCase.productA?.description || 'Sin descripción'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                    <div><span className="text-slate-400 font-semibold block">Marca:</span> <span className="font-bold text-slate-800">{selectedCase.productA?.brand || 'N/D'}</span></div>
                    <div><span className="text-slate-400 font-semibold block">Fabricante:</span> <span className="font-bold text-slate-800">{selectedCase.productA?.manufacturer || 'N/D'}</span></div>
                    <div><span className="text-slate-400 font-semibold block">Modelo:</span> <span className="font-bold text-slate-800">{selectedCase.productA?.model || 'N/D'}</span></div>
                    <div><span className="text-slate-400 font-semibold block">Ref / Catálogo:</span> <span className="font-bold text-slate-800">{selectedCase.productA?.reference || selectedCase.productA?.catalogNumber || 'N/D'}</span></div>
                  </div>
                </div>

                {/* Product B */}
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded">Producto B (Candidato a Fusionar)</span>
                    <span className="text-xs font-mono text-slate-400">ID: {selectedCase.productBId}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{selectedCase.productB?.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedCase.productB?.description || 'Sin descripción'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                    <div><span className="text-slate-400 font-semibold block">Marca:</span> <span className="font-bold text-slate-800">{selectedCase.productB?.brand || 'N/D'}</span></div>
                    <div><span className="text-slate-400 font-semibold block">Fabricante:</span> <span className="font-bold text-slate-800">{selectedCase.productB?.manufacturer || 'N/D'}</span></div>
                    <div><span className="text-slate-400 font-semibold block">Modelo:</span> <span className="font-bold text-slate-800">{selectedCase.productB?.model || 'N/D'}</span></div>
                    <div><span className="text-slate-400 font-semibold block">Ref / Catálogo:</span> <span className="font-bold text-slate-800">{selectedCase.productB?.reference || selectedCase.productB?.catalogNumber || 'N/D'}</span></div>
                  </div>
                </div>
              </div>

              {/* Signals breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                  <h5 className="text-xs font-bold text-emerald-800 uppercase mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Señales Coincidentes
                  </h5>
                  {selectedCase.matchingSignals && selectedCase.matchingSignals.length > 0 ? (
                    <ul className="space-y-1 text-xs text-emerald-900 font-medium">
                      {selectedCase.matchingSignals.map((sig: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">✓ {sig}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-700 italic">Ninguna señal fuerte coincidente.</p>
                  )}
                </div>

                <div className="bg-red-50/50 p-4 rounded-2xl border border-red-200">
                  <h5 className="text-xs font-bold text-red-800 uppercase mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" /> Señales Conflictivas / Divergencias
                  </h5>
                  {selectedCase.conflictingSignals && selectedCase.conflictingSignals.length > 0 ? (
                    <ul className="space-y-1 text-xs text-red-900 font-medium">
                      {selectedCase.conflictingSignals.map((sig: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">✗ {sig}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-700 italic">Sin conflictos detectados.</p>
                  )}
                </div>
              </div>

              {/* Recommendation & Reason */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <h5 className="text-xs font-bold text-slate-800 uppercase">Recomendación del Motor</h5>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">{selectedCase.recommendation}</p>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Motivo de Fusión / Decisión Administrativa</label>
                  <input
                    type="text"
                    value={mergeReason}
                    onChange={(e) => setMergeReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-cyan/20"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedCase.id, 'FALSE_POSITIVE', 'Descartado como falso positivo')}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-colors shadow-xs"
                >
                  Marcar Falso Positivo
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedCase.id, 'DIFFERENT_MODELS', 'Confirmado como modelos diferentes')}
                  className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors"
                >
                  Modelos Distintos (Mantener Separados)
                </button>
              </div>

              <button
                onClick={() => handleSecureMerge(selectedCase.productAId, selectedCase.productBId)}
                className="px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-[#0087a3] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
              >
                <GitMerge className="w-4 h-4" /> Ejecutar Fusión Segura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
