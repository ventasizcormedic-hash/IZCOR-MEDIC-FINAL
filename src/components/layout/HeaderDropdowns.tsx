import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, BedDouble, Scissors, Activity, 
  Syringe, Building, ArrowRight, ShieldCheck, 
  Layers, Tag, Sparkles, Scale, FileUp, Settings, 
  ExternalLink, PhoneCall
} from 'lucide-react';

interface CatalogMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CatalogMegaMenu({ isOpen, onClose }: CatalogMegaMenuProps) {
  if (!isOpen) return null;

  const clinicalCategories = [
    {
      title: 'Equipos Médicos & UCI',
      description: 'Monitores, desfibriladores, ventiladores y bombas',
      icon: Activity,
      color: 'text-brand-navy bg-slate-100',
      categorySlug: 'equipos-medicos',
      thumbnail: '/assets/ai/cat_equipos_uci.jpg',
    },
    {
      title: 'Diagnóstico & Imagenología',
      description: 'Ecógrafos, rayos X, electrocardiógrafos y sensores',
      icon: Stethoscope,
      color: 'text-cyan-700 bg-cyan-50',
      categorySlug: 'diagnostico-y-monitoreo',
      thumbnail: '/assets/ai/cat_diagnostico_monitoreo.jpg',
    },
    {
      title: 'Mobiliario Clínico & Quirófano',
      description: 'Camas UCI, camillas de traslado, mesas de operaciones',
      icon: BedDouble,
      color: 'text-slate-800 bg-slate-100',
      categorySlug: 'mobiliario-clinico',
      thumbnail: '/assets/ai/cat_mobiliario_clinico.jpg',
    },
    {
      title: 'Instrumental Quirúrgico',
      description: 'Kits de cirugía general, traumatología y laparoscopía',
      icon: Scissors,
      color: 'text-slate-800 bg-slate-100',
      categorySlug: 'instrumental-quirurgico',
      thumbnail: '/assets/ai/cat_instrumental_quirurgico.jpg',
    },
    {
      title: 'Insumos & Descartables',
      description: 'Material médico estéril, cánulas, jeringas y apósitos',
      icon: Syringe,
      color: 'text-cyan-700 bg-cyan-50',
      categorySlug: 'insumos-descartables',
      thumbnail: '/assets/ai/cat_insumos_descartables.jpg',
    },
    {
      title: 'Suministro Institucional',
      description: 'Equipamiento mayor para hospitales, clínicas y postas',
      icon: Building,
      color: 'text-brand-navy bg-slate-100',
      categorySlug: 'suministro-institucional',
      thumbnail: '/assets/ai/cta_catalog_equipment.jpg',
    },
  ];

  return (
    <div 
      className="absolute top-full left-0 w-[740px] bg-white rounded-2xl shadow-xl border border-slate-200/90 p-5 mt-1.5 z-50 animate-in fade-in zoom-in-98 duration-150"
      onMouseLeave={onClose}
    >
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 text-brand-navy">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Divisiones del Catálogo Médico
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Equipos de alta tecnología con certificación y ficha técnica disponible
            </p>
          </div>
        </div>

        <Link
          to="/productos"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-cyan bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
        >
          <span>Ver catálogo completo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of clinical categories with AI thumbnails */}
      <div className="grid grid-cols-2 gap-3">
        {clinicalCategories.map((item) => {
          return (
            <Link
              key={item.title}
              to={`/productos?category=${encodeURIComponent(item.categorySlug)}`}
              onClick={onClose}
              className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all group"
            >
              <div className="w-14 h-12 rounded-lg overflow-hidden border border-slate-200/80 bg-slate-100 shrink-0 relative shadow-2xs group-hover:border-cyan-500/40 transition-colors">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-xs font-bold text-slate-900 group-hover:text-brand-cyan transition-colors truncate">
                  {item.title}
                </h5>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom quick banner */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/70 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Fichas técnicas y manuales en PDF listos para descarga</span>
        </div>
        <Link
          to="/tdr"
          onClick={onClose}
          className="font-bold text-brand-cyan hover:underline flex items-center gap-1"
        >
          <span>¿Necesita asesoría para TDR?</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

interface ManufacturersDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManufacturersDropdown({ isOpen, onClose }: ManufacturersDropdownProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 mt-1.5 z-50 animate-in fade-in zoom-in-98 duration-150"
      onMouseLeave={onClose}
    >
      <div className="space-y-2">
        <Link
          to="/fabricantes"
          onClick={onClose}
          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
        >
          <div className="p-2.5 rounded-xl bg-slate-100 text-brand-navy flex-shrink-0 group-hover:scale-105 transition-transform">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 group-hover:text-brand-navy">
              Directorio de Fabricantes
            </h5>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Empresas manufactureras globales con homologación médica
            </p>
          </div>
        </Link>

        <Link
          to="/marcas"
          onClick={onClose}
          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
        >
          <div className="p-2.5 rounded-xl bg-cyan-50 text-brand-cyan flex-shrink-0 group-hover:scale-105 transition-transform">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 group-hover:text-brand-cyan">
              Marcas Comerciales
            </h5>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Marcas líderes en el sector biomédico y hospitalario
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 px-1 text-[11px] text-slate-400 font-medium flex items-center justify-between">
        <span>Garantía y soporte directo</span>
        <span className="text-brand-navy font-bold">100% Original</span>
      </div>
    </div>
  );
}

interface UserPortalDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  compareCount: number;
}

export function UserPortalDropdown({ isOpen, onClose, compareCount }: UserPortalDropdownProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-full right-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 mt-2 z-50 animate-in fade-in zoom-in-98 duration-150"
      onMouseLeave={onClose}
    >
      <div className="px-2 pb-2.5 mb-2 border-b border-slate-100">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Servicios & Portal Institucional
        </span>
        <p className="text-xs font-bold text-slate-800 mt-0.5">
          Atención a Compras y Licitaciones
        </p>
      </div>

      <div className="space-y-1">
        {/* Product Comparison Link */}
        <Link
          to="/productos"
          onClick={onClose}
          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-brand-navy text-xs font-semibold transition-colors"
        >
          <span className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-brand-navy" />
            <span>Comparador de Equipos</span>
          </span>
          {compareCount > 0 ? (
            <span className="px-2 py-0.5 bg-brand-navy text-white text-[10px] font-bold rounded-full">
              {compareCount}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-normal">0 items</span>
          )}
        </Link>

        {/* TDR Management */}
        <Link
          to="/tdr"
          onClick={onClose}
          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-brand-cyan text-xs font-semibold transition-colors"
        >
          <span className="flex items-center gap-2">
            <FileUp className="w-4 h-4 text-brand-cyan" />
            <span>Módulo de TDR</span>
          </span>
          <span className="text-[10px] bg-cyan-50 text-cyan-800 font-bold px-2 py-0.5 rounded">
            OSCE
          </span>
        </Link>

        {/* Farmacovigilancia */}
        <Link
          to="/farmacovigilancia"
          onClick={onClose}
          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-700 text-xs font-semibold transition-colors"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Farmacovigilancia</span>
          </span>
          <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200">
            DIGEMID
          </span>
        </Link>

        {/* Admin Center */}
        <Link
          to="/admin"
          onClick={onClose}
          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-brand-navy text-xs font-semibold transition-colors"
        >
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Panel de Administración</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Direct support footer */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <a
          href="https://wa.me/51928130349"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200/60 transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
          <span>Soporte Inmediato WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
