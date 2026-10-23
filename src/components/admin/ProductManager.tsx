import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Search, Filter, CheckCircle2, AlertTriangle, Eye, Edit, 
  Trash2, ExternalLink, Download, Sparkles, X, ChevronLeft, ChevronRight,
  ShieldAlert, RefreshCw, FileText, Globe, Check, Layers, Image as ImageIcon,
  SlidersHorizontal, ArrowUpDown, ChevronDown
} from 'lucide-react';
import { OptimizedImage } from '../common/OptimizedImage';
import { useAdminFeedback } from './ui/AdminFeedback';
import { useModalBehavior } from '../../hooks/useModalBehavior';

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  model: string | null;
  catalogNumber?: string | null;
  manufacturer: string | null;
  brandId: number | null;
  brandName?: string | null;
  categoryId: number | null;
  categoryName?: string | null;
  description: string | null;
  technicalSpecs: string | null;
  status: string;
  publicationStatus: string;
  verificationStatus: string;
  confidenceLevel: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  validationScore?: number;
  validationIssues?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListFilters {
  manufacturer?: string;
  categoryId?: string;
  issue?: string;
}

interface ProductManagerProps {
  user: any;
  initialFilter?: string;
  /** Extra filters coming from other screens (manufacturer, category, data issue). */
  initialFilters?: ProductListFilters;
  onNavigateToTab?: (tab: string) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  user,
  initialFilter = 'ALL',
  initialFilters = {},
  onNavigateToTab,
}) => {
  const { toast, confirm } = useAdminFeedback();
  const [activeStatusTab, setActiveStatusTab] = useState<string>(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [filterManufacturer, setFilterManufacturer] = useState(initialFilters.manufacturer || '');
  const [filterCategoryId, setFilterCategoryId] = useState(initialFilters.categoryId || '');
  const [brandOptions, setBrandOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ id: number; name: string; parentId?: number | null }>>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Advanced Filters
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterBrand, setFilterBrand] = useState<string>('ALL');
  const [filterIssue, setFilterIssue] = useState<string>(initialFilters.issue || 'ALL');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isPerformingBulk, setIsPerformingBulk] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  // Detail / Inspector Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'IDENTITY' | 'CLASSIFICATION' | 'SPECS' | 'MEDIA' | 'SOURCE' | 'QUALITY'>('IDENTITY');
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Fetch Products
  const fetchProducts = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      let queryUrl = `/api/admin/catalog/products?limit=${pageSize}&offset=${(page - 1) * pageSize}`;
      
      if (activeStatusTab !== 'ALL') {
        queryUrl += `&status=${activeStatusTab}`;
      }
      if (appliedSearch) {
        queryUrl += `&search=${encodeURIComponent(appliedSearch)}`;
      }
      if (filterIssue !== 'ALL') queryUrl += `&issue=${filterIssue}`;
      if (filterManufacturer) queryUrl += `&manufacturer=${encodeURIComponent(filterManufacturer)}`;
      if (filterCategoryId) queryUrl += `&categoryId=${encodeURIComponent(filterCategoryId)}`;

      setLoadError(false);
      const res = await fetch(queryUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setProducts(data.products || []);
      setTotalCount(data.total || 0);
      // Keep only selections that are still visible.
      setSelectedIds(prev => prev.filter(id => (data.products || []).some((p: ProductItem) => p.id === id)));
    } catch (err) {
      console.error("Error fetching products:", err);
      setLoadError(true);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user, activeStatusTab, page, pageSize, appliedSearch, filterIssue, filterManufacturer, filterCategoryId]);

  // Brand and category options for the inspector selects
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = await user.getIdToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        const [brandsRes, catsRes] = await Promise.all([
          fetch('/api/admin/brands/full', { headers }),
          fetch('/api/admin/categories/tree', { headers }),
        ]);
        if (brandsRes.ok) setBrandOptions(await brandsRes.json());
        if (catsRes.ok) setCategoryOptions(await catsRes.json());
      } catch (err) {
        console.error('Error loading brand/category options:', err);
      }
    })();
  }, [user]);

  // Handle Search submit (search and page change together, one fetch)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchTerm.trim());
  };

  const inspectorRef = React.useRef<HTMLDivElement>(null);
  useModalBehavior(Boolean(selectedProduct), () => setSelectedProduct(null), inspectorRef);

  // Inspect Product
  const handleInspect = async (id: number) => {
    if (!user) return;
    setIsDetailLoading(true);
    setSelectedProduct(null);
    setSaveSuccessMsg(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/catalog/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedProduct(data);
        setEditForm({ ...data });
      } else {
        toast.error(data.error || 'Error al cargar detalles del producto');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión al obtener producto');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Save changes in modal
  const handleSaveChanges = async () => {
    if (!user || !selectedProduct) return;
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/catalog/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccessMsg("Cambios guardados exitosamente.");
        toast.success('Cambios guardados.');
        fetchProducts();
        // Update local
        setSelectedProduct({
          ...selectedProduct,
          ...editForm,
          brandName: brandOptions.find(b => b.id === Number(editForm.brandId))?.name ?? selectedProduct.brandName,
          categoryName: categoryOptions.find(c => c.id === Number(editForm.categoryId))?.name ?? selectedProduct.categoryName,
        });
      } else {
        toast.error(data.error || 'Error al guardar cambios');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión al guardar producto');
    } finally {
      setIsSaving(false);
    }
  };

  // Single Quick Verification Change
  const [quickStatusId, setQuickStatusId] = useState<number | null>(null);
  const handleQuickStatus = async (id: number, status: string) => {
    if (!user) return;
    const product = products.find(p => p.id === id);
    const ok = await confirm(status === 'VERIFIED' ? {
      title: '¿Verificar este producto?',
      message: `"${product?.name || `#${id}`}" quedará marcado como VERIFICADO.`,
      confirmLabel: 'Verificar',
      tone: 'primary',
    } : {
      title: '¿Mover este producto a borrador?',
      message: `"${product?.name || `#${id}`}" dejará de figurar como verificado.`,
      confirmLabel: 'Mover a borrador',
    });
    if (!ok) return;
    setQuickStatusId(id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/catalog/products/${id}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verificationStatus: status })
      });
      if (res.ok) {
        toast.success(status === 'VERIFIED' ? 'Producto verificado.' : 'Producto movido a borrador.');
        fetchProducts();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'No se pudo actualizar el estado.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión al actualizar el estado.');
    } finally {
      setQuickStatusId(null);
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: string) => {
    if (!user || selectedIds.length === 0) return;
    const n = selectedIds.length;
    const BULK_CONFIRM: Record<string, { title: string; message: string; confirmLabel: string; tone?: 'danger' | 'primary' }> = {
      PUBLISH: { title: `¿Publicar ${n} producto(s)?`, message: 'Serán visibles en el catálogo público.', confirmLabel: 'Publicar', tone: 'primary' },
      UNPUBLISH: { title: `¿Despublicar ${n} producto(s)?`, message: 'Dejarán de verse en el catálogo público.', confirmLabel: 'Despublicar' },
      SET_VERIFIED: { title: `¿Marcar ${n} producto(s) como verificados?`, message: 'Se registrará su verificación a su nombre.', confirmLabel: 'Marcar verificados', tone: 'primary' },
      SET_DRAFT: { title: `¿Mover ${n} producto(s) a borrador?`, message: 'Dejarán de figurar como verificados.', confirmLabel: 'Mover a borrador' },
      DELETE: { title: `¿Eliminar permanentemente ${n} producto(s)?`, message: 'Esta acción no se puede deshacer.', confirmLabel: 'Eliminar' },
    };
    if (BULK_CONFIRM[action] && !(await confirm(BULK_CONFIRM[action]))) {
      return;
    }

    setIsPerformingBulk(true);
    setBulkMessage(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/catalog/products/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          productIds: selectedIds,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBulkMessage(data.message);
        toast.success(data.message || 'Acción masiva aplicada.');
        setSelectedIds([]);
        fetchProducts();
      } else {
        toast.error(data.error || 'Error en acción masiva');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión');
    } finally {
      setIsPerformingBulk(false);
    }
  };

  // Toggle selection
  // Selection only ever covers the rows currently shown in the table.
  const toggleSelectAll = () => {
    if (filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.includes(p.id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Status Tabs list
  const statusTabs = [
    { key: 'ALL', label: 'Todos' },
    { key: 'DRAFT', label: 'Borradores' },
    { key: 'REVIEW', label: 'En Revisión' },
    { key: 'VERIFIED', label: 'Verificados' },
    { key: 'OUTDATED', label: 'Desactualizados' },
  ];

  // Issue filters are applied by the server, so the page already holds exactly the visible rows.
  const filteredProducts = products;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión Integral de Productos</h2>
          <p className="text-xs text-gray-500">
            Administración, control de calidad, estados de publicación y auditoría por ficha médica
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchProducts()}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
            title="Recargar listado"
            aria-label="Recargar listado"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs por Estado */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-px">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveStatusTab(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
              activeStatusTab === tab.key
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Buscar productos"
              placeholder="Buscar por nombre, modelo, código o fabricante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filtrar por incidencia"
              value={filterIssue}
              onChange={(e) => { setFilterIssue(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todas las Incidencias</option>
              <option value="NO_IMAGE">Sin Imagen</option>
              <option value="NO_MODEL">Sin Modelo</option>
              <option value="NO_SPECS">Sin Especificaciones</option>
            </select>

            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Filtrar
            </button>
          </div>
        </div>

        {/* Filtros recibidos desde otras pantallas */}
        {(filterManufacturer || filterCategoryId) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500 font-semibold">Filtros activos:</span>
            {filterManufacturer && (
              <button type="button" onClick={() => { setFilterManufacturer(''); setPage(1); }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold">
                Fabricante: {filterManufacturer} <X className="w-3 h-3" aria-label="Quitar filtro" />
              </button>
            )}
            {filterCategoryId && (
              <button type="button" onClick={() => { setFilterCategoryId(''); setPage(1); }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold">
                Categoría: {categoryOptions.find(c => String(c.id) === filterCategoryId)?.name || `#${filterCategoryId}`} <X className="w-3 h-3" aria-label="Quitar filtro" />
              </button>
            )}
          </div>
        )}

        {/* Notificación de acción masiva */}
        {bulkMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
            <span>{bulkMessage}</span>
            <button type="button" onClick={() => setBulkMessage(null)} aria-label="Cerrar mensaje"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Toolbar de Acciones Masivas */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-xs animate-fadeIn">
            <div className="font-semibold text-blue-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              {selectedIds.length} producto{selectedIds.length > 1 ? 's' : ''} seleccionado{selectedIds.length > 1 ? 's' : ''}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={isPerformingBulk}
                onClick={() => handleBulkAction('PUBLISH')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-semibold transition"
              >
                Publicar
              </button>
              <button
                disabled={isPerformingBulk}
                onClick={() => handleBulkAction('UNPUBLISH')}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-semibold transition"
              >
                Despublicar
              </button>
              <button
                disabled={isPerformingBulk}
                onClick={() => handleBulkAction('SET_VERIFIED')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold transition"
              >
                Marcar Verificado
              </button>
              <button
                disabled={isPerformingBulk}
                onClick={() => handleBulkAction('SET_DRAFT')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md font-semibold transition"
              >
                Mover a Borrador
              </button>
              <button
                disabled={isPerformingBulk}
                onClick={() => handleBulkAction('DELETE')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md font-semibold transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-3 w-8 text-center">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos los productos visibles"
                    checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.includes(p.id))}
                    onChange={toggleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-3 w-16">Foto</th>
                <th className="p-3">Producto &amp; Modelo</th>
                <th className="p-3">Fabricante / Marca</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Quality Score</th>
                <th className="p-3">Verificación</th>
                <th className="p-3">Publicación</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Cargando catálogo oficial...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-rose-600">
                    No se pudo cargar el listado.{' '}
                    <button type="button" onClick={() => fetchProducts()} className="font-bold underline">Reintentar</button>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-gray-400">
                    No se encontraron productos con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr 
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-blue-50/40' : ''}`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar ${p.name}`}
                          checked={isSelected}
                          onChange={() => toggleSelectOne(p.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-3">
                        <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white p-0.5">
                          <OptimizedImage
                            src={p.imageUrl}
                            alt={p.name}
                            aspectRatio="square"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </td>

                      <td className="p-3 max-w-xs">
                        <div className="font-bold text-gray-900 line-clamp-1">{p.name}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>Mod: {p.model || 'N/A'}</span>
                          {p.catalogNumber && <span>&bull; Ref: {p.catalogNumber}</span>}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-gray-800">{p.manufacturer || 'General'}</div>
                        <div className="text-[11px] text-gray-400">{p.brandName || 'Genérica'}</div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {p.categoryName || 'Sin asignar'}
                        </span>
                      </td>

                      <td className="p-3">
                        {typeof p.validationScore === 'number' && p.validationScore > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-10 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  p.validationScore >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
                                }`} 
                                style={{ width: `${p.validationScore}%` }}
                              />
                            </div>
                            <span className="font-bold text-gray-800 text-[11px]">{p.validationScore}%</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400" title="Aún no se ejecutó la validación de calidad">Sin evaluar</span>
                        )}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.verificationStatus === 'REVIEW'
                            ? 'bg-red-100 text-red-800'
                            : p.verificationStatus === 'OUTDATED'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.verificationStatus}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.publicationStatus === 'PUBLISHED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {p.publicationStatus}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleInspect(p.id)}
                            disabled={isDetailLoading}
                            className="p-2 rounded-md hover:bg-blue-50 text-blue-600 transition disabled:opacity-50"
                            title="Inspeccionar y editar"
                            aria-label={`Inspeccionar y editar ${p.name}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {p.verificationStatus !== 'VERIFIED' ? (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(p.id, 'VERIFIED')}
                              disabled={quickStatusId === p.id}
                              className="p-2 rounded-md hover:bg-emerald-50 text-emerald-600 transition disabled:opacity-50"
                              title="Aprobar inmediatamente"
                              aria-label={`Verificar ${p.name}`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(p.id, 'DRAFT')}
                              disabled={quickStatusId === p.id}
                              className="p-2 rounded-md hover:bg-amber-50 text-amber-600 transition disabled:opacity-50"
                              title="Bajar a borrador"
                              aria-label={`Mover ${p.name} a borrador`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Mostrando <span className="font-semibold text-gray-900">{filteredProducts.length}</span> de <span className="font-semibold text-gray-900">{totalCount}</span> productos
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Página anterior"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-gray-700">Página {page}</span>
            <button
              type="button"
              aria-label="Página siguiente"
              disabled={page * pageSize >= totalCount}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isDetailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="status" aria-live="polite">
          <div className="bg-white rounded-xl px-5 py-4 shadow-xl flex items-center gap-3 text-sm font-semibold text-gray-700">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> Cargando ficha del producto...
          </div>
        </div>
      )}

      {/* Modal / Inspector Profundo del Producto */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedProduct(null)}>
          <div ref={inspectorRef} role="dialog" aria-modal="true" aria-labelledby="product-inspector-title" onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 uppercase">
                  ID: #{selectedProduct.id} &bull; {selectedProduct.verificationStatus}
                </span>
                <h3 id="product-inspector-title" className="text-lg font-bold text-white mt-1 line-clamp-1">{selectedProduct.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                aria-label="Cerrar inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-5 overflow-x-auto">
              {[
                { key: 'IDENTITY', label: 'Identidad' },
                { key: 'CLASSIFICATION', label: 'Clasificación' },
                { key: 'SPECS', label: 'Técnica & Descripción' },
                { key: 'MEDIA', label: `Imágenes (${selectedProduct.images?.length || 0})` },
                { key: 'SOURCE', label: 'Fuente & Trazabilidad' },
                { key: 'QUALITY', label: 'Auditoría & Calidad' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setDetailTab(tab.key as any)}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                    detailTab === tab.key
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {saveSuccessMsg}
                </div>
              )}

              {detailTab === 'IDENTITY' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="font-bold text-gray-700 block mb-1">Nombre Oficial del Producto</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Modelo Comercial</label>
                    <input
                      type="text"
                      value={editForm.model || ''}
                      onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Código de Catálogo / Referencia</label>
                    <input
                      type="text"
                      value={editForm.catalogNumber || ''}
                      onChange={(e) => setEditForm({ ...editForm, catalogNumber: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Estado de Verificación</label>
                    <select
                      value={editForm.verificationStatus || 'DRAFT'}
                      onChange={(e) => setEditForm({ ...editForm, verificationStatus: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DRAFT">DRAFT (Borrador)</option>
                      <option value="REVIEW">REVIEW (Requiere Revisión)</option>
                      <option value="VERIFIED">VERIFIED (Verificado Oficial)</option>
                      <option value="OUTDATED">OUTDATED (Desactualizado)</option>
                      <option value="ARCHIVED">ARCHIVED (Archivado)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Estado de Publicación</label>
                    <select
                      value={editForm.publicationStatus || 'UNPUBLISHED'}
                      onChange={(e) => setEditForm({ ...editForm, publicationStatus: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PUBLISHED">PUBLISHED (Visible en Web Pública)</option>
                      <option value="UNPUBLISHED">UNPUBLISHED (Oculto)</option>
                    </select>
                  </div>
                </div>
              )}

              {detailTab === 'CLASSIFICATION' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Fabricante</label>
                    <input
                      type="text"
                      value={editForm.manufacturer || ''}
                      onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="pm-brand" className="font-bold text-gray-700 block mb-1">Marca Comercial</label>
                    <select
                      id="pm-brand"
                      value={editForm.brandId ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, brandId: e.target.value ? Number(e.target.value) : null })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Sin marca</option>
                      {brandOptions.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pm-category" className="font-bold text-gray-700 block mb-1">Categoría Principal</label>
                    <select
                      id="pm-category"
                      value={editForm.categoryId ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value ? Number(e.target.value) : null })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Sin categoría</option>
                      {categoryOptions.map(c => (
                        <option key={c.id} value={c.id}>{c.parentId ? '— ' : ''}{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Presentación / Empaque</label>
                    <input
                      type="text"
                      value={editForm.presentation || ''}
                      onChange={(e) => setEditForm({ ...editForm, presentation: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {detailTab === 'SPECS' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Descripción Técnica del Producto</label>
                    <textarea
                      rows={4}
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Especificaciones Técnicas (Texto o JSON)</label>
                    <textarea
                      rows={6}
                      value={editForm.technicalSpecs || ''}
                      onChange={(e) => setEditForm({ ...editForm, technicalSpecs: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Aplicaciones Médicas e Indicaciones</label>
                    <textarea
                      rows={3}
                      value={editForm.application || ''}
                      onChange={(e) => setEditForm({ ...editForm, application: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {detailTab === 'MEDIA' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      selectedProduct.images.map((img: any) => (
                        <div key={img.id} className="border border-gray-200 rounded-xl p-2 bg-gray-50 flex flex-col items-center">
                          <img src={img.url} alt={img.altText || ''} className="h-28 w-full object-contain mb-2" />
                          <span className="text-[10px] text-gray-500 truncate w-full text-center">{img.altText || 'Imagen técnica'}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-4 p-8 text-center text-gray-400 bg-gray-50 rounded-xl">
                        No hay imágenes registradas para este producto.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailTab === 'SOURCE' && (
                <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-gray-500 block">URL de Origen Oficial:</span>
                    {selectedProduct.sourceUrl ? (
                      <a 
                        href={selectedProduct.sourceUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-600 hover:underline flex items-center gap-1 font-medium break-all mt-0.5"
                      >
                        {selectedProduct.sourceUrl} <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-gray-400">Sin URL registrada</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500 block">Nivel de Confianza de la Fuente:</span>
                    <span className="font-bold text-gray-800">{selectedProduct.confidenceLevel || 'Sin dato'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Última Actualización Registrada:</span>
                    <span className="text-gray-700 font-medium">{new Date(selectedProduct.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {detailTab === 'QUALITY' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Score de Integridad Técnica</span>
                      <span className="text-2xl font-black text-slate-800">
                        {selectedProduct.validationScore ? `${selectedProduct.validationScore}%` : 'Sin evaluar'}
                      </span>
                    </div>
                  </div>

                  {/* Real checks computed from the record, not a fixed checklist */}
                  <div className="space-y-2">
                    <span className="font-bold text-gray-700 block">Revisión de datos de la ficha</span>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-600 space-y-1">
                      {[
                        { ok: Boolean(selectedProduct.name && selectedProduct.model), label: 'Nombre y modelo registrados' },
                        { ok: Boolean(selectedProduct.manufacturer || selectedProduct.brandId), label: 'Fabricante o marca asignados' },
                        { ok: Boolean(selectedProduct.categoryId), label: 'Categoría asignada' },
                        { ok: Boolean(selectedProduct.technicalSpecs?.trim()), label: 'Especificaciones técnicas' },
                        { ok: Boolean(selectedProduct.images?.length), label: 'Al menos una imagen' },
                        { ok: Boolean(selectedProduct.sourceUrl), label: 'URL de fuente registrada' },
                      ].map(check => (
                        <div key={check.label} className={`flex items-center gap-2 ${check.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {check.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          {check.ok ? check.label : `Falta: ${check.label.toLowerCase()}`}
                        </div>
                      ))}
                    </div>
                    {Array.isArray(selectedProduct.validationIssues) && selectedProduct.validationIssues.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                        <span className="font-bold block">Incidencias de la última validación</span>
                        {selectedProduct.validationIssues.map((issue: any, i: number) => (
                          <div key={i}>• {typeof issue === 'string' ? issue : issue.message || issue.description || JSON.stringify(issue)}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Cerrar
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveChanges}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-60"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
