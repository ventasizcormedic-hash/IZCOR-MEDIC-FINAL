import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Loader2, Package, Tag, Layers, 
  Building2, ChevronRight, ArrowRight, CornerDownLeft, Sparkles 
} from 'lucide-react';

interface SuggestionItem {
  id?: number;
  name?: string;
  slug?: string;
  model?: string;
  catalogNumber?: string;
  brandName?: string;
  manufacturer?: string;
}

interface SuggestionsData {
  products: SuggestionItem[];
  brands: SuggestionItem[];
  categories: SuggestionItem[];
  manufacturers: string[];
}

interface HeaderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HeaderSearchModal({ isOpen, onClose }: HeaderSearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsData>({
    products: [],
    brands: [],
    categories: [],
    manufacturers: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSuggestions({ products: [], brands: [], categories: [], manufacturers: [] });
    }
  }, [isOpen]);

  // Global ESC shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      // Open with Ctrl+K or Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
          const searchBtn = document.getElementById('header-search-btn');
          searchBtn?.click();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch suggestions
  useEffect(() => {
    const term = query.trim();
    if (!term || term.length < 2) {
      setSuggestions({ products: [], brands: [], categories: [], manufacturers: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Search suggestions error');
        const data = await res.json();
        setSuggestions({
          products: data.products || [],
          brands: data.brands || [],
          categories: data.categories || [],
          manufacturers: data.manufacturers || [],
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/productos?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectProduct = (slugOrId: string | number) => {
    onClose();
    navigate(`/producto/${slugOrId}`);
  };

  const handleSelectTerm = (term: string) => {
    onClose();
    navigate(`/productos?search=${encodeURIComponent(term)}`);
  };

  if (!isOpen) return null;

  const hasResults = 
    suggestions.products.length > 0 || 
    suggestions.brands.length > 0 || 
    suggestions.categories.length > 0 || 
    suggestions.manufacturers.length > 0;

  return (
    <div 
      id="header-search-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 md:pt-24 px-4 sm:px-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="header-search-modal-content"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="relative border-b border-slate-200/80 bg-slate-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-navy flex-shrink-0 shadow-2xs">
              <Search className="w-4 h-4 text-brand-navy" />
            </div>

            <input
              ref={inputRef}
              type="text"
              id="header-search-modal-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar equipo, modelo, SKU, marca o fabricante..."
              className="w-full bg-transparent text-sm md:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              autoComplete="off"
            />

            {loading && (
              <Loader2 className="w-5 h-5 text-brand-navy animate-spin flex-shrink-0" />
            )}

            {query && !loading && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 bg-slate-200/80 hover:bg-slate-300 text-slate-600 rounded-lg text-xs font-mono font-medium transition-colors"
              title="Cerrar búsqueda (Esc)"
            >
              ESC
            </button>
          </div>
        </form>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 p-2">
          {/* State 1: No query entered yet */}
          {!query.trim() && (
            <div className="p-6 text-center text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-brand-navy">
                <Sparkles className="w-6 h-6 text-brand-cyan" />
              </div>
              <p className="text-sm font-bold text-slate-800">Búsqueda Inteligente en Catálogo Médico</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Escriba el nombre de un equipo, código institucional, marca comercial (ej. Philips, Mindray, Siemens) o especialidad hospitalaria.
              </p>

              {/* Quick suggestion tags */}
              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {['Monitores multiparámetro', 'Camas UCI', 'Ecógrafos', 'Bombas de infusión', 'Mindray'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setQuery(sample)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* State 2: Query entered, loading finished, no results */}
          {query.trim().length >= 2 && !loading && !hasResults && (
            <div className="p-8 text-center">
              <p className="text-sm font-bold text-slate-800">No encontramos coincidencias para "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">
                Intente buscar con términos más generales o presione <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Enter</kbd> para consultar todo el catálogo.
              </p>
            </div>
          )}

          {/* State 3: Structured Results */}
          {hasResults && (
            <div className="space-y-3 p-2">
              {/* Products */}
              {suggestions.products.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-brand-navy" />
                      Equipos Médicos ({suggestions.products.length})
                    </span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {suggestions.products.slice(0, 5).map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProduct(prod.slug || prod.id!)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-brand-navy truncate">
                            {prod.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs">
                            {prod.brandName && (
                              <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded">
                                {prod.brandName}
                              </span>
                            )}
                            {prod.model && (
                              <span className="text-[11px] font-mono text-slate-500">
                                Mod: {prod.model}
                              </span>
                            )}
                            {prod.catalogNumber && (
                              <span className="text-[11px] font-mono text-slate-400">
                                SKU: {prod.catalogNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-navy group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands & Categories Side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {suggestions.brands.length > 0 && (
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-cyan" />
                      Marcas
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.brands.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleSelectTerm(b.name || '')}
                          className="px-2.5 py-1 bg-white hover:bg-cyan-50 text-slate-800 hover:text-brand-cyan rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.categories.length > 0 && (
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      Categorías
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectTerm(c.name || '')}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Manufacturers */}
              {suggestions.manufacturers.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    Fabricantes
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {suggestions.manufacturers.map((mfg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectTerm(mfg)}
                        className="px-2.5 py-1 bg-blue-50/80 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-medium transition-colors"
                      >
                        {mfg}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span>Presione</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-700 flex items-center gap-0.5">
              <CornerDownLeft className="w-3 h-3" /> Enter
            </kbd>
            <span>para ver todos los resultados</span>
          </span>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-1 font-bold text-[#2C3E50] hover:text-brand-cyan transition-colors"
          >
            <span>Ver catálogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
