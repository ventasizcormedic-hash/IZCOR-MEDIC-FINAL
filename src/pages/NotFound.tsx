import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchX, Search, Grid, MessageSquareText } from 'lucide-react';
import { SeoHead } from '../components/seo/SeoHead';

export function NotFound() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/productos?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      <SeoHead
        title="Página no encontrada | IZCOR MEDIC"
        description="La página que busca no existe o fue movida. Busque un producto o vaya al catálogo de IZCOR MEDIC."
        noindex={true}
      />
      <main className="min-h-[75vh] bg-white flex items-center justify-center py-20 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-sm">
          <SearchX className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <h2 className="text-3xl md:text-4xl font-black text-brand-navy mb-4 tracking-tight">
          No encontramos productos que coincidan con tu búsqueda
        </h2>
        <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">
          Revisa la ortografía o intenta con el nombre de la marca o categoría. Si el producto es muy específico, podemos cotizarlo e importarlo para ti.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-10 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar otro producto, marca o modelo..."
            className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all text-slate-800"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-navy hover:bg-brand-navy-light text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/productos"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 hover:border-brand-cyan hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all"
          >
            <Grid className="w-4 h-4" />
            Ver todas las categorías
          </Link>
          <Link 
            to="/cotizar"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-navy/20"
          >
            <MessageSquareText className="w-4 h-4" />
            Solicitar manualmente
          </Link>
        </div>
      </div>
    </main>
    </>
  );
}
