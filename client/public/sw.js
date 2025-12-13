// Service Worker for GamersStation - Advanced Caching Strategy
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAMES = {
  static: `static-cache-${CACHE_VERSION}`,
  dynamic: `dynamic-cache-${CACHE_VERSION}`,
  images: `image-cache-${CACHE_VERSION}`,
  api: `api-cache-${CACHE_VERSION}`
};

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/placeholder-game.jpg',
  '/logo.svg'
];

// Cache size limits
const CACHE_LIMITS = {
  images: 100, // Max 100 images
  api: 50,     // Max 50 API responses
  dynamic: 50  // Max 50 dynamic assets
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Install failed:', err))
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return !Object.values(CACHE_NAMES).includes(cacheName);
            })
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Remove oldest items (FIFO)
    const keysToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Helper: Check if request is cacheable
function isCacheable(request) {
  const url = new URL(request.url);
  
  // Don't cache non-GET requests
  if (request.method !== 'GET') return false;
  
  // Don't cache data URLs
  if (url.protocol === 'data:') return false;
  
  // Don't cache chrome-extension URLs
  if (url.protocol === 'chrome-extension:') return false;
  
  // Don't cache websocket connections
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return false;
  
  return true;
}

// Helper: Get cache strategy for request
function getCacheStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // API requests - Network first, cache fallback
  if (pathname.startsWith('/api/')) {
    return { strategy: 'network-first', cache: CACHE_NAMES.api };
  }
  
  // Images - Cache first, network fallback
  if (/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i.test(pathname)) {
    return { strategy: 'cache-first', cache: CACHE_NAMES.images };
  }
  
  // Static assets (JS, CSS) - Cache first
  if (/\.(js|css)$/i.test(pathname)) {
    return { strategy: 'cache-first', cache: CACHE_NAMES.static };
  }
  
  // HTML pages - Network first for fresh content
  if (pathname.endsWith('.html') || pathname === '/') {
    return { strategy: 'network-first', cache: CACHE_NAMES.static };
  }
  
  // Default - Try cache, then network
  return { strategy: 'cache-first', cache: CACHE_NAMES.dynamic };
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Limit cache size
      if (cacheName === CACHE_NAMES.api) {
        limitCacheSize(cacheName, CACHE_LIMITS.api);
      }
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cacheResponse = await caches.match(request);
    if (cacheResponse) {
      console.log('[SW] Network failed, serving from cache:', request.url);
      return cacheResponse;
    }
    
    // Both network and cache failed
    throw error;
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cacheResponse = await caches.match(request);
  
  if (cacheResponse) {
    // Update cache in background
    fetch(request).then(networkResponse => {
      if (networkResponse && networkResponse.status === 200) {
        caches.open(cacheName).then(cache => {
          cache.put(request, networkResponse);
          
          // Limit cache size for images
          if (cacheName === CACHE_NAMES.images) {
            limitCacheSize(cacheName, CACHE_LIMITS.images);
          } else if (cacheName === CACHE_NAMES.dynamic) {
            limitCacheSize(cacheName, CACHE_LIMITS.dynamic);
          }
        });
      }
    }).catch(() => {
      // Silently fail background update
    });
    
    return cacheResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }
    
    throw error;
  }
}

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  if (!isCacheable(event.request)) {
    return;
  }
  
  const { strategy, cache: cacheName } = getCacheStrategy(event.request);
  
  if (strategy === 'network-first') {
    event.respondWith(networkFirst(event.request, cacheName));
  } else {
    event.respondWith(cacheFirst(event.request, cacheName));
  }
});

// Message handling for cache management
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        if (event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(CACHE_NAMES.dynamic).then(cache => {
        return Promise.all(
          urls.map(url => 
            fetch(url).then(response => {
              if (response && response.status === 200) {
                return cache.put(url, response);
              }
            }).catch(() => {
              // Silently fail individual URL caching
            })
          )
        );
      }).then(() => {
        if (event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
});

// Background sync for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
});

async function syncPosts() {
  // Implement background sync for posts/products
  try {
    const cache = await caches.open(CACHE_NAMES.api);
    const requests = await cache.keys();
    
    // Filter POST requests that need syncing
    const postRequests = requests.filter(request => 
      request.method === 'POST' && request.url.includes('/api/')
    );
    
    // Attempt to sync each request
    await Promise.all(
      postRequests.map(async request => {
        try {
          const response = await fetch(request.clone());
          if (response.ok) {
            // Remove from cache after successful sync
            await cache.delete(request);
          }
        } catch {
          console.log('[SW] Sync failed for:', request.url);
        }
      })
    );
  } catch (error) {
    console.error('[SW] Background sync error:', error);
  }
}

// Periodic background sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  // Periodically update cached content
  const urlsToUpdate = [
    '/',
    '/api/posts',
    '/api/categories'
  ];
  
  const cache = await caches.open(CACHE_NAMES.dynamic);
  
  await Promise.all(
    urlsToUpdate.map(url => 
      fetch(url).then(response => {
        if (response && response.status === 200) {
          return cache.put(url, response);
        }
      }).catch(() => {
        // Silently fail
      })
    )
  );
}

console.log('[SW] Service Worker loaded');