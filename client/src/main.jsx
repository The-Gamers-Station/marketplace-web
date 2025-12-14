import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // Initialize i18n
import App from './App.jsx'
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration'
 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for offline functionality and performance
serviceWorkerRegistration.register({
  onSuccess: () => {
    // Service Worker registration successful
  },
  onUpdate: () => {
    // New content is available; please refresh
  }
});

// Setup network status monitoring
serviceWorkerRegistration.setupNetworkStatusMonitoring();

// Preload critical resources after initial load
serviceWorkerRegistration.preloadCriticalResources();

// Monitor service worker performance
if (import.meta.env.DEV) {
  serviceWorkerRegistration.monitorServiceWorkerPerformance();
}
