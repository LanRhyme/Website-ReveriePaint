<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import anime from 'animejs'

const progress = ref(0)
let ticking = false

function update() {
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  const scrolled = max > 0 ? (h.scrollTop / max) * 100 : 0
  progress.value = isNaN(scrolled) ? 0 : Math.min(100, Math.max(0, scrolled))
  ticking = false
}

function onScroll() {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(update)
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('lenis:scroll', onScroll, { passive: true })
  // lenis 会在 raf 中触发，此时 scrollTop 仍在 lerping，需要高频更新
  let raf = 0
  const loop = () => {
    if (window.__lenis) update()
    raf = requestAnimationFrame(loop)
  }
  // 仅在 lenis 存在时启动轻量轮询，避免移动端空转
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    raf = requestAnimationFrame(loop)
  }
  window.__progressLoop = raf
  update()
  anime({
    targets: '.scroll-progress',
    scaleX: [0, 1],
    duration: 1200,
    easing: 'easeOutExpo',
    delay: 1400
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('lenis:scroll', onScroll)
  if (window.__progressLoop) cancelAnimationFrame(window.__progressLoop)
})
</script>

<template>
  <div class="scroll-progress" :style="{ transform: `scaleX(${progress / 100})` }" aria-hidden="true"></div>
</template>

<style scoped>
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, var(--c-clay), var(--c-sand), var(--c-slate));
  transform-origin: left;
  z-index: 102;
  pointer-events: none;
  will-change: transform;
}
</style>
