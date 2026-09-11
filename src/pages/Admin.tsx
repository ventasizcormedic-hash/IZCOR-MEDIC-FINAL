import React, { useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  Upload, AlertCircle, CheckCircle2, LayoutDashboard, Package, Tag, 
  Layers, FileText, Settings, Search, Bell, 
  Eye, ShieldCheck, Trash2, RefreshCw, Filter, Globe, Activity, 
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

export function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [productFilterInitial, setProductFilterInitial] = useState<string>('ALL');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        fetchDashboardStats(currentUser);
      }
    });
    return unsubscribe;
  }, []);

  const fetchDashboardStats = async (currentUser = user) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      // Auto-sync user to db
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const res = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Error al obtener estadísticas del panel:", e);
    }
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-slate-500 flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white font-black text-2xl">
            IZ
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Acceso Administrativo</h1>
          <p className="text-slate-500 mb-8 font-medium">Centro de Control de Catálogo Oficial de Grado Médico.</p>
          <button 
            onClick={login}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl flex justify-center items-center gap-3 transition-colors shadow-lg shadow-slate-900/20"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-1 text-slate-900" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"/>
            </svg>
            Continuar con Google
          </button>
        </div>
      </div>
    );
  }

  // Sidebar Menu Sections
  const menuSections = [
    {
      title: 'OPERACIONES',
      items: [
        { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
        { id: 'products', label: 'Gestión de Productos', icon: Package },
        { id: 'review', label: 'Centro de Revisión', icon: Eye, badge: stats?.reviewProducts },
        { id: 'validation', label: 'Control de Calidad', icon: CheckCircle2 },
        { id: 'deduplication', label: 'Deduplicación & Fusión', icon: ShieldCheck, badge: stats?.pendingAlerts?.duplicateCases },
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
        { id: 'errors', label: 'Alertas & Errores', icon: AlertOctagon, badge: stats?.pendingAlerts?.validationErrors },
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar - Dark Mode */}
      <aside className="w-64 bg-[#0B1329] text-slate-300 flex flex-col fixed inset-y-0 left-0 z-20 shadow-xl">
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
        </div>
        
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
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
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/5 bg-[#080E1E]">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 border border-white/10 flex items-center justify-center text-white font-bold text-xs">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user.email}</div>
              <button 
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
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Panel Administrativo
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs font-bold text-slate-700 capitalize">
              {activeTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchDashboardStats(user)}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              title="Sincronizar métricas"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Sincronizar</span>
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">En Línea</span>
            </div>
          </div>
        </header>

        {/* Dynamic View Rendering */}
        <div className="p-8 flex-1">
          {activeTab === 'dashboard' && (
            <AdminDashboard 
              stats={stats} 
              isLoading={loading}
              onNavigate={(tab) => {
                if (tab === 'REVIEW') {
                  setActiveTab('review');
                } else if (tab === 'OUTDATED') {
                  setActiveTab('products');
                  setProductFilterInitial('OUTDATED');
                } else {
                  setActiveTab(tab.toLowerCase());
                }
              }} 
              onRefresh={() => fetchDashboardStats(user)}
            />
          )}

          {activeTab === 'products' && (
            <ProductManager 
              user={user} 
              initialFilter={productFilterInitial} 
              onNavigateToTab={(tab) => setActiveTab(tab)}
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
              onFilterProductsByManufacturer={(mfg) => {
                setActiveTab('products');
              }}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesManager 
              user={user} 
              onFilterProductsByCategory={(catId) => {
                setActiveTab('products');
              }}
            />
          )}

          {activeTab === 'media' && (
            <MediaCenterManager 
              user={user} 
              onFilterProductsWithoutImage={() => {
                setActiveTab('products');
              }}
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
              onRetrySource={() => setActiveTab('scraper')}
            />
          )}

          {activeTab === 'readiness' && (
            <ReadinessReportManager 
              user={user} 
              onNavigateToTab={(tab) => setActiveTab(tab)}
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
            <PerformanceManager />
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
  );
}
