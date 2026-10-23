import React, { useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface FlashNoticeProps {
  message: string | null;
  onDismiss: () => void;
  /** Auto-dismiss delay in ms. */
  duration?: number;
}

/** Small non-blocking notice shown at the top of the viewport (replaces window.alert). */
export function FlashNotice({ message, onDismiss, duration = 4000 }: FlashNoticeProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-2rem)] max-w-md pointer-events-none"
    >
      {message && (
        <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900 shadow-lg animate-fadeIn">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
          <span className="flex-1">{message}</span>
          <button
            type="button"
            onClick={onDismiss}
            className="-m-1 p-1 rounded-md text-amber-700 hover:bg-amber-100"
            aria-label="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
