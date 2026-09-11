import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, ChevronRight, ChevronDown, Search, FileText, 
  FileUp, Phone, Mail, ShieldCheck, Scale, Building, 
  Tag, Activity, BedDouble, Scissors, Stethoscope, 
  Syringe, Settings, ExternalLink, Sparkles, Newspaper, Users, MapPin, AlertTriangle
} from 'lucide-react';
import { Logo } from '../Logo';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  compareCount: number;
}

export function MobileNavDrawer({ isOpen, onClose, onOpenSearch, compareCount }: MobileNavDrawerProps) {
  const location = useLocation();
  const [catalogExpanded, setCatalogExpanded] = useState(false);

  if (!isOpen) return null;

  const clinicalCategories = [
    { title: 'Equipos Médicos & UCI', slug: 'equipos-medicos', icon: Activity },
    { title: 'Diagnóstico & Imagenología', slug: 'diagnostico-y-monitoreo', icon: Stethoscope },
    { title: 'Mobiliario Clínico', slug: 'mobiliario-clinico', icon: BedDouble },
    { title: 'Instrumental Quirúrgico', slug: 'instrumental-quirurgico', icon: Scissors },
    { title: 'Insumos & Descartables', slug: 'insumos-descartables', icon: Syringe },
    { title: 'Suministro Institucional', slug: 'suministro-institucional', icon: Building },
  ];

  const isHomeActive = location.pathname === '/';
  const isAboutActive = location.pathname === '/nosotros';
  const isCatalogActive = location.pathname.startsWith('/productos') || location.pathname.startsWith('/producto/') || location.pathname.startsWith('/categorias/');
  const isNewsActive = location.pathname === '/noticias';
  const isContactActive = location.pathname === '/contacto';
  const isTdrActive = location.pathname.startsWith('/tdr');
  const isPvActive = location.pathname.startsWith('/farmacovigilancia');
  const isQuoteActive = location.pathname.startsWith('/cotizar');

  return (
    <div 
      id="mobile-nav-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="mobile-nav-panel"
        className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header inside mobile drawer */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <Link to="/" onClick={onClose} className="p-1">
            <Logo className="h-8" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search button trigger */}
        <div className="p-4 border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-100/90 hover:bg-slate-200 text-slate-500 text-xs font-semibold rounded-xl border border-slate-200/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Buscar en todo el catálogo...</span>
            </span>
            <span className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[10px] font-mono text-slate-400">
              Buscar
            </span>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {/* 1. Inicio */}
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              isHomeActive 
                ? 'bg-[#2C3E50] text-white shadow-2xs' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>Inicio</span>
            <ChevronRight className={`w-4 h-4 ${isHomeActive ? 'text-white' : 'text-slate-400'}`} />
          </Link>

          {/* 2. Nosotros */}
          <Link
            to="/nosotros"
            onClick={onClose}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              isAboutActive 
                ? 'bg-[#2C3E50] text-white shadow-2xs' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Nosotros</span>
            </span>
            <ChevronRight className={`w-4 h-4 ${isAboutActive ? 'text-white' : 'text-slate-400'}`} />
          </Link>

          {/* 3. Catálogo with Accordion */}
          <div className="rounded-xl border border-slate-200/70 overflow-hidden">
            <button
              type="button"
              onClick={() => setCatalogExpanded(!catalogExpanded)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-bold transition-colors ${
                isCatalogActive 
                  ? 'bg-cyan-50/80 text-cyan-900' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Catálogo de Equipos</span>
                {isCatalogActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                )}
              </div>
              {catalogExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {catalogExpanded && (
              <div className="p-2 bg-slate-50/60 border-t border-slate-200/50 space-y-1">
                <Link
                  to="/productos"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 text-xs font-bold text-cyan-700 hover:bg-white rounded-lg transition-colors"
                >
                  <span>Ver todo el catálogo</span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-700" />
                </Link>
                {clinicalCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.title}
                      to={`/productos?category=${encodeURIComponent(cat.slug)}`}
                      onClick={onClose}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:text-cyan-800 hover:bg-white rounded-lg transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cat.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Noticias */}
          <Link
            to="/noticias"
            onClick={onClose}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              isNewsActive 
                ? 'bg-[#2C3E50] text-white shadow-2xs' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-slate-400" />
              <span>Noticias</span>
            </span>
            <ChevronRight className={`w-4 h-4 ${isNewsActive ? 'text-white' : 'text-slate-400'}`} />
          </Link>

          {/* 5. Contáctanos */}
          <Link
            to="/contacto"
            onClick={onClose}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              isContactActive 
                ? 'bg-[#2C3E50] text-white shadow-2xs' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>Contáctanos</span>
            </span>
            <ChevronRight className={`w-4 h-4 ${isContactActive ? 'text-white' : 'text-slate-400'}`} />
          </Link>

          {/* Módulo TDR */}
          <Link
            to="/tdr"
            onClick={onClose}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              isTdrActive 
                ? 'bg-[#2C3E50] text-white shadow-2xs' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileUp className="w-4 h-4 text-brand-cyan" />
              <span>Módulo TDR</span>
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              isTdrActive ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-800'
            }`}>
              OSCE
            </span>
          </Link>

          {/* Farmacovigilancia */}
          <Link
            to="/farmacovigilancia"
            onClick={onClose}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              isPvActive 
                ? 'bg-[#2C3E50] text-white shadow-2xs' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Farmacovigilancia</span>
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              isPvActive ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200/60'
            }`}>
              DIGEMID
            </span>
          </Link>

          {/* Comparador de equipos */}
          <Link
            to="/productos"
            onClick={onClose}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-500" />
              <span>Comparador de Equipos</span>
            </span>
            {compareCount > 0 ? (
              <span className="px-2 py-0.5 bg-[#2C3E50] text-white text-[10px] font-bold rounded-full">
                {compareCount}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">0</span>
            )}
          </Link>

          {/* Panel Admin */}
          <Link
            to="/admin"
            onClick={onClose}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" />
              <span>Acceso Administrativo</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        {/* Footer actions and contact */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Suministro Médico Certificado DIGEMID</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://wa.me/51928130349"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <Link
              to="/cotizar"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-brand-cyan hover:bg-[#0087a3] text-white font-bold text-xs rounded-xl shadow-xs transition-colors font-heading"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Cotizar</span>
            </Link>
          </div>

          <a
            href="mailto:ventasizcormedic@gmail.com"
            className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-[#2C3E50] transition-colors py-1"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>ventasizcormedic@gmail.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}
