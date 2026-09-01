import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'vue-vendor': ['vue'],
          'lenis': ['lenis']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: false
  }
})
