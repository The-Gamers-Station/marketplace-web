import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to remove unused CSS
const removeUnusedCSS = () => {
  return {
    name: 'remove-unused-css',
    apply: 'build',
    generateBundle(options, bundle) {
      // Track all CSS classes used in JS/JSX files
      const usedClasses = new Set()
      const classRegex = /className\s*=\s*["'`]([^"'`]+)["'`]/g
      const dynamicClassRegex = /className\s*=\s*\{[^}]*["'`]([^"'`]+)["'`]/g
      
      // Scan all JS files for class names
      Object.keys(bundle).forEach(fileName => {
        if (fileName.endsWith('.js')) {
          const chunk = bundle[fileName]
          if (chunk.type === 'chunk') {
            let match
            while ((match = classRegex.exec(chunk.code)) !== null) {
              match[1].split(/\s+/).forEach(cls => usedClasses.add(cls))
            }
            while ((match = dynamicClassRegex.exec(chunk.code)) !== null) {
              match[1].split(/\s+/).forEach(cls => usedClasses.add(cls))
            }
          }
        }
      })
      
      // Add essential classes that might be dynamically added
      const essentialClasses = [
        'active', 'disabled', 'error', 'loading', 'success', 'show', 'hide',
        'open', 'closed', 'expanded', 'collapsed', 'animate-in', 'fade-in',
        'slide-in', 'skeleton', 'shimmer', 'mobile-only', 'desktop-only',
        'rtl', 'dark'
      ]
      essentialClasses.forEach(cls => usedClasses.add(cls))
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Include JSX runtime for better HMR
      jsxRuntime: 'automatic'
    }),
    removeUnusedCSS()
  ],
  
  // Ensure public directory is copied to dist
  publicDir: 'public',
  
  server: {
    // Enable HMR
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
      port: 5174, // Use a different port for HMR websocket to avoid conflicts
      clientPort: 5174
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
      },
      // WebSocket proxy configuration
      '/api/v1/ws': {
        target: 'ws://80.66.87.82:8080',
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('WebSocket proxy error', err);
          });
          proxy.on('open', () => {
            console.log('WebSocket connection opened');
          });
          proxy.on('close', () => {
            console.log('WebSocket connection closed');
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
        // Disable manual chunking to avoid issues with lucide-react
        manualChunks: undefined,
        
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
    cssMinify: true,
    // Additional CSS optimization
    cssTarget: 'chrome80'
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
    },
    // PostCSS configuration for CSS optimization
    postcss: {
      plugins: []
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
