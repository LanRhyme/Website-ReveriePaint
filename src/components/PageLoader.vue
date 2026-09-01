<script setup>
import { ref, onMounted } from 'vue'
import anime from 'animejs'

const visible = ref(true)
const isFading = ref(false)
const emit = defineEmits(['done'])

function finish() {
  if (isFading.value) return
  isFading.value = true
  anime({
    targets: '.loader-screen',
    opacity: 0,
    duration: 700,
    easing: 'easeInOutQuad',
    complete: () => {
      visible.value = false
      emit('done')
      // 确保 Lenis 重新计算
      window.__lenis?.resize?.()
    }
  })
  // 立刻让出点击权，修复“导航点不了”
  const el = document.querySelector('.loader-screen')
  if (el) el.style.pointerEvents = 'none'
}

function skip() {
  // 点击/按键跳过
  finish()
}

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    visible.value = false
    emit('done')
    return
  }

  const tl = anime.timeline({
    easing: 'easeOutExpo',
    complete: () => finish()
  })

  tl.add({
    targets: '.loader-diamond',
    scale: [0, 1],
    rotate: ['45deg', '45deg'],
    opacity: [0, 1],
    duration: 700,
    easing: 'easeOutExpo'
  })
    .add({
      targets: '.loader-brand span',
      translateY: ['100%', '0%'],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(45),
      easing: 'easeOutExpo'
    }, '-=400')
    .add({
      targets: '.loader-line',
      scaleX: [0, 1],
      duration: 600,
      easing: 'easeInOutQuad'
    }, '-=600')
    .add({
      targets: '.loader-meta',
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 500,
      easing: 'easeOutQuad'
    }, '-=300')
    .add({
      targets: '.loader-line-inner',
      translateX: ['-100%', '0%'],
      duration: 800,
      easing: 'easeInOutExpo'
    }, '-=700')

  // 2.8s 后允许点击跳过，避免长时阻断导航
  setTimeout(() => {
    const el = document.querySelector('.loader-screen')
    if (el) el.addEventListener('click', skip, { once: true })
    window.addEventListener('keydown', skip, { once: true })
  }, 400)

  // 安全兜底：4.5s 未完成则强制结束，防止“永远盖住”
  setTimeout(() => { if (visible.value) finish() }, 4500)
})
</script>

<template>
  <div v-if="visible" class="loader-screen" :class="{ fading: isFading }" aria-hidden="true" @click="skip">
    <div class="loader-inner">
      <div class="loader-top">
        <div class="loader-diamond"></div>
        <div class="loader-brand">
          <span>R</span><span>e</span><span>v</span><span>e</span><span>r</span><span>i</span><span>e</span><span>P</span><span>a</span><span>i</span><span>n</span><span>t</span>
        </div>
      </div>
      <div class="loader-line">
        <div class="loader-line-inner"></div>
      </div>
      <div class="loader-meta">
        <span>KRITA CORE · ANDROID ARMv8-A</span>
        <span>LOADING CANVAS 2026</span>
      </div>
      <div class="loader-skip">点击跳过 · TAP TO SKIP</div>
    </div>
    <div class="loader-bg-grid"></div>
  </div>
</template>

<style scoped>
.loader-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #0b0c0e;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}
.loader-screen.fading {
  pointer-events: none;
}
.loader-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 80px 80px;
  opacity: 0.5;
  pointer-events: none;
}
.loader-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
}
.loader-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}
.loader-diamond {
  width: 14px;
  height: 14px;
  border: 1px solid #fff;
  transform: rotate(45deg);
  background: transparent;
}
.loader-brand {
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: 0.42em;
  text-transform: uppercase;
  color: #fff;
  display: flex;
  overflow: hidden;
  padding-left: 0.42em;
}
.loader-brand span {
  display: inline-block;
}
.loader-line {
  width: 220px;
  height: 1px;
  background: rgba(255,255,255,0.12);
  overflow: hidden;
  transform-origin: left;
}
.loader-line-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--c-clay), var(--c-sand));
}
.loader-meta {
  display: flex;
  gap: 2rem;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  color: var(--c-mist);
}
.loader-skip {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.35);
  margin-top: 0.6rem;
  text-transform: uppercase;
}

@media (max-width: 640px) {
  .loader-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}
</style>
