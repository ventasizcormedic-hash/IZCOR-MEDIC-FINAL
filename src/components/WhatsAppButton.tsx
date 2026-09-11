import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="size-8"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.67-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 0 1-1.511-5.26C2.17 7.066 6.604 2.63 12.05 2.63a9.83 9.83 0 0 1 6.99 2.898 9.83 9.83 0 0 1 2.893 6.994c-.003 5.446-4.437 9.88-9.882 9.88m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.141 1.588 5.945L.057 24l6.304-1.654a11.865 11.865 0 0 0 5.657 1.438h.005c6.554 0 11.89-5.335 11.893-11.89a11.82 11.82 0 0 0-3.452-8.406" />
    </svg>
  );
}

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex items-center gap-4 sm:right-6">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-white px-4 py-3 rounded-lg shadow-xl border border-slate-100 hidden sm:block"
          >
            <p className="text-sm font-bold text-brand-navy mb-0.5">¿Necesitas ayuda?</p>
            <p className="text-xs text-slate-500">Escríbenos por WhatsApp</p>
            {/* Tooltip triangle */}
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 border-8 border-transparent border-l-white"></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.a
        href="https://wa.me/51928130349"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar a asesores de IZCOR MEDIC por WhatsApp (abre en nueva pestaña)"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="size-14 min-w-14 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
      >
        <WhatsAppIcon />
      </motion.a>
    </div>
  );
}
