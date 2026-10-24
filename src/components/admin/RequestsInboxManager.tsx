import React, { useEffect, useMemo, useState } from 'react';
import {
  Inbox, FileText, AlertTriangle, MessageSquare, RefreshCw, ChevronDown,
  Mail, Phone, Building2, MapPin, Download, Search, ExternalLink
} from 'lucide-react';
import { useAdminFeedback } from './ui/AdminFeedback';

type InboxKind = 'quotes' | 'contact' | 'tdr' | 'pharmacovigilance';

interface QuoteRequest {
  id: number;
  name: string;
  company: string | null;
  institution: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  message: string | null;
  status: string | null;
  createdAt: string;
  items: Array<{ productId: number; quantity: number; productName: string | null; productModel: string | null; productSlug: string | null; brandName: string | null }>;
}

interface TdrRequest {
  id: number;
  name: string;
  institution: string;
  email: string;
  phone: string;
  description: string | null;
  fileUrl: string | null;
  status: string | null;
  createdAt: string;
}

interface PvReport {
  id: number;
  reportCode: string;
  patientName: string | null;
  contactEmail: string;
  contactPhone: string | null;
  productName: string;
  lotNumber: string | null;
  symptomDescription: string;
  isProfessional: boolean | null;
  status: string | null;
  createdAt: string;
}

// Contact form messages are stored in the quotes table with this prefix.
const CONTACT_PREFIX = '[CONTACTO';

const STATUS_OPTIONS: Record<InboxKind, Array<{ value: string; label: string }>> = {
  quotes: [
    { value: 'NEW', label: 'Nueva' },
    { value: 'IN_PROGRESS', label: 'En proceso' },
    { value: 'SENT', label: 'Cotización enviada' },
    { value: 'WON', label: 'Ganada' },
    { value: 'LOST', label: 'Perdida' },
    { value: 'CLOSED', label: 'Cerrada' },
  ],
  contact: [
    { value: 'NEW', label: 'Nuevo' },
    { value: 'IN_PROGRESS', label: 'En atención' },
    { value: 'CLOSED', label: 'Atendido' },
  ],
  tdr: [
    { value: 'NEW', label: 'Nuevo' },
    { value: 'IN_REVIEW', label: 'En evaluación' },
    { value: 'PROPOSAL_SENT', label: 'Propuesta enviada' },
    { value: 'DISCARDED', label: 'Descartado' },
    { value: 'CLOSED', label: 'Cerrado' },
  ],
  pharmacovigilance: [
    { value: 'PENDING_REVIEW', label: 'Pendiente de revisión' },
    { value: 'UNDER_INVESTIGATION', label: 'En investigación' },
    { value: 'REPORTED_DIGEMID', label: 'Notificado a DIGEMID' },
    { value: 'CLOSED', label: 'Cerrado' },
  ],
};

const OPEN_STATUSES = ['NEW', 'IN_PROGRESS', 'IN_REVIEW', 'PENDING_REVIEW', 'UNDER_INVESTIGATION', null, undefined, ''];

const PAGE_SIZE = 20;

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return value;
  }
};

const statusLabel = (kind: InboxKind, status: string | null) =>
  STATUS_OPTIONS[kind].find(o => o.value === status)?.label || status || 'Sin estado';

