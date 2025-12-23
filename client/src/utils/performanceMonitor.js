// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = new Map();
    this.isSupported = this.checkSupport();
  }

  checkSupport() {
    return typeof window !== 'undefined' && 
           'performance' in window && 
           'PerformanceObserver' in window;
  }

  // Measure component render time
  measureComponent(componentName, callback) {
    if (!this.isSupported) {
      callback();
      return;
    }

    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;
    const measureName = `${componentName}-render`;

    performance.mark(startMark);
    
    const result = callback();
    
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    if (measure) {
      this.logMetric(componentName, measure.duration);
    }
    
    // Clean up marks
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
    
    return result;
  }

  // Log Web Vitals
  logWebVitals() {
    if (!this.isSupported) return;

    // First Contentful Paint (FCP)
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.logMetric('FCP', entry.startTime);
        }
      }
    });
    
    try {
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', paintObserver);
    } catch (e) { void e;
      // Paint observer not supported
    }

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.logMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
    });
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
    } catch (e) { void e;
      // LCP observer not supported
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.logMetric('FID', entry.processingStart - entry.startTime);
      }
    });
    
    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
    } catch (e) { void e;
      // FID observer not supported
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.logMetric('CLS', clsValue);
        }
      }
    });
    
    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    } catch (e) { void e;
      // CLS observer not supported
    }

    // Time to First Byte (TTFB)
    this.measureTTFB();
  }

  // Measure Time to First Byte
  measureTTFB() {
    if (!this.isSupported) return;
    
    const navigationTiming = performance.getEntriesByType('navigation')[0];
    if (navigationTiming) {
      const ttfb = navigationTiming.responseStart - navigationTiming.fetchStart;
      this.logMetric('TTFB', ttfb);
    }
  }

  // Log resource loading performance
  logResourcePerformance() {
    if (!this.isSupported) return;

    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'img' || 
            entry.initiatorType === 'script' || 
            entry.initiatorType === 'css') {
          this.logResourceMetric(entry.name, entry.duration, entry.initiatorType);
        }
      }
    });
    
    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (e) { void e;
      // Resource observer not supported
    }
  }

  // Log a metric
  logMetric(name, value) {
    this.metrics[name] = {
      value: Math.round(value * 100) / 100,
      timestamp: Date.now()
    };
    
    // [Performance] ${name}: ${this.metrics[name].value}ms
  }

  // Log resource metric
  logResourceMetric(name, duration, type) {
    const resourceMetrics = this.metrics.resources || [];
    resourceMetrics.push({
      name: name.split('/').pop(),
      duration: Math.round(duration * 100) / 100,
      type,
      timestamp: Date.now()
    });
    this.metrics.resources = resourceMetrics;
  }

  // Get all metrics
  getMetrics() {
    return this.metrics;
  }

  // Send metrics to analytics (implement your analytics here)
  sendMetrics(endpoint) {
    if (Object.keys(this.metrics).length === 0) return;
    
    // Example: Send to your analytics endpoint
    if (import.meta.env && import.meta.env.PROD) {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: this.metrics,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      }).catch(err => {
        // Failed to send metrics: err
      });
    }
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-initialize on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.logWebVitals();
    performanceMonitor.logResourcePerformance();
    
    // Send metrics after 10 seconds
    setTimeout(() => {
      // [Performance] Final Metrics: performanceMonitor.getMetrics()
    }, 10000);
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
  });
}

export default performanceMonitor;