import { ref, onMounted, onUnmounted } from 'vue'

export function usePrefersReducedMotion() {
  const prefersReduced = ref(false)
  let mql = null
  const handler = (e) => (prefersReduced.value = e.matches)

  onMounted(() => {
    mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReduced.value = mql.matches
    mql.addEventListener('change', handler)
  })
  onUnmounted(() => {
    if (mql) mql.removeEventListener('change', handler)
  })
  return prefersReduced
}
