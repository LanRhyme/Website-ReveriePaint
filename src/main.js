import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/global.css'
import { initLenis } from './composables/useLenis.js'

// 尽早初始化 Lenis，确保页面加载即生效（而非等待 App.vue onMounted），并让 html.lenis 类立即可验证
if (typeof window !== 'undefined') {
  // 延迟到 DOMContentLoaded 之前初始化，但确保在 Vue 挂载前完成首帧 raf
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initLenis(), { once: true })
  } else {
    initLenis()
  }
}

createApp(App).mount('#app')
