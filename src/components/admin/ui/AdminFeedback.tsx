import React, { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useModalBehavior } from '../../../hooks/useModalBehavior';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' for destructive actions, 'primary' for publish-like ones. */
  tone?: 'danger' | 'primary';
}

interface AdminFeedbackContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
  /** Resolves true when the user confirms. Replaces window.confirm(). */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AdminFeedbackContext = createContext<AdminFeedbackContextType | null>(null);

const TOAST_STYLES: Record<ToastTone, { box: string; icon: React.ElementType; iconClass: string }> = {
  success: { box: 'bg-emerald-50 border-emerald-200 text-emerald-900', icon: CheckCircle2, iconClass: 'text-emerald-600' },
  error: { box: 'bg-rose-50 border-rose-200 text-rose-900', icon: AlertCircle, iconClass: 'text-rose-600' },
  info: { box: 'bg-blue-50 border-blue-200 text-blue-900', icon: Info, iconClass: 'text-blue-600' },
};

/** Toasts and confirmation dialog for the admin panel (replaces alert/confirm). */
export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const [pendingConfirm, setPendingConfirm] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const push = useCallback((tone: ToastTone, message: string) => {
    const id = nextId.current++;
    setToasts(prev => [...prev.slice(-3), { id, tone, message }]);
    setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 4000);
  }, [dismiss]);

  const toast = useRef({
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    info: (message: string) => push('info', message),
  }).current;

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      setPendingConfirm({ ...options, resolve });
    });
  }, []);

  const closeConfirm = useCallback((ok: boolean) => {
    setPendingConfirm(current => {
      current?.resolve(ok);
      return null;
    });
  }, []);

  useModalBehavior(Boolean(pendingConfirm), () => closeConfirm(false), dialogRef);

  const isDanger = pendingConfirm?.tone !== 'primary';

  return (
    <AdminFeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toasts */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 left-4 sm:left-auto z-[80] flex flex-col gap-2 sm:w-96 pointer-events-none"
      >
        {toasts.map(t => {
          const style = TOAST_STYLES[t.tone];
          const Icon = style.icon;
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-xs font-semibold shadow-lg animate-fadeIn ${style.box}`}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.iconClass}`} />
              <span className="flex-1 whitespace-pre-line">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="-m-1 p-1 rounded-md opacity-70 hover:opacity-100"
                aria-label="Cerrar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation dialog */}
      {pendingConfirm && (
        <div
          className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => closeConfirm(false)}
        >
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            aria-describedby={pendingConfirm.message ? 'admin-confirm-message' : undefined}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-fadeIn"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDanger ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 id="admin-confirm-title" className="text-base font-bold text-slate-900">
                  {pendingConfirm.title}
                </h2>
                {pendingConfirm.message && (
                  <div id="admin-confirm-message" className="mt-1 text-sm text-slate-600 leading-relaxed">
                    {pendingConfirm.message}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700"
              >
                {pendingConfirm.cancelLabel || 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className={`h-10 px-4 rounded-xl text-sm font-bold text-white ${isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {pendingConfirm.confirmLabel || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminFeedbackContext.Provider>
  );
}

export function useAdminFeedback() {
  const ctx = useContext(AdminFeedbackContext);
  if (!ctx) throw new Error('useAdminFeedback must be used within AdminFeedbackProvider');
  return ctx;
}
