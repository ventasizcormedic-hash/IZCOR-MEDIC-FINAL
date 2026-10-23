import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CatalogFacets, Product, CategoryWithSubcategories, Brand } from '../types';
import { ProductCard } from '../components/ProductCard';
import { CatalogHeader } from '../components/catalog/CatalogHeader';
import { FilterSidebar } from '../components/catalog/FilterSidebar';
import { FilterDrawer } from '../components/catalog/FilterDrawer';
import { ActiveFilterChips } from '../components/catalog/ActiveFilterChips';
import { ProductListItem } from '../components/catalog/ProductListItem';
import { Pagination } from '../components/catalog/Pagination';
import { EmptyCatalogState } from '../components/catalog/EmptyCatalogState';
import { CatalogSkeleton } from '../components/catalog/CatalogSkeleton';
import { CategoryShowcase } from '../components/catalog/CategoryShowcase';
import { ComparisonBar } from '../components/catalog/ComparisonBar';
import { ComparisonModal } from '../components/catalog/ComparisonModal';
import { FlashNotice } from '../components/common/FlashNotice';
import { useComparison, MAX_COMPARISON_ITEMS } from '../hooks/useComparison';
import { ViewMode, SortOption, ComparisonProduct } from '../components/catalog/types';
import { SeoHead } from '../components/seo/SeoHead';

