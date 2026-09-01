import { onMounted, onUnmounted } from 'vue'
import anime from 'animejs'

export function useMagnetic(targetRef, strength = 0.35) {
  let el = null
  let bounds = null
  let raf = 0

  function onMove(e) {
    if (!el || !bounds) return
    const x = e.clientX - bounds.left - bounds.width / 2
    const y = e.clientY - bounds.top - bounds.height / 2
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      anime({
        targets: el,
        translateX: x * strength,
        translateY: y * strength,
        duration: 400,
        easing: 'easeOutQuad'
      })
    })
  }

  function onLeave() {
    if (!el) return
    anime({
      targets: el,
      translateX: 0,
      translateY: 0,
      duration: 700,
      easing: 'easeOutElastic(1, 0.5)'
    })
  }

  function updateBounds() {
    if (el) bounds = el.getBoundingClientRect()
  }

  onMounted(() => {
    el = targetRef.value
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    updateBounds()
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', updateBounds)
  })

  onUnmounted(() => {
    if (!el) return
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
    window.removeEventListener('resize', updateBounds)
    cancelAnimationFrame(raf)
  })
}
