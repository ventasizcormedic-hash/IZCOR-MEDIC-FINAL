import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Plus, Minus, AlertTriangle, FileText, Send, User } from 'lucide-react';
import { SeoHead } from '../components/seo/SeoHead';

const faqs = [
  {
    question: "¿Qué es la Farmacovigilancia y Tecnovigilancia?",
    answer: "Es la ciencia y actividades relativas a la detección, evaluación, comprensión y prevención de los efectos adversos de los medicamentos, vacunas y dispositivos médicos. En IZCOR MEDIC, velamos por la seguridad de todos los productos que distribuimos."
  },
  {
    question: "¿Qué debo reportar?",
    answer: "Cualquier sospecha de reacción adversa a un medicamento (RAM) o incidente adverso con un dispositivo médico, incluso si no está seguro de que el producto causó el problema."
  },
  {
    question: "¿Quién puede reportar?",
    answer: "Cualquier persona puede y debe reportar: profesionales de la salud (médicos, farmacéuticos, enfermeras), pacientes, familiares o representantes de instituciones."
  },
  {
    question: "¿Qué sucede con mi reporte?",
    answer: "Su reporte es estrictamente confidencial. Se evalúa por nuestro equipo de farmacovigilancia y se envía a la autoridad sanitaria competente (DIGEMID) para contribuir a la seguridad del producto a nivel nacional."
  }
];

