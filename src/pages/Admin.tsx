import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { auth, googleAuthProvider } from '../lib/firebase';
import {
  signInWithPopup, signInWithRedirect, getRedirectResult,
  onAuthStateChanged, signOut, User
} from 'firebase/auth';
import {
  Upload, CheckCircle2, LayoutDashboard, Package, Tag,
  Layers, FileText, Settings, Menu, X, Inbox, AlertCircle,
  Eye, ShieldCheck, RefreshCw, Globe, Activity, ShieldX,
  DatabaseBackup, Zap, Gauge, Users, AlertOctagon, BarChart3, Image as ImageIcon
} from 'lucide-react';

import { AdminDashboard } from '../components/admin/AdminDashboard';
import { ProductManager } from '../components/admin/ProductManager';
import { ProductReviewWorkspace } from '../components/admin/ProductReviewWorkspace';
import { ValidationManager } from '../components/admin/ValidationManager';
import { DeduplicationManager } from '../components/admin/DeduplicationManager';
import { ManufacturersManager } from '../components/admin/ManufacturersManager';
import { CategoriesManager } from '../components/admin/CategoriesManager';
import { MediaCenterManager } from '../components/admin/MediaCenterManager';
import { AutonomousEngineManager } from '../components/admin/AutonomousEngineManager';
import { ScraperManager } from '../components/admin/ScraperManager';
import { MassImportManager } from '../components/admin/MassImportManager';
import { SourcesManager } from '../components/admin/SourcesManager';
import { ErrorCenterManager } from '../components/admin/ErrorCenterManager';
import { AuditLogsManager } from '../components/admin/AuditLogsManager';
import { AnalyticsManager } from '../components/admin/AnalyticsManager';
import { UsersManager } from '../components/admin/UsersManager';
import { PerformanceManager } from '../components/admin/PerformanceManager';
import { SystemHealthManager } from '../components/admin/SystemHealthManager';
import { SettingsManager } from '../components/admin/SettingsManager';
import { ReadinessReportManager } from '../components/admin/ReadinessReportManager';
import { RequestsInboxManager } from '../components/admin/RequestsInboxManager';
import { AdminFeedbackProvider } from '../components/admin/ui/AdminFeedback';
import { useModalBehavior } from '../hooks/useModalBehavior';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

type AccessState = 'checking' | 'granted' | 'denied' | 'error';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/popup-closed-by-user': 'Se cerró la ventana de Google antes de completar el inicio de sesión.',
  'auth/cancelled-popup-request': 'Se canceló el inicio de sesión. Intente nuevamente.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase. Agréguelo en Firebase Console → Authentication → Settings → Authorized domains.',
  'auth/network-request-failed': 'No hay conexión con el servicio de autenticación. Revise su conexión a internet.',
  'auth/operation-not-allowed': 'El inicio de sesión con Google no está habilitado en Firebase.',
};

