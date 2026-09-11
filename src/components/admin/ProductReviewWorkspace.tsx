import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Clock, 
  RefreshCw, FileText, Eye, Check, X, ShieldAlert, Sparkles, Filter, 
  Layers, Package, Tag, Globe, ArrowRight, Save, ArrowLeft, GitMerge, History, Image as ImageIcon
} from 'lucide-react';

interface ProductReviewWorkspaceProps {
  user: User | null;
}

export function ProductReviewWorkspace({ user }: ProductReviewWorkspaceProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [productDetail, setProductDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'identity' | 'content' | 'specs' | 'media' | 'sources' | 'duplicates' | 'history'>('summary');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editForm, setEditForm] = useState<any>({});
  const [editReason, setEditReason] = useState('Corrección y validación administrativa');
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/review/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetail = async (id: number) => {
    if (!user) return;
    setDetailLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/review/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProductDetail(data);
        setEditForm({
          name: data.name || '',
          manufacturer: data.manufacturer || '',
          model: data.model || '',
          catalogNumber: data.catalogNumber || '',
          description: data.description || '',
          technicalSpecs: data.technicalSpecs || '',
          application: data.application || '',
          presentation: data.presentation || '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  useEffect(() => {
    if (selectedId) {
      fetchProductDetail(selectedId);
    } else {
      setProductDetail(null);
    }
  }, [selectedId]);

  const handleSaveEdit = async () => {
    if (!user || !selectedId) return;
    setMessage({ text: '', type: '' });
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/review/products/${selectedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...editForm, reason: editReason })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message || 'Cambios guardados con éxito.', type: 'success' });
        fetchProductDetail(selectedId);
        fetchProducts();
      } else {
        setMessage({ text: data.error || 'Error al guardar cambios.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setMessage({ text: 'Error de red al guardar.', type: 'error' });
    }
  };

  const handleUpdateStatus = async (newStatus: string, notes?: string) => {
    if (!user || !selectedId) return;
    if (!confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/review/products/${selectedId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, notes })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Estado actualizado.');
        fetchProductDetail(selectedId);
        fetchProducts();
      } else {
        alert(data.error || 'Error al actualizar estado.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = products.filter(p => {
    if (filterStatus !== 'ALL' && p.verificationStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (p.name && p.name.toLowerCase().includes(q)) ||
             (p.model && p.model.toLowerCase().includes(q)) ||
             (p.manufacturer && p.manufacturer.toLowerCase().includes(q));
    }
    return true;
  });

  // If a product is selected, render the deep review workspace
  if (selectedId && productDetail) {
    const historyEntries = productDetail.auditReport?.history || [];
    return (
      <div className="space-y-6">
        {/* Top Navigation & Actions Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <button
            onClick={() => setSelectedId(null)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a la Cola de Revisión
          </button>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              productDetail.publicationStatus === 'PUBLISHED' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {productDetail.publicationStatus === 'PUBLISHED' ? '🌐 PUBLICADO' : 'NO PUBLICADO'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              productDetail.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
              productDetail.verificationStatus === 'REVIEW' ? 'bg-amber-100 text-amber-800' :
              productDetail.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
            }`}>
              Estado: {productDetail.verificationStatus}
            </span>
            <button
              onClick={() => handleUpdateStatus('REVIEW', 'Devuelto a revisión administrativa')}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl transition-colors"
            >
              Devolver a Review
            </button>
            <button
              onClick={() => handleUpdateStatus('REJECTED', 'Rechazado en centro de control de calidad')}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition-colors"
            >
              Rechazar / Despublicar
            </button>
            <button
              onClick={() => handleUpdateStatus('VERIFIED', 'Verificado y aprobado por administrador')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Validar y Publicar
            </button>
          </div>
        </div>

        {/* Header Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-50 text-cyan-800 border border-cyan-200">ID #{productDetail.id}</span>
              <span className="text-xs text-slate-400 font-mono">Creado: {new Date(productDetail.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-black text-[#2C3E50]">{productDetail.name}</h1>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
              <div><strong>Marca / Fabricante:</strong> {productDetail.manufacturer || 'N/D'}</div>
              <div><strong>Modelo:</strong> {productDetail.model || 'N/D'}</div>
              <div><strong>Ref / Catálogo:</strong> {productDetail.catalogNumber || 'N/D'}</div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Score de Calidad General</span>
              <div className="text-3xl font-black text-brand-cyan mt-1">{productDetail.validationScore || 0}/100</div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Fuente: <a href={productDetail.sourceUrl} target="_blank" rel="noreferrer" className="text-brand-cyan hover:underline truncate block">Enlace original de extracción</a>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {[
            { id: 'summary', label: 'Resumen & Alertas' },
            { id: 'identity', label: 'Identidad' },
            { id: 'content', label: 'Contenido' },
            { id: 'specs', label: 'Especificaciones' },
            { id: 'media', label: 'Multimedia & Docs' },
            { id: 'sources', label: 'Fuentes & Trazabilidad' },
            { id: 'duplicates', label: 'Duplicados & Conflictos' },
            { id: 'history', label: `Historial (${historyEntries.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase">Resumen de Calidad y Problemas Detectados</h3>
              {productDetail.validationIssues && productDetail.validationIssues.length > 0 ? (
                <div className="space-y-2">
                  {productDetail.validationIssues.map((issue: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase text-[10px] bg-amber-200 px-2 py-0.5 rounded mr-2">{issue.severity}</span>
                        <span className="text-xs font-semibold">{issue.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-bold">El producto ha superado satisfactoriamente los controles automáticos de estructura e identidad.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'identity' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Editor de Identidad Oficial</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Oficial</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-cyan/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fabricante</label>
                  <input
                    type="text"
                    value={editForm.manufacturer}
                    onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-cyan/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Modelo</label>
                  <input
                    type="text"
                    value={editForm.model}
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-cyan/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Referencia / Catálogo / SKU</label>
                  <input
                    type="text"
                    value={editForm.catalogNumber}
                    onChange={(e) => setEditForm({ ...editForm, catalogNumber: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-cyan/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Motivo del Cambio (para auditoría)</label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-cyan/20"
                />
              </div>

              <button
                onClick={handleSaveEdit}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Guardar Cambios de Identidad
              </button>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Descripción y Contenido Extraído</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descripción General</label>
                <textarea
                  rows={6}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-cyan/20"
                />
              </div>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Guardar Contenido
              </button>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Especificaciones Técnicas</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Especificaciones (Texto o JSON estructurado)</label>
                <textarea
                  rows={8}
                  value={editForm.technicalSpecs}
                  onChange={(e) => setEditForm({ ...editForm, technicalSpecs: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-brand-cyan/20"
                />
              </div>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Guardar Especificaciones
              </button>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase">Imágenes y Documentos (PDFs)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {productDetail.images && productDetail.images.length > 0 ? (
                  productDetail.images.map((img: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded-2xl border border-slate-200 flex flex-col items-center">
                      <img src={img.url} alt="Producto" className="h-28 object-contain rounded-xl mb-2 bg-white p-1" />
                      <span className="text-[10px] font-mono text-slate-500 truncate w-full text-center">Imagen #{idx + 1}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic col-span-4">Sin imágenes registradas para este producto.</p>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-900 uppercase mt-6">Documentación Técnica / PDFs</h4>
              <div className="space-y-2">
                {productDetail.documents && productDetail.documents.length > 0 ? (
                  productDetail.documents.map((doc: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-cyan" />
                        <span className="font-bold text-slate-800">{doc.title || 'Ficha Técnica PDF'}</span>
                      </div>
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-brand-cyan font-bold hover:underline">Abrir Documento →</a>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Sin documentos PDF vinculados.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Trazabilidad y Origen de Datos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div><strong className="text-slate-400 block uppercase text-[10px]">URL Fuente:</strong> <a href={productDetail.sourceUrl} target="_blank" rel="noreferrer" className="text-brand-cyan hover:underline break-all">{productDetail.sourceUrl}</a></div>
                  <div><strong className="text-slate-400 block uppercase text-[10px]">Fecha de Extracción:</strong> {new Date(productDetail.createdAt).toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div><strong className="text-slate-400 block uppercase text-[10px]">Última Modificación:</strong> {new Date(productDetail.updatedAt).toLocaleString()}</div>
                  <div><strong className="text-slate-400 block uppercase text-[10px]">Verificado por:</strong> {productDetail.verifiedBy || 'Pendiente de firma'}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'duplicates' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Casos de Duplicidad e Identidad</h3>
              {productDetail.duplicates && productDetail.duplicates.length > 0 ? (
                <div className="space-y-3">
                  {productDetail.duplicates.map((d: any) => (
                    <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Caso #{d.id} — Score: {d.duplicateScore}/100</span>
                        <p className="text-slate-500 mt-0.5">{d.recommendation}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold text-[10px]">{d.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No se han detectado casos de duplicidad para este producto.</p>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Historial de Auditoría y Cambios Manuales</h3>
              {historyEntries.length > 0 ? (
                <div className="space-y-3">
                  {historyEntries.map((h: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold text-slate-800">{h.user}</span>
                        <span>{new Date(h.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-700 font-medium">Motivo: {h.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Sin modificaciones registradas en el historial.</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Queue List View
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-cyan" />
            <h2 className="text-lg font-black text-slate-900">Centro de Control de Calidad y Revisión de Productos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Inspecciona, corrige y aprueba productos extraídos. Todo producto nuevo llega como DRAFT y requiere control humano antes de ser verificado.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre, modelo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl w-64 focus:outline-hidden focus:ring-2 focus:ring-brand-cyan/20"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['ALL', 'DRAFT', 'REVIEW', 'VERIFIED', 'OUTDATED', 'REJECTED'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterStatus === status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Cargando cola de revisión...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No hay productos en esta bandeja.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Modelo / Fabricante</th>
                  <th className="py-3 px-4">Estado Verificación</th>
                  <th className="py-3 px-4">Publicación</th>
                  <th className="py-3 px-4">Fecha Extracción</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-black">
                      <span className="px-2 py-1 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">{p.validationScore || 0}/100</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.name}
                      <span className="block text-[10px] text-slate-400 font-mono">ID: {p.id}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.model || 'N/D'}
                      <span className="block text-[10px] text-slate-400">{p.manufacturer || 'N/D'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                        p.verificationStatus === 'REVIEW' ? 'bg-amber-100 text-amber-800' :
                        p.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.publicationStatus === 'PUBLISHED' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.publicationStatus === 'PUBLISHED' ? '🌐 PUBLICADO' : 'NO'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedId(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Abrir Revisión
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