export function Pharmacovigilance() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    patientName: '',
    contactEmail: '',
    contactPhone: '',
    productName: '',
    lotNumber: '',
    symptomDescription: '',
    isProfessional: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedReportCode, setGeneratedReportCode] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/pharmacovigilance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor (${res.status})`);
      }

      const data = await res.json();
      setGeneratedReportCode(data.reportCode || null);
      setSubmitSuccess(true);
      setFormData({
        patientName: '',
        contactEmail: '',
        contactPhone: '',
        productName: '',
        lotNumber: '',
        symptomDescription: '',
        isProfessional: false
      });
    } catch (err: any) {
      console.error('Error enviando reporte de farmacovigilancia:', err);
      setSubmitError(err.message || 'Error de conexión al enviar el reporte. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SeoHead
        title="Farmacovigilancia y Tecnovigilancia | IZCOR MEDIC"
        description="Reporte incidentes adversos y reacciones sospechosas relacionadas a medicamentos y dispositivos médicos. Plataforma oficial de Farmacovigilancia de IZCOR MEDIC."
        canonicalUrl="/farmacovigilancia"
      />

      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Header Banner */}
        <section className="bg-brand-navy text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6 border border-white/15 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              Seguridad del Paciente
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 font-heading tracking-tight">
              Farmacovigilancia y Tecnovigilancia
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Su reporte es vital. Ayúdenos a mantener los más altos estándares de seguridad en los productos médicos que proveemos al sector salud.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              
              {/* Left Column: Information & FAQs (FASE 16) */}
              <div>
                <div className="mb-10">
                  <h2 className="text-2xl font-black text-slate-900 mb-4 font-heading tracking-tight flex items-center gap-3">
                    <AlertTriangle className="w-7 h-7 text-amber-500" />
                    Información Importante
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    La farmacovigilancia es un pilar fundamental en la atención sanitaria. Todo incidente adverso sospechoso debe ser reportado inmediatamente para su investigación y trazabilidad según la normativa de DIGEMID.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 font-heading mb-4">Preguntas Frecuentes</h3>
                  {faqs.map((faq, index) => (
                    <div 
                      key={index}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors"
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left bg-white focus-visible:outline-none focus-visible:bg-slate-50 cursor-pointer"
                        aria-expanded={openFaqIndex === index}
                      >
                        <span className="font-bold text-sm text-slate-900 pr-4">{faq.question}</span>
                        {openFaqIndex === index ? (
                          <Minus className="w-5 h-5 text-brand-cyan shrink-0" />
                        ) : (
                          <Plus className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                      </button>
                      <AnimatePresence>
                        {openFaqIndex === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Reporting Form (FASE 17) */}
              <div>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-cyan to-blue-600" />
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-brand-cyan shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 font-heading">Formulario de Reporte</h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Reporte de síntomas o incidentes adversos
                      </p>
                    </div>
                  </div>

                  {submitSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center py-10"
                    >
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-emerald-900 mb-2">Reporte Registrado Oficialmente</h3>
                      {generatedReportCode && (
                        <div className="inline-block bg-white border border-emerald-300 rounded-xl px-4 py-2 my-2 shadow-2xs">
                          <span className="text-xs text-emerald-800 font-medium">Código de Radicado Sanitario: </span>
                          <span className="font-mono font-black text-emerald-900 text-sm">{generatedReportCode}</span>
                        </div>
                      )}
                      <p className="text-sm text-emerald-700 leading-relaxed mt-2">
                        Gracias por su reporte. Nuestro equipo técnico evaluará la información y la derivará a DIGEMID conforme a ley. Su contribución es vital para la seguridad sanitaria.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitSuccess(false);
                          setGeneratedReportCode(null);
                        }}
                        className="mt-6 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                      >
                        Enviar Otro Reporte
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {submitError && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{submitError}</span>
                        </div>
                      )}
                      
                      {/* Section 1: Datos del Paciente / Reportante */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-2">
                          <User className="w-4 h-4" />
                          1. Datos de Contacto
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 sm:col-span-2">
                            <label htmlFor="patientName" className="text-xs font-semibold text-slate-700">Nombre y Apellidos</label>
                            <input
                              type="text"
                              id="patientName"
                              name="patientName"
                              required
                              value={formData.patientName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all outline-none"
                              placeholder="Nombre completo"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label htmlFor="contactEmail" className="text-xs font-semibold text-slate-700">Correo Electrónico</label>
                            <input
                              type="email"
                              id="contactEmail"
                              name="contactEmail"
                              required
                              value={formData.contactEmail}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all outline-none"
                              placeholder="correo@ejemplo.com"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label htmlFor="contactPhone" className="text-xs font-semibold text-slate-700">Teléfono / Celular</label>
                            <input
                              type="tel"
                              id="contactPhone"
                              name="contactPhone"
                              required
                              value={formData.contactPhone}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all outline-none"
                              placeholder="Número de contacto"
                            />
                          </div>
                        </div>

                        <label className="flex items-start gap-3 mt-2 cursor-pointer group">
                          <div className="relative flex items-center justify-center mt-0.5">
                            <input 
                              type="checkbox"
                              name="isProfessional"
                              checked={formData.isProfessional}
                              onChange={handleInputChange}
                              className="peer sr-only"
                            />
                            <div className="w-5 h-5 rounded border border-slate-300 bg-white group-hover:border-brand-cyan peer-checked:bg-brand-cyan peer-checked:border-brand-cyan transition-colors" />
                            <ShieldCheck className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                          </div>
                          <span className="text-xs text-slate-600 font-medium">Soy un profesional de la salud reportando en nombre de un paciente.</span>
                        </label>
                      </div>

                      {/* Section 2: Producto */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-2">
                          <AlertTriangle className="w-4 h-4" />
                          2. Producto Médico
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 sm:col-span-2">
                            <label htmlFor="productName" className="text-xs font-semibold text-slate-700">Nombre del Producto / Dispositivo</label>
                            <input
                              type="text"
                              id="productName"
                              name="productName"
                              required
                              value={formData.productName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all outline-none"
                              placeholder="Ej. Monitor Multiparámetro Mod. X"
                            />
                          </div>
                          <div className="space-y-1.5 sm:col-span-2">
                            <label htmlFor="lotNumber" className="text-xs font-semibold text-slate-700">Lote o Serie (Opcional)</label>
                            <input
                              type="text"
                              id="lotNumber"
                              name="lotNumber"
                              value={formData.lotNumber}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all outline-none"
                              placeholder="Número de serie o lote del producto"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Síntoma */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-2">
                          <FileText className="w-4 h-4" />
                          3. Descripción
                        </h3>
                        
                        <div className="space-y-1.5">
                          <label htmlFor="symptomDescription" className="text-xs font-semibold text-slate-700">Descripción del Síntoma o Incidente Adverso</label>
                          <textarea
                            id="symptomDescription"
                            name="symptomDescription"
                            required
                            rows={4}
                            value={formData.symptomDescription}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all outline-none resize-none"
                            placeholder="Describa con detalle lo sucedido, fecha de inicio, duración y gravedad..."
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary h-12 flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Enviar Reporte Confidencial</span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-slate-400 text-center">
                        Sus datos serán tratados con estricta confidencialidad según la Ley de Protección de Datos Personales (Ley N° 29733).
                      </p>
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
