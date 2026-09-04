import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { wgslVitePlugin } from '@vgpu/wgsl/loader-vite'

export default defineConfig({
  base: '/',
  plugins: [vue(), wgslVitePlugin()],
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
