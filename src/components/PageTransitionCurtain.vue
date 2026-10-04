<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isPreloaderActive = ref(false)
const canvasRef = ref(null)

const digitHundredRef = ref(null)
const digitTenRef = ref(null)
const digitUnitRef = ref(null)

let ctx = null
let width = 0
let height = 0
let dpr = 1
let animFrameId = null

// Lusion 原版 Ease: expoInOut
function easeExpoInOut(t) {
  if (t === 0) return 0
  if (t === 1) return 1
  if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2
  return (2 - Math.pow(2, -20 * t + 10)) / 2
}

function resize() {
  if (!canvasRef.value) return
  width = window.innerWidth
  height = window.innerHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvasRef.value.width = width * dpr
  canvasRef.value.height = height * dpr
}

// Lusion 1:1 TransitionOverlay Canvas 渲染核心
function renderTransitionOverlay(state) {
  if (!ctx || !canvasRef.value) return

  const { activeRatio, loadBarRatio, lineTransformRatio, contentShowRatio } = state

  if (activeRatio <= 0.001) {
    canvasRef.value.style.display = 'none'
    return
  }
  canvasRef.value.style.display = 'block'

  const t = width + 2
  const r = height + 2
  const n = Math.min(42, Math.floor(width / 30))
  const a = loadBarRatio
  const l = lineTransformRatio
  const c = Math.sqrt(t * t + r * r) / n
  const u = ctx

  u.save()
  u.scale(dpr, dpr)
  u.clearRect(0, 0, t, r)

  // 1. 底层全黑遮罩
  u.fillStyle = '#000000'
  u.fillRect(0, 0, t, r)

  const f = easeExpoInOut(Math.max(0, Math.min(1, 1 - activeRatio)))
  const p = (1 + f * c) * n

  // 2. Lusion 原版矩阵：旋转、斜移与倍率缩放
  u.translate(t * 0.5, r * 0.5)
  u.rotate(f * (contentShowRatio === 0 ? -1 : 1))
  u.translate(n * f * c, -n * 0.5 * f * c)
  u.scale(p, p)

  if (l === 0) {
    // 居中加载条 (前置 loading 阶段)
    u.fillStyle = '#333333'
    u.fillRect(-2.5, -0.5, 5, 1)
    u.fillStyle = '#ffffff'
    u.fillRect(-2.5, -0.5, 5 * a, 1)
  } else {
    // 达成 100% 时：加载条变形并旋转 90 度，通过 XOR 模式镂空视窗揭示下层内容
    u.translate(-l, 1.5 * l)

    u.save()
    u.translate(0.5, -0.5)
    u.rotate(l * Math.PI * 0.5)
    u.globalCompositeOperation = 'xor'
    u.fillStyle = '#ffffff'
    u.fillRect(-3, 0, 3, 1)
    u.globalCompositeOperation = 'source-over'
    u.globalAlpha = Math.max(0, 1 - f)
    u.fillRect(-3, 0, 3, 1)
    u.restore()

    u.save()
    u.translate(0.5, -0.5)
    u.globalCompositeOperation = 'xor'
    u.fillStyle = '#ffffff'
    u.fillRect(0, 0, 2, 1)
    u.globalCompositeOperation = 'source-over'
    u.globalAlpha = Math.max(0, 1 - f)
    u.fillRect(0, 0, 2, 1)
    u.restore()
  }

  u.restore()
}

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return

  ctx = canvasRef.value?.getContext('2d')
  resize()
  window.addEventListener('resize', resize, { passive: true })

  // 检查是否是从站内其它页面路由切入过来的
  const isRouteTransitionIn = sessionStorage.getItem('rp_page_trans') === '1'
  if (isRouteTransitionIn) {
    sessionStorage.removeItem('rp_page_trans')
    // 路由切入：不重复播放 0-100% 滚轮，直接执行 Lusion 几何旋转开门转场
    isPreloaderActive.value = false
    let startProgress = 0
    const duration = 550 // 毫秒
    const startTime = performance.now()

    function revealStep(now) {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      // activeRatio: 1 -> 0 (从完全遮罩旋发展开到完全透明)
      const activeRatio = 1 - progress
      renderTransitionOverlay({
        activeRatio,
        loadBarRatio: 1,
        lineTransformRatio: 1,
        contentShowRatio: 1
      })
      if (progress < 1) {
        animFrameId = requestAnimationFrame(revealStep)
      } else {
        if (canvasRef.value) canvasRef.value.style.display = 'none'
      }
    }
    animFrameId = requestAnimationFrame(revealStep)
  } else {
    // 首次进入 / 页面刷新：执行完整的 Lusion 机械滚轮预加载 + 几何开幕转场
    isPreloaderActive.value = true

    let t = 0 // 进度 0 ~ 1
    let lineTransform = 0
    let showRatio = 0
    let lastTime = performance.now()

    const domDigits = [
      { el: digitHundredRef.value, easedVal: 0 },
      { el: digitTenRef.value, easedVal: 0 },
      { el: digitUnitRef.value, easedVal: 0 }
    ]

    function loop(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now

      if (t < 1) {
        // 递增加载速度 (约 0.85s 走完 100%)
        t = Math.min(1, t + dt * 1.15)
      } else if (lineTransform < 1) {
        // 达到 100% 后，几何线在 0.22s 内旋转 90 度
        lineTransform = Math.min(1, lineTransform + dt * 4.5)
      } else if (showRatio < 1) {
        // 开幕光圈在 0.55s 内以 expoInOut 放大扫出整屏
        showRatio = Math.min(1, showRatio + dt * 1.8)
      }

      // Lusion 1:1 滚轮双数字步进与平滑插值
      for (let a = 0; a < 3; a++) {
        const item = domDigits[a]
        if (!item.el) continue

        const c = Math.floor((t * 100) / Math.pow(10, 3 - a - 1))
        item.easedVal += (c - item.easedVal) * (1 - Math.exp(-12 * dt))
        if (Math.abs(c - item.easedVal) < 0.01) item.easedVal = c

        const u = item.easedVal % 10
        const f = Math.floor(u)
        const p = (f + 1) % 10
        const g = u - f

        const nums = item.el.querySelectorAll('.preloader-percent-digit-num')
        if (nums.length >= 2) {
          nums[0].textContent = f
          nums[1].textContent = p
        }

        const exitShift = easeExpoInOut(Math.max(0, Math.min(1, showRatio * 1.2 - (0.2 * a) / 2)))
        item.el.style.transform = `translateY(${-(g - exitShift) * 50}%) translateY(-0.05em)`
      }

      const activeRatio = 1 - showRatio
      renderTransitionOverlay({
        activeRatio,
        loadBarRatio: t,
        lineTransformRatio: lineTransform,
        contentShowRatio: showRatio
      })

      if (showRatio < 1) {
        animFrameId = requestAnimationFrame(loop)
      } else {
        isPreloaderActive.value = false
        if (canvasRef.value) canvasRef.value.style.display = 'none'
      }
    }

    animFrameId = requestAnimationFrame(loop)
  }

  // 站内页面点击拦截：触发 Lusion 几何旋转闭合转场
  function handleLinkClick(e) {
    const target = e.target.closest('a')
    if (!target) return
    const href = target.getAttribute('href')
    if (!href) return

    // 排除外部链接、锚点跳转
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') || target.target === '_blank') {
      return
    }

    e.preventDefault()

    // 旋转闭合进入
    let closeProgress = 0
    const closeDuration = 450 // 毫秒
    const closeStartTime = performance.now()

    if (canvasRef.value) canvasRef.value.style.display = 'block'

    function closeStep(now) {
      const elapsed = now - closeStartTime
      closeProgress = Math.min(1, elapsed / closeDuration)

      // activeRatio 从 0 -> 1 (旋转几何收缩闭合)
      const activeRatio = closeProgress
      renderTransitionOverlay({
        activeRatio,
        loadBarRatio: 1,
        lineTransformRatio: 1,
        contentShowRatio: 0
      })

      if (closeProgress < 1) {
        requestAnimationFrame(closeStep)
      } else {
        sessionStorage.setItem('rp_page_trans', '1')
        window.location.href = href
      }
    }

    requestAnimationFrame(closeStep)
  }

  document.addEventListener('click', handleLinkClick)

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    document.removeEventListener('click', handleLinkClick)
    if (animFrameId) cancelAnimationFrame(animFrameId)
  })
})
</script>

