<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from '../composables/useGsap.js'
import { useSound } from '../composables/useSound.js'

const { playTone, playTransition } = useSound()

const isVisible = ref(true)
const preloaderRef = ref(null)
const transitionOverlayRef = ref(null)

// 机械滚轮 0-100 对应各数位偏移量
const hundredsPos = ref(0) // 0 或 1
const tensPos = ref(0)     // 0 ~ 9
const unitsPos = ref(0)    // 0 ~ 9
const progressVal = ref(0) // 0 ~ 100

let tl = null

function updateOdometer(val) {
  const rounded = Math.min(100, Math.max(0, Math.round(val)))
  progressVal.value = rounded

  const h = Math.floor(rounded / 100)
  const t = Math.floor((rounded % 100) / 10)
  const u = rounded % 10

  hundredsPos.value = h
  tensPos.value = t
  unitsPos.value = u
}

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    isVisible.value = false
    window.dispatchEvent(new CustomEvent('lusion-ready'))
    return
  }

  // 1. 初始化进入动画：数字从 0 机械滚轮加速转动至 100
  const progressObj = { value: 0 }

  tl = gsap.timeline({
    onComplete() {
      playTransition()
      // 达到 100% 后停顿 120ms，随后纯黑幕布向上滑出揭示整页
      gsap.to(preloaderRef.value, {
        yPercent: -100,
        duration: 1.1,
        ease: 'power4.inOut',
        onStart() {
          // 提前 350ms 唤醒页面主角元素入场
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('lusion-ready'))
          }, 350)
        },
        onComplete() {
          isVisible.value = false
        }
      })
    }
  })

  // 机械滚轮非线性数字变化（带有前紧中快后缓的真实感）
  tl.to(progressObj, {
    value: 100,
    duration: 1.55,
    ease: 'power2.inOut',
    onUpdate() {
      updateOdometer(progressObj.value)
    }
  })

  // 2. 页面内全站无感过渡转场拦截器（Lusion Page Transition）
  function handleLinkClick(e) {
    const target = e.target.closest('a')
    if (!target) return
    const href = target.getAttribute('href')
    if (!href) return

    // 排除外部链接、锚点跳转、新窗口
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') || target.target === '_blank') {
      return
    }

    // 内部页面跳转（如 /download/ 或 /）
    e.preventDefault()
    playTransition()

    if (transitionOverlayRef.value) {
      gsap.set(transitionOverlayRef.value, { display: 'block', yPercent: 100 })
      gsap.to(transitionOverlayRef.value, {
        yPercent: 0,
        duration: 0.65,
        ease: 'power4.inOut',
        onComplete() {
          window.location.href = href
        }
      })
    } else {
      window.location.href = href
    }
  }

  document.addEventListener('click', handleLinkClick)

  onUnmounted(() => {
    document.removeEventListener('click', handleLinkClick)
    tl?.kill()
  })
})
</script>

<template>
  <!-- 页面跳转动态黑幕遮罩 -->
  <div id="transition-overlay" ref="transitionOverlayRef"></div>

  <!-- Lusion 1:1 风格前置加载器与巨幕机械滚轮 -->
  <div v-if="isVisible" id="preloader" ref="preloaderRef">
    <!-- 顶部状态栏 -->
    <div class="preloader-meta-top">
      <div class="meta-item">
        <span class="meta-pulse"></span>
        <span class="meta-text">REVERIE PAINT // NEXT-GEN GRAPHICS CORE</span>
      </div>
      <div class="meta-item meta-arch">
        <span>ARCH: KRITA C++ / MULTI-THREADED RASTER</span>
      </div>
    </div>

    <!-- 屏幕中心微光进度指示器 -->
    <div class="preloader-center-indicator">
      <div class="indicator-inner">
        <span class="indicator-label">INITIALIZING WORKSPACE</span>
        <div class="indicator-track">
          <div class="indicator-fill" :style="{ width: `${progressVal}%` }"></div>
        </div>
      </div>
    </div>

    <!-- 底部巨幕滚轮计数器 (Lusion 1:1 Odometer) -->
    <div id="preloader-percent-digits">
      <!-- 百位 -->
      <div class="preloader-percent-digit">
        <div
          class="preloader-digit-strip"
          :style="{ transform: `translateY(-${hundredsPos * 10}%)` }"
        >
          <div v-for="n in 10" :key="n-1" class="preloader-percent-digit-num">
            {{ n - 1 }}
          </div>
        </div>
      </div>

      <!-- 十位 -->
      <div class="preloader-percent-digit">
        <div
          class="preloader-digit-strip"
          :style="{ transform: `translateY(-${tensPos * 10}%)` }"
        >
          <div v-for="n in 10" :key="n-1" class="preloader-percent-digit-num">
            {{ n - 1 }}
          </div>
        </div>
      </div>

      <!-- 个位 -->
      <div class="preloader-percent-digit">
        <div
          class="preloader-digit-strip"
          :style="{ transform: `translateY(-${unitsPos * 10}%)` }"
        >
          <div v-for="n in 10" :key="n-1" class="preloader-percent-digit-num">
            {{ n - 1 }}
          </div>
        </div>
      </div>

      <!-- 百分号标志 -->
      <div class="preloader-percent-symbol">%</div>
    </div>

    <!-- 右下角技术规格参数 -->
    <div class="preloader-meta-bottom">
      <div class="meta-row">
        <span class="meta-cross">+</span>
        <span>240+ OFFICIAL BRUSHES</span>
      </div>
      <div class="meta-row">
        <span class="meta-cross">+</span>
        <span>SPARSE TILE MEMORY ENGINE</span>
      </div>
      <div class="meta-row">
        <span class="meta-cross">+</span>
        <span>SUB-PIXEL STYLUS SAMPLING</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 页面转场遮罩 */
