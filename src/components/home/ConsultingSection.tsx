import { motion } from 'motion/react';
import { 
  Users, ShieldCheck, FileCheck, ArrowRight, 
  Stethoscope, Sparkles, MessageCircle
} from 'lucide-react';
import { InteractiveCtaButton } from '../common/InteractiveCtaButton';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

export function ConsultingSection() {
  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      'Estimado equipo de IZCOR MEDIC, deseo solicitar asesoramiento técnico y homologación para un requerimiento de equipamiento médico.'
    );
    return `https://wa.me/51928130349?text=${text}`;
  };

  return (
    <section 
      id="consultoria-izcor-medic" 
      className="py-20 sm:py-28 bg-[#0D2232] text-white relative overflow-hidden border-b border-white/10"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#00B9D8]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#1E5872]/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: 3 Core Brand Pillars */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>01 Tecnología • 02 Personas • 03 Respaldo</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight mb-5">
            Detrás de Cada Equipo Hay un Especialista que te Acompaña
          </h2>
          
          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
            En IZCOR MEDIC no solo suministramos tecnología hospitalaria: entendemos la necesidad clínica, analizamos tus especificaciones técnicas y te respaldamos con asesoría continua.
          </p>
        </div>

        {/* 2-Column Showcase: Real Advisory Photography + Strategic Pillar Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-16">
          
          {/* Left Column: Authentic Photography of IZCOR Advisory Team */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl group bg-[#162B3B]">
              <img 
                src="/assets/izcor_consulting_team.jpg" 
                alt="Equipo de Asesoría Biomédica y Comercial de IZCOR MEDIC" 
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover object-center aspect-[16/10] group-hover:scale-102 transition-transform duration-500"
              />
              {/* Subtle Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D2232]/90 via-transparent to-transparent pointer-events-none" />

              {/* Floating Overlay Badge on Photo */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-4 rounded-xl bg-[#0D2232]/90 border border-white/15 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                      Asesoría Directa de Ingenieros y Especialistas
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Evaluación técnica personalizada para centros de salud en todo el Perú
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: The 3 Corporate Commitments */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lg:col-span-6 flex flex-col gap-5"
          >
            {/* Pillar 1: Entendimiento Clínico */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.08] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Stethoscope className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                    Entendimiento de la Necesidad Clínica
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Evaluamos el nivel de complejidad asistencial de su servicio (UCI, emergencia, sala de operaciones o policlínico) para recomendar la configuración técnica más precisa.
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 2: Respaldo Documental y OSCE */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.08] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                    Homologación y Respaldo Documentario
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Suministramos fichas técnicas homologadas, registros sanitarios DIGEMID, manuales de servicio y sustento técnico listo para auditorías, comités de compra y licitaciones OSCE.
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 3: Acompañamiento Post-Venta y Suministro */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.08] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                    Garantía y Acompañamiento Continuo
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    No terminamos en la entrega: coordinamos puesta en marcha, capacitación a su personal asistencial y disponibilidad continua de repuestos y consumibles.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar con Micro-Previews IA */}
            <div className="pt-2 flex flex-wrap items-center gap-3 relative z-30">
              <InteractiveCtaButton
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-consulting-whatsapp"
                variant="whatsapp"
                previewImage="/assets/ai/cta_advisor_whatsapp.jpg"
                previewTitle="Asesoría Personalizada"
                previewSubtitle="Atención directa con ingenieros biomédicos y especialistas comerciales."
                previewPosition="top"
                icon={<MessageCircle className="w-4 h-4 shrink-0" />}
                iconPosition="left"
                className="text-xs sm:text-sm font-bold uppercase tracking-wider"
              >
                Hablar con un Asesor
              </InteractiveCtaButton>

              <InteractiveCtaButton
                to="/cotizar"
                id="btn-consulting-quote"
                variant="secondary"
                previewImage="/assets/ai/cta_quote_consultation.jpg"
                previewTitle="Cotización Técnico-Económica"
                previewSubtitle="Propuesta formal con registros sanitarios y fichas técnicas homologadas."
                previewPosition="top"
                icon={<ArrowRight className="w-4 h-4 shrink-0" />}
                iconPosition="right"
                className="text-xs sm:text-sm font-bold uppercase tracking-wider"
              >
                Solicitar Cotización
              </InteractiveCtaButton>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
