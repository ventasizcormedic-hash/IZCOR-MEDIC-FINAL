import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Loader2, History, Package, Building2, Tag, 
  Layers, ChevronRight, ShieldCheck, AlertCircle 
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
  models: SuggestionItem[];
}

interface MedicalSearchBoxProps {
  searchTerm: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query?: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const MedicalSearchBox: React.FC<MedicalSearchBoxProps> = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  placeholder = "Buscar equipo médico, modelo, fabricante, SKU, marca o especialidad...",
  className = "",
  autoFocus = false,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsData>({
    products: [],
    brands: [],
    categories: [],
    manufacturers: [],
    models: [],
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('izcor_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce and race-condition / obsolete query protection
  useEffect(() => {
    const term = searchTerm.trim();
    if (!term || term.length < 2) {
      setSuggestions({ products: [], brands: [], categories: [], manufacturers: [], models: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Error fetching suggestions');
        const data = await res.json();
        startTransition(() => {
          setSuggestions(data);
          setIsLoading(false);
          setIsOpen(true);
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (term) {
      saveRecentSearch(term);
    }
    setIsOpen(false);
    onSearchSubmit(term);
  };

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('izcor_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectTerm = (term: string) => {
    onSearchChange(term);
    saveRecentSearch(term);
    setIsOpen(false);
    navigate(`/productos?search=${encodeURIComponent(term)}`);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('izcor_recent_searches');
  };

  const totalFlatItems = 
    suggestions.products.length + 
    suggestions.brands.length + 
    suggestions.categories.length + 
    suggestions.manufacturers.length + 
    suggestions.models.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalFlatItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalFlatItems - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const hasSuggestions = 
    suggestions.products.length > 0 ||
    suggestions.brands.length > 0 ||
    suggestions.categories.length > 0 ||
    suggestions.manufacturers.length > 0 ||
    suggestions.models.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleFormSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          id="medical-search-input"
          value={searchTerm}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-11 pr-12 py-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 shadow-2xs transition-all"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="medical-search-results"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-brand-navy animate-spin" />
          )}
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Limpiar búsqueda"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete & Suggestions Dropdown */}
      {isOpen && (
        <div 
          id="medical-search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-[480px] overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-150"
          role="listbox"
        >
          {/* State 1: Empty search term -> Show recent searches */}
          {!searchTerm.trim() && recentSearches.length > 0 && (
            <div className="p-3">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-500 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  Búsquedas recientes
                </span>
                <button
                  type="button"
                  onClick={handleClearRecent}
                  className="text-slate-400 hover:text-rose-600 text-[11px] font-medium"
                >
                  Borrar historial
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectTerm(term)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/60 transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-3 h-3 text-slate-400" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* State 2: Searching with term but no results yet */}
          {searchTerm.trim() && !isLoading && !hasSuggestions && (
            <div className="p-8 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-800">No encontramos resultados para "{searchTerm}"</p>
              <p className="text-xs text-slate-500 mt-1">Verifique la ortografía o intente buscar por marca, modelo o código general.</p>
            </div>
          )}

          {/* State 3: Categorized Suggestions */}
          {hasSuggestions && (
            <div className="py-2">
              {suggestions.products.length > 0 && (
                <div className="px-3 py-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1">
                    <Package className="w-3 h-3 text-brand-navy" />
                    Productos Médicos ({suggestions.products.length})
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {suggestions.products.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => {
                          saveRecentSearch(prod.name || searchTerm);
                          setIsOpen(false);
                          navigate(`/producto/${prod.slug || prod.id}`);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-brand-navy truncate">
                            {prod.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {prod.brandName && (
                              <span className="text-[10px] font-semibold text-brand-navy bg-slate-100 px-1.5 py-0.2 rounded">
                                {prod.brandName}
                              </span>
                            )}
                            {prod.model && (
                              <span className="text-[10px] font-mono text-slate-500">
                                Modelo: {prod.model}
                              </span>
                            )}
                            {prod.catalogNumber && (
                              <span className="text-[10px] font-mono text-slate-400">
                                SKU: {prod.catalogNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-navy flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.brands.length > 0 && (
                <div className="px-3 py-1.5 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-brand-cyan" />
                    Marcas ({suggestions.brands.length})
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1 px-2">
                    {suggestions.brands.map((brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => handleSelectTerm(brand.name || '')}
                        className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg text-xs font-bold transition-colors"
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.categories.length > 0 && (
                <div className="px-3 py-1.5 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-emerald-600" />
                    Categorías ({suggestions.categories.length})
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1 px-2">
                    {suggestions.categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectTerm(cat.name || '')}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.manufacturers.length > 0 && (
                <div className="px-3 py-1.5 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-blue-600" />
                    Fabricantes
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1 px-2">
                    {suggestions.manufacturers.map((mfg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectTerm(mfg)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        {mfg}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Presione <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">Enter</kbd> para buscar en todo el catálogo
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onSearchSubmit(searchTerm);
                  }}
                  className="text-xs font-bold text-brand-navy hover:underline flex items-center gap-1"
                >
                  <span>Ver todos los resultados</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
