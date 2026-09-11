import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageCircle, ArrowUp } from 'lucide-react';
import { ProductDetailData } from './types';

interface ProductStickyBarProps {
  product: ProductDetailData;
  mainImage?: string | null;
}

export const ProductStickyBar: React.FC<ProductStickyBarProps> = ({ product, mainImage }) => {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger sticky bar once user scrolls past 380px
      if (window.scrollY > 380) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Estimados IZCOR MEDIC, requiero cotización del equipo: ${product.name} (Ref: ${product.model || `#${product.id}`}).`
    );
    return `https://wa.me/51928130349?text=${text}`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Desktop Top Floating Sticky Bar */}
      <div
        className={`hidden md:block fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-md transition-all duration-300 transform ${
          showSticky ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {mainImage ? (
              <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center flex-shrink-0">
                <img src={mainImage} alt="" className="w-full h-full object-contain" />
              </div>
            ) : null}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-navy bg-navy-50 px-1.5 py-0.5 rounded border border-brand-navy/20">
                  {product.brandName || 'IZCOR'}
                </span>
                {product.model && (
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    Mod: {product.model}
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-md lg:max-w-xl">
                {product.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to={`/cotizar?product=${product.id}`}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-brand-navy hover:bg-brand-navy-light active:bg-brand-cyan text-white rounded-xl font-bold text-xs shadow-xs hover:shadow active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Cotizar</span>
            </Link>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-white rounded-xl font-bold text-xs shadow-xs hover:shadow active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span>WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={scrollToTop}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title="Volver al inicio de la ficha"
              aria-label="Subir"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Fixed Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg z-40 flex items-center gap-2">
        <Link
          to={`/cotizar?product=${product.id}`}
          className="flex-1 h-11 flex items-center justify-center gap-2 px-3 bg-brand-navy hover:bg-brand-navy-light text-white rounded-xl font-bold text-xs active:bg-brand-cyan active:scale-[0.98] transition-all shadow-xs"
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Solicitar Cotización</span>
        </Link>
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noreferrer"
          className="flex-1 h-11 flex items-center justify-center gap-2 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs active:scale-[0.98] transition-all shadow-xs"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span>WhatsApp</span>
        </a>
      </div>
    </>
  );
};
