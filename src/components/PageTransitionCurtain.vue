<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from '../composables/useGsap.js'

const isVisible = ref(true)
const percent = ref(0)
const preloaderRef = ref(null)
const curtainRef = ref(null)
const numberRef = ref(null)
const brandRef = ref(null)

onMounted(() => {
  // 如果用户开启了减少动效，或者极速加载完成
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    isVisible.value = false
    return
  }

  // 1. 数字累加动效 (0% -> 100%)
  const counter = { val: 0 }
  const tl = gsap.timeline({
    onComplete() {
      // 动画完成后完全从 DOM 移除
      setTimeout(() => {
        isVisible.value = false
      }, 300)
    }
  })

  tl.to(counter, {
    val: 100,
    duration: 1.25,
    ease: 'power2.inOut',
    onUpdate() {
      percent.value = Math.round(counter.val)
    }
  })

  // 2. 文字收缩与数字淡出
  tl.to([brandRef.value, numberRef.value], {
    opacity: 0,
    y: -24,
    duration: 0.45,
    ease: 'power3.in'
  }, '-=0.2')

  // 3. 幕布垂直拉升揭示整页内容 (Lusion Curtain Reveal)
  tl.to(curtainRef.value, {
    yPercent: -100,
    duration: 0.95,
    ease: 'power4.inOut'
  }, '-=0.1')
})
</script>

<template>
  <div v-if="isVisible" ref="preloaderRef" class="lusion-preloader">
    <div ref="curtainRef" class="curtain-panel">
      <div class="preloader-content">
        <div ref="brandRef" class="preloader-brand">
          <svg viewBox="0 0 22 22" width="32" height="32" aria-hidden="true">
            <rect x="1" y="1" width="20" height="20" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.3" />
            <path d="M6.4 15.6 L11 6.4 L15.6 15.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="11" cy="13" r="1.5" fill="currentColor" />
          </svg>
          <span class="brand-title">ReveriePaint</span>
        </div>

        <div class="progress-wrap">
          <div class="progress-bar-track">
            <div class="progress-bar-fill" :style="{ width: `${percent}%` }"></div>
          </div>
          <div ref="numberRef" class="progress-number">
            <span>{{ percent }}</span><span class="symbol">%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lusion-preloader {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  pointer-events: all;
  overflow: hidden;
}

.curtain-panel {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #14161a; /* 极客莫兰迪墨黑 */
  color: #f5f2ec;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
}

.preloader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
  width: 90%;
  max-width: 420px;
}

.preloader-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  will-change: transform, opacity;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  font-family: var(--font-sans);
}

.progress-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.progress-bar-track {
  width: 100%;
  height: 2px;
  background: rgba(245, 242, 236, 0.12);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #f5f2ec;
  transition: width 0.05s linear;
}

.progress-number {
  font-family: var(--font-mono);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 400;
  letter-spacing: -0.04em;
  font-feature-settings: "tnum";
  line-height: 1;
  display: flex;
  align-items: baseline;
  will-change: transform, opacity;
}

.progress-number .symbol {
  font-size: 1.1rem;
  margin-left: 4px;
  opacity: 0.65;
}
</style>
