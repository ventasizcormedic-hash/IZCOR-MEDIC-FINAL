import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Sistema básico de analítica en cliente (Memoria del sistema).
 * Preparado para conectar con GTM, GA4 o backend propio en el futuro.
 */
export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // 1. Page View Tracking
    const trackPageView = () => {
      const pagePath = location.pathname + location.search;
      console.log(`[Analytics] page_view: ${pagePath}`);
      // dataLayer.push({ event: 'page_view', page_path: pagePath });
    };

    trackPageView();
  }, [location]);

  // Funciones específicas para eventos de producto y negocio
  const trackEvent = (eventName: string, eventParams: Record<string, any> = {}) => {
    console.log(`[Analytics] ${eventName}:`, eventParams);
    // dataLayer.push({ event: eventName, ...eventParams });
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
