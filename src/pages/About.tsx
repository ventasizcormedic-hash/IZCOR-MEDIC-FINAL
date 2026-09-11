import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Building2, ShieldCheck, Award, Users, CheckCircle2, 
  Clock, Truck, Phone, Mail, FileText, ArrowRight, HeartPulse,
  Activity, Sparkles
} from 'lucide-react';
import { SeoHead } from '../components/seo/SeoHead';
import { TestimonialsSection } from '../components/home/TestimonialsSection';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

export function About() {
  return (
    <>
      <SeoHead
        title="Nosotros | IZCOR MEDIC - Proveedor Institucional de Salud"
        description="Conoce más sobre IZCOR MEDIC S.A.C., empresa peruana especializada en tecnología biomédica, equipamiento clínico e insumos médicos con certificación DIGEMID y homologación OSCE."
        canonicalUrl="/nosotros"
      />

      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Hero Header */}
        <section className="bg-[#2C3E50] text-white py-16 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C3E50] via-[#1E2B37] to-[#2C3E50] opacity-95" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
                <Building2 className="w-3.5 h-3.5" />
                Compromiso con el Sector Salud
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 font-heading tracking-tight">
                Acerca de IZCOR MEDIC
              </h1>
              <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                Empresa especializada en el suministro, distribución e implementación de tecnología médica de vanguardia para instituciones públicas y privadas en todo el territorio nacional.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Corporate Identity & Values */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-2 font-heading">
                  Nuestra Trayectoria
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#2C3E50] mb-6 font-heading tracking-tight">
                  Aliados Estratégicos en Infraestructura Hospitalaria
                </h2>
                <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                  <p>
                    En <strong>IZCOR MEDIC S.A.C.</strong>, entendemos que la precisión médica salva vidas. Por ello, proveemos soluciones biomédicas integrales, desde equipamiento para Unidades de Cuidados Intensivos (UCI) y centros quirúrgicos, hasta mobiliario clínico de alta resistencia e insumos descartables.
                  </p>
                  <p>
                    Trabajamos directamente con fabricantes y marcas internacionales certificadas, garantizando registros sanitarios <strong>DIGEMID</strong>, homologación de especificaciones técnicas para procesos <strong>OSCE</strong> y soporte técnico continuo.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="text-2xl font-black text-[#2C3E50] font-heading">+500</div>
                    <div className="text-xs font-semibold text-slate-500">Equipos e Insumos en Catálogo</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="text-2xl font-black text-cyan-600 font-heading">100%</div>
                    <div className="text-xs font-semibold text-slate-500">Homologación y Trazabilidad</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Calidad',
                    icon: ShieldCheck,
                    color: 'text-cyan-600',
                    bg: 'bg-cyan-50',
                    border: 'border-cyan-100',
                    desc: 'Aseguramos los más altos estándares técnicos y certificaciones en todo nuestro equipamiento biomédico.'
                  },
                  {
                    title: 'Liderazgo',
                    icon: Award,
                    color: 'text-[#2C3E50]',
                    bg: 'bg-slate-100',
                    border: 'border-slate-200',
                    desc: 'Marcamos la pauta en innovación y distribución institucional para el sector salud peruano.'
                  },
                  {
                    title: 'Compromiso',
                    icon: HeartPulse,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-100',
                    desc: 'Dedicación total a la mejora continua y al soporte ininterrumpido de nuestros clientes clínicos.'
                  },
                  {
                    title: 'Ética',
                    icon: CheckCircle2,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                    border: 'border-blue-100',
                    desc: 'Transparencia absoluta en todas nuestras operaciones, licitaciones y relaciones comerciales.'
                  }
                ].map((val, i) => (
                  <div 
                    key={i} 
                    className="group relative h-48 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                    tabIndex={0}
                  >
                    {/* Front: Clean composition */}
                    <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center transition-opacity duration-300 group-hover:opacity-0 group-focus:opacity-0">
                      <div className={`w-14 h-14 rounded-2xl ${val.bg} ${val.border} border flex items-center justify-center ${val.color} mb-3`}>
                        <val.icon className="w-7 h-7" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg font-heading">{val.title}</h3>
                    </div>
                    
                    {/* Back: Revealed content on hover/focus */}
                    <div className="absolute inset-0 p-6 bg-[#2C3E50] flex flex-col items-center justify-center text-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0 transition-all duration-300">
                      <h3 className="font-bold text-cyan-400 text-lg font-heading mb-2">{val.title}</h3>
                      <p className="text-white text-sm leading-relaxed">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <TestimonialsSection />

        {/* CTA Section */}
        <section className="py-14 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-black text-[#2C3E50] mb-3 font-heading">
              ¿Listo para coordinar el abastecimiento de tu institución?
            </h2>
            <p className="text-slate-600 text-sm mb-6 max-w-xl mx-auto">
              Contáctanos para recibir asesoría biomédica personalizada o envíanos tus términos de referencia para cotización inmediata.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/cotizar"
                className="px-6 py-3 rounded-xl bg-brand-cyan hover:bg-[#0087a3] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
              >
                Solicitar Cotización
              </Link>
              <Link
                to="/contacto"
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2C3E50] font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
              >
                Contáctanos
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
