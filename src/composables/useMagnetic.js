import { onMounted, onUnmounted } from 'vue'
import anime from 'animejs'

export function useMagnetic(targetRef, strength = 0.28) {
  let el = null
  let currentAnim = null
  let originLeft = 0
  let originTop = 0
  let originWidth = 0
  let originHeight = 0
  let curX = 0
  let curY = 0

  function computeOrigin() {
    if (!el) return
    const rect = el.getBoundingClientRect()
    originLeft = rect.left - curX
    originTop = rect.top - curY
    originWidth = rect.width
    originHeight = rect.height
  }

  function onMouseEnter() {
    computeOrigin()
  }

  function onMouseMove(e) {
    if (!el) return
    if (originWidth === 0) computeOrigin()
    const targetX = (e.clientX - (originLeft + originWidth / 2)) * strength
    const targetY = (e.clientY - (originTop + originHeight / 2)) * strength
    curX = targetX
    curY = targetY

    if (currentAnim) currentAnim.pause()
    currentAnim = anime({
      targets: el,
      translateX: targetX,
      translateY: targetY,
      duration: 260,
      easing: 'easeOutQuad'
    })
  }

  function onMouseLeave() {
    if (!el) return
    curX = 0
    curY = 0
    if (currentAnim) currentAnim.pause()
    currentAnim = anime({
      targets: el,
      translateX: 0,
      translateY: 0,
      duration: 750,
      easing: 'easeOutElastic(1, 0.45)'
    })
  }

  onMounted(() => {
    el = targetRef.value
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    el.addEventListener('mouseenter', onMouseEnter)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)
  })

  onUnmounted(() => {
    if (!el) return
    el.removeEventListener('mouseenter', onMouseEnter)
    el.removeEventListener('mousemove', onMouseMove)
    el.removeEventListener('mouseleave', onMouseLeave)
    if (currentAnim) currentAnim.pause()
  })
}