#transition-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9998;
  background-color: #000000;
  display: none;
  pointer-events: none;
  will-change: transform;
}

/* Lusion 原版 Preloader 容器 */
#preloader {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: #000000;
  color: #ffffff;
  overflow: hidden;
  user-select: none;
  pointer-events: all;
  will-change: transform;
}

/* 顶部状态栏 */
.preloader-meta-top {
  position: absolute;
  top: clamp(1.5rem, 4vw, 3rem);
  left: clamp(1.5rem, 4vw, 4rem);
  right: clamp(1.5rem, 4vw, 4rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: clamp(0.7rem, 0.85vw, 0.825rem);
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meta-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #5b7fc7;
  box-shadow: 0 0 10px #5b7fc7;
  animation: pulse 1.4s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% { opacity: 0.4; transform: scale(0.85); }
  100% { opacity: 1; transform: scale(1.15); }
}

@media (max-width: 768px) {
  .meta-arch {
    display: none;
  }
}

/* 屏幕中心微光进度指示器 */
.preloader-center-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.indicator-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.indicator-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.22em;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

.indicator-track {
  width: 140px;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
}

.indicator-fill {
  height: 100%;
  background: #ffffff;
  transition: width 0.08s linear;
}

/* 底部巨幕机械滚轮数字 (Lusion 1:1) */
#preloader-percent-digits {
  position: absolute;
  bottom: clamp(1.5rem, 4vw, 3.5rem);
  left: clamp(1.5rem, 4vw, 4rem);
  display: flex;
  align-items: baseline;
  font-family: var(--font-mono);
  font-size: clamp(6.5rem, 16vw, 20rem);
  font-weight: 700;
  height: 0.75em;
  line-height: 0.75em;
  letter-spacing: -0.04em;
  color: #ffffff;
  overflow: hidden;
  user-select: none;
}

.preloader-percent-digit {
  position: relative;
  width: 1ch;
  height: 100%;
  text-align: center;
  overflow: hidden;
}

.preloader-digit-strip {
  display: flex;
  flex-direction: column;
  transition: transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
}

.preloader-percent-digit-num {
  height: 0.75em;
  line-height: 0.75em;
  text-align: center;
}

.preloader-percent-symbol {
  font-size: 0.35em;
  line-height: 1;
  color: rgba(255, 255, 255, 0.35);
  margin-left: 0.15ch;
  font-weight: 400;
  transform: translateY(-0.15em);
}

/* 右下角技术规格参数 */
.preloader-meta-bottom {
  position: absolute;
  bottom: clamp(1.5rem, 4vw, 3.5rem);
  right: clamp(1.5rem, 4vw, 4rem);
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: clamp(0.6875rem, 0.8vw, 0.75rem);
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.4);
  text-align: right;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.meta-cross {
  color: rgba(255, 255, 255, 0.2);
  font-size: 10px;
}

@media (max-width: 768px) {
  .preloader-meta-bottom {
    display: none;
  }
}
</style>
