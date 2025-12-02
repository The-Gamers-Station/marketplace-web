import React, { lazy, Suspense, useEffect, memo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import './App.css';

// Lazy load pages for better performance with preloading
const LandingPage = lazy(() =>
  import(/* webpackChunkName: "landing" */ './pages/LandingPage/LandingPage')
);
const FAQPage = lazy(() =>
  import(/* webpackChunkName: "faq" */ './pages/FAQPage/FAQPage')
);
const ContactPage = lazy(() =>
  import(/* webpackChunkName: "contact" */ './pages/ContactPage/ContactPage')
);
const MerchantsPage = lazy(() =>
  import(/* webpackChunkName: "merchants" */ './pages/MerchantsPage/MerchantsPage')
);
const ProductDetailsPage = lazy(() =>
  import(/* webpackChunkName: "product" */ './pages/ProductDetailsPage/ProductDetailsPage')
);

// Modern Loading component with professional design
const PageLoader = memo(() => {
  const { t } = useTranslation();
  
  return (
    <div className="page-loader">
      <div className="loader-container">
        <div className="modern-loader">
          <div className="loader-ring">
            <div className="loader-ring-inner"></div>
          </div>
          <img src="/logo.svg" alt="GamersStation" className="loader-logo" />
        </div>
        <div className="loader-progress">
          <div className="loader-progress-bar"></div>
        </div>
        <p className="loader-text">{t('common.loading')}</p>
      </div>
    </div>
  );
});

PageLoader.displayName = 'PageLoader';

function App() {
  const { i18n, ready } = useTranslation();

  useEffect(() => {
    // Set initial direction based on language
    const currentLang = i18n.language || 'ar';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  // Preload critical pages after initial render
  useEffect(() => {
    const preloadPages = async () => {
      // Wait a bit before preloading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Preload frequently accessed pages
      import(/* webpackChunkName: "merchants" */ './pages/MerchantsPage/MerchantsPage');
      import(/* webpackChunkName: "product" */ './pages/ProductDetailsPage/ProductDetailsPage');
    };
    
    preloadPages();
  }, []);

  // Wait for i18n to be ready
  if (!ready) {
    return <PageLoader />;
  }

  return (
    <HelmetProvider>
      <Router>
        <div className="App">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/merchants" element={<MerchantsPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
            </Routes>
          </Suspense>
          <ScrollToTop />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
