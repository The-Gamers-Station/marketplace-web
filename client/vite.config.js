import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Include JSX runtime for better HMR
      jsxRuntime: 'automatic'
    })
  ],
  
  server: {
    // Enable HMR
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    },
    // Watch options for better file detection on Windows
    watch: {
      usePolling: true,
      interval: 100
    },
    // Host configuration
    host: true,
    port: 5173,
    strictPort: false,
    // Enable response compression
    middlewareMode: false,
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://80.66.87.82:8080',
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-helmet-async',
      'react-i18next',
      'i18next',
      'i18next-browser-languagedetector',
      'i18next-http-backend',
      'lucide-react'
    ],
    exclude: [],
    esbuildOptions: {
      // Define global variables if needed
      define: {
        global: 'globalThis'
      },
      // Target modern browsers for smaller builds
      target: 'es2018'
    }
  },
  
  // Build configuration
  build: {
    target: 'es2018',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    // Smaller chunks for better caching
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    rollupOptions: {
      output: {
        // Advanced chunking strategy
        manualChunks(id) {
          // Core React chunks
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') && !id.includes('react-')) {
              return 'react-core';
            }
            // React ecosystem
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('react-helmet')) {
              return 'react-vendor';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // All other vendor code
            return 'vendor';
          }
          
          // Application code splitting
          if (id.includes('/src/')) {
            // Services
            if (id.includes('/services/')) {
              return 'services';
            }
            // Common components
            if (id.includes('/components/Header') || 
                id.includes('/components/Footer') || 
                id.includes('/components/SEO')) {
              return 'layout';
            }
            // Product components
            if (id.includes('/components/Product') || 
                id.includes('/components/OptimizedImage')) {
              return 'product-components';
            }
            // Form components
            if (id.includes('/components/Form') || 
                id.includes('/components/LanguageSwitcher')) {
              return 'form-components';
            }
            // Virtual scrolling
            if (id.includes('/components/VirtualScroll')) {
              return 'virtual-scroll';
            }
          }
        },
        
        // Asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (extType === 'css') {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      },
      // Tree-shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    // Report compressed size
    reportCompressedSize: true,
    // Consistent file names for better caching
    modulePreload: {
      polyfill: true
    },
    // CSS optimization
    cssMinify: true
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@utils': '/src/utils',
      '@assets': '/src/assets'
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true
  }
})
