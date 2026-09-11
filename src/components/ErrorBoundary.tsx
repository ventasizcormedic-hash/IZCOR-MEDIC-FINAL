import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Aquí se registraría el error en el sistema de analítica
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-brand-navy mb-3">Algo salió mal</h1>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Hemos encontrado un error inesperado al cargar esta sección. Nuestro equipo técnico ha sido notificado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar nuevamente
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-brand-cyan hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
