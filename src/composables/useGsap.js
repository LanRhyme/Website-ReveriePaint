import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from './useLenis.js'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

let initialized = false

export function initGsapScroll() {
  if (typeof window === 'undefined' || initialized) return

  const lenis = getLenis()
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update)
  }
  window.addEventListener('lenis:scroll', () => ScrollTrigger.update())
  window.addEventListener('scroll', () => ScrollTrigger.update(), { passive: true })

  if (document.readyState === 'complete') {
    ScrollTrigger.refresh()
  } else {
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
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

export { gsap, ScrollTrigger }

