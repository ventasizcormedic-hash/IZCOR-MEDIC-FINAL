import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const logEvent = (message: string, params?: Record<string, any>) => {
  // Only log in development until a real provider (GTM/GA4) is connected.
  if (import.meta.env.DEV) console.log(`[Analytics] ${message}`, params ?? '');
  // dataLayer.push({ event: eventName, ...eventParams });
};

/** Tracks one page view per route change. Mount once, in the public layout. */
export function usePageViewTracking() {
  const location = useLocation();

  useEffect(() => {
    logEvent(`page_view: ${location.pathname + location.search}`);
  }, [location]);
}

/**
 * Sistema básico de analítica en cliente (Memoria del sistema).
 * Preparado para conectar con GTM, GA4 o backend propio en el futuro.
 */
export function useAnalytics() {
  // Funciones específicas para eventos de producto y negocio
  const trackEvent = (eventName: string, eventParams: Record<string, any> = {}) => {
    logEvent(eventName, eventParams);
  };

  const trackProductView = (productData: { id: number; name: string; brand: string; category: string }) => {
    trackEvent('product_view', productData);
  };

  const trackQuoteStart = () => {
    trackEvent('form_start', { form_id: 'quote_form' });
  };

  const trackQuoteSubmit = () => {
    trackEvent('form_submit', { form_id: 'quote_form' });
    trackEvent('conversion', { type: 'quote' });
  };

  const trackSearch = (query: string) => {
    trackEvent('search', { search_term: query });
  };

  return {
    trackEvent,
    trackProductView,
    trackQuoteStart,
    trackQuoteSubmit,
    trackSearch
  };
}
