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

// Lusion 原版平滑缓动：expoInOut
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

// ReveriePaint 现代瑞士几何大写「R」外轮廓 (顺时针)
function drawLetterROuter(u) {
  u.beginPath()
  u.moveTo(-2.1, -2.5)
  u.lineTo(0.7, -2.5)
  u.bezierCurveTo(1.6, -2.5, 2.1, -2.0, 2.1, -1.1)
  u.bezierCurveTo(2.1, -0.2, 1.6, 0.3, 0.7, 0.3)
  u.lineTo(0.5, 0.3)
  u.lineTo(2.0, 2.5)
  u.lineTo(0.8, 2.5)
  u.lineTo(-0.4, 0.3)
  u.lineTo(-1.1, 0.3)
  u.lineTo(-1.1, 2.5)
  u.lineTo(-2.1, 2.5)
  u.closePath()
}

// ReveriePaint 现代瑞士几何大写「R」上环镂空孔 (逆时针)
function drawLetterRCounter(u) {
  u.beginPath()
  u.moveTo(-1.1, -0.6)
  u.lineTo(0.6, -0.6)
  u.bezierCurveTo(1.0, -0.6, 1.2, -0.8, 1.2, -1.1)
  u.bezierCurveTo(1.2, -1.4, 1.0, -1.6, 0.6, -1.6)
  u.lineTo(-1.1, -1.6)
  u.closePath()
}

// 绘制完整带孔的白色字母 R
function drawCompleteLetterR(u, fillAlpha = 1, counterAlpha = 1) {
  u.save()
  u.beginPath()
  // 外轮廓
  u.moveTo(-2.1, -2.5)
  u.lineTo(0.7, -2.5)
  u.bezierCurveTo(1.6, -2.5, 2.1, -2.0, 2.1, -1.1)
  u.bezierCurveTo(2.1, -0.2, 1.6, 0.3, 0.7, 0.3)
  u.lineTo(0.5, 0.3)
  u.lineTo(2.0, 2.5)
  u.lineTo(0.8, 2.5)
  u.lineTo(-0.4, 0.3)
  u.lineTo(-1.1, 0.3)
  u.lineTo(-1.1, 2.5)
  u.lineTo(-2.1, 2.5)
  u.closePath()

  // 内部孔
  if (counterAlpha > 0.01) {
    u.moveTo(-1.1, -0.6)
    u.lineTo(0.6, -0.6)
    u.bezierCurveTo(1.0, -0.6, 1.2, -0.8, 1.2, -1.1)
    u.bezierCurveTo(1.2, -1.4, 1.0, -1.6, 0.6, -1.6)
    u.lineTo(-1.1, -1.6)
    u.closePath()
  }

  u.fillStyle = `rgba(245, 242, 236, ${fillAlpha})`
  u.fill()
  u.restore()
}

