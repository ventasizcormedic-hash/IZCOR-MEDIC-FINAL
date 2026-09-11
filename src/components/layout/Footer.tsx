import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, Clock, Award, FileText, BookOpen, AlertTriangle, ExternalLink } from 'lucide-react';
import { Logo } from '../Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="main-footer" className="bg-[radial-gradient(circle_at_top,_rgba(0,185,216,0.12),_transparent_28%),linear-gradient(180deg,_#0D2232_0%,_#132B3B_100%)] text-slate-300 pt-16 pb-8 border-t-4 border-[#00B9D8]" role="contentinfo" aria-label="Pie de página de IZCOR MEDIC">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Corporate Accreditation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-12 mb-12 border-b border-white/10">
          <div className="footer-cta-card flex items-start gap-4 p-4 rounded-xl hover:bg-white/8 transition-colors">
            <ShieldCheck className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Garantía y Registro Sanitario</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Equipos e insumos con certificaciones DIGEMID, CE e ISO para uso en centros hospitalarios.
              </p>
            </div>
          </div>

          <div className="footer-cta-card flex items-start gap-4 p-4 rounded-xl hover:bg-white/8 transition-colors">
            <Award className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Suministro y Licitaciones</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Especialistas en procesos OSCE, compras corporativas y abastecimiento directo a nivel nacional.
              </p>
            </div>
          </div>

          <div className="footer-cta-card flex items-start gap-4 p-4 rounded-xl hover:bg-white/8 transition-colors">
            <Clock className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Soporte Biomédico</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Asistencia técnica, manuales, fichas oficiales y cotizaciones formalizadas en menos de 24 horas.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Presentation */}
          <div className="lg:col-span-2">
            <div className="mb-5 bg-white p-3 rounded-xl inline-block shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
              <Logo className="h-9" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mb-6">
              Plataforma integral de suministro y equipamiento para hospitales, clínicas, laboratorios e instituciones públicas y privadas del Perú.
            </p>
            
            <address className="not-italic space-y-2 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" aria-hidden="true" />
                <span>Lima, Perú • Despachos y cobertura a nivel nacional</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" aria-hidden="true" />
                <a href="mailto:ventasizcormedic@gmail.com" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  ventasizcormedic@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" aria-hidden="true" />
                <a href="tel:+51928130349" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  +51 928 130 349
                </a>
              </p>
            </address>
          </div>

          {/* Navegación Institucional */}
          <nav aria-label="Navegación de plataforma">
            <h3 className="text-xs font-bold tracking-widest uppercase mb-5 text-cyan-400">
              PLATAFORMA
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/productos" className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  Catálogo Oficial
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/noticias" className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  Noticias
                </Link>
              </li>
              <li>
                <Link to="/tdr" className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  Módulo de Licitaciones TDR
                </Link>
              </li>
              <li>
                <Link to="/cotizar" className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  Solicitud de Cotización
                </Link>
              </li>
              <li>
                <Link to="/farmacovigilancia" className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" aria-hidden="true" />
                  Farmacovigilancia
                </Link>
              </li>
            </ul>
          </nav>

          {/* Líneas Médicas */}
          <nav aria-label="Líneas médicas">
            <h3 className="text-xs font-bold tracking-widest uppercase mb-5 text-cyan-400">
              LÍNEAS MÉDICAS
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/categorias/equipos-medicos" className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  Equipamiento Clínico
                </Link>
              </li>
              <li>
                <Link to="/categorias/laboratorio" className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  Laboratorio &amp; Diagnóstico
                </Link>
              </li>
              <li>
                <Link to="/categorias/mobiliario-clinico" className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  Mobiliario Hospitalario
                </Link>
              </li>
              <li>
                <Link to="/categorias/instrumental-quirurgico" className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  Instrumental Quirúrgico
                </Link>
              </li>
              <li>
                <Link to="/categorias/insumos-descartables" className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
                  Insumos &amp; Descartables
                </Link>
              </li>
            </ul>
          </nav>

          {/* Canal Corporativo + Libro de Reclamaciones */}
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-cyan-400">
                CANAL CORPORATIVO
              </h3>
              <div className="footer-cta-card p-4 rounded-xl text-xs space-y-3">
                <p className="text-slate-300">
                  ¿Requiere sustento técnico o cotización para bases de licitación?
                </p>
                <Link
                  to="/tdr"
                  className="inline-flex items-center gap-1.5 w-full justify-center py-2 px-3 rounded-lg bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs border border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                  Cargar TDR
                </Link>
                <a
                  href="https://wa.me/51928130349"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 w-full justify-center py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  aria-label="Contactar asesor por WhatsApp (abre en nueva pestaña)"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  Asesor por WhatsApp
                </a>
              </div>
            </div>

            {/* Libro de Reclamaciones */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-red-400 flex-shrink-0" aria-hidden="true" />
                <h4 className="text-white font-bold text-xs">Libro de Reclamaciones</h4>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed mb-3">
                Conforme a la Ley 29571 (Código de Protección al Consumidor), tienes derecho a registrar tu reclamo o queja.
              </p>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-1.5 w-full justify-center py-2 px-3 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                aria-label="Registrar una queja o reclamo"
              >
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                Registrar Reclamo
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>
            &copy; {currentYear} IZCOR MEDIC S.A.C. Todos los derechos reservados. RUC y especificaciones sujetas a verificación institucional.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5" aria-label="Canal de atención activo">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
              Canal de Atención Activo
            </span>
            <Link to="/farmacovigilancia" className="hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
              Farmacovigilancia
            </Link>
            <Link to="/contacto" className="hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
              Contacto
            </Link>
            <Link to="/admin" className="hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:text-cyan-300">
              Acceso Administrativo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
