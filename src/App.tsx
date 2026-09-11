import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { QuoteProvider } from './context/QuoteContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAnalytics } from './hooks/useAnalytics';
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Catalog = lazy(() => import('./pages/Catalog').then(module => ({ default: module.Catalog })));
const CategoryDetail = lazy(() => import('./pages/CategoryDetail').then(module => ({ default: module.CategoryDetail })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(module => ({ default: module.ProductDetail })));
const ManufacturersDirectory = lazy(() => import('./pages/ManufacturersDirectory').then(module => ({ default: module.ManufacturersDirectory })));
const ManufacturerDetail = lazy(() => import('./pages/ManufacturerDetail').then(module => ({ default: module.ManufacturerDetail })));
const BrandsDirectory = lazy(() => import('./pages/BrandsDirectory').then(module => ({ default: module.BrandsDirectory })));
const BrandDetail = lazy(() => import('./pages/BrandDetail').then(module => ({ default: module.BrandDetail })));
const Quote = lazy(() => import('./pages/Quote').then(module => ({ default: module.Quote })));
const Tdr = lazy(() => import('./pages/Tdr').then(module => ({ default: module.Tdr })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const News = lazy(() => import('./pages/News').then(module => ({ default: module.News })));
const Contact = lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const Pharmacovigilance = lazy(() => import('./pages/Pharmacovigilance').then(module => ({ default: module.Pharmacovigilance })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

function RouteFallback() {
  return <div className="min-h-[40vh] flex items-center justify-center text-slate-500">Cargando contenido...</div>;
}

function PublicLayout() {
  useAnalytics(); // Inicia el tracking de vistas de página

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      {/* FASE 21 — Accesibilidad: Skip to main content */}
      <a href="#main-content" className="skip-to-content">
        Saltar al contenido principal
      </a>
      <Header />
      <div id="main-content" className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}


export default function App() {
  return (
    <HelmetProvider>
      <QuoteProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/admin/*" element={<Admin />} />
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/nosotros" element={<About />} />
                <Route path="/productos" element={<Catalog />} />
                <Route path="/categorias/:slug" element={<CategoryDetail />} />
                <Route path="/productos/:slug" element={<ProductDetail />} />
                <Route path="/producto/:slug" element={<ProductDetail />} />
                <Route path="/fabricantes" element={<ManufacturersDirectory />} />
                <Route path="/fabricantes/:nameOrSlug" element={<ManufacturerDetail />} />
                <Route path="/marcas" element={<BrandsDirectory />} />
                <Route path="/marcas/:idOrSlug" element={<BrandDetail />} />
                <Route path="/noticias" element={<News />} />
                <Route path="/contacto" element={<Contact />} />
                <Route path="/cotizar" element={<Quote />} />
                <Route path="/tdr" element={<Tdr />} />
                <Route path="/farmacovigilancia" element={<Pharmacovigilance />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QuoteProvider>
    </HelmetProvider>
  );
}
