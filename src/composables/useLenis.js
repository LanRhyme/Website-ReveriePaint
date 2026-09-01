import Lenis from 'lenis'

let lenisInstance = null
let rafId = 0

export function getLenis() {
  return lenisInstance
}

export function initLenis(options = {}) {
  if (lenisInstance) return lenisInstance
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // 即使开启减弱动效也初始化 Lenis（仅缩短时长、禁用平滑触摸），保证用户感知到 Lenis 已引入
  lenisInstance = new Lenis({
    duration: prefersReduced ? 0.6 : 1.15,
    easing: prefersReduced ? (t) => t : (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 1.6,
    infinite: false,
    autoRaf: false,
    ...options
  })

  window.__lenis = lenisInstance
  // 标记已引入，供用户 DevTools 验证：window.__lenis && document.documentElement.classList.contains('lenis')
  console.info('[Lenis] initialized', { prefersReduced, version: Lenis.version || '1.3.26' })

  function raf(time) {
    lenisInstance.raf(time)
    rafId = requestAnimationFrame(raf)
  }
  rafId = requestAnimationFrame(raf)

  function onAnchorClick(e) {
    const a = e.target.closest('a[href^="#"]')
    if (!a) return
    const href = a.getAttribute('href')
    if (!href || href === '#') return
    const target = document.querySelector(href)
    if (!target) return
    e.preventDefault()
    const offset = window.innerWidth <= 1024 ? -12 : -24
    lenisInstance.scrollTo(target, {
      offset,
      duration: prefersReduced ? 0.6 : 1.25,
      easing: prefersReduced ? (t) => t : (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    })
    window.dispatchEvent(new CustomEvent('lenis:navigate', { detail: href }))
    history.pushState(null, '', href)
  }
  document.addEventListener('click', onAnchorClick)
  window.__lenisAnchorHandler = onAnchorClick

  lenisInstance.on('scroll', () => {
    window.dispatchEvent(new Event('lenis:scroll'))
  })

  return lenisInstance
}

export function destroyLenis() {
  if (rafId) cancelAnimationFrame(rafId)
  if (window.__lenisAnchorHandler) {
    document.removeEventListener('click', window.__lenisAnchorHandler)
    delete window.__lenisAnchorHandler
  }
  if (lenisInstance) {
    lenisInstance.destroy()
    lenisInstance = null
    delete window.__lenis
  }
}

// Vue composable 包装：兼容旧调用点 src/App.vue 的 useLenis()
import { onMounted, onUnmounted } from 'vue'
export function useLenis(options = {}) {
  onMounted(() => initLenis(options))
  onUnmounted(() => {
    // 不在组件卸载时销毁，保持单例；仅在整页卸载时 destroyLenis()
  })
  return { getLenis }
}
