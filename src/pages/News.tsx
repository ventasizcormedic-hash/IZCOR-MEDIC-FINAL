import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Newspaper, Calendar, ArrowRight, ShieldCheck, 
  FileText, Activity, Sparkles, Building2, X,
  CheckCircle2, Clock, Share2, Award, ChevronRight, MessageSquareText
} from 'lucide-react';
import { SeoHead } from '../components/seo/SeoHead';

interface Article {
  id: number;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  image: string;
  readTime: string;
  regulations: string;
  fullContent: string[];
  keyTakeaways: string[];
}

const articles: Article[] = [
  {
    id: 1,
    title: 'Nuevas Normativas DIGEMID para Equipamiento Biomédico en Cuidados Intensivos',
    date: '24 Febrero, 2026',
    category: 'Regulación',
    excerpt: 'Conoce los lineamientos técnicos y de calibración exigidos para monitores multiparámetro y bombas de infusión en salas críticas.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min',
    regulations: 'Resolución Ministerial N° 124-2025/MINSA & Directiva DIGEMID N° 004',
    fullContent: [
      'La Dirección General de Medicamentos, Insumos y Drogas (DIGEMID) ha publicado una actualización sustancial a los requisitos de control metrológico y certificación de seguridad eléctrica para equipos médicos de soporte de vida en unidades críticas.',
      'A partir del presente periodo, las adquisiciones hospitalarias de monitores multiparámetro y bombas de infusión deben acreditar protocolos de calibración trazables según norma IEC 60601-1 y certificados de calibración emitidos por laboratorios acreditados ante INACAL.',
      'En IZCOR MEDIC, todos los equipos distribuidos incorporan desde fábrica el certificado de calibración metrológica, manuales de servicio en español y garantía de repuestos originales por un periodo mínimo de 5 años.'
    ],
    keyTakeaways: [
      'Calibración obligatoria bajo norma IEC 60601-1 para monitores de signos vitales.',
      'Exigencia de registro sanitario vigente y trazabilidad de importación legal.',
      'Plazos de entrega técnica con capacitación presencial para el equipo biomédico hospitalario.'
    ]
  },
  {
    id: 2,
    title: 'Campaña de Salud Preventiva y Soporte Técnico en Comunidades Vulnerables',
    date: '15 Febrero, 2026',
    category: 'Compromiso Social',
    excerpt: 'IZCOR MEDIC participó en la jornada de despistaje y atención médica, brindando soporte técnico y logístico.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    readTime: '3 min',
    regulations: 'Convenio de Responsabilidad Social Corporativa Sector Salud 2026',
    fullContent: [
      'En coordinación con redes comunitarias de salud del centro del país, el equipo de ingeniería biomédica de IZCOR MEDIC facilitó equipamiento de diagnóstico rápido y monitoreo ambulatorio.',
      'Se desplegaron ecógrafos portátiles Doppler y electrocardiógrafos digitales para la detección temprana de afecciones cardiovasculares y seguimiento gestacional en más de 650 pacientes.',
      'Esta iniciativa reafirma el compromiso de la compañía con un acceso equitativo a tecnología sanitaria de primer nivel, capacitando además al personal de salud local en el mantenimiento preventivo básico.'
    ],
    keyTakeaways: [
      'Más de 650 atenciones especializadas realizadas con ecógrafos Doppler portátiles.',
      'Capacitación a médicos rurales en el uso y cuidado del equipamiento clínico.',
      'Donación de insumos médicos estériles y kits de bioseguridad descartables.'
    ]
  },
  {
    id: 3,
    title: 'Taller de Especialización en Uso de Ecógrafos Doppler Portátiles',
    date: '02 Febrero, 2026',
    category: 'Educación',
    excerpt: 'Jornada académica dirigida a residentes y especialistas para optimizar el diagnóstico materno-infantil.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min',
    regulations: 'Acreditación del Colegio Médico del Perú — Comité de Educación Continua',
    fullContent: [
      'Con la participación de especialistas en ginecología, obstetricia y medicina intensiva, se desarrolló el taller práctico de ultrasonido clínico avanzado en la sede corporativa de IZCOR MEDIC.',
      'El entrenamiento incluyó prácticas con transductores convexos, lineales y endocavitarios de última generación con procesamiento de imagen con reducción de ruido y elastografía de tejido.',
      'Los participantes pudieron comparar directamente la ergonomía y capacidad de procesamiento de los diferentes modelos clínicos para fundamentar sus especificaciones técnicas de compra institucional.'
    ],
    keyTakeaways: [
      'Entrenamiento interactivo en sondas multifrecuencia y modos Doppler color.',
      'Criterios para la redacción de Términos de Referencia (TDR) sin direccionamiento.',
      'Certificación académica emitida en alianza con sociedades científicas médicas.'
    ]
  },
  {
    id: 4,
    title: 'ExpoMedica 2026: Innovación y Tecnología Hospitalaria',
    date: '20 Enero, 2026',
    category: 'Eventos',
    excerpt: 'Presentamos nuestras nuevas líneas de equipamiento quirúrgico y mobiliario de última generación en la feria más importante del sector.',
    image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min',
    regulations: 'Certificaciones ISO 13485 e ISO 9001 en gestión hospitalaria',
    fullContent: [
      'Durante la última edición de ExpoMedica, IZCOR MEDIC presentó su catálogo ampliado con más de 500 referencias de equipamiento hospitalario, camas UCI de 4 motores y cajas de instrumental quirúrgico de acero alemán.',
      'Se mantuvieron reuniones con más de 120 comités de adquisiciones de clínicas privadas y directores de redes hospitalarias públicas interesadas en el programa de abastecimiento continuo y homologación inmediata.',
      'La presentación incluyó demostraciones en vivo del funcionamiento de autoclaves de mesa clase B y analizadores hematológicos de última generación.'
    ],
    keyTakeaways: [
      'Presentación del portafolio unificado con soporte post-venta a nivel nacional.',
      'Acuerdos preliminares de suministro para proyectos de modernización hospitalaria.',
      'Disponibilidad inmediata de fichas técnicas para procesos de licitación pública OSCE.'
    ]
  }
];

