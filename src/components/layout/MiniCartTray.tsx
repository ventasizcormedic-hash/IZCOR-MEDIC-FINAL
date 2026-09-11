import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Trash2, Plus, Minus, ArrowRight, 
  PackageX, Sparkles, X, ShieldCheck
} from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';

interface MiniCartTrayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniCartTray({ isOpen, onClose }: MiniCartTrayProps) {
  const { items, itemCount, removeItem, updateQuantity, clearTray } = useQuote();
  const trayRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={trayRef}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-full mt-2 w-[340px] sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 text-slate-800"
          id="mini-cart-tray"
        >
          {/* Header */}
          <div className="bg-[#2C3E50] text-white px-5 py-3.5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-300" />
              <h3 className="font-bold text-sm tracking-tight font-heading">
                Bandeja de Cotización
              </h3>
              <span className="bg-white/15 text-cyan-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}
              </span>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Cerrar bandeja"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                  <PackageX className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1 font-heading">
                  No hay artículos para cotizar
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[240px] mb-4">
                  Explora nuestro catálogo y agrega los equipos e insumos médicos que requiera tu institución.
                </p>
                <Link
                  to="/productos"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2C3E50] text-white text-xs font-bold hover:bg-[#1E2B37] active:scale-[0.98] transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Explorar Catálogo</span>
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider truncate">
                      {item.brand}
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 truncate leading-snug" title={item.name}>
                      {item.name}
                    </h5>
                    {item.model && (
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        Mod: {item.model}
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                      title="Disminuir cantidad"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-800 w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                      title="Aumentar cantidad"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                    title="Eliminar ítem"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {items.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Fichas y cotización oficial
                </span>
                <button
                  type="button"
                  onClick={clearTray}
                  className="text-slate-400 hover:text-slate-700 text-[11px] underline"
                >
                  Vaciar lista
                </button>
              </div>

              <Link
                to="/cotizar"
                onClick={onClose}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-brand-cyan hover:bg-[#0087a3] active:bg-[#00768e] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
              >
                <span>Continuar a Cotización</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
