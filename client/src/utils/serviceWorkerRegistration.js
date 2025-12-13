// Service Worker Registration and Management

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    // Register service worker after page load for better performance
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      if (isLocalhost) {
        // This is running on localhost. Check if a service worker still exists or not
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service worker. ' +
            'To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });

    // Handle service worker updates
    if (config && config.onUpdate) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      console.log('Service Worker registered successfully:', registration);

      // Check for updates periodically
      const intervalId = setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }

              // Show update notification
              showUpdateNotification();
            } else {
              // At this point, everything has been precached.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };

      // Clear interval on page unload
      window.addEventListener('unload', () => {
        clearInterval(intervalId);
      });
    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

// Show update notification
function showUpdateNotification() {
  if (!document.querySelector('.sw-update-notification')) {
    const notification = document.createElement('div');
    notification.className = 'sw-update-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span>New version available!</span>
        <button onclick="window.location.reload()">Update Now</button>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .sw-update-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #2196F3;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideUp 0.3s ease-out;
      }
      
      .notification-content {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .notification-content button {
        background: white;
        color: #2196F3;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: opacity 0.2s;
      }
      
      .notification-content button:hover {
        opacity: 0.9;
      }
      
      @keyframes slideUp {
        from {
          transform: translate(-50%, 100%);
          opacity: 0;
        }
        to {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
  }
}

// Utility functions for service worker communication
export function sendMessageToSW(message) {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker.controller) {
      reject(new Error('No service worker controller'));
      return;
    }

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = event => {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
}

// Clear all caches
export function clearAllCaches() {
  return sendMessageToSW({ type: 'CLEAR_CACHE' });
}

// Cache specific URLs
export function cacheUrls(urls) {
  return sendMessageToSW({ type: 'CACHE_URLS', urls });
}

// Skip waiting for new service worker
export function skipWaiting() {
  return sendMessageToSW({ type: 'SKIP_WAITING' });
}

// Check if app is running offline
export function isOffline() {
  return !navigator.onLine;
}

// Network status monitoring
export function setupNetworkStatusMonitoring() {
  let wasOffline = false;
  
  window.addEventListener('online', () => {
    if (wasOffline) {
      console.log('Back online! Syncing data...');
      // Trigger background sync
      if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          registration.sync.register('sync-posts');
        });
      }
      wasOffline = false;
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('App is offline. Some features may be limited.');
    wasOffline = true;
  });
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalUrls = [
    '/',
    '/api/posts?page=1&limit=12',
    '/api/categories',
    '/logo.svg',
    '/placeholder-game.jpg'
  ];
  
  // Preload after initial page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      cacheUrls(criticalUrls).catch(err => {
        console.log('Failed to preload resources:', err);
      });
    }, 5000); // Wait 5 seconds after page load
  });
}

// Performance monitoring for service worker
export function monitorServiceWorkerPerformance() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.name.includes('sw.js')) {
          console.log('Service Worker Performance:', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource', 'navigation'] });
  }
}

// Export all utilities
export default {
  register,
  unregister,
  sendMessageToSW,
  clearAllCaches,
  cacheUrls,
  skipWaiting,
  isOffline,
  setupNetworkStatusMonitoring,
  preloadCriticalResources,
  monitorServiceWorkerPerformance
};