import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Include JSX runtime for better HMR
      jsxRuntime: 'automatic',
      // Babel optimization for production builds
      babel: {
        plugins: process.env.NODE_ENV === 'production' ?
          [['transform-react-remove-prop-types', { removeImport: true }]] : []
      }
    })
  ],
  server: {
    // Enable HMR
    hmr: {
      overlay: true,
      // Use polling on Windows to fix HMR issues
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
    // Open browser automatically
    open: false,
    // Enable response compression
    middlewareMode: false
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
      }
    }
  },
  // Build configuration
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
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
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            return 'vendor';
          }
          
          // Component chunks
          if (id.includes('/components/')) {
            if (id.includes('/components/Header') || id.includes('/components/Footer')) {
              return 'layout-components';
            }
            if (id.includes('/components/Product')) {
              return 'product-components';
            }
            return 'components';
          }
          
          // Page chunks are handled by lazy loading
        },
        // Asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
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
    }
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
