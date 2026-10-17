/**
 * 全站唯一的入场动画系统。
 *
 * 规则：只管一件事 —— 元素进入视口后加 .is-in，其余交给 CSS。
 * 不要把 GSAP 的 from({opacity:0}) 叠在 .reveal 上：两边都写透明度时，
 * GSAP 会以 CSS 的 0 作为终点写回内联样式，元素就永久停在不可见状态。
 */
let observer = null
let mutationObserver = null
let reduced = false
let initialized = false
let scanTimer = 0

const REVEAL_SELECTOR = '.reveal, .reveal-fade'

function revealNow(el) {
  el.classList.add('is-in')
}

function scan(root = document) {
  const nodes = root.querySelectorAll(REVEAL_SELECTOR)
  nodes.forEach((el) => {
    if (el.dataset.revealBound === '1') return
    el.dataset.revealBound = '1'
    if (reduced || !observer) {
      revealNow(el)
    } else {
      observer.observe(el)
    }
  })
}

export function initReveal() {
  if (typeof window === 'undefined' || observer || initialized) return
  initialized = true

  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!reduced) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          revealNow(entry.target)
          observer.unobserve(entry.target)
        })
      },
      // 元素露出约 10% 即触发，底部留一点余量避免"到边上才出现"
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    )
  }

  scan()

  // 拖动滚动条或锚点跳转会一次跨过很多内容，这些元素从没"进入过视口"，
  // 若不管就会在回滚时留下一片空白。滚动停止后把已经越过视口的直接标为已显示。
  let sweepTimer = 0
  window.addEventListener(
    'scroll',
    () => {
      clearTimeout(sweepTimer)
      sweepTimer = setTimeout(() => {
        document.querySelectorAll('.reveal:not(.is-in), .reveal-fade:not(.is-in)').forEach((el) => {
          if (el.getBoundingClientRect().bottom < 0) revealNow(el)
        })
      }, 180)
    },
    { passive: true }
  )

  // 兜底：万一 observer 因任何原因没触发，把落在首屏里的元素显出来，
  // 不让页面停在"一片空白"的状态。
  window.addEventListener(
    'load',
    () => {
      setTimeout(() => {
        document.querySelectorAll('.reveal:not(.is-in), .reveal-fade:not(.is-in)').forEach((el) => {
          const r = el.getBoundingClientRect()
          if (r.top < window.innerHeight && r.bottom > 0) revealNow(el)
        })
      }, 1200)
    },
    { once: true }
  )

  // 语言切换会重建带 :key 的节点，新节点需要重新登记，
  // 否则它们会带着 .reveal 的 opacity:0 一直不可见。
  if ('MutationObserver' in window) {
    mutationObserver = new MutationObserver(() => {
      clearTimeout(scanTimer)
      scanTimer = setTimeout(() => scan(), 80)
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })
  }
}

/** 主题或语言变化后可手动补扫一次 */
export function scanReveal(root = document) {
  scan(root)
}

export function destroyReveal() {
  observer?.disconnect()
  observer = null
  mutationObserver?.disconnect()
  mutationObserver = null
  clearTimeout(scanTimer)
  initialized = false
}
