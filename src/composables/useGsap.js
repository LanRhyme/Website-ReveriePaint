import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from './useLenis.js'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  // 手机地址栏收放会改变视口高度，忽略这类 resize 避免 ScrollTrigger 反复刷新
  ScrollTrigger.config({ ignoreMobileResize: true })
}

let initialized = false

export function initGsapScroll() {
  if (typeof window === 'undefined' || initialized) return

  const lenis = getLenis()
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update)
  }
  window.addEventListener('lenis:scroll', () => ScrollTrigger.update())

  const refresh = () => ScrollTrigger.refresh()
  if (document.readyState === 'complete') {
    refresh()
  } else {
    window.addEventListener('load', refresh, { once: true })
  }
  // 字体与首屏大图加载完成后，元素高度变化会让触发点偏移
  if (document.fonts?.ready) {
    document.fonts.ready.then(refresh)
  }

  initialized = true
}

export function isFineHoverPointer(e) {
  if (typeof window === 'undefined') return false
  if (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return false
    if ('sourceCapabilities' in e && e.sourceCapabilities?.firesTouchEvents) return false
  }
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export { gsap, ScrollTrigger }
