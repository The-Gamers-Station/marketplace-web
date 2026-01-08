import React, { lazy, Suspense, useEffect, memo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1>Something went wrong</h1>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px',
              marginTop: '20px',
              cursor: 'pointer',
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '8px'
            }}
          >
            Go to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Retry function for lazy loading
const lazyWithRetry = (componentImport) => {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      throw error;
    }
  });
};

// Lazy load pages for better performance with preloading
const LandingPage = lazyWithRetry(() =>
  import(/* webpackChunkName: "landing" */ './pages/LandingPage/LandingPage')
);
const FAQPage = lazyWithRetry(() =>
  import(/* webpackChunkName: "faq" */ './pages/FAQPage/FAQPage')
);
const ContactPage = lazyWithRetry(() =>
  import(/* webpackChunkName: "contact" */ './pages/ContactPage/ContactPage')
);
const ProductDetailsPage = lazyWithRetry(() =>
  import(/* webpackChunkName: "product" */ './pages/ProductDetailsPage/ProductDetailsPage')
);
const LoginPage = lazyWithRetry(() =>
  import(/* webpackChunkName: "login" */ './pages/LoginPage/LoginPage')
);
const RegisterPage = lazyWithRetry(() =>
  import(/* webpackChunkName: "register" */ './pages/RegisterPage/RegisterPage')
);
const ProfileCompletePage = lazyWithRetry(() =>
  import(/* webpackChunkName: "profile-complete" */ './pages/ProfileCompletePage/ProfileCompletePage')
);
const AddProductPage = lazyWithRetry(() =>
  import(/* webpackChunkName: "add-product" */ './pages/AddProductPage/AddProductPage')
);
const ProfilePage = lazyWithRetry(() =>
  import(/* webpackChunkName: "profile" */ './pages/ProfilePage/ProfilePage')
);
const ChatPage = lazyWithRetry(() =>
  import(/* webpackChunkName: "chat" */ './pages/ChatPage/ChatPage')
);
const NotFoundPage = lazyWithRetry(() =>
  import(/* webpackChunkName: "notfound" */ './pages/NotFoundPage/NotFoundPage')
);
const AllProductsPage = lazyWithRetry(() =>
  import(/* webpackChunkName: "all-products" */ './pages/AllProductsPage/AllProductsPage')
);
const EditProductPage = lazyWithRetry(() =>
  import(/* webpackChunkName: "edit-product" */ './pages/EditProductPage/EditProductPage')
);

// Modern Loading component with professional design
const PageLoader = memo(() => {
  const { t } = useTranslation();
  
  return (
    <div className="page-loader">
      <div className="loader-container">
        <div className="modern-loader">
           
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
      import(/* webpackChunkName: "product" */ './pages/ProductDetailsPage/ProductDetailsPage');
      // Preload auth pages for better UX
      import(/* webpackChunkName: "login" */ './pages/LoginPage/LoginPage');
      import(/* webpackChunkName: "register" */ './pages/RegisterPage/RegisterPage');
    };
    
    preloadPages();
  }, []);

  // Wait for i18n to be ready
  if (!ready) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <div className="App">
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/products" element={<AllProductsPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile/complete" element={<ProfileCompletePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/add-product" element={<AddProductPage />} />
                <Route path="/edit-product/:id" element={<EditProductPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:chatId" element={<ChatPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
