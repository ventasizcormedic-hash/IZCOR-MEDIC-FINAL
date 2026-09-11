import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Phone, Mail, FileText, Menu, ShieldCheck, 
  ChevronDown, Search, FileUp, Scale, Sparkles, 
  Layers, Building, UserCheck, ShoppingBag, Clock, MapPin
} from 'lucide-react';
import { Logo } from '../Logo';
import { HeaderSearchModal } from './HeaderSearchModal';
import { CatalogMegaMenu, ManufacturersDropdown, UserPortalDropdown } from './HeaderDropdowns';
import { MobileNavDrawer } from './MobileNavDrawer';
import { MiniCartTray } from './MiniCartTray';
import { useQuote } from '../../context/QuoteContext';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);
  const [mfgMenuOpen, setMfgMenuOpen] = useState(false);
  const [userPortalOpen, setUserPortalOpen] = useState(false);
  const [cartTrayOpen, setCartTrayOpen] = useState(false);
  const [compareCount, setCompareCount] = useState(0);

  const { itemCount, justAddedId } = useQuote();
  const location = useLocation();

  const catalogMenuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mfgMenuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userPortalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cartTrayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Ctrl+K / Cmd+K search modal shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setSearchModalOpen(false);
    setCatalogMenuOpen(false);
    setMfgMenuOpen(false);
    setUserPortalOpen(false);
    setCartTrayOpen(false);
  }, [location.pathname]);

  // Read and listen to comparison list
  const updateCompareCount = () => {
    try {
      const saved = localStorage.getItem('izcor_product_comparison');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompareCount(Array.isArray(parsed) ? parsed.length : 0);
      } else {
        setCompareCount(0);
      }
    } catch {
      setCompareCount(0);
    }
  };

  useEffect(() => {
    updateCompareCount();
    window.addEventListener('storage', updateCompareCount);
    const interval = setInterval(updateCompareCount, 2000);
    return () => {
      window.removeEventListener('storage', updateCompareCount);
      clearInterval(interval);
    };
  }, []);

  // Route active checkers
  const isHomeActive = location.pathname === '/';
  const isAboutActive = location.pathname === '/nosotros';
  const isCatalogActive = 
    location.pathname.startsWith('/productos') || 
    location.pathname.startsWith('/producto/') || 
    location.pathname.startsWith('/categorias/');
  const isNewsActive = location.pathname === '/noticias';
  const isContactActive = location.pathname === '/contacto';

  // Hover handlers with grace delay
  const handleCatalogEnter = () => {
    if (catalogMenuTimerRef.current) clearTimeout(catalogMenuTimerRef.current);
    setCatalogMenuOpen(true);
  };
  const handleCatalogLeave = () => {
    catalogMenuTimerRef.current = setTimeout(() => setCatalogMenuOpen(false), 150);
  };

  const handleCartEnter = () => {
    if (cartTrayTimerRef.current) clearTimeout(cartTrayTimerRef.current);
    setCartTrayOpen(true);
  };
  const handleCartLeave = () => {
    cartTrayTimerRef.current = setTimeout(() => setCartTrayOpen(false), 200);
  };

  return (
    <>
      {/* 1. TOP BAR (Very thin, elegant, corporate information) */}
      <div 
        id="top-bar-corporate"
        className="bg-[radial-gradient(circle_at_top_left,_rgba(0,185,216,0.14),_transparent_30%),linear-gradient(90deg,_#10283a_0%,_#162B3B_35%,_#0D2232_100%)] text-slate-200 text-[11px] sm:text-xs border-b border-white/10 select-none hidden md:block"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
          {/* Left Info: Trust Badge & Location */}
          <div className="flex items-center gap-4 lg:gap-6">
            <span className="inline-flex items-center gap-1.5 text-cyan-300 font-semibold tracking-tight">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Suministro Médico Homologado • DIGEMID & OSCE
            </span>
            <span className="text-white/20 hidden lg:inline">|</span>
            <span className="text-slate-300 text-[11px] hidden lg:inline-flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-slate-400" />
              Lima, Perú • Despacho Nacional a Hospitales y Clínicas
            </span>
          </div>

          {/* Right Info: Phone, Email, Hours */}
          <div className="flex items-center gap-4 lg:gap-6 text-[11px] sm:text-xs font-semibold">
            <a 
              href="mailto:ventasizcormedic@gmail.com" 
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 transition-colors"
              title="Correo institucional"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              ventasizcormedic@gmail.com
            </a>
            <span className="text-white/20">•</span>
            <a 
              href="https://wa.me/51928130349" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
              title="Atención directa por WhatsApp"
            >
              <Phone className="w-3.5 h-3.5" />
              +51 928 130 349
            </a>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-slate-400 text-[11px] hidden xl:inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Lun - Vie: 8:30 - 18:30
            </span>
          </div>
        </div>
      </div>

      {/* 2. STICKY HEADER */}
      <header 
        id="main-sticky-header"
        className={`sticky top-0 left-0 right-0 z-40 w-full transition-all duration-250 ${
          scrolled 
            ? 'bg-white/92 backdrop-blur-xl shadow-[0_12px_32px_rgba(15,23,42,0.08)] border-b border-slate-200/90 py-2.5' 
            : 'bg-white/96 backdrop-blur-md border-b border-slate-200/80 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 md:h-14 gap-4">
            
            {/* Left: Logotipo */}
            <div className="flex items-center gap-3">
              <Link 
                to="/" 
                id="header-brand-logo"
                className="flex-shrink-0 flex items-center p-1.5 rounded-xl transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C3E50]"
                aria-label="IZCOR MEDIC - Inicio"
              >
                <Logo className="h-9 md:h-11" />
              </Link>

              <div className="header-brand-shell hidden sm:flex items-center rounded-full px-3 py-1.5">
                <div className="brand-lockup-mark text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#20384D]">IZCOR MEDIC</p>
                  <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-slate-500">Instituciones de salud</p>
                </div>
              </div>
            </div>

            {/* Center: Navegación Principal (Inicio, Nosotros, Catálogo, Noticias, Contáctanos) */}
            <nav 
              id="desktop-navigation"
              className="hidden xl:flex items-center space-x-1"
              aria-label="Navegación principal"
            >
              {/* 1. Inicio */}
              <Link
                to="/"
                id="nav-link-inicio"
                className={`px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-[0.14em] uppercase transition-all duration-200 relative ${
                  isHomeActive 
                    ? 'text-[#2C3E50] bg-slate-100/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]' 
                    : 'text-[#2C3E50]/75 hover:text-cyan-700 hover:bg-slate-50'
                }`}
              >
                <span>Inicio</span>
                {isHomeActive && (
                  <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-brand-cyan rounded-full" />
                )}
              </Link>

              {/* 2. Nosotros */}
              <Link
                to="/nosotros"
                id="nav-link-nosotros"
                className={`px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-[0.14em] uppercase transition-all duration-200 relative ${
                  isAboutActive 
                    ? 'text-[#2C3E50] bg-slate-100/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]' 
                    : 'text-[#2C3E50]/75 hover:text-cyan-700 hover:bg-slate-50'
                }`}
              >
                <span>Nosotros</span>
                {isAboutActive && (
                  <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-brand-cyan rounded-full" />
                )}
              </Link>

              {/* 3. Catálogo (with Mega Menu) */}
              <div 
                className="relative"
                onMouseEnter={handleCatalogEnter}
                onMouseLeave={handleCatalogLeave}
              >
                <Link
                  to="/productos"
                  id="nav-link-catalogo"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-[0.14em] uppercase transition-all duration-200 relative ${
                    isCatalogActive 
                      ? 'text-[#2C3E50] bg-slate-100/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]' 
                      : 'text-[#2C3E50]/75 hover:text-cyan-700 hover:bg-slate-50'
                  }`}
                  aria-expanded={catalogMenuOpen}
                  aria-haspopup="true"
                >
                  <Layers className="w-3.5 h-3.5 opacity-70" />
                  <span>Catálogo</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${catalogMenuOpen ? 'rotate-180 text-cyan-700' : 'text-slate-400'}`} />
                  {isCatalogActive && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-brand-cyan rounded-full" />
                  )}
                </Link>

                <CatalogMegaMenu 
                  isOpen={catalogMenuOpen} 
                  onClose={() => setCatalogMenuOpen(false)} 
                />
              </div>

              {/* 4. Noticias */}
              <Link
                to="/noticias"
                id="nav-link-noticias"
                className={`px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-[0.14em] uppercase transition-all duration-200 relative ${
                  isNewsActive 
                    ? 'text-[#2C3E50] bg-slate-100/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]' 
                    : 'text-[#2C3E50]/75 hover:text-cyan-700 hover:bg-slate-50'
                }`}
              >
                <span>Noticias</span>
                {isNewsActive && (
                  <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-brand-cyan rounded-full" />
                )}
              </Link>

              {/* 5. Contáctanos */}
              <Link
                to="/contacto"
                id="nav-link-contacto"
                className={`px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-[0.14em] uppercase transition-all duration-200 relative ${
                  isContactActive 
                    ? 'text-[#2C3E50] bg-slate-100/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]' 
                    : 'text-[#2C3E50]/75 hover:text-cyan-700 hover:bg-slate-50'
                }`}
              >
                <span>Contáctanos</span>
                {isContactActive && (
                  <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-brand-cyan rounded-full" />
                )}
              </Link>
            </nav>

            {/* Right: Search, Comparison, Quote Tray & SOLICITAR COTIZACIÓN CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Buscador Redondeado con Focus Cian */}
              <button
                type="button"
                id="header-search-btn"
                onClick={() => setSearchModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan cursor-pointer"
                title="Buscar en catálogo médico (Ctrl+K)"
                aria-label="Abrir buscador"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xl:inline text-slate-500 font-sans">Buscar equipos o insumos...</span>
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded-full">
                  ⌘K
                </kbd>
              </button>

              {/* Comparador Shortcut */}
              <Link
                to="/productos"
                id="header-compare-link"
                className="hidden sm:inline-flex items-center justify-center relative p-2 text-slate-600 hover:text-[#2C3E50] hover:bg-slate-100 rounded-xl transition-colors"
                title={compareCount > 0 ? `${compareCount} equipos en comparación` : "Matriz de comparación"}
              >
                <Scale className="w-4 h-4" />
                {compareCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2C3E50] text-[10px] font-bold text-white shadow-2xs">
                    {compareCount}
                  </span>
                )}
              </Link>

              {/* Carrito / Bandeja de Cotización with Hover & Click Mini-Cart Tray */}
              <div 
                className="relative"
                onMouseEnter={handleCartEnter}
                onMouseLeave={handleCartLeave}
              >
                <button
                  type="button"
                  id="header-quote-cart-btn"
                  onClick={() => setCartTrayOpen(!cartTrayOpen)}
                  className={`relative p-2.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan ${
                    itemCount > 0 
                      ? 'bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100' 
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-[#2C3E50] hover:bg-slate-200'
                  }`}
                  aria-label={`Bandeja de cotización: ${itemCount} artículos`}
                  title="Ver bandeja de cotización"
                >
                  <ShoppingBag className={`w-4 h-4 ${justAddedId ? 'scale-125 text-cyan-600' : ''} transition-transform duration-200`} />
                  
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-cyan text-[11px] font-bold text-white shadow-xs animate-in zoom-in-75">
                      {itemCount}
                    </span>
                  )}
                </button>

                {/* Floating Mini-Cart Dropdown */}
                <MiniCartTray 
                  isOpen={cartTrayOpen} 
                  onClose={() => setCartTrayOpen(false)} 
                />
              </div>

              {/* Primary CTA: SOLICITAR COTIZACIÓN */}
              <Link 
                to="/cotizar" 
                id="header-btn-solicitar-cotizacion"
                className="hidden sm:inline-flex items-center justify-center gap-2 bg-[#00B9D8] hover:bg-[#00a2be] active:bg-[#008fa8] text-[#0D2232] px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black tracking-wide uppercase font-heading transition-all shadow-sm hover:shadow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B9D8]"
                title="Solicitar cotización institucional formal"
              >
                <FileText className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" />
                <span className="hidden xs:inline">Solicitar Cotización</span>
                <span className="xs:hidden">Cotizar</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                id="header-mobile-menu-btn"
                onClick={() => setMobileDrawerOpen(true)}
                className="xl:hidden p-2 rounded-xl text-slate-700 hover:text-[#2C3E50] hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan transition-colors"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <HeaderSearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />

      {/* Mobile Drawer */}
      <MobileNavDrawer 
        isOpen={mobileDrawerOpen} 
        onClose={() => setMobileDrawerOpen(false)} 
        onOpenSearch={() => setSearchModalOpen(true)}
        compareCount={compareCount}
      />
    </>
  );
}