export function News() {
  const [filter, setFilter] = useState('Todos');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const categories = ['Todos', 'Compromiso Social', 'Educación', 'Eventos', 'Regulación'];

  const filteredArticles = filter === 'Todos' 
    ? articles 
    : articles.filter(a => a.category === filter);

  return (
    <>
      <SeoHead
        title="Noticias y Actualidad Médica | IZCOR MEDIC"
        description="Artículos técnicos, normativas DIGEMID, guías de licitación OSCE y novedades en tecnología biomédica para el sector salud peruano."
        canonicalUrl="/noticias"
      />

      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Header Banner */}
        <section className="bg-[#2C3E50] text-white py-16 sm:py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
              <Newspaper className="w-3.5 h-3.5" />
              Actualidad Institucional
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 font-heading tracking-tight">
              Noticias y Eventos
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Mantente informado sobre nuestra labor, compromiso corporativo, eventos académicos y novedades normativas.
            </p>
          </div>
        </section>

        {/* Articles Grid & Filters */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10 pb-4 border-b border-slate-200">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    filter === cat 
                      ? 'bg-brand-cyan text-white shadow-md' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-[#2C3E50]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((art) => (
                <article
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedArticle(art);
                    }
                  }}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
                >
                  <div>
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 bg-[#2C3E50]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                        {art.category}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{art.date}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{art.readTime}</span>
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 leading-snug font-heading group-hover:text-cyan-700 transition-colors">
                        {art.title}
                      </h2>

                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700 uppercase tracking-wider group-hover:text-cyan-900">
                    <span>Leer artículo técnico</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Modal de Lectura Técnica Completa */}
        <AnimatePresence>
          {selectedArticle && (
            <div 
              className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="article-modal-title"
              onClick={() => setSelectedArticle(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
              >
                {/* Header Image with close button */}
                <div className="relative aspect-[21/9] sm:aspect-[21/8] overflow-hidden bg-slate-900">
                  <img
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E2B37] via-transparent to-black/40" />
                  
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                    aria-label="Cerrar artículo"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-6 right-6 text-white">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-cyan text-white mb-2">
                      {selectedArticle.category}
                    </span>
                    <div className="flex items-center gap-4 text-xs text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-300" />
                        {selectedArticle.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-300" />
                        {selectedArticle.readTime} de lectura
                      </span>
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-6 sm:p-8 space-y-6">
                  <h2 id="article-modal-title" className="text-xl sm:text-2xl font-black text-[#2C3E50] font-heading leading-snug">
                    {selectedArticle.title}
                  </h2>

                  {/* Normative Reference Pill */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Marco Normativo Aplicable</div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">{selectedArticle.regulations}</div>
                    </div>
                  </div>

                  {/* Body Paragraphs */}
                  <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                    {selectedArticle.fullContent.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Key Takeaways */}
                  <div className="p-5 rounded-2xl bg-cyan-50/70 border border-cyan-100 space-y-3">
                    <div className="text-xs font-bold text-cyan-900 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-brand-cyan" />
                      Puntos Clave para Comités y Compras Institucionales
                    </div>
                    <ul className="space-y-2">
                      {selectedArticle.keyTakeaways.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-cyan-950 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-500">
                      ¿Requiere asesoría técnica o cotización formal sobre este tema?
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Link
                        to="/cotizar"
                        onClick={() => setSelectedArticle(null)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-cyan hover:bg-[#0087a3] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Cotizar Equipos</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedArticle(null)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
