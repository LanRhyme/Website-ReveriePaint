<script setup>
import { ref, onMounted, watch } from 'vue'
import anime from 'animejs'
import { useIntersection } from '../composables/useIntersection.js'

const rootRef = ref(null)
const { target, isVisible } = useIntersection({ threshold: 0.18 })
let played = false

onMounted(() => {
  // 同步 IntersectionObserver 目标；普通模板 ref（非函数 ref），避免 Vue 编译成 t.value.value 在 null 时抛错
  if (rootRef.value) target.value = rootRef.value
})

watch(isVisible, (v) => {
  if (!v || played) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { played = true; return }
  played = true
  anime.timeline({ easing: 'easeOutExpo' })
    .add({
      targets: '.footer-huge-mark .char',
      translateY: [48, 0],
      opacity: [0, 1],
      duration: 900,
      delay: anime.stagger(38),
      easing: 'easeOutExpo'
    })
    .add({
      targets: '.footer-meta-grid > div',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(120)
    }, '-=500')
    .add({
      targets: '.footer-colophon span',
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 600,
      delay: anime.stagger(80)
    }, '-=400')
})

function onScroll() {
  const el = rootRef.value?.querySelector('.footer-huge-mark')
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const rect = el.getBoundingClientRect()
  const prog = 1 - rect.top / window.innerHeight
  if (prog > 0 && prog < 1.4) {
    el.style.transform = `translateX(${ (prog - 0.5) * -24 }px)`
  }
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))

// 将 REVERIEPAINT 拆为单字 span，避免 letter-spacing 导致末字被 overflow 裁切，并支持 stagger 入场
onMounted(() => {
  const el = rootRef.value?.querySelector('.footer-huge-mark')
  if (!el || el.dataset.split === '1') return
  const text = el.textContent.trim()
  el.textContent = ''
  ;[...text].forEach(ch => {
    const s = document.createElement('span')
    s.className = 'char'
    s.textContent = ch
    s.style.display = 'inline-block'
    el.appendChild(s)
  })
  el.dataset.split = '1'
})
</script>

<template>
  <footer ref="rootRef">
    <div class="footer-huge-mark" aria-hidden="true">REVERIEPAINT</div>
    <div class="footer-meta-grid">
      <div>
        <h4 class="footer-col-title">About The Philosophy</h4>
        <p class="footer-desc">
          ReveriePaint 是一场针对移动端数字绘画工具的纯粹主义重构，我们相信工具的终极状态是隐形，让创作者的意念跨越屏幕，直抵艺术本身
        </p>
      </div>
      <div>
        <h4 class="footer-col-title">Open Engine</h4>
        <ul class="footer-link-list">
          <li><a href="https://github.com/LanRhyme/ReveriePaint" target="_blank" rel="noopener">GitHub Repository ↗</a></li>
          <li><a href="https://github.com/LanRhyme/ReveriePaint/releases" target="_blank" rel="noopener">Binary Releases ↗</a></li>
          <li><a href="https://krita.org" target="_blank" rel="noopener">Krita Core Architecture ↗</a></li>
        </ul>
      </div>
      <div>
        <h4 class="footer-col-title">Architecture</h4>
        <ul class="footer-link-list">
          <li><a href="#">ARM64-V8A Native</a></li>
          <li><a href="#">GPL-3.0 License</a></li>
          <li><a href="#">Material You Monet</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-colophon">
      <span>CRAFTED FOR IMMERSIVE DIGITAL EXPRESSION</span>
      <span>[ MORANDI PRECISION CANVAS ]</span>
      <span>© 2026 REVERIEPAINT PROJECT</span>
    </div>
  </footer>
</template>

<style scoped>
footer {
  padding: 10rem 8vw 5rem;
  border-top: 1px solid var(--border-wire);
  position: relative;
  z-index: 10;
  background: var(--c-bg);
  overflow: visible;
}
.footer-huge-mark {
  font-family: var(--font-display);
  /* 修复：原 clamp(3rem,11vw,12rem)+0.15em 在 84vw 容器内 12 字宽超 2.6k 被 overflow:hidden 截断，末字 T/P 丢失 */
  font-size: clamp(2.4rem, 7.2vw, 7.8rem);
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 0.9;
  color: rgba(255, 255, 255, 0.075);
  text-transform: uppercase;
  margin-bottom: 5rem;
  /* 补偿 letter-spacing 在末字的额外空白，避免视觉截断；同时改 overflow 为 visible */
  padding-right: 0.06em;
  margin-right: -0.06em;
  white-space: nowrap;
  overflow: visible;
  width: 100%;
  max-width: 100%;
  user-select: none;
  will-change: transform;
  display: block;
}
.footer-huge-mark .char {
  display: inline-block;
  will-change: transform, opacity;
}
.footer-meta-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 4rem;
  border-top: 1px solid var(--border-wire);
  padding-top: 3rem;
}
.footer-desc {
  font-size: 0.85rem;
  color: var(--c-mist);
  line-height: 2;
  max-width: 480px;
  font-weight: 300;
}
.footer-col-title {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--c-text);
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
}
.footer-col-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 18px;
  height: 1px;
  background: var(--c-clay);
}
.footer-link-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.footer-link-list a {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--c-mist);
  text-decoration: none;
  letter-spacing: 0.1em;
  transition: color 0.3s, transform 0.3s;
  display: inline-block;
}
.footer-link-list a:hover {
  color: #fff;
  transform: translateX(4px);
}
.footer-colophon {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 6rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--c-ash);
  letter-spacing: 0.15em;
}

@media (max-width: 1024px) {
  .footer-meta-grid {
    grid-template-columns: 1fr;
  }
  .footer-huge-mark {
    font-size: clamp(2.2rem, 10vw, 6rem);
    letter-spacing: 0.05em;
    padding-right: 0.05em;
    margin-right: -0.05em;
  }
}
@media (max-width: 640px) {
  footer {
    padding: 6rem 5vw 3rem;
  }
  .footer-huge-mark {
    font-size: clamp(1.9rem, 9vw, 3.2rem);
    letter-spacing: 0.045em;
    padding-right: 0.045em;
    margin-right: -0.045em;
    margin-bottom: 3rem;
    color: rgba(255,255,255,0.09);
  }
}
</style>
