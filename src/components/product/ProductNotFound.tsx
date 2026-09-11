import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Search, Layers, Home } from 'lucide-react';

export const ProductNotFound: React.FC = () => {
  return (
    <main className="min-h-[70vh] bg-[#F8FAFC] py-20 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-200 shadow-2xs">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-md">
          Registro No Disponible
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-2">
          Ficha Médica No Encontrada
        </h1>

        <p className="text-slate-600 text-xs sm:text-sm mb-8 leading-relaxed max-w-md mx-auto">
          El equipo o referencia técnica solicitada no se encuentra en el índice activo o ha sido reubicada conforme a las actualizaciones regulatorias de DIGEMID.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/productos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white font-bold text-xs shadow-xs hover:bg-brand-navy-light transition-colors"
          >
            <Search className="w-4 h-4" />
            Explorar Catálogo Oficial
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Página de Inicio
          </Link>
        </div>
      </div>
    </main>
  );
};
