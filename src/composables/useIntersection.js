import { ref, onMounted, onUnmounted, watch } from 'vue'

export function useIntersection(options = {}) {
  const target = ref(null)
  const isVisible = ref(false)

  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.value = entry.isIntersecting
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px',
        ...options
      }
    )
    if (target.value) observer.observe(target.value)
  })

  watch(target, (el, prev) => {
    if (!observer) return
    if (prev) observer.unobserve(prev)
    if (el) observer.observe(el)
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })

  return { target, isVisible }
}