/** Inbox for what customers send from the public site: quotes, contact messages, TDR files and adverse event reports. */
export function RequestsInboxManager({ user }: { user: any }) {
  const { toast } = useAdminFeedback();
  const [kind, setKind] = useState<InboxKind>('quotes');
  const [quoteRows, setQuoteRows] = useState<QuoteRequest[]>([]);
  const [tdrRows, setTdrRows] = useState<TdrRequest[]>([]);
  const [pvRows, setPvRows] = useState<PvReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    setLoadError(false);
    try {
      const token = await user.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [qRes, tRes, pRes] = await Promise.all([
        fetch('/api/admin/quotes', { headers }),
        fetch('/api/admin/tdr', { headers }),
        fetch('/api/admin/pharmacovigilance', { headers }),
      ]);
      if (!qRes.ok || !tRes.ok || !pRes.ok) throw new Error('Request failed');
      setQuoteRows(await qRes.json());
      setTdrRows(await tRes.json());
      setPvRows(await pRes.json());
    } catch (e) {
      console.error('Error loading requests inbox:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [user]);

  useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [kind, onlyOpen, search]);

  const quotes = useMemo(() => quoteRows.filter(q => !q.message?.startsWith(CONTACT_PREFIX)), [quoteRows]);
  const contacts = useMemo(() => quoteRows.filter(q => q.message?.startsWith(CONTACT_PREFIX)), [quoteRows]);

  const counts: Record<InboxKind, number> = {
    quotes: quotes.filter(q => OPEN_STATUSES.includes(q.status)).length,
    contact: contacts.filter(q => OPEN_STATUSES.includes(q.status)).length,
    tdr: tdrRows.filter(t => OPEN_STATUSES.includes(t.status)).length,
    pharmacovigilance: pvRows.filter(r => OPEN_STATUSES.includes(r.status)).length,
  };

  const rows: Array<QuoteRequest | TdrRequest | PvReport> =
    kind === 'quotes' ? quotes : kind === 'contact' ? contacts : kind === 'tdr' ? tdrRows : pvRows;

  const term = search.trim().toLowerCase();
  const visibleRows = rows.filter((r: any) => {
    if (onlyOpen && !OPEN_STATUSES.includes(r.status)) return false;
    if (!term) return true;
    return [r.name, r.company, r.institution, r.email, r.contactEmail, r.productName, r.reportCode, r.message, r.description]
      .some(v => typeof v === 'string' && v.toLowerCase().includes(term));
  });
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / PAGE_SIZE));
  const pageRows = visibleRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateStatus = async (rowKind: InboxKind, id: number, status: string) => {
    const key = `${rowKind}-${id}`;
    setUpdatingId(key);
    try {
      const token = await user.getIdToken();
      const endpoint = rowKind === 'tdr' ? 'tdr' : rowKind === 'pharmacovigilance' ? 'pharmacovigilance' : 'quotes';
      const res = await fetch(`/api/admin/${endpoint}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar el estado.');
      if (endpoint === 'quotes') setQuoteRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
      if (endpoint === 'tdr') setTdrRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
      if (endpoint === 'pharmacovigilance') setPvRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
      toast.success(`Estado actualizado: ${statusLabel(rowKind, status)}.`);
    } catch (e: any) {
      toast.error(e.message || 'No se pudo actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  // TDR files are behind admin auth, so download with the token instead of a plain link.
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const downloadTdrFile = async (row: TdrRequest) => {
    if (!row.fileUrl) return;
    setDownloadingId(row.id);
    try {
      const token = await user.getIdToken();
      const url = row.fileUrl.startsWith('/api/') ? row.fileUrl : `/api/admin/tdr/${row.id}/file`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(res.status === 404 ? 'El archivo ya no está disponible.' : `Error ${res.status}`);
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const fileName = disposition.match(/filename="([^"]+)"/)?.[1] || `TDR-${String(row.id).padStart(5, '0')}`;
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (e: any) {
      toast.error(e.message || 'No se pudo descargar el documento.');
    } finally {
      setDownloadingId(null);
    }
  };

  const tabs: Array<{ id: InboxKind; label: string; icon: React.ElementType }> = [
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'contact', label: 'Mensajes de contacto', icon: MessageSquare },
    { id: 'tdr', label: 'TDR', icon: Inbox },
    { id: 'pharmacovigilance', label: 'Farmacovigilancia', icon: AlertTriangle },
  ];

  const renderStatusSelect = (rowKind: InboxKind, id: number, status: string | null) => {
    const key = `${rowKind}-${id}`;
    const options = STATUS_OPTIONS[rowKind];
    const known = options.some(o => o.value === status);
    return (
      <select
        aria-label="Cambiar estado"
        value={status || ''}
        disabled={updatingId === key}
        onClick={e => e.stopPropagation()}
        onChange={e => updateStatus(rowKind, id, e.target.value)}
        className="h-9 px-2 text-xs border border-gray-200 rounded-lg bg-white font-semibold text-gray-700 disabled:opacity-50"
      >
        {!known && <option value={status || ''}>{status || 'Sin estado'}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  };

  const contactLine = (email?: string | null, phone?: string | null) => (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
      {email && (
        <a href={`mailto:${email}`} className="inline-flex items-center gap-1 text-blue-700 hover:underline">
          <Mail className="w-3.5 h-3.5" /> {email}
        </a>
      )}
      {phone && (
        <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
          <Phone className="w-3.5 h-3.5" /> {phone}
        </a>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Solicitudes de Clientes</h2>
          <p className="text-xs text-gray-500">Cotizaciones, mensajes, TDR y reportes recibidos desde el sitio web.</p>
        </div>
        <button
          type="button"
          onClick={fetchAll}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Tipo de solicitud">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = kind === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setKind(t.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 h-10 rounded-lg text-xs font-bold border transition ${
                active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {counts[t.id] > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20' : 'bg-amber-100 text-amber-800'}`}>
                  {counts[t.id]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            aria-label="Buscar solicitudes"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, institución, correo o producto..."
            className="w-full h-10 pl-9 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
          <input type="checkbox" checked={onlyOpen} onChange={e => setOnlyOpen(e.target.checked)} className="rounded text-blue-600" />
          Solo pendientes
        </label>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm" role="status">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" /> Cargando solicitudes...
          </div>
        ) : loadError ? (
          <div className="p-10 text-center text-sm text-rose-700" role="alert">
            No se pudieron cargar las solicitudes.{' '}
            <button type="button" onClick={fetchAll} className="font-bold underline">Reintentar</button>
          </div>
        ) : pageRows.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            {rows.length === 0 ? 'Todavía no hay solicitudes de este tipo.' : 'Ninguna solicitud coincide con el filtro.'}
          </div>
        ) : (
          pageRows.map((row: any) => {
            const key = `${kind}-${row.id}`;
            const expanded = expandedId === key;
            const title =
              kind === 'pharmacovigilance' ? `${row.reportCode} · ${row.productName}` :
              kind === 'tdr' ? `TDR-${String(row.id).padStart(5, '0')} · ${row.institution}` :
              kind === 'quotes' ? `COT-${String(row.id).padStart(5, '0')} · ${row.company || row.name}` :
              `${row.name}${row.company ? ` · ${row.company}` : ''}`;
            const subtitle =
              kind === 'pharmacovigilance' ? (row.patientName || row.contactEmail) :
              kind === 'quotes' ? `${row.name}${row.items?.length ? ` · ${row.items.length} equipo(s)` : ''}` :
              kind === 'contact' ? (row.message || '').replace(/^\[CONTACTO - ([^\]]*)\]:\s*/, '$1 · ') :
              row.name;
            return (
              <div key={key}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : key)}
                    aria-expanded={expanded}
                    className="flex-1 min-w-0 text-left flex items-start gap-3"
                  >
                    <ChevronDown className={`w-4 h-4 mt-0.5 shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-gray-900 truncate">{title}</span>
                      <span className="block text-xs text-gray-500 truncate">{subtitle}</span>
                      <span className="block text-[11px] text-gray-400 mt-0.5">{formatDate(row.createdAt)}</span>
                    </span>
                  </button>
                  <div className="flex items-center gap-2 pl-7 sm:pl-0">
                    {renderStatusSelect(kind, row.id, row.status)}
                  </div>
                </div>

                {expanded && (
                  <div className="px-4 pb-5 pl-11 space-y-3 text-xs text-gray-700 animate-fadeIn">
                    {kind === 'pharmacovigilance' ? (
                      <>
                        {contactLine(row.contactEmail, row.contactPhone)}
                        <div className="grid sm:grid-cols-2 gap-2">
                          <div><span className="text-gray-500">Producto:</span> <strong>{row.productName}</strong></div>
                          <div><span className="text-gray-500">Lote / Serie:</span> {row.lotNumber || '—'}</div>
                          <div><span className="text-gray-500">Reporta:</span> {row.patientName || '—'}</div>
                          <div><span className="text-gray-500">Profesional de salud:</span> {row.isProfessional ? 'Sí' : 'No'}</div>
                        </div>
                        <p className="whitespace-pre-line bg-gray-50 rounded-lg p-3 border border-gray-100">{row.symptomDescription}</p>
                      </>
                    ) : kind === 'tdr' ? (
                      <>
                        {contactLine(row.email, row.phone)}
                        <div className="flex items-center gap-1 text-gray-600"><Building2 className="w-3.5 h-3.5" /> {row.institution}</div>
                        {row.description && <p className="whitespace-pre-line bg-gray-50 rounded-lg p-3 border border-gray-100">{row.description}</p>}
                        {row.fileUrl ? (
                          <button
                            type="button"
                            onClick={() => downloadTdrFile(row)}
                            disabled={downloadingId === row.id}
                            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-60"
                          >
                            <Download className="w-3.5 h-3.5" /> {downloadingId === row.id ? 'Descargando...' : 'Descargar documento TDR'}
                          </button>
                        ) : (
                          <span className="text-gray-400">Sin archivo adjunto.</span>
                        )}
                      </>
                    ) : (
                      <>
                        {contactLine(row.email, row.phone)}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                          {(row.company || row.institution) && (
                            <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {[row.company, row.institution].filter(Boolean).join(' · ')}</span>
                          )}
                          {row.city && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {row.city}</span>}
                        </div>
                        {kind === 'quotes' && row.items?.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border border-gray-100 rounded-lg">
                              <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
                                <tr><th className="p-2">Equipo</th><th className="p-2">Marca</th><th className="p-2">Modelo</th><th className="p-2 text-right">Cant.</th></tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {row.items.map((it: any) => (
                                  <tr key={it.productId}>
                                    <td className="p-2">
                                      {it.productSlug ? (
                                        <a href={`/producto/${it.productSlug}`} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline inline-flex items-center gap-1">
                                          {it.productName || `#${it.productId}`} <ExternalLink className="w-3 h-3" />
                                        </a>
                                      ) : (it.productName || `#${it.productId}`)}
                                    </td>
                                    <td className="p-2">{it.brandName || '—'}</td>
                                    <td className="p-2">{it.productModel || '—'}</td>
                                    <td className="p-2 text-right font-bold">{it.quantity}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {row.message && (
                          <p className="whitespace-pre-line bg-gray-50 rounded-lg p-3 border border-gray-100">
                            {kind === 'contact' ? row.message.replace(/^\[CONTACTO - [^\]]*\]:\s*/, '') : row.message}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {!loading && !loadError && visibleRows.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{visibleRows.length} solicitudes</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="h-9 px-3 rounded-lg border border-gray-200 bg-white disabled:opacity-40">Anterior</button>
            <span className="font-bold">Página {page} de {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="h-9 px-3 rounded-lg border border-gray-200 bg-white disabled:opacity-40">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}
