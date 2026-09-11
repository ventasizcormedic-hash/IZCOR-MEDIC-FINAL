import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface QuoteTrayItem {
  id: number;
  name: string;
  brand: string;
  model: string;
  quantity: number;
  image?: string | null;
  slug?: string;
  categoryName?: string;
}

interface QuoteContextType {
  items: QuoteTrayItem[];
  itemCount: number;
  isTrayOpen: boolean;
  justAddedId: number | null;
  addItem: (product: {
    id: number;
    name: string;
    brandName?: string | null;
    model?: string | null;
    imageUrl?: string | null;
    slug?: string;
    categoryName?: string | null;
  }) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearTray: () => void;
  openTray: () => void;
  closeTray: () => void;
  toggleTray: () => void;
  isInTray: (id: number) => boolean;
}

const STORAGE_KEY = 'izcor_quote_tray';

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteTrayItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist quote tray to localStorage', e);
    }
  }, [items]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const addItem = (product: {
    id: number;
    name: string;
    brandName?: string | null;
    model?: string | null;
    imageUrl?: string | null;
    slug?: string;
    categoryName?: string | null;
  }) => {
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 2000);

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          brand: product.brandName?.trim() || 'IZCOR MEDIC',
          model: product.model?.trim() || '',
          quantity: 1,
          image: product.imageUrl || null,
          slug: product.slug || '',
          categoryName: product.categoryName || '',
        },
      ];
    });
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is QuoteTrayItem => item !== null)
    );
  };

  const clearTray = () => {
    setItems([]);
  };

  const openTray = () => setIsTrayOpen(true);
  const closeTray = () => setIsTrayOpen(false);
  const toggleTray = () => setIsTrayOpen((prev) => !prev);

  const isInTray = (id: number) => items.some((item) => item.id === id);

  return (
    <QuoteContext.Provider
      value={{
        items,
        itemCount,
        isTrayOpen,
        justAddedId,
        addItem,
        removeItem,
        updateQuantity,
        clearTray,
        openTray,
        closeTray,
        toggleTray,
        isInTray,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
}