export function Admin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(false);
  const [access, setAccess] = useState<AccessState>('checking');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = React.useRef<HTMLElement>(null);

  // Navigation state lives in the URL: /admin/<tab>?filtros
  const activeTab = location.pathname.replace(/^\/admin\/?/, '').split('/')[0] || 'dashboard';
  const query = new URLSearchParams(location.search);
  const goToTab = useCallback((tab: string, params?: Record<string, string | undefined>) => {
    const search = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v) search.set(k, v); });
    const qs = search.toString();
    navigate(`/admin/${tab}${qs ? `?${qs}` : ''}`);
    setSidebarOpen(false);
  }, [navigate]);

  // Close the mobile sidebar with Escape / keep focus inside while open (only below lg).
  const isMobileSidebar = sidebarOpen && typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches;
  useModalBehavior(isMobileSidebar, () => setSidebarOpen(false), sidebarRef);

  const fetchDashboardStats = useCallback(async (currentUser: User | null) => {
    if (!currentUser) return;
    setStatsLoading(true);
    setStatsError(false);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
    } catch (e) {
      console.error("Error al obtener estadísticas del panel:", e);
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Sync the signed-in user and check their role before showing the panel.
  const checkAccess = useCallback(async (currentUser: User) => {
    setAccess('checking');
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.isAdmin) {
        setAccess('granted');
        fetchDashboardStats(currentUser);
      } else {
        setAccess('denied');
      }
    } catch (e) {
      console.error('Error al verificar acceso:', e);
      setAccess('error');
    }
  }, [fetchDashboardStats]);

  useEffect(() => {
    // Surface errors from a redirect-based sign-in (used when popups are blocked).
    getRedirectResult(auth).catch((e: any) => {
      setLoginError(AUTH_ERROR_MESSAGES[e?.code] || 'No se pudo iniciar sesión con Google.');
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        checkAccess(currentUser);
      }
    });
    return unsubscribe;
  }, [checkAccess]);

  const login = async () => {
    setLoginError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (e: any) {
      if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/operation-not-supported-in-this-environment') {
        // Popups blocked (common on mobile/in-app browsers): fall back to a full-page redirect.
        try {
          await signInWithRedirect(auth, googleAuthProvider);
          return;
        } catch (redirectError: any) {
          e = redirectError;
        }
      }
      console.error(e);
      setLoginError(AUTH_ERROR_MESSAGES[e?.code] || `No se pudo iniciar sesión con Google${e?.code ? ` (${e.code})` : ''}.`);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading || (user && access === 'checking')) {
    return (
      <div className="p-20 text-center text-slate-500 flex flex-col gap-3 items-center justify-center min-h-screen" role="status">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        <span className="text-sm font-medium">{user ? 'Verificando permisos...' : 'Cargando...'}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white font-black text-2xl">
            IZ
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Acceso Administrativo</h1>
          <p className="text-slate-500 mb-8 font-medium">Centro de Control de Catálogo Oficial de Grado Médico.</p>
          <button
            type="button"
            onClick={login}
            disabled={isSigningIn}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl flex justify-center items-center gap-3 transition-colors shadow-lg shadow-slate-900/20"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-1 text-slate-900" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"/>
            </svg>
            {isSigningIn ? 'Abriendo Google...' : 'Continuar con Google'}
          </button>
          {loginError && (
            <div role="alert" className="mt-4 flex items-start gap-2 text-left bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}
          <Link to="/" className="inline-block mt-6 text-xs font-semibold text-slate-500 hover:text-slate-800">
            ← Volver al sitio
          </Link>
        </div>
      </div>
    );
  }

  if (access !== 'granted') {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            {access === 'denied' ? <ShieldX className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2">
            {access === 'denied' ? 'Acceso restringido' : 'No se pudo verificar el acceso'}
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            {access === 'denied' ? (
              <>La cuenta <strong className="text-slate-900">{user.email}</strong> no tiene rol de administrador. Pida a un SUPER_ADMIN que le asigne el rol ADMIN.</>
            ) : (
              'Hubo un problema al comunicarse con el servidor. Intente nuevamente.'
            )}
          </p>
          <div className="flex flex-col gap-2">
            {access === 'error' && (
              <button type="button" onClick={() => checkAccess(user)} className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold">
                Reintentar
              </button>
            )}
            <button type="button" onClick={() => signOut(auth)} className="w-full h-11 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold">
              Cerrar sesión y usar otra cuenta
            </button>
            <Link to="/" className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-800">← Volver al sitio</Link>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar Menu Sections
  const menuSections: Array<{ title: string; items: MenuItem[] }> = [
    {
      title: 'OPERACIONES',
      items: [
        { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
        { id: 'requests', label: 'Solicitudes de Clientes', icon: Inbox },
        { id: 'products', label: 'Gestión de Productos', icon: Package },
        { id: 'review', label: 'Centro de Revisión', icon: Eye, badge: stats?.reviewProducts },
        { id: 'validation', label: 'Control de Calidad', icon: CheckCircle2 },
        { id: 'deduplication', label: 'Deduplicación & Fusión', icon: ShieldCheck },
      ]
    },
    {
      title: 'CATÁLOGO MAESTRO',
      items: [
        { id: 'brands', label: 'Fabricantes & Marcas', icon: Tag },
        { id: 'categories', label: 'Categorías Médicas', icon: Layers },
        { id: 'media', label: 'Imágenes & Documentos', icon: ImageIcon },
        { id: 'sources', label: 'Fuentes de Extracción', icon: Globe },
      ]
    },
    {
      title: 'AUTOMATIZACIÓN & EXTRACCIÓN',
      items: [
        { id: 'autonomous', label: 'Motor Autónomo', icon: Zap },
        { id: 'scraper', label: 'Web Scraper', icon: Upload },
        { id: 'import', label: 'Importación Masiva (Jobs)', icon: DatabaseBackup },
        { id: 'errors', label: 'Alertas & Errores', icon: AlertOctagon },
      ]
    },
    {
      title: 'GOBERNANZA & ESCALA',
      items: [
        { id: 'readiness', label: 'Auditoría & Preparación 50K+', icon: ShieldCheck },
        { id: 'audit', label: 'Historial & Auditoría', icon: FileText },
        { id: 'analytics', label: 'Analítica & Métricas', icon: BarChart3 },
        { id: 'users', label: 'Usuarios & Permisos', icon: Users },
        { id: 'performance', label: 'Rendimiento & Escala', icon: Gauge },
        { id: 'health', label: 'Salud del Sistema', icon: Activity },
        { id: 'settings', label: 'Configuración & Mantenimiento', icon: Settings },
      ]
    }
  ];

  const allItems = menuSections.flatMap(s => s.items);
  const activeItem = allItems.find(i => i.id === activeTab);
  const productFilters = {
    manufacturer: query.get('fabricante') || undefined,
    categoryId: query.get('categoria') || undefined,
    issue: query.get('incidencia') || undefined,
  };

  return (
    <AdminFeedbackProvider>
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar - Dark Mode (drawer below lg, fixed column on desktop) */}
      <aside
        ref={sidebarRef}
        id="admin-sidebar"
        aria-label="Menú del panel"
        className={`w-64 bg-[#0B1329] text-slate-300 flex flex-col fixed inset-y-0 left-0 z-40 shadow-xl transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/5 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md">
              IZ
            </div>
            <div>
              <span className="font-bold text-white tracking-wide text-sm block">Izcor Medic</span>
              <span className="text-[10px] text-blue-400 font-semibold block tracking-wider uppercase">Centro de Control</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 -mr-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6" aria-label="Secciones del panel">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Link
                    key={item.id}
                    to={`/admin/${item.id}`}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2.5 lg:py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'hover:bg-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/5 bg-[#080E1E]">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 border border-white/10 flex items-center justify-center text-white font-bold text-xs">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user.email}</div>
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Abrir menú del panel"
              aria-controls="admin-sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-slate-400">
              Panel Administrativo
            </span>
            <span className="hidden sm:inline text-slate-300">&bull;</span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-700 truncate">
              {activeItem?.label || 'Sección no encontrada'}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => fetchDashboardStats(user)}
              disabled={statsLoading}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 disabled:opacity-60 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              title="Actualizar métricas"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${statsLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <Link to="/" className="hidden md:inline text-xs font-semibold text-slate-500 hover:text-slate-800">
              Ver sitio
            </Link>
          </div>
        </header>

        {/* Dynamic View Rendering */}
        <div className="p-4 lg:p-8 flex-1 min-w-0">
          {!activeItem && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <p className="text-sm font-semibold text-slate-700 mb-3">Esta sección del panel no existe.</p>
              <Link to="/admin/dashboard" className="text-sm font-bold text-blue-600 hover:underline">Ir al Panel Principal</Link>
            </div>
          )}

          {activeTab === 'dashboard' && (
            statsError && !stats ? (
              <div role="alert" className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-rose-800 mb-4">No se pudieron cargar las métricas del panel.</p>
                <button type="button" onClick={() => fetchDashboardStats(user)} className="h-10 px-5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
                  Reintentar
                </button>
              </div>
            ) : (
              <AdminDashboard
                stats={stats}
                isLoading={statsLoading}
                onNavigate={(tab, filter) => {
                  const target = tab.toLowerCase();
                  if (tab === 'REVIEW') goToTab('review');
                  else if (tab === 'OUTDATED') goToTab('products', { estado: 'OUTDATED' });
                  else if (target === 'products') goToTab('products', { estado: filter && filter !== 'ALL' ? filter : undefined });
                  else goToTab(target);
                }}
                onRefresh={() => fetchDashboardStats(user)}
              />
            )
          )}

          {activeTab === 'requests' && (
            <RequestsInboxManager user={user} />
          )}

          {activeTab === 'products' && (
            <ProductManager
              key={location.search}
              user={user}
              initialFilter={query.get('estado') || 'ALL'}
              initialFilters={productFilters}
              onNavigateToTab={(tab) => goToTab(tab)}
            />
          )}

          {activeTab === 'review' && (
            <ProductReviewWorkspace user={user} />
          )}

          {activeTab === 'validation' && (
            <ValidationManager user={user} />
          )}

          {activeTab === 'deduplication' && (
            <DeduplicationManager user={user} />
          )}

          {activeTab === 'brands' && (
            <ManufacturersManager
              user={user}
              onFilterProductsByManufacturer={(mfg) => goToTab('products', { fabricante: mfg })}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesManager
              user={user}
              onFilterProductsByCategory={(catId) => goToTab('products', { categoria: String(catId) })}
            />
          )}

          {activeTab === 'media' && (
            <MediaCenterManager
              user={user}
              onFilterProductsWithoutImage={() => goToTab('products', { incidencia: 'NO_IMAGE' })}
            />
          )}

          {activeTab === 'sources' && (
            <SourcesManager user={user} />
          )}

          {activeTab === 'autonomous' && (
            <AutonomousEngineManager user={user} onRefresh={() => fetchDashboardStats(user)} />
          )}

          {activeTab === 'scraper' && (
            <ScraperManager user={user} />
          )}

          {activeTab === 'import' && (
            <MassImportManager user={user} />
          )}

          {activeTab === 'errors' && (
            <ErrorCenterManager
              user={user}
              onRetrySource={() => goToTab('sources')}
            />
          )}

          {activeTab === 'readiness' && (
            <ReadinessReportManager
              user={user}
              onNavigateToTab={(tab) => goToTab(tab)}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogsManager user={user} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsManager stats={stats} />
          )}

          {activeTab === 'users' && (
            <UsersManager user={user} />
          )}

          {activeTab === 'performance' && (
            <PerformanceManager user={user} />
          )}

          {activeTab === 'health' && (
            <SystemHealthManager user={user} />
          )}

          {activeTab === 'settings' && (
            <SettingsManager user={user} />
          )}
        </div>
      </main>
    </div>
    </AdminFeedbackProvider>
  );
}
