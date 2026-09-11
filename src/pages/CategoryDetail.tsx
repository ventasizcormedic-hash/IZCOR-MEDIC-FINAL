import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, Filter, Search, Grid, List, 
  Package, LayoutGrid, Building2, Tag, 
  CheckCircle2, AlertCircle, RefreshCw,
  SlidersHorizontal, X
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
  productCount?: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  model: string | null;
  catalogNumber: string | null;
  manufacturer: string | null;
  brandName: string | null;
  categoryName: string | null;
  description: string | null;
  images: Array<{ id: number; url: string; altText: string | null }>;
}

import { SeoHead } from '../components/seo/SeoHead';

export function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [category, setCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [relatedBrands, setRelatedBrands] = useState<Array<{id: number, name: string, count: number}>>([]);
  const [relatedManufacturers, setRelatedManufacturers] = useState<Array<{name: string, count: number}>>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Product list state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'recent';
  const q = searchParams.get('q') || '';
  const filterBrand = searchParams.get('brand') || '';
  const filterManufacturer = searchParams.get('manufacturer') || '';
  const limit = 24;

  const activeFiltersCount = [q, filterBrand, filterManufacturer].filter(Boolean).length;
  const isPageFiltered = activeFiltersCount > 0 || page > 1;

  useEffect(() => {
    fetchCategoryDetails();
  }, [slug]);

  useEffect(() => {
    if (category) {
      fetchProducts();
    }
  }, [category, page, sort, q, filterBrand, filterManufacturer]);

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/categories/${slug}/details`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Category not found');
        } else {
          setError('Failed to load category');
        }
        return;
      }
      
      const data = await res.json();
      setCategory(data.category);
      setParentCategory(data.parentCategory);
      setSubcategories(data.subcategories);
      setFeaturedProducts(data.featuredProducts);
      setRelatedBrands(data.relatedBrands);
      setRelatedManufacturers(data.relatedManufacturers);
      setTotalProducts(data.totalProducts);
      setError(null);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
      });
      if (q) params.append('q', q);
      if (filterBrand) params.append('brandId', filterBrand);
      if (filterManufacturer) params.append('manufacturer', filterManufacturer);

      const res = await fetch(`/api/categories/${slug}/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setTotalProducts(data.total); // Update total based on filters
      }
    } catch (err) {
      console.error('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 on filter change
    newParams.set('page', '1');
    navigate(`${location.pathname}?${newParams.toString()}`);
  };

  const clearFilters = () => {
    navigate(location.pathname);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-8"></div>
        <div className="h-12 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-full mb-12"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block h-96 bg-slate-200 rounded"></div>
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-slate-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {error === 'Category not found' ? 'Categoría no encontrada' : 'Error al cargar la categoría'}
        </h2>
        <p className="text-slate-500 mb-8">
          No pudimos encontrar la información de esta categoría.
        </p>
        <Link to="/productos" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold">
          <Package className="w-5 h-5 mr-2" />
          Ir al catálogo general
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <SeoHead
        title={category.name + " | Catálogo Médico | IZCOR MEDIC"}
        description={category.description || `Explora nuestra selección de ${category.name}. Equipamiento médico profesional y autorizado.`}
        canonicalUrl={`/categorias/${category.slug}`}
        noindex={isPageFiltered}
      />
      {/* Category Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Inicio</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/productos" className="hover:text-indigo-600 transition-colors">Productos</Link>
            <ChevronRight className="w-4 h-4" />
            {parentCategory && (
              <>
                <Link to={`/categorias/${parentCategory.slug}`} className="hover:text-indigo-600 transition-colors">{parentCategory.name}</Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-slate-900 font-semibold">{category.name}</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-3">{category.name}</h1>
              {category.description && (
                <p className="text-slate-600 max-w-3xl text-lg">{category.description}</p>
              )}
            </div>
            {category.image && (
              <div className="hidden md:block w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl">
              <Package className="w-4 h-4 text-indigo-600" />
              {totalProducts.toLocaleString()} productos publicados
            </div>
            {subcategories.length > 0 && (
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl">
                <LayoutGrid className="w-4 h-4 text-indigo-600" />
                {subcategories.length} subcategorías
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Subcategories Grid */}
        {subcategories.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-bold text-[#2C3E50] mb-6 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-brand-cyan" /> Subcategorías
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {subcategories.map(sub => (
                <Link 
                  key={sub.id} 
                  to={`/categorias/${sub.slug}`}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-brand-cyan/40 hover:shadow-md active:scale-[0.98] transition-all group text-center flex flex-col items-center justify-center h-full"
                >
                  <span className="font-bold text-slate-800 group-hover:text-brand-cyan text-sm leading-tight mb-2">
                    {sub.name}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {sub.productCount} productos
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && !activeFiltersCount && page === 1 && (
          <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Destacados en {category.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <Link key={product.id} to={`/producto/${product.slug}`} className="bg-white rounded-2xl border-2 border-emerald-100 p-4 hover:shadow-lg hover:border-emerald-300 transition-all group flex flex-col h-full">
                  <div className="aspect-square rounded-xl bg-slate-50 mb-4 overflow-hidden relative flex items-center justify-center p-4">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0].url} alt={product.images[0].altText || product.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Package className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-xs font-bold text-emerald-600 mb-1">{product.brandName || product.manufacturer || 'General'}</span>
                    <h4 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">{product.name}</h4>
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-mono block">REF: {product.catalogNumber || product.model || 'N/A'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-600" /> Filtros
                </h3>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* Search within category */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Buscar en {category.name}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Ej. modelo o palabra clave..." 
                    value={q}
                    onChange={(e) => updateFilters('q', e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Brands Filter */}
              {relatedBrands.length > 0 && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    <Tag className="w-3.5 h-3.5 inline mr-1" /> Marcas Presentes
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {relatedBrands.map(brand => (
                      <label key={brand.id} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={filterBrand === brand.id.toString()}
                            onChange={() => updateFilters('brand', filterBrand === brand.id.toString() ? '' : brand.id.toString())}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">{brand.name}</span>
                        </div>
                        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{brand.count}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Manufacturers Filter */}
              {relatedManufacturers.length > 0 && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    <Building2 className="w-3.5 h-3.5 inline mr-1" /> Fabricantes
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {relatedManufacturers.map(mfg => (
                      <label key={mfg.name} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={filterManufacturer === mfg.name}
                            onChange={() => updateFilters('manufacturer', filterManufacturer === mfg.name ? '' : mfg.name)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors truncate max-w-[140px]" title={mfg.name}>
                            {mfg.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{mfg.count}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product List Area */}
          <div className="lg:col-span-3">
            
            {/* Top Bar: Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Mostrando <span className="font-bold text-slate-900">{products.length}</span> de <span className="font-bold text-slate-900">{totalProducts}</span> resultados
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Ordenar:</span>
                  <select 
                    value={sort}
                    onChange={(e) => updateFilters('sort', e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none font-medium cursor-pointer"
                  >
                    <option value="recent">Más recientes</option>
                    <option value="name-asc">Nombre (A-Z)</option>
                    <option value="name-desc">Nombre (Z-A)</option>
                  </select>
                </div>

                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs font-bold text-slate-500 uppercase mr-2">Filtros Activos:</span>
                {q && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                    Búsqueda: {q}
                    <button onClick={() => updateFilters('q', '')} className="hover:text-indigo-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filterBrand && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                    Marca: {relatedBrands.find(b => b.id.toString() === filterBrand)?.name || 'Seleccionada'}
                    <button onClick={() => updateFilters('brand', '')} className="hover:text-indigo-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filterManufacturer && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                    Fabricante: {filterManufacturer}
                    <button onClick={() => updateFilters('manufacturer', '')} className="hover:text-indigo-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid/List */}
            {productsLoading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={`bg-slate-200 animate-pulse rounded-2xl ${viewMode === 'grid' ? 'h-80' : 'h-32'}`}></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
                {products.map(product => (
                  <Link key={product.id} to={`/producto/${product.slug}`} className={`bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all group overflow-hidden ${viewMode === 'list' ? 'flex flex-row p-4 items-center gap-6' : 'flex flex-col'}`}>
                    
                    <div className={`${viewMode === 'grid' ? 'w-full aspect-[4/3] border-b border-slate-100' : 'w-32 h-32 flex-shrink-0 border border-slate-100 rounded-xl'} bg-slate-50 relative flex items-center justify-center p-4 overflow-hidden`}>
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0].url} alt={product.images[0].altText || product.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Package className="w-10 h-10 text-slate-300" />
                      )}
                    </div>
                    
                    <div className={`${viewMode === 'grid' ? 'p-5 flex-1 flex flex-col' : 'flex-1'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {product.brandName || product.manufacturer || 'General'}
                        </span>
                      </div>
                      <h3 className={`font-bold text-slate-900 group-hover:text-indigo-600 transition-colors ${viewMode === 'grid' ? 'text-sm mb-2 line-clamp-2' : 'text-lg mb-1'}`}>
                        {product.name}
                      </h3>
                      {viewMode === 'list' && product.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-2">{product.description}</p>
                      )}
                      
                      <div className={`mt-auto ${viewMode === 'grid' ? 'pt-4 border-t border-slate-100' : ''}`}>
                        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                          <span>{product.catalogNumber ? `REF: ${product.catalogNumber}` : ''}</span>
                          <span>{product.model ? `Mod: ${product.model}` : ''}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">No se encontraron productos</h3>
                <p className="text-slate-500">
                  No hay productos publicados que coincidan con los filtros seleccionados en esta categoría.
                </p>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                    Limpiar Filtros
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalProducts > limit && (
              <div className="mt-8 flex justify-center">
                <div className="inline-flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                  <button 
                    disabled={page === 1}
                    onClick={() => updateFilters('page', (page - 1).toString())}
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 disabled:opacity-50 disabled:hover:text-slate-600"
                  >
                    Anterior
                  </button>
                  <div className="px-4 py-2 text-sm font-bold text-slate-900 border-x border-slate-200">
                    Página {page} de {Math.ceil(totalProducts / limit)}
                  </div>
                  <button 
                    disabled={page >= Math.ceil(totalProducts / limit)}
                    onClick={() => updateFilters('page', (page + 1).toString())}
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 disabled:opacity-50 disabled:hover:text-slate-600"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
