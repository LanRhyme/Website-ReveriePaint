import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from './useLenis.js'

let initialized = false

export function initGsapScroll() {
  if (typeof window === 'undefined' || initialized) return
  gsap.registerPlugin(ScrollTrigger)

  const lenis = getLenis()
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update)
  }
  window.addEventListener('lenis:scroll', () => ScrollTrigger.update())

  if (document.readyState === 'complete') {
    ScrollTrigger.refresh()
  } else {
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
  }

  initialized = true
}

export { gsap, ScrollTrigger }

