import { useState, useEffect, useCallback } from 'react';

export interface FavoriteProduct {
  id: number;
  name: string;
  slug: string;
  brandName?: string | null;
  model?: string | null;
  imageUrl?: string | null;
  categoryName?: string | null;
  addedAt?: number;
}

const STORAGE_KEY = 'izcor_user_favorites';
const EVENT_NAME = 'izcor_favorites_updated';

function getStoredFavorites(): FavoriteProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>(getStoredFavorites);

  const syncFavorites = useCallback(() => {
    setFavorites(getStoredFavorites());
  }, []);

  useEffect(() => {
    syncFavorites();

    const handleCustomEvent = () => syncFavorites();
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) syncFavorites();
    };

    window.addEventListener(EVENT_NAME, handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(EVENT_NAME, handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [syncFavorites]);

  const isFavorite = useCallback(
    (id: number) => {
      return favorites.some((item) => item.id === id);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (product: Omit<FavoriteProduct, 'addedAt'>): { isAdded: boolean } => {
      const current = getStoredFavorites();
      const exists = current.some((item) => item.id === product.id);

      let next: FavoriteProduct[];
      let isAdded: boolean;

      if (exists) {
        next = current.filter((item) => item.id !== product.id);
        isAdded = false;
      } else {
        next = [
          ...current,
          {
            ...product,
            addedAt: Date.now(),
          },
        ];
        isAdded = true;
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save favorite:', err);
      }

      setFavorites(next);
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { productId: product.id, isAdded } }));

      return { isAdded };
    },
    []
  );

  const removeFavorite = useCallback((id: number) => {
    const current = getStoredFavorites();
    const next = current.filter((item) => item.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
    setFavorites(next);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { productId: id, isAdded: false } }));
  }, []);

  const clearFavorites = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear favorites:', err);
    }
    setFavorites([]);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { cleared: true } }));
  }, []);

  return {
    favorites,
    favoritesCount: favorites.length,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  };
}
