import { useCallback, useSyncExternalStore } from 'react';
import type { ComparisonProduct } from '../components/catalog/types';

const STORAGE_KEY = 'izcor_product_comparison';
const CHANGE_EVENT = 'izcor:comparison-change';
export const MAX_COMPARISON_ITEMS = 4;

let cachedRaw: string | null = null;
let cachedList: ComparisonProduct[] = [];

function readList(): ComparisonProduct[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  // Keep the same array reference while storage is unchanged (required by useSyncExternalStore).
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedList = Array.isArray(parsed) ? parsed : [];
  } catch {
    cachedList = [];
  }
  return cachedList;
}

function writeList(list: ComparisonProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to persist comparison list', e);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  // CHANGE_EVENT covers this tab; 'storage' covers other tabs.
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

const EMPTY: ComparisonProduct[] = [];

/** Product comparison list shared by every component and persisted in localStorage. */
export function useComparison() {
  const list = useSyncExternalStore(subscribe, readList, () => EMPTY);

  /** Adds or removes the product. Returns false when the list is full and nothing was added. */
  const toggle = useCallback((item: ComparisonProduct): boolean => {
    const current = readList();
    if (current.some(p => p.id === item.id)) {
      writeList(current.filter(p => p.id !== item.id));
      return true;
    }
    if (current.length >= MAX_COMPARISON_ITEMS) return false;
    writeList([...current, item]);
    return true;
  }, []);

  const remove = useCallback((id: number) => {
    writeList(readList().filter(p => p.id !== id));
  }, []);

  const clear = useCallback(() => writeList([]), []);

  return { list, toggle, remove, clear };
}