// 当 l 从 0 到 1 时，居中进度条由 [-2.5, -0.5, 5, 1] 机械展开为完整品牌字母 R
function drawMorphingBarToR(u, l) {
  const el = easeExpoInOut(l)

  // 1. 左半段 (主干)：从水平 [-2.5, -0.5, 3, 1] 旋转 90 度并拉伸为完整垂直主干 [-2.1, -2.5, 1, 5]
  u.save()
  const cx = -1.0 * (1 - el) + -1.6 * el
  const cy = 0
  const w = 3.0 * (1 - el) + 5.0 * el
  const h = 1.0
  const angle = el * (Math.PI * 0.5)
  u.translate(cx, cy)
  u.rotate(-angle)
  u.fillStyle = '#f5f2ec'
  u.fillRect(-w * 0.5, -h * 0.5, w, h)
  u.restore()

  // 2. 右半段 (环与斜腿)：从水平 [0.5, -0.5, 2, 1] 渐变展开为右侧上环与斜腿
  if (el < 0.98) {
    u.save()
    u.fillStyle = `rgba(245, 242, 236, ${Math.max(0, 1 - el * 2.2)})`
    u.fillRect(0.5, -0.5, 2 * (1 - el * 0.35), 1)
    u.restore()
  }

  if (el > 0.05) {
    const rScale = (el - 0.05) / 0.95
    u.save()
    u.translate(-1.1 * el, 0)
    u.scale(rScale, rScale)

    u.beginPath()
    u.moveTo(0, -2.5 * el)
    u.lineTo(0.7 * el, -2.5 * el)
    u.bezierCurveTo(1.6 * el, -2.5 * el, 2.1 * el, -2.0 * el, 2.1 * el, -1.1 * el)
    u.bezierCurveTo(2.1 * el, -0.2 * el, 1.6 * el, 0.3 * el, 0.7 * el, 0.3 * el)
    u.lineTo(0.5 * el, 0.3 * el)
    u.lineTo(2.0 * el, 2.5 * el)
    u.lineTo(0.8 * el, 2.5 * el)
    u.lineTo(-0.4 * el, 0.3 * el)
    u.lineTo(0, 0.3 * el)
    u.closePath()

    // 内部镂空孔
    u.moveTo(0, -0.6 * el)
    u.lineTo(0.6 * el, -0.6 * el)
    u.bezierCurveTo(1.0 * el, -0.6 * el, 1.2 * el, -0.8 * el, 1.2 * el, -1.1 * el)
    u.bezierCurveTo(1.2 * el, -1.4 * el, 1.0 * el, -1.6 * el, 0.6 * el, -1.6 * el)
    u.lineTo(0, -1.6 * el)
    u.closePath()

    u.fillStyle = `rgba(245, 242, 236, ${Math.min(1, el * 1.5)})`
    u.fill()
    u.restore()
  }
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

  const f = easeExpoInOut(Math.max(0, Math.min(1, 1 - activeRatio)))
  const p = (1 + f * c) * n

  // 1. 底层深色墨黑遮罩 (Morandi Deep Obsidian #0c0e12)
  // 当 f 接近 1 时柔和淡出，确保绝无任何残余黑边或视口死角
  const overlayAlpha = Math.max(0, 1 - f * 1.15)
  u.fillStyle = `rgba(12, 14, 18, ${overlayAlpha})`
  u.fillRect(0, 0, t, r)

  // 2. 矩阵：居中、旋转、斜移与倍率缩放 (Lusion 原版矩阵动力学)
  u.translate(t * 0.5, r * 0.5)
  u.rotate(f * (contentShowRatio === 0 ? -0.38 : 0.38))
  u.translate(n * f * c * 0.15, -n * 0.08 * f * c)
  u.scale(p, p)

  if (l === 0) {
    // 居中加载条 (前置 loading 阶段)
    u.fillStyle = 'rgba(255, 255, 255, 0.18)'
    u.fillRect(-2.5, -0.5, 5, 1)
    u.fillStyle = '#f5f2ec'
    u.fillRect(-2.5, -0.5, 5 * a, 1)
  } else if (l < 1) {
    // 达到 100% 时：加载条由水平激光条机械变形展开为品牌字母「R」
    drawMorphingBarToR(u, l)
  } else {
    // 字母「R」已完整形成：执行 Lusion 标志性透镜开幕
    // (1) 使用 destination-out 镂空出以 R 为轮廓的扩张视口，直视底层网页
    u.save()
    u.globalCompositeOperation = 'destination-out'
    drawLetterROuter(u)
    u.fill()

    // 内部孔：在 f 极小 (未开始扩张) 时保留遮罩，随着 f > 0 迅速融入主视口，避免黑岛残留
    const counterAlpha = Math.max(0, 1 - f * 3.5)
    if (counterAlpha > 0.01) {
      u.globalCompositeOperation = 'source-over'
      u.fillStyle = `rgba(12, 14, 18, ${counterAlpha * overlayAlpha})`
      drawLetterRCounter(u)
      u.fill()
    }
    u.restore()

    // (2) 白色实体字符：在 f 展开初期 (f < 0.25) 随透镜深度渐隐，使开门感如光晕般自然
    if (f < 0.8) {
      const whiteAlpha = Math.max(0, 1 - f * 2.2)
      if (whiteAlpha > 0.01) {
        u.save()
        u.globalCompositeOperation = 'source-over'
        drawCompleteLetterR(u, whiteAlpha, counterAlpha)
        u.restore()
      }
    }
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
    // 路由切入：不重复播放 0-100% 滚轮，直接执行 380ms 快速开门转场
    isPreloaderActive.value = false
    const duration = 380
    const startTime = performance.now()

    function revealStep(now) {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
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
    // 首次进入 / 页面刷新：执行完整的 Lusion 机械滚轮预加载 + 几何展开开幕
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
        // 递增加载速度 (约 0.95s 走完 100%)
        t = Math.min(1, t + dt * 1.05)
      } else if (lineTransform < 1) {
        // 达到 100% 后，几何线在 0.32s 内优雅机械展开为字母「R」
        lineTransform = Math.min(1, lineTransform + dt * 3.2)
      } else if (showRatio < 1) {
        // 开幕光圈在 0.58s 内以 expoInOut 放大扫出整屏
        showRatio = Math.min(1, showRatio + dt * 1.72)
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

  // 站内页面点击拦截：触发快速几何收缩转场
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

    let closeProgress = 0
    const closeDuration = 320 // 毫秒
    const closeStartTime = performance.now()

    if (canvasRef.value) canvasRef.value.style.display = 'block'

    function closeStep(now) {
      const elapsed = now - closeStartTime
      closeProgress = Math.min(1, elapsed / closeDuration)

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
  background-color: #0c0e12;
  pointer-events: none;
  overflow: hidden;
}

#preloader-percent-digits {
  position: absolute;
  justify-content: center;
  bottom: 0;
  left: 0;
  font-size: clamp(7em, 12vw, 20em);
  height: 0.75em;
  line-height: 0.75em;
  color: #f5f2ec;
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
