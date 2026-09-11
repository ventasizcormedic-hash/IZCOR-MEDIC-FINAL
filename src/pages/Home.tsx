import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import { 
  Search, ChevronRight, ShieldCheck, Truck, Award, Activity, 
  Stethoscope, Microscope, Bed, Syringe, Building2,
  PackageCheck, PhoneCall, CheckCircle2, ArrowRight, Headset,
  FileText, FileCheck2, Clock, Check, Sparkles, MessageCircle,
  Hospital, Layers, HeartPulse, ChevronDown, ChevronLeft
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { MedicalSearchBox } from '../components/catalog/MedicalSearchBox';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { SeoHead } from '../components/seo/SeoHead';
import { ConsultingSection } from '../components/home/ConsultingSection';
import { InteractiveCtaButton } from '../components/common/InteractiveCtaButton';

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Animated Counter Component
function AnimatedCounter({ end, suffix = '' }: { end: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 1800;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isInView, end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // FASE 07: Banner Interactivo
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Soluciones Médicas y Suministro Integral para Instituciones de Salud",
      subtitle: "Catálogo multimarca con fichas técnicas homologadas, trazabilidad clínica y cotizaciones inmediatas para hospitales, clínicas, laboratorios y comités de compra en todo el Perú."
    },
    {
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Equipamiento de Alta Complejidad para UCI",
      subtitle: "Monitores multiparámetro, ventiladores mecánicos y camas eléctricas con certificación internacional y soporte técnico continuo."
    },
    {
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      title: "Instrumental Quirúrgico de Precisión",
      subtitle: "Acero alemán certificado para intervenciones críticas. Cajas quirúrgicas completas y herramientas especializadas para cada especialidad."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const quickSearchSuggestions = [
    'Monitores UCI',
    'Camas Eléctricas',
    'Ecógrafos',
    'Bombas de Infusión',
    'Instrumental Quirúrgico',
    'Mobiliario Clínico',
  ];

  useEffect(() => {
    setLoadingProducts(true);
    fetch('/api/products?limit=12')
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : (data.items || []);
        setProducts(items);
        setFilteredProducts(items.slice(0, 8));
        setLoadingProducts(false);
      })
      .catch(err => {
        console.error('Error fetching featured products:', err);
        setLoadingProducts(false);
      });
  }, []);

  const handleTabChange = (tab: string) => {
    setSelectedCategoryTab(tab);
    if (tab === 'all') {
      setFilteredProducts(products.slice(0, 8));
    } else {
      const filtered = products.filter(p => {
        const cat = (p.categoryName || '').toLowerCase();
        if (tab === 'equipos') return cat.includes('equipo') || cat.includes('uci') || cat.includes('monitor');
        if (tab === 'mobiliario') return cat.includes('mobiliario') || cat.includes('cama') || cat.includes('camilla');
        if (tab === 'diagnostico') return cat.includes('diagn') || cat.includes('ecograf') || cat.includes('electro');
        if (tab === 'instrumental') return cat.includes('instrumental') || cat.includes('quirurg');
        return true;
      });
      setFilteredProducts(filtered.length > 0 ? filtered.slice(0, 8) : products.slice(0, 8));
    }
  };

  const getWhatsAppLink = (customText?: string) => {
    const text = encodeURIComponent(
      customText || 'Estimados IZCOR MEDIC, requiero información y cotización formal de equipamiento médico para mi institución.'
    );
    return `https://wa.me/51928130349?text=${text}`;
  };

  const homeSchema = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "IZCOR MEDIC",
      "url": typeof window !== 'undefined' ? window.location.origin : "https://izcormedic.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": (typeof window !== 'undefined' ? window.location.origin : "https://izcormedic.com") + "/productos?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "IZCOR MEDIC",
      "url": typeof window !== 'undefined' ? window.location.origin : "https://izcormedic.com",
      "logo": (typeof window !== 'undefined' ? window.location.origin : "https://izcormedic.com") + "/assets/izcor_logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+51-928-130-349",
        "contactType": "customer service",
        "areaServed": "PE",
        "availableLanguage": "es"
      }
    }
  ];

  return (
    <>
      <SeoHead
        title="IZCOR MEDIC | Soluciones Médicas y Equipamiento para Instituciones de Salud"
        description="Plataforma corporativa de tecnología, equipamiento e insumos médicos con fichas técnicas homologadas para hospitales, clínicas, laboratorios e instituciones públicas y privadas en Perú."
        canonicalUrl="/"
        schemaObj={homeSchema}
      />
      
      <main id="homepage-main" className="min-h-screen bg-[#F8FAFC] overflow-hidden">
        
        {/* 1. HERO SECTION MASTER (Formato Cinematográfico 16:9 con 3 Capas de Profundidad) */}
        <section 
          id="hero-master-izcor"
          className="relative min-h-[660px] lg:min-h-[820px] flex items-center overflow-hidden bg-[#0D2232] text-white"
        >
          {/* CAPA 1: Fotografía Corporativa Médica Realista en Alta Resolución */}
          <div 
            className="absolute inset-0 bg-cover bg-no-repeat bg-[center_right_15%] sm:bg-[center_right] lg:bg-[right_center] transition-transform duration-1000 scale-100"
            style={{ 
              backgroundImage: "url('/assets/hero_surgical_consultation.jpg')",
            }}
            aria-hidden="true"
          />

          {/* CAPA 1.5: Gradientes Institucionales de Alta Precisión */}
          {/* Overlay Desktop (Fórmula Oficial: 90deg con absorción progresiva hacia la derecha) */}
          <div className="absolute inset-0 hidden lg:block bg-izcor-hero-overlay pointer-events-none" />
          
          {/* Overlay Mobile / Tablet (180deg vertical para legibilidad óptima) */}
          <div className="absolute inset-0 block lg:hidden bg-izcor-hero-overlay-mobile pointer-events-none" />

          {/* Transición suave inferior hacia la barra de métricas */}
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0D2232] via-[#0D2232]/80 to-transparent pointer-events-none" />

          {/* CAPA 2 & 3: Composición de Contenido + Monitor 3D */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-16 sm:py-20 lg:py-24">
            <div className="brand-hero-panel brand-hero-panel--editorial rounded-[2rem] border border-white/10 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Lado Izquierdo: Jerarquía de Mensaje, Buscador y Tríada de CTAs */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="lg:col-span-12 flex flex-col items-start text-left"
              >
                {/* Badge Institucional en Vivo */}
                <motion.div variants={fadeUp} className="mb-4 sm:mb-5">
                  <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-[11px] font-black tracking-[0.18em] uppercase shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#00B9D8] animate-pulse shadow-[0_0_18px_rgba(0,185,216,0.9)]" />
                    <span className="text-cyan-300">
                      Soluciones para instituciones de salud
                    </span>
                  </div>
                </motion.div>

                {/* Titular Principal del Hero */}
                <motion.h1 
                  variants={fadeUp}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-black text-white leading-[0.9] mb-5 tracking-[-0.065em] font-heading max-w-[39rem] [text-shadow:0_10px_35px_rgba(15,23,42,0.55)]"
                >
                  Soluciones médicas para{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B9D8] via-[#32D4E9] to-[#8FEAFF]">
                    hospitales que exigen precisión
                  </span>
                </motion.h1>

                {/* Subtítulo Institucional */}
                <motion.p 
                  variants={fadeUp}
                  className="text-base sm:text-lg md:text-xl text-slate-200 mb-8 leading-relaxed font-normal max-w-2xl opacity-95"
                >
                  Equipamiento clínico, instrumental quirúrgico y apoyo técnico para hospitales, clínicas, laboratorios y comités de compra que necesitan calidad, trazabilidad y respuesta rápida.
                </motion.p>

                {/* Buscador Rápido Integrado */}
                <motion.div variants={fadeUp} className="w-full max-w-xl mb-7">
                  <div className="institutional-cta-shell p-2 rounded-2xl backdrop-blur-md shadow-[0_18px_50px_rgba(15,23,42,0.32)]">
                    <MedicalSearchBox
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      onSearchSubmit={(query) => {
                        const term = query !== undefined ? query : searchTerm;
                        if (term.trim()) {
                          navigate(`/productos?search=${encodeURIComponent(term.trim())}`);
                        }
                      }}
                      placeholder="Buscar por equipo, modelo, fabricante, SKU, marca..."
                    />
                  </div>

                  {/* Sugerencias Rápidas de Búsqueda */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-0.5">
                    <span className="text-[11px] font-semibold text-slate-300 mr-1">
                      Frecuentes:
                    </span>
                    {quickSearchSuggestions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => navigate(`/productos?search=${encodeURIComponent(tag)}`)}
                        className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white text-[11px] font-medium transition-all active:scale-95 cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Tríada de CTAs con Micro-Previews Visuales IA al Hover */}
                <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10 w-full relative z-30">
                  {/* CTA Principal: Explorar Catálogo */}
                  <InteractiveCtaButton
                    to="/productos"
                    id="btn-hero-catalog"
                    variant="primary"
                    title="Explorar catálogo médico completo de IZCOR MEDIC"
                    previewImage="/assets/ai/cta_catalog_equipment.jpg"
                    previewTitle="Equipamiento Hospitalario Homologado"
                    previewSubtitle="Monitores UCI, bombas de infusión e instrumental de precisión."
                    previewPosition="top"
                    icon={<ArrowRight className="w-4 h-4 shrink-0" />}
                    iconPosition="right"
                  >
                    EXPLORAR CATÁLOGO
                  </InteractiveCtaButton>

                  {/* CTA Secundario: Solicitar Cotización */}
                  <InteractiveCtaButton
                    to="/cotizar"
                    id="btn-hero-quote"
                    variant="secondary"
                    title="Solicitar cotización formal para su centro médico"
                    previewImage="/assets/ai/cta_quote_consultation.jpg"
                    previewTitle="Cotización Técnico-Económica"
                    previewSubtitle="Te asesoramos para encontrar la solución biomédica exacta."
                    previewPosition="top"
                    icon={<FileCheck2 className="w-4 h-4 text-cyan-300 shrink-0" />}
                    iconPosition="left"
                  >
                    SOLICITAR COTIZACIÓN
                  </InteractiveCtaButton>

                  {/* CTA Humano: Hablar con un Asesor (WhatsApp) */}
                  <InteractiveCtaButton
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    id="btn-hero-human-advisor"
                    variant="whatsapp"
                    title="Atención y asesoría inmediata por WhatsApp"
                    previewImage="/assets/ai/cta_advisor_whatsapp.jpg"
                    previewTitle="Asesoría Biomédica Personalizada"
                    previewSubtitle="Contacto directo con especialistas comerciales e ingenieros clínicos."
                    previewPosition="top"
                    icon={<MessageCircle className="w-4 h-4 shrink-0" />}
                    iconPosition="left"
                  >
                    HABLAR CON UN ASESOR
                  </InteractiveCtaButton>
                </motion.div>

                {/* Barra de Confianza y Acreditaciones Rápidas */}
                <motion.div 
                  variants={fadeUp}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl pt-6 border-t border-white/15"
                >
                  <div className="premium-stat rounded-2xl p-3.5 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold text-xs">Marcas Homologadas</div>
                      <div className="text-slate-400 text-[10px]">Garantía y trazabilidad</div>
                    </div>
                  </div>

                  <div className="premium-stat rounded-2xl p-3.5 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold text-xs">Licitaciones & OSCE</div>
                      <div className="text-slate-400 text-[10px]">Expedientes técnicos listos</div>
                    </div>
                  </div>

                  <div className="premium-stat rounded-2xl p-3.5 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center shrink-0">
                      <Headset className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold text-xs">Asesoría Biomédica</div>
                      <div className="text-slate-400 text-[10px]">Especialistas dedicados</div>
                    </div>
                  </div>
                </motion.div>

              </motion.div>

            </div>
            </div>
          </div>
        </section>

        {/* FASE 08: CERTIFICACIONES DIGEMID */}
        <section className="official-certification-section bg-white py-8 border-b border-slate-200/80">
          <div className="official-certification-artwork-wrap">
            <img
              className="official-certification-artwork"
              src="/assets/certificaciones-oficiales-premium.png"
              alt="Certificaciones oficiales de IZCOR MEDIC"
            />
          </div>
        </section>

        {/* 2. INSTITUTIONAL METRICS & CAPACITY BAR */}
        <section className="bg-[#0D2232] py-12 border-b border-white/10 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 divide-x-0 md:divide-x divide-white/10 text-center">
              {[
                { value: `+${<AnimatedCounter end={500} />}`, label: 'Equipos e Insumos Médicos' },
                { value: `+${<AnimatedCounter end={50} />}`, label: 'Marcas y Fabricantes' },
                { value: <AnimatedCounter end={100} suffix="%" />, label: 'Fichas Homologadas' },
                { value: 'PERÚ', label: 'Cobertura y Despacho Nacional' },
              ].map((stat, index) => (
                <div key={index} className="premium-stat rounded-2xl px-3 py-5">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-1.5 tracking-tight font-heading">
                    {stat.value}
                  </div>
                  <div className="text-[#00B9D8] font-bold text-xs sm:text-sm tracking-wider uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. MEDICAL CATEGORIES (Structured Exploration by Clinical Line) */}
        <section id="categories-section" className="py-20 sm:py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp} 
              className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14"
            >
              <div>
                <div className="section-kicker mb-2">
                  <Activity className="w-4 h-4" />
                  Líneas de Especialidad
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2C3E50] tracking-tight [letter-spacing:-0.04em]">
                  Explora por Especialidad y Tipo de Equipamiento
                </h2>
                <p className="text-slate-600 max-w-2xl font-normal text-sm sm:text-base mt-2">
                  Disponemos de líneas completas para cubrir las demandas de infraestructura hospitalaria, centros quirúrgicos, unidades críticas y policlínicos.
                </p>
              </div>

              <Link 
                to="/productos" 
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#2C3E50] hover:text-brand-cyan transition-colors uppercase tracking-wider shrink-0"
              >
                <span>Ver Todas las Categorías</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  title: 'Equipos Médicos & UCI', 
                  items: 'Monitores multiparámetro • Bombas de infusión • Desfibriladores • Ventiladores mecánicos', 
                  icon: Activity, 
                  slug: 'equipos-medicos',
                  badge: 'Alta Complejidad',
                  image: '/assets/ai/cat_equipos_uci.jpg'
                },
                { 
                  title: 'Mobiliario Clínico & Hospitalario', 
                  items: 'Camas eléctricas UCI • Camillas de transporte • Vitrinas de acero quirúrgico • Mesas de noche', 
                  icon: Bed, 
                  slug: 'mobiliario-clinico',
                  badge: 'Grado Hospitalario',
                  image: '/assets/ai/cat_mobiliario_clinico.jpg'
                },
                { 
                  title: 'Diagnóstico & Monitoreo', 
                  items: 'Ecógrafos doppler • Electrocardiógrafos • Pulsioxímetros • Doppler fetal', 
                  icon: Microscope, 
                  slug: 'diagnostico-y-monitoreo',
                  badge: 'Precisión Clínica',
                  image: '/assets/ai/cat_diagnostico_monitoreo.jpg'
                },
                { 
                  title: 'Instrumental Quirúrgico', 
                  items: 'Pinzas hemostáticas • Tijeras de disección • Separadores • Cajas quirúrgicas completas', 
                  icon: Stethoscope, 
                  slug: 'instrumental-quirurgico',
                  badge: 'Acero Alemán / Certificado',
                  image: '/assets/ai/cat_instrumental_quirurgico.jpg'
                },
                { 
                  title: 'Insumos Médicos & Descartables', 
                  items: 'Material médico estéril • Apósitos • Sondas • Catéteres • Guantes quirúrgicos', 
                  icon: Syringe, 
                  slug: 'insumos-descartables',
                  badge: 'Suministro Continuo',
                  image: '/assets/ai/cat_insumos_descartables.jpg'
                },
                { 
                  title: 'Suministro Institucional & TDR', 
                  items: 'Kits hospitalarios integrales • Homologación de expedientes • Paquetes para licitación', 
                  icon: PackageCheck, 
                  href: '/tdr',
                  badge: 'Procesos OSCE',
                  image: '/assets/ai/cta_tdr_procurement.jpg'
                },
              ].map((cat, i) => (
                <motion.div 
                  key={i}
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeUp}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full relative overflow-hidden"
                  onClick={() => navigate((cat as any).href || (cat.slug ? `/productos?category=${cat.slug}` : '/productos'))}
                >
                  <div className="absolute top-0 left-0 h-1 w-0 bg-brand-cyan transition-all duration-300 group-hover:w-full z-20" />
                  
                  {/* Visual Header con Imagen IA */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={cat.image} 
                      alt={cat.title} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
                    
                    {/* Badge sobre imagen */}
                    <div className="absolute top-3.5 right-3.5 z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#0D2232]/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 shadow-xs">
                        {cat.badge}
                      </span>
                    </div>

                    {/* Icono flotante integrado */}
                    <div className="absolute bottom-3 left-4 z-10 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-md text-[#0D2232] group-hover:bg-brand-cyan group-hover:text-white transition-colors">
                      <cat.icon className="w-5 h-5 transition-colors" strokeWidth={1.8} />
                    </div>
                  </div>

                  {/* Contenido de la Tarjeta */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#2C3E50] mb-2 group-hover:text-brand-cyan transition-colors font-heading leading-snug">
                        {cat.title}
                      </h3>
                      <p className="text-slate-500 font-normal text-xs leading-relaxed mb-4">
                        {cat.items}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2C3E50] group-hover:text-brand-cyan transition-colors uppercase tracking-wider">
                      <span>{(cat as any).href ? 'Cargar Requerimiento / TDR' : 'Explorar Equipos'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. FEATURED PRODUCTS SHOWCASE (Standardized ProductCard with Actions) */}
        <section id="featured-products-section" className="py-20 sm:py-24 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp} 
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
            >
              <div>
                <div className="section-kicker mb-2">
                  <Sparkles className="w-4 h-4" />
                  Catálogo Seleccionado
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2C3E50] tracking-tight [letter-spacing:-0.04em]">
                  Productos y Equipamiento Destacado
                </h2>
                <p className="text-slate-600 font-normal text-sm sm:text-base mt-2">
                  Equipamiento de alta demanda hospitalaria con especificaciones técnicas completas y cotización inmediata.
                </p>
              </div>

              <Link 
                to="/productos" 
                className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2C3E50] text-xs font-bold transition-all shrink-0"
              >
                <span>Ver Catálogo Completo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Category Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-8 pb-2 border-b border-slate-100">
              {[
                { id: 'all', label: 'Todos los Destacados' },
                { id: 'equipos', label: 'Equipos Médicos & UCI' },
                { id: 'mobiliario', label: 'Mobiliario Clínico' },
                { id: 'diagnostico', label: 'Diagnóstico & Monitoreo' },
                { id: 'instrumental', label: 'Instrumental Quirúrgico' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategoryTab === tab.id
                      ? 'bg-brand-navy text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* FASE 09: Carrusel Horizontal de Productos */}
            {loadingProducts ? (
              <div className="flex overflow-x-auto gap-6 hide-scrollbar pb-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="min-w-[280px] sm:min-w-[320px] bg-slate-50 rounded-2xl border border-slate-200 p-4 h-80 animate-pulse flex flex-col justify-between shrink-0">
                    <div className="aspect-[4/3] bg-slate-200 rounded-xl mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div className="h-9 bg-slate-200 rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="flex overflow-x-auto gap-6 pb-6 pt-2 px-1 snap-x snap-mandatory hide-scrollbar">
                {filteredProducts.map((product) => (
                  <motion.div 
                    key={product.id}
                    initial="hidden" 
                    whileInView="visible" 
                    viewport={{ once: true }} 
                    variants={fadeUp}
                    className="min-w-[280px] sm:min-w-[300px] lg:min-w-[320px] snap-center shrink-0"
                  >
                    <ProductCard 
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      model={product.model}
                      brandName={product.brandName || 'IZCOR MEDIC'}
                      manufacturer={product.manufacturer}
                      categoryName={product.categoryName}
                      imageUrl={product.imageUrl}
                      images={product.images}
                      verificationStatus={product.verificationStatus}
                      isFeatured={true}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-slate-500 font-medium text-sm">No se encontraron productos en esta categoría.</p>
                <Link to="/productos" className="mt-3 inline-block text-xs font-bold text-brand-navy hover:underline">
                  Explorar todo el catálogo →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 5. MEDICAL TRUST & PROCUREMENT VALUE (Why IZCOR) */}
        <section className="py-20 sm:py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp} 
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-cyan uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                Garantía y Cumplimiento
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2C3E50] tracking-tight">
                ¿Por Qué Instituciones de Salud Confían en IZCOR?
              </h2>
              <p className="text-slate-600 font-normal text-sm sm:text-base mt-3">
                Optimizamos el proceso de adquisición y equipamiento con respaldo técnico, documentación homologada y respuesta oportuna.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: FileText,
                  title: 'Fichas Homologadas para OSCE',
                  desc: 'Expedientes técnicos y especificaciones listas para inclusión en bases de licitación y compras directas.',
                  image: '/assets/ai/pillar_documentacion_osce.jpg',
                  tag: 'Norma Técnica'
                },
                {
                  icon: Award,
                  title: 'Registro Sanitario & Trazabilidad',
                  desc: 'Equipos e insumos con registros sanitarios DIGEMID, normas CE / ISO 13485 y serialización de fábrica.',
                  image: '/assets/ai/pillar_calidad_certificacion.jpg',
                  tag: 'Certificación DIGEMID'
                },
                {
                  icon: Headset,
                  title: 'Asesoría Biomédica Especializada',
                  desc: 'Acompañamiento por profesionales para dimensionar el equipamiento adecuado según nivel de complejidad.',
                  image: '/assets/ai/pillar_asesoria_especializada.jpg',
                  tag: 'Ingeniería Clínica'
                },
                {
                  icon: Truck,
                  title: 'Despacho Seguro a Nivel Nacional',
                  desc: 'Embalaje con protección clínica y coordinación logística eficiente hacia todas las regiones del país.',
                  image: '/assets/ai/pillar_cobertura_nacional.jpg',
                  tag: 'Cobertura País'
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    <span className="absolute bottom-2.5 left-3 text-[10px] font-bold text-white uppercase tracking-wider bg-[#0D2232]/80 backdrop-blur-xs px-2 py-0.5 rounded border border-white/20">
                      {item.tag}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#2C3E50] mb-3 group-hover:bg-brand-cyan group-hover:text-white transition-colors">
                        <item.icon className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <h3 className="text-sm font-bold text-[#2C3E50] mb-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Estándar Garantizado</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5.5. PERSONAL IZCOR MEDIC & ASESORÍA CLÍNICA (01 Tecnología • 02 Personas • 03 Respaldo) */}
        <ConsultingSection />

        {/* 6. SOLUTIONS BY HEALTHCARE SECTOR */}
        <section className="py-20 sm:py-24 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp} 
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-cyan uppercase tracking-wider mb-2">
                <Hospital className="w-4 h-4" />
                Soluciones Integrales
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2C3E50] tracking-tight">
                Atención Especializada por Sector Asistencial
              </h2>
              <p className="text-slate-600 font-normal text-sm sm:text-base mt-3">
                Configuramos soluciones a medida según los requerimientos operativos y normativos de cada tipo de establecimiento.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Building2,
                  title: 'Hospitales y Redes Asistenciales',
                  desc: 'Equipamiento de alta complejidad para hospitalización, UCI y salas de operaciones. Gestión de expedientes técnicos para licitaciones públicas y compras directas.',
                  tag: 'Nivel II y III',
                  link: '/soluciones',
                  image: '/assets/ai/sector_hospitales.jpg'
                },
                {
                  icon: HeartPulse,
                  title: 'Clínicas y Centros Quirúrgicos',
                  desc: 'Abastecimiento de tecnología biomédica, instrumental quirúrgico de alta durabilidad y mobiliario clínico especializado para centros privados.',
                  tag: 'Sector Privado',
                  link: '/soluciones',
                  image: '/assets/ai/sector_clinicas.jpg'
                },
                {
                  icon: Microscope,
                  title: 'Laboratorios y Diagnóstico',
                  desc: 'Suministro de equipos de diagnóstico por imágenes, centrífugas, reactivos con cadena de frío garantizada y material médico de laboratorio.',
                  tag: 'Diagnóstico Clínico',
                  link: '/soluciones',
                  image: '/assets/ai/sector_laboratorios.jpg'
                }
              ].map((sol, i) => (
                <motion.div 
                  key={i}
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeUp}
                  className="bg-slate-50/70 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between overflow-hidden"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={sol.image}
                      alt={sol.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-600"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D2232]/85 via-[#0D2232]/30 to-transparent" />
                    <span className="absolute top-3.5 right-3.5 text-[10px] font-bold uppercase tracking-wider text-white bg-[#0D2232]/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/20">
                      {sol.tag}
                    </span>
                    <div className="absolute bottom-3 left-4 w-11 h-11 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-[#0D2232] shadow-md group-hover:bg-brand-cyan group-hover:text-white transition-colors">
                      <sol.icon className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#2C3E50] mb-2.5 tracking-tight group-hover:text-brand-cyan transition-colors font-heading">
                        {sol.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed mb-6">
                        {sol.desc}
                      </p>
                    </div>
                    <Link 
                      to={sol.link} 
                      className="text-xs font-bold text-[#2C3E50] group-hover:text-brand-cyan flex items-center gap-2 transition-all uppercase tracking-wider pt-4 border-t border-slate-200/70"
                    >
                      <span>Conocer Solución</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. MEDICAL BRANDS & MANUFACTURERS (Dignified, clean brand grid) */}
        <section className="py-16 sm:py-20 bg-[#F8FAFC] overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
              MARCAS Y FABRICANTES HOMOLOGADOS
            </h2>
            <p className="text-xl sm:text-2xl font-black text-[#2C3E50] mb-10 max-w-2xl mx-auto">
              Tecnología Médica de Fabricantes Líderes Internacionales
            </p>
            
            {/* FASE 11: Marquesina de marcas */}
            <div className="relative overflow-hidden w-full before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-16 before:bg-gradient-to-r before:from-[#F8FAFC] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-16 after:bg-gradient-to-l after:from-[#F8FAFC] after:to-transparent">
              <div className="inline-flex animate-marquee hover:pause gap-4 md:gap-8 w-max">
                {/* Doble render para que el loop sea fluido */}
                {[...Array(2)].map((_, groupIdx) => (
                  <div key={groupIdx} className="flex gap-4 md:gap-8 shrink-0">
                    {[
                      { name: 'Mindray', origin: 'Equipos UCI & Monitoreo' },
                      { name: 'NOPA Instruments', origin: 'Instrumental Quirúrgico' },
                      { name: 'Roker', origin: 'Insumos & Descartables' },
                      { name: 'Clute', origin: 'Bioseguridad & Protección' },
                      { name: 'Aceros UP', origin: 'Mobiliario Hospitalario' },
                      { name: 'Jampar', origin: 'Insumos Hospitalarios' },
                      { name: 'Edan', origin: 'Diagnóstico por Imágenes' },
                      { name: 'Bowa', origin: 'Electrocirugía' }
                    ].map((brand) => (
                      <div 
                        key={brand.name + groupIdx}
                        onClick={() => navigate(`/productos?search=${encodeURIComponent(brand.name)}`)}
                        className="w-48 sm:w-56 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#2C3E50] transition-all cursor-pointer group flex flex-col items-center justify-center text-center shrink-0"
                      >
                        <span className="text-base sm:text-lg font-black text-[#2C3E50] group-hover:text-brand-cyan transition-colors tracking-tight">
                          {brand.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                          {brand.origin}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. SUPPLY PROCESS WORKFLOW (Transparent 5-step operational delivery) */}
        <section className="py-20 sm:py-24 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp} 
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-cyan uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4" />
                Flujo Operativo
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2C3E50] tracking-tight">
                ¿Cómo Gestionamos tu Requerimiento?
              </h2>
              <p className="text-slate-600 font-normal text-sm sm:text-base mt-3">
                Un proceso riguroso y transparente desde la recepción del expediente hasta la entrega en tu sede.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
              {[
                { step: '01', title: 'Recepción de Necesidad o TDR', desc: 'Envío de lista de equipos o especificaciones técnicas.' },
                { step: '02', title: 'Evaluación y Homologación', desc: 'Validación de compatibilidad con normas y registros DIGEMID.' },
                { step: '03', title: 'Propuesta Técnico-Económica', desc: 'Emisión formal de cotización y fichas técnicas oficiales.' },
                { step: '04', title: 'Coordinación y Despacho', desc: 'Embalaje con protección clínica y seguimiento logístico.' },
                { step: '05', title: 'Entrega y Puesta en Marcha', desc: 'Recepción conforme, certificados de garantía y soporte.' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeUp}
                  className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 flex flex-col justify-between text-left group hover:bg-white hover:shadow-md transition-all"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#2C3E50] text-cyan-300 font-black text-sm flex items-center justify-center mb-4 shadow-2xs group-hover:bg-brand-cyan group-hover:text-white transition-colors">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-[#2C3E50] text-sm mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 8.5. TESTIMONIALS OF CLIENTS (Public & Private Health Institutions) */}
        <TestimonialsSection />

        {/* 9. TDR & INSTITUTIONAL CALL TO ACTION BANNER */}
        <section className="py-20 sm:py-24 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#2C3E50] rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden">
              {/* Background gradient decorative shapes */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    Canal Exclusivo para Licitaciones & Compras Institucionales
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 tracking-tight leading-tight">
                    ¿Tienes un requerimiento de equipamiento o TDR en curso?
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                    Carga tus términos de referencia o lista de equipamiento y recibe una propuesta técnico-económica homologada con fichas oficiales en menos de 24 horas.
                  </p>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-3 relative z-30">
                  <InteractiveCtaButton 
                    to="/tdr" 
                    variant="cyan"
                    id="btn-banner-tdr"
                    title="Cargar bases técnicas y términos de referencia"
                    previewImage="/assets/ai/cta_tdr_procurement.jpg"
                    previewTitle="Mesa de Partes & Homologación TDR"
                    previewSubtitle="Carga de especificaciones para comités de compra y licitaciones OSCE en 24h."
                    previewPosition="top"
                    icon={<FileCheck2 className="w-4 h-4 shrink-0" />}
                    iconPosition="left"
                    className="h-12 w-full uppercase"
                  >
                    Cargar Bases / TDR
                  </InteractiveCtaButton>

                  <InteractiveCtaButton 
                    to="/cotizar" 
                    variant="outline"
                    id="btn-banner-quote"
                    title="Solicitar cotización formal"
                    previewImage="/assets/ai/cta_quote_consultation.jpg"
                    previewTitle="Cotización Técnico-Económica"
                    previewSubtitle="Propuesta formal con registros sanitarios y ficha técnica oficial."
                    previewPosition="top"
                    icon={<FileText className="w-4 h-4 shrink-0" />}
                    iconPosition="left"
                    className="h-12 w-full uppercase"
                  >
                    Solicitar Cotización
                  </InteractiveCtaButton>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
