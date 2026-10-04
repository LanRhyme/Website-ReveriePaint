/**
 * 全局入场动画：任何带 .reveal 的元素进入视口后加上 .is-in
 * 只在客户端挂载一次，卸载时断开 observer
 */
let observer = null

export function initReveal() {
  if (typeof window === 'undefined' || observer) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'))
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )

  scanReveal()
}

/** 对当前 DOM 中尚未观察的 .reveal 元素注册观察 */
export function scanReveal(root = document) {
  if (!observer) return
  root.querySelectorAll('.reveal:not(.is-in), .line-mask:not(.is-in), .kinetic-wrap:not(.is-in)').forEach((el) => {
    if (el.dataset.revealBound === '1') return
    el.dataset.revealBound = '1'
    observer.observe(el)
  })
}

export function destroyReveal() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}
