import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Performance optimizations
    rollupOptions: {
      output: {
        // Code splitting strategy for better caching
        manualChunks: {
          firebase: ['firebase/app', 'firebase/database'],
          router: ['react-router-dom'],
          icons: ['react-icons/fi'],
          vendor: ['react', 'react-dom', 'react-helmet-async']
        }
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Assets optimization
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild'
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/database']
  }
})
