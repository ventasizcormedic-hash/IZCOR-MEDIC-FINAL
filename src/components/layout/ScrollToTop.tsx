import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the top on route change, or to the #hash target when the URL has one. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a frame so the target section of the new page is rendered.
      const frame = requestAnimationFrame(() => {
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' });
      });
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}
