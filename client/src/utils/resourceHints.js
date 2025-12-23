// Resource Hints and Performance Optimization Utilities

/**
 * Preloads critical resources for better performance
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;
  
  const criticalResources = [
    { href: '/logo.svg', as: 'image', type: 'image/svg+xml' },
    { href: '/placeholder-game.svg', as: 'image', type: 'image/svg+xml' },
    { href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap', as: 'style' }
  ];
  
  criticalResources.forEach(resource => {
    const existingLink = document.querySelector(`link[rel="preload"][href="${resource.href}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      if (resource.as === 'font') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
}

/**
 * Prefetches resources for likely next navigation
 */
export function prefetchResources(urls) {
  if (typeof window === 'undefined' || !('requestIdleCallback' in window)) return;
  
  requestIdleCallback(() => {
    urls.forEach(url => {
      const existingLink = document.querySelector(`link[rel="prefetch"][href="${url}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      }
    });
  }, { timeout: 2000 });
}

/**
 * Preconnects to external domains for faster resource loading
 */
export function preconnectDomains() {
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.gamersstation.eg',
    'https://images.unsplash.com'
  ];
  
  domains.forEach(domain => {
    const existingPreconnect = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
    if (!existingPreconnect) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = domain.includes('fonts') ? 'anonymous' : '';
      document.head.appendChild(link);
    }
    
    // Also add dns-prefetch as fallback
    const existingDnsPrefetch = document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`);
    if (!existingDnsPrefetch) {
      const dnsLink = document.createElement('link');
      dnsLink.rel = 'dns-prefetch';
      dnsLink.href = domain;
      document.head.appendChild(dnsLink);
    }
  });
}

/**
 * Implements adaptive loading based on network conditions
 */
export function getNetworkConditions() {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType || 'unknown',
      saveData: connection.saveData || false,
      downlink: connection.downlink || null,
      rtt: connection.rtt || null
    };
  }
  return { effectiveType: '4g', saveData: false, downlink: null, rtt: null };
}

/**
 * Determines resource loading strategy based on network
 */
export function getLoadingStrategy() {
  const { effectiveType, saveData } = getNetworkConditions();
  
  if (saveData) {
    return 'minimal';
  }
  
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'minimal';
    case '3g':
      return 'moderate';
    case '4g':
    default:
      return 'full';
  }
}

/**
 * Lazy loads images with intersection observer
 */
export function lazyLoadImages(selector = 'img[data-src]', options = {}) {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll(selector).forEach(img => {
      img.src = img.dataset.src;
      img.classList.add('loaded');
    });
    return;
  }
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: options.rootMargin || '50px 0px',
    threshold: options.threshold || 0.01
  });
  
  document.querySelectorAll(selector).forEach(img => {
    imageObserver.observe(img);
  });
  
  return imageObserver;
}

/**
 * Implements progressive enhancement for components
 */
export function progressiveEnhancement(componentLoader, fallback) {
  const strategy = getLoadingStrategy();
  
  if (strategy === 'minimal') {
    return fallback;
  }
  
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window && strategy === 'moderate') {
      requestIdleCallback(() => {
        componentLoader().then(resolve);
      }, { timeout: 3000 });
    } else {
      componentLoader().then(resolve);
    }
  });
}

/**
 * Optimizes third-party script loading
 */
export function loadThirdPartyScript(src, options = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = options.async !== false;
    script.defer = options.defer || false;
    
    if (options.integrity) {
      script.integrity = options.integrity;
      script.crossOrigin = 'anonymous';
    }
    
    script.onload = resolve;
    script.onerror = reject;
    
    // Load based on network conditions
    const strategy = getLoadingStrategy();
    if (strategy === 'minimal' && !options.critical) {
      return reject(new Error('Script loading skipped due to network conditions'));
    }
    
    if (options.loadOnIdle && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        document.body.appendChild(script);
      }, { timeout: options.timeout || 5000 });
    } else {
      document.body.appendChild(script);
    }
  });
}

/**
 * Monitors and reports performance metrics
 */
export function reportWebVitals(onPerfEntry) {
  if ('PerformanceObserver' in window) {
    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          onPerfEntry({
            name: 'CLS',
            value: clsValue,
            id: 'v1-' + Date.now() + '-' + Math.floor(Math.random() * 10000)
          });
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      onPerfEntry({
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
        id: 'v1-' + Date.now() + '-' + Math.floor(Math.random() * 10000)
      });
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    
    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        onPerfEntry({
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          id: 'v1-' + Date.now() + '-' + Math.floor(Math.random() * 10000)
        });
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  }
}

// Auto-initialize resource hints
if (typeof window !== 'undefined') {
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preconnectDomains();
      preloadCriticalResources();
    });
  } else {
    preconnectDomains();
    preloadCriticalResources();
  }
}

export default {
  preloadCriticalResources,
  prefetchResources,
  preconnectDomains,
  getNetworkConditions,
  getLoadingStrategy,
  lazyLoadImages,
  progressiveEnhancement,
  loadThirdPartyScript,
  reportWebVitals
};