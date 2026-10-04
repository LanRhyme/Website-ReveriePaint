<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from '../composables/useGsap.js'

const isActive = ref(true)
const isRevealing = ref(false)
const progress = ref(0)

const canvasRef = ref(null)
const digitHundredRef = ref(null)
const digitTenRef = ref(null)
const digitUnitRef = ref(null)

const digitNums = [
  ref([0, 0]), // hundreds [f, p]
  ref([0, 0]), // tens [f, p]
  ref([0, 0])  // units [f, p]
]

let ctx = null
let width = 0
let height = 0
let dpr = 1
let animFrameId = null
let revealProgress = { val: 0 } // 0 = fully covered, 1 = fully open

function resizeCanvas() {
  if (!canvasRef.value) return
  width = window.innerWidth
  height = window.innerHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvasRef.value.width = width * dpr
  canvasRef.value.height = height * dpr
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
}

// Lusion 1:1 几何旋转视口切片画板渲染器
function drawAperture(ratio) {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  // ratio = 1 表示完全开启揭示（无任何遮罩）
  if (ratio >= 0.999) {
    return
  }

  ctx.save()
  // 1. 铺满墨黑/纯黑遮罩
  ctx.fillStyle = '#0c0e12'
  ctx.fillRect(0, 0, width, height)

  // 2. 如果开始揭示，在中心切割出旋转膨胀几何视口 (Destination-Out)
  if (ratio > 0.001) {
    const maxDim = Math.hypot(width, height) * 1.55
    const currentSize = ratio * maxDim
    const angle = (1 - ratio) * -0.42 // 随着展开旋转约 24 度

    ctx.translate(width * 0.5, height * 0.5)
    ctx.rotate(angle)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillRect(-currentSize * 0.5, -currentSize * 0.5, currentSize, currentSize)
  }

  ctx.restore()
}

// Lusion 1:1 机械滚轮数字算法 (三位双数字滚轮)
function updateDigits(t) {
  progress.value = Math.min(100, Math.round(t * 100))
  const els = [digitHundredRef.value, digitTenRef.value, digitUnitRef.value]

  for (let a = 0; a < 3; a++) {
    const el = els[a]
    if (!el) continue

    const c = t * 100 / Math.pow(10, 3 - a - 1)
    const u = c % 10
    const f = Math.floor(u)
    const p = Math.ceil(u) % 10
    const g = u - f

    digitNums[a].value = [f, p]
    el.style.transform = `translateY(${-g * 50}%) translateY(-0.05em)`
  }
}

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    isActive.value = false
    return
  }

  ctx = canvasRef.value.getContext('2d')
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas, { passive: true })

  // 初始全黑遮罩
  drawAperture(0)

  // 1. 模拟加载阶段（0% -> 100% 滚轮加速递增）
  const loaderObj = { t: 0 }
  const tl = gsap.timeline({
    onComplete() {
      // 达到 100% 时，触发 Lusion 标志性旋转几何开幕动效
      isRevealing.value = true

      // 旋转光圈从 0 放大至 1，以 expo.inOut 划开幕布
      gsap.to(revealProgress, {
        val: 1,
        duration: 1.15,
        ease: 'expo.inOut',
        onUpdate() {
          drawAperture(revealProgress.val)
        },
        onComplete() {
          isActive.value = false
        }
      })
    }
  })

  tl.to(loaderObj, {
    t: 1,
    duration: 1.35,
    ease: 'power2.inOut',
    onUpdate() {
      updateDigits(loaderObj.t)
    }
  })

  // 2. 页面内平滑路由转场（Lusion 几何闭合过渡）
  function handleLinkClick(e) {
    const target = e.target.closest('a')
    if (!target) return
    const href = target.getAttribute('href')
    if (!href) return

    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') || target.target === '_blank') {
      return
    }

    e.preventDefault()
    isActive.value = true
    isRevealing.value = false
    revealProgress.val = 1

    // 旋转闭合进入
    gsap.to(revealProgress, {
      val: 0,
      duration: 0.65,
      ease: 'expo.inOut',
      onUpdate() {
        drawAperture(revealProgress.val)
      },
      onComplete() {
        window.location.href = href
      }
    })
  }

  document.addEventListener('click', handleLinkClick)

  onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas)
    document.removeEventListener('click', handleLinkClick)
    tl.kill()
    if (animFrameId) cancelAnimationFrame(animFrameId)
  })
})
</script>

<template>
  <div v-if="isActive" class="lusion-preloader-root">
    <!-- Lusion 几何旋转开幕 Canvas -->
    <canvas ref="canvasRef" class="transition-canvas"></canvas>

    <!-- 屏幕正中心微型几何进度条 (达到 100% 前显示) -->
    <div v-if="!isRevealing" class="center-loader">
      <div class="center-loader-track">
        <div class="center-loader-fill" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>

    <!-- Lusion 1:1 左下角巨幕机械滚轮数字 (000 -> 100) -->
    <div
      id="preloader-percent-digits"
      :class="{ 'is-hiding': isRevealing }"
    >
      <!-- 百位 -->
      <div ref="digitHundredRef" class="preloader-percent-digit">
        <div class="preloader-percent-digit-num">{{ digitNums[0].value[0] }}</div>
        <div class="preloader-percent-digit-num">{{ digitNums[0].value[1] }}</div>
      </div>
      <!-- 十位 -->
      <div ref="digitTenRef" class="preloader-percent-digit">
        <div class="preloader-percent-digit-num">{{ digitNums[1].value[0] }}</div>
        <div class="preloader-percent-digit-num">{{ digitNums[1].value[1] }}</div>
      </div>
      <!-- 个位 -->
      <div ref="digitUnitRef" class="preloader-percent-digit">
        <div class="preloader-percent-digit-num">{{ digitNums[2].value[0] }}</div>
        <div class="preloader-percent-digit-num">{{ digitNums[2].value[1] }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lusion-preloader-root {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  pointer-events: all;
  overflow: hidden;
  user-select: none;
}

/* 几何开幕画布 */
.transition-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

/* 屏幕中心微型进度线 (Lusion 1:1) */
.center-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10000;
}

.center-loader-track {
  width: 72px;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  overflow: hidden;
}

.center-loader-fill {
  height: 100%;
  background: #ffffff;
  transition: width 0.05s linear;
}

/* Lusion 1:1 左下角巨幕机械滚轮数字 */
#preloader-percent-digits {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  font-family: var(--font-mono, monospace);
  font-size: clamp(7em, 12vw, 20em);
  height: 0.75em;
  line-height: 0.75em;
  color: #ffffff;
  overflow: hidden;
  pointer-events: none;
  z-index: 10000;
  letter-spacing: -0.04em;
  transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}

#preloader-percent-digits.is-hiding {
  opacity: 0;
  transform: translateY(30%);
}

.preloader-percent-digit {
  position: relative;
  float: left;
  width: 1ch;
  text-align: center;
  height: 100%;
  will-change: transform;
}

.preloader-percent-digit-num {
  height: 0.75em;
  line-height: 0.75em;
  text-align: center;
}
</style>
