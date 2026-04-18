import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Split CSS per chunk so pages only load their own styles
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    // Use esbuild (default, fast) for minification — terser not needed
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached forever after first load
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Firebase — large SDK, changes rarely
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Animation library
          'vendor-framer': ['framer-motion'],
          // PDF viewer — very large, only needed on product detail pages
          'vendor-pdf': ['react-pdf', 'pdfjs-dist'],
          // All Radix UI primitives bundled together
          'vendor-radix': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-label',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch',
            '@radix-ui/react-avatar',
          ],
          // Heavy pages isolated to avoid bloating the main bundle
          'page-hub': ['./src/pages/LegalHub'],
          'page-playground': ['./src/pages/LegalPlayground'],
          'page-mcq-quiz': ['./src/pages/MCQQuiz'],

          // Chart library — only used in admin analytics
          'vendor-charts': ['recharts'],
          // Form handling
          'vendor-forms': ['react-hook-form', 'zod'],
        },
      },
    },
  },
});

