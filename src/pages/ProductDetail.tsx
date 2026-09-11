import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, ShieldCheck, Download, MessageCircle, 
  Clock, CheckCircle2, ChevronDown, ChevronUp, 
  Layers, HelpCircle, FileCheck2, Building2
} from 'lucide-react';
import { 
  ProductDetailData, 
  parseTechnicalSpecs, 
  ProductDocument 
} from '../components/product/types';
import { ProductBreadcrumb } from '../components/product/ProductBreadcrumb';
import { ProductImageGallery } from '../components/image/ProductImageGallery';
import { ProductIdentity } from '../components/product/ProductIdentity';
import { ProductQuickOverview } from '../components/product/ProductQuickOverview';
import { ProductTechnicalSpecs } from '../components/product/ProductTechnicalSpecs';
import { ProductClinicalApplications } from '../components/product/ProductClinicalApplications';
import { ProductVariantsAndModels } from '../components/product/ProductVariantsAndModels';
import { ProductDocumentation } from '../components/product/ProductDocumentation';
import { ProductTraceability } from '../components/product/ProductTraceability';
import { ProductRelated } from '../components/product/ProductRelated';
import { ProductStickyBar } from '../components/product/ProductStickyBar';
import { ProductSkeleton } from '../components/product/ProductSkeleton';
import { ProductNotFound } from '../components/product/ProductNotFound';
import { SeoHead } from '../components/seo/SeoHead';
import { useAnalytics } from '../hooks/useAnalytics';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { trackProductView } = useAnalytics();
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [descExpanded, setDescExpanded] = useState<boolean>(false);
  const [comparisonList, setComparisonList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('izcor_product_comparison');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleCompare = (prod: any) => {
    setComparisonList((prev) => {
      let updated: any[];
      if (prev.some((p) => p.id === prod.id)) {
        updated = prev.filter((p) => p.id !== prod.id);
      } else {
        if (prev.length >= 4) {
          alert('Puedes comparar hasta 4 productos a la vez.');
          return prev;
        }
        updated = [...prev, prod];
      }
      try {
        localStorage.setItem('izcor_product_comparison', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Failed to sync comparison', err);
      }
      return updated;
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLoading(true);
    setError(false);

    fetch(`/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Producto no encontrado');
        return res.json();
      })
      .then((data: ProductDetailData) => {
        setProduct(data);
        setLoading(false);
        trackProductView({
          id: data.id,
          name: data.name,
          brand: data.brandName || 'General',
          category: data.categoryName || 'Uncategorized'
        });
      })
      .catch((err) => {
        console.error('Error al cargar ficha médica:', err);
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  const seoData = useMemo(() => {
    if (!product) return null;
    const brandPart = product.brandName ? ` - ${product.brandName}` : '';
    const modelPart = product.model ? ` (${product.model})` : '';
    const title = `${product.name}${modelPart}${brandPart} | IZCOR MEDIC`;
    const description = product.description
      ? product.description.length > 150
        ? `${product.description.substring(0, 147).trimEnd()}...`
        : product.description
      : `Especificaciones técnicas y detalles de ${product.name}. Equipamiento médico profesional.`;
    
    const schema = [
      {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.images?.[0] || undefined,
        "description": product.description || description,
        "brand": {
          "@type": "Brand",
          "name": product.brandName || product.manufacturer || "Desconocido"
        },
        "url": typeof window !== 'undefined' ? `${window.location.origin}/producto/${product.slug}` : undefined,
        "model": product.model || undefined,
        "sku": product.catalogNumber || undefined,
        "manufacturer": product.manufacturer ? {
          "@type": "Organization",
          "name": product.manufacturer
        } : undefined
      },
      {
        "@context": "https://schema.org/",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": typeof window !== 'undefined' ? window.location.origin : ""
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Catálogo",
            "item": typeof window !== 'undefined' ? `${window.location.origin}/productos` : ""
          },
          product.categoryName ? {
            "@type": "ListItem",
            "position": 3,
            "name": product.categoryName,
            "item": typeof window !== 'undefined' ? `${window.location.origin}/categorias/${product.categorySlug}` : ""
          } : null,
          {
            "@type": "ListItem",
            "position": product.categoryName ? 4 : 3,
            "name": product.name,
            "item": typeof window !== 'undefined' ? `${window.location.origin}/producto/${product.slug}` : ""
          }
        ].filter(Boolean)
      }
    ];
    return { title, description, schema };
  }, [product]);

  // Find official datasheet document if available
  const datasheetDoc: ProductDocument | null = useMemo(() => {
    if (!product?.documents || product.documents.length === 0) return null;
    return (
      product.documents.find(
        (doc) =>
          doc.type?.toUpperCase().includes('DATASHEET') ||
          doc.title?.toLowerCase().includes('ficha') ||
          doc.url.toLowerCase().endsWith('.pdf')
      ) || product.documents[0]
    );
  }, [product?.documents]);

  // Parse technical specs
  const parsedSpecs = useMemo(() => {
    return parseTechnicalSpecs(product?.technicalSpecs);
  }, [product?.technicalSpecs]);

  // Primary image
  const primaryImage = product?.images && product.images.length > 0 ? product.images[0].url : null;

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return <ProductNotFound />;
  }

  // Determine what sections actually have data (Content-Aware logic)
  const hasSpecs = Boolean(parsedSpecs || product.technicalSpecs);
  const hasApplicationsOrPresentation = Boolean(product.application || product.presentation);
  const hasSiblingModels = Boolean(product.siblingModels && product.siblingModels.length > 0);
  const hasDocs = Boolean((product.documents && product.documents.length > 0) || product.sourceUrl);
  const hasRelated = Boolean(product.relatedProducts && product.relatedProducts.length > 0);

  // If the product is rich with multiple sections, show internal anchor navigation
  const availableSectionsCount = [hasSpecs, hasApplicationsOrPresentation, hasSiblingModels, hasDocs, hasRelated].filter(Boolean).length;
  const showSectionNav = availableSectionsCount >= 2;

  const isLongDescription = (product.description?.length || 0) > 350;

  return (
    <>
      {seoData && (
        <SeoHead
          title={seoData.title}
          description={seoData.description}
          canonicalUrl={`/producto/${product.slug}`}
          ogImage={product.images?.[0]?.url}
          schemaObj={seoData.schema}
        />
      )}
      <main id="product-detail-view" className="min-h-screen bg-[#F8FAFC] pb-28 md:pb-20 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Institutional Contextual Breadcrumb */}
        <ProductBreadcrumb
          categoryName={product.categoryName}
          categorySlug={product.categorySlug}
          subcategoryName={product.subcategory?.name}
          subcategorySlug={product.subcategory?.slug}
          productName={product.name}
          prevProduct={product.prevProduct}
          nextProduct={product.nextProduct}
        />

        {/* 2. Top Stage: Product Photography & Primary Commercial Identity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
          
          {/* Left Column (5 Cols): Photography & Visual Fallbacks */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <ProductImageGallery
              images={product.images}
              productId={product.id}
              productName={product.name}
              brandName={product.brandName}
              model={product.model}
              catalogNumber={product.catalogNumber}
              verificationStatus={product.verificationStatus}
            />

            {/* Institutional Guarantee and Procurement Trust Strip */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-100/90 border border-slate-200/90 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Garantía y Soporte Oficial</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <FileCheck2 className="w-4 h-4 text-brand-navy flex-shrink-0" />
                <span className="font-semibold">Apto para Bases OSCE / TDR</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Clinical Identity, Model, Summary and CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              {/* Identity (Brand, Manufacturer, Name, Model, SKU) */}
              <ProductIdentity product={product} />

              {/* Quick Summary & Action Buttons */}
              <ProductQuickOverview
                product={product}
                datasheetDoc={datasheetDoc}
                onScrollToSpecs={() => scrollToSection('product-specs-section')}
                isCompared={comparisonList.some((p) => p.id === product.id)}
                onToggleCompare={handleToggleCompare}
              />
            </div>
          </div>
        </div>

        {/* 3. Internal Section Navigation Bar (Rendered only if multiple content sections exist) */}
        {showSectionNav && (
          <div className="sticky top-0 z-30 mb-8 -mx-4 sm:mx-0 px-4 sm:px-0 bg-[#F8FAFC]/95 backdrop-blur-xs py-2 border-b border-slate-200">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin text-xs font-bold text-slate-600">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1 hidden sm:inline">
                Secciones:
              </span>
              
              {product.description && (
                <button
                  type="button"
                  onClick={() => scrollToSection('product-description-section')}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-brand-navy hover:border-brand-navy transition-all whitespace-nowrap shadow-2xs"
                >
                  Descripción
                </button>
              )}

              {hasSpecs && (
                <button
                  type="button"
                  onClick={() => scrollToSection('product-specs-section')}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-brand-navy hover:border-brand-navy transition-all whitespace-nowrap shadow-2xs"
                >
                  Especificaciones Técnicas
                </button>
              )}

              {hasApplicationsOrPresentation && (
                <button
                  type="button"
                  onClick={() => scrollToSection('product-applications-section')}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-brand-navy hover:border-brand-navy transition-all whitespace-nowrap shadow-2xs"
                >
                  Aplicaciones & Presentación
                </button>
              )}

              {hasSiblingModels && (
                <button
                  type="button"
                  onClick={() => scrollToSection('product-models-section')}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-brand-navy hover:border-brand-navy transition-all whitespace-nowrap shadow-2xs"
                >
                  Modelos de la Línea
                </button>
              )}

              {hasDocs && (
                <button
                  type="button"
                  onClick={() => scrollToSection('product-documentation-section')}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-brand-navy hover:border-brand-navy transition-all whitespace-nowrap shadow-2xs"
                >
                  Documentación
                </button>
              )}

              <button
                type="button"
                onClick={() => scrollToSection('product-traceability-section')}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-brand-navy hover:border-brand-navy transition-all whitespace-nowrap shadow-2xs"
              >
                Trazabilidad
              </button>

              {hasRelated && (
                <button
                  type="button"
                  onClick={() => scrollToSection('product-related-section')}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-brand-navy hover:border-brand-navy transition-all whitespace-nowrap shadow-2xs"
                >
                  Relacionados
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. Sequential Structured Technical Blocks (Content-Aware: Only rendered when real data exists) */}
        <div className="space-y-8">
          
          {/* Full Technical Description Block */}
          {product.description && (
            <section id="product-description-section" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
              <h2 className="text-lg font-black text-slate-900 mb-3 pb-3 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-navy" />
                <span>Descripción Técnica y Funcional</span>
              </h2>
              
              <div 
                className={`text-slate-700 text-sm leading-relaxed whitespace-pre-line ${
                  isLongDescription && !descExpanded ? 'line-clamp-4' : ''
                }`}
              >
                {product.description}
              </div>

              {isLongDescription && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:underline"
                  >
                    <span>{descExpanded ? 'Mostrar menos texto' : 'Ver descripción completa'}</span>
                    {descExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Technical Specifications Table */}
          {hasSpecs && (
            <section id="product-specs-section">
              <ProductTechnicalSpecs 
                parsedSpecs={parsedSpecs} 
                rawSpecs={product.technicalSpecs} 
              />
            </section>
          )}

          {/* Applications & Clinical Presentation */}
          {hasApplicationsOrPresentation && (
            <section id="product-applications-section">
              <ProductClinicalApplications
                application={product.application}
                presentation={product.presentation}
              />
            </section>
          )}

          {/* Sibling Models / Variants in the same family */}
          {hasSiblingModels && (
            <section id="product-models-section">
              <ProductVariantsAndModels
                currentModel={product.model}
                currentName={product.name}
                siblingModels={product.siblingModels}
                brandName={product.brandName}
              />
            </section>
          )}

          {/* Official Documentation & Downloads */}
          {hasDocs && (
            <section id="product-documentation-section">
              <ProductDocumentation
                documents={product.documents}
                sourceUrl={product.sourceUrl}
              />
            </section>
          )}

          {/* Catalog Traceability and Data Transparency */}
          <section id="product-traceability-section">
            <ProductTraceability product={product} />
          </section>

          {/* Related Products from same line/category */}
          {hasRelated && (
            <section id="product-related-section">
              <ProductRelated
                relatedProducts={product.relatedProducts}
                categoryName={product.categoryName}
              />
            </section>
          )}

        </div>

      </div>

      {/* 5. Sticky Floating Header / Mobile Bottom Bar */}
      <ProductStickyBar 
        product={product} 
        mainImage={primaryImage} 
      />
    </main>
    </>
  );
}
