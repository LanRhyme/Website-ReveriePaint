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
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 0
  },
  server: {
    port: 5173,
    open: false
  }
})
