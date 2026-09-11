import React, { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  FileText, ShieldCheck, CheckCircle2, Building2, Trash2, 
  Plus, Minus, ArrowLeft, Send, MessageCircle, 
  PackageSearch, Clock, Sparkles, Check, Phone, Mail, Award,
  Loader2, AlertCircle
} from 'lucide-react';
import { useQuote } from '../context/QuoteContext';
import { SeoHead } from '../components/seo/SeoHead';

export function Quote() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const { items, itemCount, updateQuantity, removeItem, clearTray, addItem } = useQuote();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fetchingProduct, setFetchingProduct] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [ruc, setRuc] = useState('');
  const [institutionType, setInstitutionType] = useState('MINSA / EsSalud');
  const [region, setRegion] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Fetch product if URL has ?productId=
  useEffect(() => {
    if (productId) {
      const pid = parseInt(productId, 10);
      if (!isNaN(pid) && !items.some(i => i.id === pid)) {
        setFetchingProduct(true);
        fetch(`/api/products/${pid}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.id) {
              addItem({
                id: data.id,
                name: data.name,
                brandName: data.brand?.name || data.brandName || 'IZCOR MEDIC',
                model: data.model || '',
                imageUrl: data.imageUrl || (data.images && data.images[0]?.url) || null,
                slug: data.slug || '',
                categoryName: data.category?.name || data.categoryName || '',
              });
            }
          })
          .catch(err => console.error('Error fetching product for quote:', err))
          .finally(() => setFetchingProduct(false));
      }
    }
  }, [productId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    
    try {
      const payload = {
        name: fullName,
        email,
        phone,
        organization,
        ruc,
        institutionType,
        region,
        notes,
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          brand: item.brand,
          model: item.model,
        })),
      };

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error del servidor (${res.status})`);
      }

      const data = await res.json();
      setQuoteId(data.quoteId || data.id || null);
      setSuccess(true);
      clearTray();
    } catch (err: any) {
      setSubmitError(err.message || 'Error de red. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main id="quote-success-view" className="min-h-screen bg-[#F8FAFC] py-16 flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-200 mx-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#2C3E50] mb-3 font-heading">
            Solicitud de Cotización Recibida
          </h2>
          {quoteId && (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2 rounded-xl mb-4">
              <Check className="w-3.5 h-3.5" />
              <span>Expediente N.° <span className="font-mono tracking-wider">{quoteId}</span></span>
            </div>
          )}
          <p className="text-slate-600 text-xs sm:text-sm mb-8 leading-relaxed">
            Hemos registrado tu requerimiento para <strong className="text-slate-900">{organization || 'tu institución'}</strong>. Nuestro equipo de ingenieros biomédicos y especialistas en adquisiciones preparará la propuesta formal en menos de 24 horas.
          </p>
          <div className="space-y-3">
            <a 
              href={`https://wa.me/51928130349?text=Hola%20IZCOR%20MEDIC,%20acabo%20de%20enviar%20una%20solicitud%20de%20cotizaci%C3%B3n%20para%20${encodeURIComponent(organization || fullName)}`}
              target="_blank" 
              rel="noreferrer"
              className="inline-flex justify-center items-center gap-2 h-12 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm active:scale-[0.98] w-full"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Priorizar Atención por WhatsApp</span>
            </a>
            <Link 
              to="/productos"
              className="inline-flex justify-center items-center h-12 px-6 bg-slate-100 hover:bg-slate-200 text-[#2C3E50] font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-[0.98] w-full"
            >
              Volver al Catálogo Médico
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <SeoHead
        title="Solicitud de Cotización Institucional | IZCOR MEDIC"
        description="Emisión de cotizaciones formales y fichas técnicas homologadas para comités de compra hospitalarios, clínicas y licitaciones OSCE."
        canonicalUrl="/cotizar"
      />

      <main id="quote-page" className="min-h-screen bg-[#F8FAFC] py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Breadcrumb & Header */}
          <div className="mb-8">
            <Link 
              to="/productos" 
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-cyan-700 mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Volver al Catálogo Oficial
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#2C3E50] mb-1 font-heading tracking-tight">
                  Solicitud de Cotización Institucional
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Cotizaciones formales, fichas técnicas y sustento normativo para comités de selección, clínicas y hospitales.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl w-fit">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Garantía Oficial & Homologación DIGEMID</span>
              </div>
            </div>
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left Column: Product Tray & Institutional Reassurance */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Product Tray List */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-700" />
                    <h2 className="text-xs font-black text-[#2C3E50] uppercase tracking-wider font-heading">
                      Equipos en Cotización ({items.length})
                    </h2>
                  </div>
                  {items.length > 0 && (
                    <button 
                      type="button"
                      onClick={clearTray}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors px-2 py-1 rounded-md hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Vaciar</span>
                    </button>
                  )}
                </div>
                
                {fetchingProduct ? (
                  <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-cyan-600 animate-spin" />
                    <span className="text-xs text-slate-500 font-bold">Cargando producto seleccionado...</span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 text-slate-400">
                      <PackageSearch className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1 font-heading">Tu lista de cotización está vacía</h3>
                    <p className="text-slate-500 text-xs mb-5 max-w-xs">
                      Puedes agregar equipos desde el catálogo o describir tu requerimiento global en el formulario.
                    </p>
                    <Link 
                      to="/productos" 
                      className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-[#2C3E50] hover:bg-[#1E2B37] text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                    >
                      Explorar Catálogo Médico
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                    {items.map(item => (
                      <div key={item.id} className="p-4 flex items-center gap-3 hover:bg-slate-50/70 transition-colors">
                        
                        {/* Thumbnail */}
                        <div className="w-14 h-14 bg-white rounded-xl border border-slate-200/90 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                          ) : (
                            <FileText className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">{item.brand}</div>
                          <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">{item.name}</h4>
                          {item.model && <p className="text-[10px] text-slate-500 font-mono">Mod: {item.model}</p>}
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded hover:bg-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-4 text-center font-bold text-xs text-slate-800">
                            {item.quantity}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded hover:bg-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* Remove */}
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                          title="Eliminar de lista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Corporate Trust Cards */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2C3E50] font-heading">Tiempo de Respuesta Rápido</h4>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                      Cotizaciones desglosadas con fichas técnicas emitidas en un plazo menor a 24 horas hábiles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#2C3E50] shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2C3E50] font-heading">Validez para Licitaciones Públicas</h4>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                      Cumplimiento de términos de referencia para estudios de mercado ante MINSA, EsSalud y Gobiernos Regionales.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2C3E50] font-heading">Soporte Técnico Especializado</h4>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                      Acompañamiento biomédico, garantía de fábrica y servicio de post-venta directo.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Institutional Contact Form */}
            <div className="lg:col-span-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-md border border-slate-200">
                <h2 className="text-lg font-black text-[#2C3E50] mb-1 font-heading">
                  Datos del Solicitante
                </h2>
                <p className="text-xs text-slate-500 mb-6 pb-4 border-b border-slate-100">
                  Completa los datos para emitir la cotización con razón social y contacto técnico oficial.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="quote-fullName" className="block font-bold text-slate-700 mb-1 uppercase tracking-wide">
                      Nombre y Cargo del Responsable *
                    </label>
                    <input 
                      id="quote-fullName"
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50 text-slate-900 text-xs sm:text-sm" 
                      placeholder="Ej. Dr. Carlos Valdivia (Jefe de Biomédica)" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="quote-organization" className="block font-bold text-slate-700 mb-1 uppercase tracking-wide">
                        Institución / Empresa *
                      </label>
                      <input 
                        id="quote-organization"
                        type="text" 
                        required
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50 text-slate-900 text-xs sm:text-sm" 
                        placeholder="Ej. Hospital Regional / Clínica" 
                      />
                    </div>
                    <div>
                      <label htmlFor="quote-ruc" className="block font-bold text-slate-700 mb-1 uppercase tracking-wide">
                        RUC Institucional
                      </label>
                      <input 
                        id="quote-ruc"
                        type="text" 
                        value={ruc}
                        onChange={(e) => setRuc(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-mono" 
                        placeholder="Ej. 20XXXXXXXXX" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="quote-institutionType" className="block font-bold text-slate-700 mb-1 uppercase tracking-wide">
                        Sector / Régimen *
                      </label>
                      <select
                        id="quote-institutionType"
                        value={institutionType}
                        onChange={(e) => setInstitutionType(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-medium"
                      >
                        <option value="MINSA / EsSalud">MINSA / EsSalud</option>
                        <option value="Gobierno Regional / Red de Salud">Gobierno Regional / Red</option>
                        <option value="Fuerzas Armadas / Policiales">Fuerzas Armadas / Sanidad</option>
                        <option value="Clínica / Centro Privado">Clínica Privada</option>
                        <option value="Distribuidor / Consorcio">Distribuidor / Postor OSCE</option>
                        <option value="Profesional Independiente">Profesional Independiente</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="quote-region" className="block font-bold text-slate-700 mb-1 uppercase tracking-wide">
                        Región de Destino *
                      </label>
                      <input 
                        id="quote-region"
                        type="text" 
                        required
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50 text-slate-900 text-xs sm:text-sm" 
                        placeholder="Ej. Lima, Arequipa, Cusco..." 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="quote-email" className="block font-bold text-slate-700 mb-1 uppercase tracking-wide">
                        Correo Corporativo *
                      </label>
                      <input 
                        id="quote-email"
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50 text-slate-900 text-xs sm:text-sm" 
                        placeholder="logistica@hospital.gob.pe" 
                      />
                    </div>
                    <div>
                      <label htmlFor="quote-phone" className="block font-bold text-slate-700 mb-1 uppercase tracking-wide">
                        Teléfono / WhatsApp *
                      </label>
                      <input 
                        id="quote-phone"
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-mono" 
                        placeholder="+51 9XXXXXXXX" 
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="quote-notes" className="block font-bold text-slate-700 mb-1 uppercase tracking-wide">
                      Especificaciones Técnicas o Requerimientos de Entrega
                    </label>
                    <textarea 
                      id="quote-notes"
                      rows={3} 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50 text-slate-900 text-xs sm:text-sm resize-none" 
                      placeholder="Indique si requiere metrología inicial, capacitación para personal médico, accesorios adicionales o plazos de entrega específicos..."
                    />
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <input 
                      id="quote-terms" 
                      type="checkbox" 
                      required
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 border-slate-300 rounded text-cyan-600 focus:ring-brand-cyan"
                    />
                    <label htmlFor="quote-terms" className="text-[11px] text-slate-500 leading-snug">
                      Autorizo el tratamiento de datos institucionales para fines de emisión de cotización y expedientes técnicos de acuerdo a ley.
                    </label>
                  </div>
                  
                  <button 
                    id="btn-submit-quote"
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 bg-brand-cyan hover:bg-[#0087a3] active:bg-[#00768e] text-white font-bold px-5 rounded-xl transition-all shadow-md active:scale-[0.98] flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:pointer-events-none text-xs sm:text-sm uppercase tracking-wider font-heading cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generando Cotización...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Enviar Solicitud Formal de Cotización</span>
                      </>
                    )}
                  </button>
                  {submitError && (
                    <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