const toPositiveInt = (value: string | null, fallback: number) => {
  const n = parseInt(value || '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state reading
  const paramSearch = searchParams.get('search') || '';
  const paramCategory = searchParams.get('category') || '';
  const paramSubcategory = searchParams.get('subcategory') || '';
  const paramBrand = searchParams.get('brand') || '';
  const paramManufacturer = searchParams.get('manufacturer') || '';
  const paramApplication = searchParams.get('application') || '';
  const paramVerification = searchParams.get('verification') || '';
  const paramProcedencia = searchParams.get('procedencia') || '';
  const paramSort = (searchParams.get('sort') as SortOption) || 'recent';
  const paramPage = toPositiveInt(searchParams.get('page'), 1);
  const paramLimit = Math.min(100, toPositiveInt(searchParams.get('limit'), 24));
  const paramView = (searchParams.get('view') as ViewMode) || 'grid';

  // Local state
  const [searchTerm, setSearchTerm] = useState(paramSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(paramSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(paramCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(paramSubcategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(paramBrand);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>(paramManufacturer);
  const [selectedApplication, setSelectedApplication] = useState<string>(paramApplication);
  const [selectedVerification, setSelectedVerification] = useState<string>(paramVerification);
  const [selectedProcedencia, setSelectedProcedencia] = useState<string>(paramProcedencia);
  const [sort, setSort] = useState<SortOption>(paramSort);
  const [currentPage, setCurrentPage] = useState<number>(paramPage > 0 ? paramPage : 1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(paramLimit > 0 ? paramLimit : 24);
  const [viewMode, setViewMode] = useState<ViewMode>(paramView);

  // Mobile drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Facets and products data
  const [facets, setFacets] = useState<CatalogFacets>({
    totalProducts: 0,
    categories: [],
    allCategories: [],
    brands: [],
    manufacturers: [],
    clinicalApplications: [],
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comparison state (shared with header and product page, persisted in localStorage)
  const { list: comparisonList, toggle: toggleCompare, remove: handleRemoveCompare, clear: handleClearCompare } = useComparison();
  // ?compare=1 (header shortcut) opens the comparison matrix directly.
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(() => searchParams.get('compare') === '1');
  const [notice, setNotice] = useState<string | null>(null);
  const dismissNotice = useCallback(() => setNotice(null), []);

  useEffect(() => {
    if (searchParams.get('compare') === '1') {
      setIsComparisonModalOpen(comparisonList.length > 0);
      if (comparisonList.length === 0) {
        setNotice('Aún no hay equipos en comparación. Use el botón "Comparar" de cada producto.');
      }
      const next = new URLSearchParams(searchParams);
      next.delete('compare');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams]);

  const handleToggleCompare = useCallback((item: ComparisonProduct) => {
    if (!toggleCompare(item)) {
      setNotice(`Puede comparar un máximo de ${MAX_COMPARISON_ITEMS} equipos a la vez. Quite uno para agregar otro.`);
    }
  }, [toggleCompare]);

  // 1. Fetch Facets on mount
  useEffect(() => {
    fetch('/api/catalog/facets')
      .then(res => res.json())
      .then(data => {
        if (data && data.categories) {
          setFacets(data);
        }
      })
      .catch(err => {
        console.error('Error fetching catalog facets:', err);
      });
  }, []);

  // 2. Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const lastSyncedSearch = useRef(paramSearch);

  // 3. Keep state synced when searchParams change externally (e.g. Back/Forward)
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedSubcategory(searchParams.get('subcategory') || '');
    setSelectedBrand(searchParams.get('brand') || '');
    setSelectedManufacturer(searchParams.get('manufacturer') || '');
    setSelectedApplication(searchParams.get('application') || '');
    setSelectedVerification(searchParams.get('verification') || '');
    setSelectedProcedencia(searchParams.get('procedencia') || '');
    setSort((searchParams.get('sort') as SortOption) || 'recent');
    setCurrentPage(toPositiveInt(searchParams.get('page'), 1));
    setItemsPerPage(Math.min(100, toPositiveInt(searchParams.get('limit'), 24)));
    setViewMode((searchParams.get('view') as ViewMode) || 'grid');
    const s = searchParams.get('search') || '';
    // Only overwrite the input when the search changed outside of typing (Back/Forward, links).
    if (s !== lastSyncedSearch.current) {
      lastSyncedSearch.current = s;
      setSearchTerm(s);
      setDebouncedSearch(s);
    }
  }, [searchParams]);

  // Mirror the debounced search into the URL so refresh, Back and shared links keep it.
  useEffect(() => {
    if (debouncedSearch === (searchParams.get('search') || '')) return;
    lastSyncedSearch.current = debouncedSearch;
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set('search', debouncedSearch); else next.delete('search');
    next.delete('page');
    setCurrentPage(1);
    setSearchParams(next, { replace: true });
  }, [debouncedSearch]);

  // 4. Helper to update URL params cleanly
  const syncToUrl = useCallback((updates: Partial<{
    search: string;
    category: string;
    subcategory: string;
    brand: string;
    manufacturer: string;
    application: string;
    verification: string;
    sort: SortOption;
    page: number;
    limit: number;
    view: ViewMode;
  }>) => {
    const newParams = new URLSearchParams(searchParams);

    const merged = {
      search: debouncedSearch,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      brand: selectedBrand,
      manufacturer: selectedManufacturer,
      application: selectedApplication,
      verification: selectedVerification,
      sort,
      page: currentPage,
      limit: itemsPerPage,
      view: viewMode,
      ...updates,
    };

    if (merged.search) newParams.set('search', merged.search); else newParams.delete('search');
    if (merged.category) newParams.set('category', merged.category); else newParams.delete('category');
    if (merged.subcategory) newParams.set('subcategory', merged.subcategory); else newParams.delete('subcategory');
    if (merged.brand) newParams.set('brand', merged.brand); else newParams.delete('brand');
    if (merged.manufacturer) newParams.set('manufacturer', merged.manufacturer); else newParams.delete('manufacturer');
    if (merged.application) newParams.set('application', merged.application); else newParams.delete('application');
    if (merged.verification && merged.verification !== 'ALL') newParams.set('verification', merged.verification); else newParams.delete('verification');
    if (merged.sort && merged.sort !== 'recent') newParams.set('sort', merged.sort); else newParams.delete('sort');
    if (merged.page > 1) newParams.set('page', merged.page.toString()); else newParams.delete('page');
    if (merged.limit !== 24) newParams.set('limit', merged.limit.toString()); else newParams.delete('limit');
    if (merged.view !== 'grid') newParams.set('view', merged.view); else newParams.delete('view');

    setSearchParams(newParams);
  }, [
    searchParams, debouncedSearch, selectedCategory, selectedSubcategory, 
    selectedBrand, selectedManufacturer, selectedApplication, 
    selectedVerification, sort, currentPage, itemsPerPage, viewMode, setSearchParams
  ]);

  // 5. Fetch Products on query parameters change
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    query.set('format', 'paginated');
    query.set('page', currentPage.toString());
    query.set('limit', itemsPerPage.toString());

    if (debouncedSearch) query.set('search', debouncedSearch);
    if (selectedCategory) query.set('category', selectedCategory);
    if (selectedSubcategory) query.set('subcategory', selectedSubcategory);
    if (selectedBrand) query.set('brand', selectedBrand);
    if (selectedManufacturer) query.set('manufacturer', selectedManufacturer);
    if (selectedApplication) query.set('application', selectedApplication);
    if (selectedProcedencia) query.set('procedencia', selectedProcedencia);
    if (selectedVerification && selectedVerification !== 'ALL') {
      query.set('verificationStatus', selectedVerification);
    }
    if (sort) query.set('sort', sort);

    fetch(`/api/products?${query.toString()}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.items) {
          setProducts(data.items);
          setTotalProducts(data.total || 0);
          setTotalPages(data.totalPages || 1);
        } else if (Array.isArray(data)) {
          setProducts(data);
          setTotalProducts(data.length);
          setTotalPages(Math.ceil(data.length / itemsPerPage) || 1);
        }
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error('Error fetching products:', err);
        setError('No se pudo cargar el listado de productos médicos.');
        setProducts([]);
        setLoading(false);
      });
    return () => controller.abort();
  }, [
    debouncedSearch, selectedCategory, selectedSubcategory, 
    selectedBrand, selectedManufacturer, selectedApplication, 
    selectedVerification, selectedProcedencia, sort, currentPage, itemsPerPage, reloadKey
  ]);

  // Actions
  const handleCategorySelect = (idOrSlug: string) => {
    setSelectedCategory(idOrSlug);
    setSelectedSubcategory(''); // reset subcategory when parent changes
    setCurrentPage(1);
    syncToUrl({ category: idOrSlug, subcategory: '', page: 1 });
  };

  const handleSubcategorySelect = (idOrSlug: string) => {
    const nextSub = selectedSubcategory === idOrSlug ? '' : idOrSlug;
    setSelectedSubcategory(nextSub);
    setCurrentPage(1);
    syncToUrl({ subcategory: nextSub, page: 1 });
  };

  const handleBrandSelect = (idOrSlug: string) => {
    setSelectedBrand(idOrSlug);
    setCurrentPage(1);
    syncToUrl({ brand: idOrSlug, page: 1 });
  };

  const handleManufacturerSelect = (mfg: string) => {
    setSelectedManufacturer(mfg);
    setCurrentPage(1);
    syncToUrl({ manufacturer: mfg, page: 1 });
  };

  const handleApplicationSelect = (app: string) => {
    setSelectedApplication(app);
    setCurrentPage(1);
    syncToUrl({ application: app, page: 1 });
  };

  const handleVerificationSelect = (status: string) => {
    setSelectedVerification(status);
    setCurrentPage(1);
    syncToUrl({ verification: status, page: 1 });
  };

  const handleProcedenciaSelect = (p: string) => {
    setSelectedProcedencia(p);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (p) newParams.set('procedencia', p); else newParams.delete('procedencia');
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    syncToUrl({ sort: newSort, page: 1 });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    syncToUrl({ view: mode });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    syncToUrl({ page: newPage });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    syncToUrl({ limit: newLimit, page: 1 });
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedBrand('');
    setSelectedManufacturer('');
    setSelectedApplication('');
    setSelectedVerification('');
    setSelectedProcedencia('');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  // Find human names for active chips
  const activeCategoryName = useMemo(() => {
    if (!selectedCategory) return null;
    const cat = facets.categories.find(
      c => c.id.toString() === selectedCategory || c.slug === selectedCategory ||
        c.name.toLowerCase() === selectedCategory.toLowerCase()
    );
    return cat?.name || null;
  }, [selectedCategory, facets.categories]);

  const activeSubcategoryName = useMemo(() => {
    if (!selectedSubcategory) return null;
    for (const cat of facets.categories) {
      if (cat.subcategories) {
        const sub = cat.subcategories.find(
          s => s.id.toString() === selectedSubcategory || s.slug === selectedSubcategory
        );
        if (sub) return sub.name;
      }
    }
    return null;
  }, [selectedSubcategory, facets.categories]);

  const activeBrandName = useMemo(() => {
    if (!selectedBrand) return null;
    const br = facets.brands.find(
      b => b.id.toString() === selectedBrand || b.slug === selectedBrand ||
        b.name.toLowerCase() === selectedBrand.toLowerCase()
    );
    return br?.name || null;
  }, [selectedBrand, facets.brands]);

  const activeFiltersCount = [
    Boolean(debouncedSearch),
    Boolean(selectedCategory),
    Boolean(selectedSubcategory),
    Boolean(selectedBrand),
    Boolean(selectedManufacturer),
    Boolean(selectedApplication),
    Boolean(selectedProcedencia),
    Boolean(selectedVerification && selectedVerification !== 'ALL'),
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;
  // Use a heuristic to noindex searches or deep parameter combinations to avoid spamming the index.
  const shouldNoindex = Boolean(debouncedSearch) || activeFiltersCount > 1 || currentPage > 1;

  return (
    <>
      <SeoHead
        title="Catálogo de Equipos e Insumos Médicos | IZCOR MEDIC"
        description="Explora nuestro catálogo completo de equipos médicos, mobiliario e insumos. Filtra por especialidad, marca y fabricante. Cotiza online."
        canonicalUrl="/productos"
        noindex={shouldNoindex}
      />
      <main id="catalog-page" className="min-h-screen bg-[#F8FAFC] py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Header with Breadcrumbs, Search, Corporate Banner & Toolbar */}
        <CatalogHeader
          searchTerm={searchTerm}
          onSearchChange={(q) => {
            setSearchTerm(q);
            setCurrentPage(1);
          }}
          onSearchSubmit={() => {
            syncToUrl({ search: searchTerm, page: 1 });
          }}
          activeCategoryName={activeCategoryName}
          activeSubcategoryName={activeSubcategoryName}
          activeBrandName={activeBrandName}
          totalProducts={totalProducts}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          sort={sort}
          onSortChange={handleSortChange}
          onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* 2. Top-level category cards showcase when no category is filtered */}
        {!selectedCategory && !debouncedSearch && (
          <CategoryShowcase
            categories={facets.categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        )}

        {/* 3. Main Catalog Body (Sidebar + Content Stream) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24">
            <FilterSidebar
              categories={facets.categories}
              brands={facets.brands}
              manufacturers={facets.manufacturers}
              clinicalApplications={facets.clinicalApplications}
              procedencias={facets.procedencias}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              selectedBrand={selectedBrand}
              selectedManufacturer={selectedManufacturer}
              selectedApplication={selectedApplication}
              selectedVerificationStatus={selectedVerification}
              selectedProcedencia={selectedProcedencia}
              onSelectCategory={handleCategorySelect}
              onSelectSubcategory={handleSubcategorySelect}
              onSelectBrand={handleBrandSelect}
              onSelectManufacturer={handleManufacturerSelect}
              onSelectApplication={handleApplicationSelect}
              onSelectVerificationStatus={handleVerificationSelect}
              onSelectProcedencia={handleProcedenciaSelect}
              onClearAll={handleClearAllFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </aside>

          {/* Product Feed & Grid */}
          <div className="flex-1 w-full min-w-0">
            
            {/* Active Filters Removable Badges */}
            <div className="mb-4">
              <ActiveFilterChips
                search={debouncedSearch}
                categoryName={activeCategoryName}
                subcategoryName={activeSubcategoryName}
                brandName={activeBrandName}
                manufacturer={selectedManufacturer}
                procedencia={selectedProcedencia}
                application={selectedApplication}
                verificationStatus={selectedVerification}
                onRemoveSearch={() => {
                  setSearchTerm('');
                  setDebouncedSearch('');
                  syncToUrl({ search: '', page: 1 });
                }}
                onRemoveCategory={() => handleCategorySelect('')}
                onRemoveSubcategory={() => handleSubcategorySelect('')}
                onRemoveBrand={() => handleBrandSelect('')}
                onRemoveManufacturer={() => handleManufacturerSelect('')}
                onRemoveProcedencia={() => handleProcedenciaSelect('')}
                onRemoveApplication={() => handleApplicationSelect('')}
                onRemoveVerificationStatus={() => handleVerificationSelect('')}
                onClearAll={handleClearAllFilters}
              />
            </div>

            {/* Error notice if API fails */}
            {/* Products Stream */}
            {error && !loading ? (
              <div role="alert" className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>{error} Verifique su conexión e intente nuevamente.</span>
                <button
                  type="button"
                  onClick={() => setReloadKey(k => k + 1)}
                  className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0"
                >
                  Reintentar
                </button>
              </div>
            ) : loading ? (
              <CatalogSkeleton viewMode={viewMode} count={itemsPerPage > 12 ? 12 : itemsPerPage} />
            ) : products.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                      <ProductCard 
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        model={product.model || ''}
                        brandName={product.brandName || 'IZCOR MEDIC'}
                        manufacturer={product.manufacturer}
                        catalogNumber={product.catalogNumber}
                        categoryName={product.categoryName || undefined}
                        imageUrl={product.imageUrl}
                        verificationStatus={product.verificationStatus}
                        technicalSpecs={product.technicalSpecs}
                        application={product.application}
                        presentation={product.presentation}
                        isCompared={comparisonList.some(p => p.id === product.id)}
                        onToggleCompare={handleToggleCompare}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map(product => (
                      <ProductListItem
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        brandName={product.brandName}
                        manufacturer={product.manufacturer}
                        model={product.model}
                        catalogNumber={product.catalogNumber}
                        categoryName={product.categoryName}
                        imageUrl={product.imageUrl}
                        technicalSpecs={product.technicalSpecs}
                        application={product.application}
                        presentation={product.presentation}
                        verificationStatus={product.verificationStatus}
                        isCompared={comparisonList.some(p => p.id === product.id)}
                        onToggleCompare={handleToggleCompare}
                      />
                    ))}
                  </div>
                )}

                {/* Scalable Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalProducts}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </>
            ) : (
              <EmptyCatalogState
                onClearFilters={handleClearAllFilters}
                onApplySuggestedSearch={(term) => {
                  setSearchTerm(term);
                  setDebouncedSearch(term);
                  syncToUrl({ search: term, page: 1 });
                }}
              />
            )}

          </div>

        </div>

      </div>

      {/* Mobile Filters Slide-over Drawer */}
      <FilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        categories={facets.categories}
        brands={facets.brands}
        manufacturers={facets.manufacturers}
        procedencias={facets.procedencias}
        clinicalApplications={facets.clinicalApplications}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        selectedBrand={selectedBrand}
        selectedManufacturer={selectedManufacturer}
        selectedProcedencia={selectedProcedencia}
        selectedApplication={selectedApplication}
        selectedVerificationStatus={selectedVerification}
        onSelectCategory={handleCategorySelect}
        onSelectSubcategory={handleSubcategorySelect}
        onSelectBrand={handleBrandSelect}
        onSelectManufacturer={handleManufacturerSelect}
        onSelectProcedencia={handleProcedenciaSelect}
        onSelectApplication={handleApplicationSelect}
        onSelectVerificationStatus={handleVerificationSelect}
        onClearAll={handleClearAllFilters}
        hasActiveFilters={hasActiveFilters}
        totalResults={totalProducts}
      />

      <FlashNotice message={notice} onDismiss={dismissNotice} />

      {/* Floating Bottom Comparison Dock */}
      <ComparisonBar
        products={comparisonList}
        onOpenModal={() => setIsComparisonModalOpen(true)}
        onRemoveProduct={handleRemoveCompare}
        onClearAll={handleClearCompare}
      />

      {/* Modal with Full Side-by-Side Comparison Matrix */}
      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        products={comparisonList}
        onRemoveProduct={handleRemoveCompare}
        onClearAll={handleClearCompare}
      />

    </main>
    </>
  );
}