<template>
  <!-- Lusion 1:1 Canvas 几何旋转开幕/转场画布 -->
  <canvas id="transition-overlay" ref="canvasRef"></canvas>

  <!-- Lusion 1:1 首次加载器与左下角机械滚轮数字 -->
  <div v-show="isPreloaderActive" id="preloader">
    <div id="preloader-percent-digits">
      <div ref="digitHundredRef" class="preloader-percent-digit">
        <div class="preloader-percent-digit-num">0</div>
        <div class="preloader-percent-digit-num">0</div>
      </div>
      <div ref="digitTenRef" class="preloader-percent-digit">
        <div class="preloader-percent-digit-num">0</div>
        <div class="preloader-percent-digit-num">0</div>
      </div>
      <div ref="digitUnitRef" class="preloader-percent-digit">
        <div class="preloader-percent-digit-num">0</div>
        <div class="preloader-percent-digit-num">0</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Lusion 1:1 CSS 规则还原 */
#transition-overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  pointer-events: none;
  display: block;
}

#preloader {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9998;
  background-color: #000000;
  pointer-events: none;
  overflow: hidden;
}

#preloader-percent-digits {
  position: absolute;
  justify-content: center;
  bottom: 0;
  left: 0;
  font-size: clamp(7em, 9vw, 20em);
  height: 0.75em;
  line-height: 0.75em;
  color: #ffffff;
  overflow: hidden;
  font-family: var(--font-mono, monospace);
  font-weight: 700;
  letter-spacing: -0.04em;
  user-select: none;
  display: flex;
}

.preloader-percent-digit {
  position: relative;
  float: left;
  width: 1ch;
  text-align: center;
  transform: translateY(-0.05em);
  will-change: transform;
}

.preloader-percent-digit-num {
  height: 0.75em;
  line-height: 0.75em;
  text-align: center;
}
</style>
