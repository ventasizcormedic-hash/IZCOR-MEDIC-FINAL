import React from 'react';
import { Heart, Share2, Layers, Check, MessageCircle } from 'lucide-react';
import { useFavorites, FavoriteProduct } from '../../hooks/useFavorites';
import { useProductShare } from '../../hooks/useProductShare';

export interface ProductQuickActionsProps {
  product: {
    id: number;
    name: string;
    slug: string;
    brandName?: string | null;
    model?: string | null;
    imageUrl?: string | null;
    categoryName?: string | null;
  };
  isCompared?: boolean;
  onToggleCompare?: (product: any) => void;
  showWhatsApp?: boolean;
  layout?: 'floating' | 'inline' | 'compact';
  className?: string;
}

export const ProductQuickActions: React.FC<ProductQuickActionsProps> = ({
  product,
  isCompared = false,
  onToggleCompare,
  showWhatsApp = false,
  layout = 'floating',
  className = '',
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { copied, shareProduct } = useProductShare();

  const favorited = isFavorite(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brandName: product.brandName,
      model: product.model,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName,
    });
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await shareProduct({
      title: product.name,
      url: `/productos/${product.slug}`,
    });
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleCompare) {
      onToggleCompare(product);
    }
  };

  const getWhatsAppUrl = () => {
    const text = encodeURIComponent(
      `Hola IZCOR MEDIC, requiero información técnica y disponibilidad del producto: ${product.name}${
        product.model ? ` (Modelo: ${product.model})` : ''
      }.`
    );
    return `https://wa.me/51928130349?text=${text}`;
  };

  if (layout === 'floating') {
    return (
      <div
        className={`flex items-center gap-1.5 p-1 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-xs ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`size-10 flex items-center justify-center rounded-xl transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer ${
            favorited
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
          }`}
          title={favorited ? 'Guardado en favoritos (quitar)' : 'Guardar en favoritos'}
          aria-label={favorited ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShareClick}
          className={`size-10 flex items-center justify-center rounded-xl transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy cursor-pointer ${
            copied
              ? 'bg-emerald-50 text-emerald-600'
              : 'text-slate-400 hover:text-brand-navy hover:bg-slate-100'
          }`}
          title={copied ? '¡Enlace copiado al portapapeles!' : 'Compartir ficha del producto'}
          aria-label="Compartir producto"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  if (layout === 'inline') {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        {/* Favorite Button with text */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer ${
            favorited
              ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-rose-600'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current text-rose-600' : ''}`} />
          <span>{favorited ? 'Guardado en Favoritos' : 'Guardar Favorito'}</span>
        </button>

        {/* Share Button with text */}
        <button
          type="button"
          onClick={handleShareClick}
          className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy cursor-pointer ${
            copied
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-brand-navy'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>¡Enlace Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Compartir Ficha</span>
            </>
          )}
        </button>

        {/* Compare Button if onToggleCompare provided */}
        {onToggleCompare && (
          <button
            type="button"
            onClick={handleCompareClick}
            className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy cursor-pointer ${
              isCompared
                ? 'bg-brand-navy text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-brand-navy'
            }`}
          >
            {isCompared ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyan-300" />
                <span>En Comparativa</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Comparar Equipo</span>
              </>
            )}
          </button>
        )}

        {/* WhatsApp Direct Query */}
        {showWhatsApp && (
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold bg-[#25D366]/10 text-emerald-800 border border-emerald-200 hover:bg-[#25D366]/20 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
            <span>Consultar Disponibilidad</span>
          </a>
        )}
      </div>
    );
  }

  // Compact icon-only row
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleFavoriteClick}
        className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer ${
          favorited
            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
            : 'bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-slate-200 border border-transparent'
        }`}
        title={favorited ? 'Guardado en favoritos' : 'Guardar en favoritos'}
        aria-label="Favorito"
      >
        <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
      </button>

      <button
        type="button"
        onClick={handleShareClick}
        className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy cursor-pointer ${
          copied
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            : 'bg-slate-100 text-slate-500 hover:text-brand-navy hover:bg-slate-200 border border-transparent'
        }`}
        title={copied ? '¡Enlace copiado!' : 'Copiar enlace'}
        aria-label="Compartir"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
