import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Phone, Mail, MapPin, Clock, Send, CheckCircle2, 
  Building2, MessageCircle, ShieldCheck, FileCheck2, AlertCircle
} from 'lucide-react';
import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    email: '',
    phone: '',
    subject: 'Cotización de Equipos Médicos',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setContactError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error del servidor (${res.status})`);
      }
      setSubmitted(true);
    } catch (err: any) {
      setContactError(err.message || 'Error de red. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SeoHead
        title="Contáctanos | IZCOR MEDIC - Central de Atención y Ventas"
        description="Comunícate con nuestros asesores biomédicos y especialistas en licitaciones hospitalarias. Teléfono, WhatsApp, correo y atención presencial en Lima, Perú."
        canonicalUrl="/contacto"
      />

      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Header Banner */}
        <section className="bg-[#2C3E50] text-white py-16 sm:py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
              <Phone className="w-3.5 h-3.5" />
              Canales de Atención Institucional
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 font-heading tracking-tight">
              Contáctanos
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Estamos listos para atender tus requerimientos técnicos, pedidos de cotización y consultas de licitación con rapidez y rigor profesional.
            </p>
          </div>
        </section>

        {/* 2-Column Contact Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Direct Contact Info & Corporate Trust */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-[#2C3E50] font-heading border-b border-slate-100 pb-3">
                    Información Directa
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-semibold">Central Telefónica / WhatsApp</div>
                        <a href="https://wa.me/51928130349" target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-900 hover:text-cyan-700 transition-colors">
                          +51 928 130 349
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#2C3E50] shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-semibold">Correo de Ventas y Licitaciones</div>
                        <a href="mailto:ventasizcormedic@gmail.com" className="text-sm font-bold text-slate-900 hover:text-cyan-700 transition-colors">
                          ventasizcormedic@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-semibold">Sede Principal & Despacho</div>
                        <div className="text-sm font-bold text-slate-900">
                          Lima, Perú (Despachos y Cobertura Nacional)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-semibold">Horario de Atención</div>
                        <div className="text-sm font-bold text-slate-900">
                          Lunes a Viernes: 8:30 AM - 6:30 PM <br />
                          Sábados: 9:00 AM - 1:00 PM
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct WhatsApp Box */}
                <div className="bg-[#25D366]/10 border border-[#25D366]/30 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">¿Atención Urgente por WhatsApp?</h3>
                    <p className="text-slate-600 text-xs mt-0.5">Respuesta inmediata de un asesor comercial.</p>
                  </div>
                  <a
                    href="https://wa.me/51928130349?text=Hola%20IZCOR%20MEDIC,%20solicito%20informaci%C3%B3n%20urgente"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Escribir</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Contact Message Form */}
              <div className="lg:col-span-7">
                <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md">
                  <h2 className="text-xl font-bold text-[#2C3E50] mb-2 font-heading">
                    Envíanos tu Mensaje o Consulta
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mb-8">
                    Completa los datos de tu institución y te responderemos a la brevedad con información técnica y comercial.
                  </p>

                  {submitted ? (
                    <div className="py-12 text-center flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 font-heading mb-1">
                        ¡Mensaje Enviado con Éxito!
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-6">
                        Hemos recibido tu solicitud. Nuestro equipo comercial se comunicará contigo al correo o teléfono proporcionado en menos de 24 horas.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="px-5 py-2.5 rounded-xl bg-[#2C3E50] text-white text-xs font-bold hover:bg-[#1E2B37] transition-all"
                      >
                        Enviar otra consulta
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                            Nombre y Apellidos *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej. Dr. Carlos Mendoza"
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                            Institución / Empresa
                          </label>
                          <input
                            type="text"
                            value={formData.institution}
                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                            placeholder="Ej. Clínica San Pablo / Hospital"
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                            Correo Corporativo *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="contacto@institucion.pe"
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                            Teléfono / WhatsApp *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+51 900 000 000"
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                          Motivo de Consulta
                        </label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50"
                        >
                          <option value="Cotización de Equipos Médicos">Cotización de Equipos Médicos</option>
                          <option value="Procesos de Licitación / TDR">Procesos de Licitación / TDR</option>
                          <option value="Servicio Técnico y Calibración">Servicio Técnico y Calibración</option>
                          <option value="Distribución y Alianzas">Distribución y Alianzas</option>
                          <option value="Otro Requerimiento">Otro Requerimiento</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                          Mensaje o Detalle del Requerimiento *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Describe los equipos, marcas o especificaciones que necesitas cotizar..."
                          className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all bg-slate-50/50"
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="cyan"
                        size="lg"
                        fullWidth
                        isLoading={loading}
                        loadingText="Enviando solicitud..."
                        leftIcon={!loading ? <Send className="w-4 h-4" aria-hidden="true" /> : undefined}
                        className="uppercase tracking-wider"
                      >
                        Enviar Solicitud
                      </Button>
                      {contactError && (
                        <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{contactError}</span>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </>
  );
}
