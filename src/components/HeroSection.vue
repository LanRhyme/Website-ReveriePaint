<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap, ScrollTrigger } from '../composables/useGsap.js'
import heroCanvas from '../assets/shots/hero-canvas.webp'
import heroCanvasSm from '../assets/shots/hero-canvas-sm.webp'

const ready = ref(false)
const heroRef = ref(null)
const deviceRef = ref(null)
const shineRef = ref(null)
const washRef = ref(null)
const canvasRef = ref(null)
const hasStrokes = ref(false)

const brushCount = ref(0)
const blendCount = ref(0)
const filterCount = ref(0)

let deviceQuickToX = null
let deviceQuickToY = null
let drawingCtx = null
let isDrawing = false
let lastPoint = null
let dpr = 1
let scrollCtx = null

function initCanvas() {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return
  dpr = window.devicePixelRatio || 1
  canvas.width = Math.round(rect.width * dpr)
  canvas.height = Math.round(rect.height * dpr)
  drawingCtx = canvas.getContext('2d')
  drawingCtx.scale(dpr, dpr)
  drawingCtx.lineCap = 'round'
  drawingCtx.lineJoin = 'round'
  drawingCtx.strokeStyle = 'rgba(28, 32, 38, 0.88)'
}

function getCanvasPos(e) {
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    pressure: e.pressure || 0,
    time: Date.now()
  }
}

function startDraw(e) {
  if (!canvasRef.value || !drawingCtx) return
  canvasRef.value.setPointerCapture?.(e.pointerId)
  isDrawing = true
  hasStrokes.value = true
  lastPoint = getCanvasPos(e)

  if (navigator?.vibrate) {
    navigator.vibrate(6)
  }

  const radius = lastPoint.pressure > 0 ? 1.5 + lastPoint.pressure * 5 : 2.8
  drawingCtx.beginPath()
  drawingCtx.arc(lastPoint.x, lastPoint.y, radius, 0, Math.PI * 2)
  drawingCtx.fillStyle = 'rgba(28, 32, 38, 0.88)'
  drawingCtx.fill()
}

function drawStroke(e) {
  if (!isDrawing || !lastPoint || !drawingCtx) return
  const current = getCanvasPos(e)
  const dist = Math.hypot(current.x - lastPoint.x, current.y - lastPoint.y)
  if (dist < 1.5) return

  const dt = Math.max(1, current.time - lastPoint.time)
  const speed = dist / dt

  let lineWidth = 3
  if (current.pressure > 0) {
    lineWidth = 1.8 + current.pressure * 12
  } else {
    lineWidth = Math.max(1.6, Math.min(8.5, 7.5 - speed * 1.8))
  }

  drawingCtx.beginPath()
  drawingCtx.lineWidth = lineWidth
  drawingCtx.moveTo(lastPoint.x, lastPoint.y)
  const midX = (lastPoint.x + current.x) / 2
  const midY = (lastPoint.y + current.y) / 2
  drawingCtx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY)
  drawingCtx.stroke()

  lastPoint = current
}

function endDraw(e) {
  if (!isDrawing) return
  isDrawing = false
  lastPoint = null
  if (canvasRef.value?.hasPointerCapture?.(e.pointerId)) {
    canvasRef.value.releasePointerCapture(e.pointerId)
  }
}

function clearCanvas() {
  if (!canvasRef.value || !drawingCtx) return
  const canvas = canvasRef.value
  drawingCtx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
  hasStrokes.value = false
}

function onHeroMouseMove(e) {
  if (!deviceRef.value || !heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5

  if (deviceQuickToX && deviceQuickToY) {
    deviceQuickToX(x * 10)
    deviceQuickToY(-y * 10)
  }

  if (shineRef.value) {
    const shineX = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const shineY = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    shineRef.value.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.18) 0%, transparent 62%)`
  }
}

function onHeroMouseLeave() {
  if (deviceQuickToX && deviceQuickToY) {
    deviceQuickToX(0)
    deviceQuickToY(0)
  }
  if (shineRef.value) {
    shineRef.value.style.background = 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 62%)'
  }
}

function onOrientation(e) {
  if (e.gamma == null || e.beta == null) return
  const tiltY = Math.max(-10, Math.min(10, e.gamma * 0.35))
  const tiltX = Math.max(-10, Math.min(10, (e.beta - 45) * 0.35))
  if (deviceQuickToX && deviceQuickToY) {
    deviceQuickToX(tiltY)
    deviceQuickToY(-tiltX)
  }
  if (shineRef.value) {
    const shineX = Math.round(50 + tiltY * 3.5)
    const shineY = Math.round(50 + tiltX * 3.5)
    shineRef.value.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.16) 0%, transparent 62%)`
  }
}

function onBtnMouseMove(e) {
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const dx = e.clientX - rect.left - rect.width / 2
  const dy = e.clientY - rect.top - rect.height / 2
  gsap.to(btn, { x: dx * 0.22, y: dy * 0.22 - 2, duration: 0.3, ease: 'power1.out' })
}

function onBtnMouseLeave(e) {
  gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.45)' })
}

onMounted(() => {
  requestAnimationFrame(() => {
    ready.value = true
    initCanvas()
  })

  window.addEventListener('resize', initCanvas)

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!reduceMotion && deviceRef.value) {
    deviceQuickToX = gsap.quickTo(deviceRef.value, 'rotationY', { duration: 0.7, ease: 'power2.out' })
    deviceQuickToY = gsap.quickTo(deviceRef.value, 'rotationX', { duration: 0.7, ease: 'power2.out' })
    gsap.set(deviceRef.value, { transformPerspective: 1100, transformStyle: 'preserve-3d' })

    // 移动端/平板设备陀螺仪体感倾斜
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
      window.addEventListener('deviceorientation', onOrientation, { passive: true })
    }

    if (washRef.value) {
      gsap.to(washRef.value, {
        scale: 1.06,
        rotation: 2.5,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    }

    // 针对手机与平板：首屏设备随页面滚动纵深后退折叠
    scrollCtx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        '(max-width: 960px)': () => {
          gsap.to(deviceRef.value, {
            rotationX: 10,
            scale: 0.94,
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.value,
              start: 'top top',
              end: 'bottom top',
              scrub: 1.2
            }
          })
        }
      })
    }, heroRef.value)
  }

  if (reduceMotion) {
    brushCount.value = 240
    blendCount.value = 25
    filterCount.value = 35
  } else {
    const obj = { b: 0, l: 0, f: 0 }
    gsap.to(obj, {
      b: 240,
      l: 25,
      f: 35,
      duration: 1.8,
      delay: 0.35,
      ease: 'power2.out',
      onUpdate() {
        brushCount.value = Math.round(obj.b)
        blendCount.value = Math.round(obj.l)
        filterCount.value = Math.round(obj.f)
      }
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', initCanvas)
  window.removeEventListener('deviceorientation', onOrientation)
  scrollCtx?.revert()
})
</script>

<template>
  <section
    id="top"
    ref="heroRef"
    class="hero"
    :class="{ ready }"
    @mousemove="onHeroMouseMove"
    @mouseleave="onHeroMouseLeave"
  >
    <div ref="washRef" class="hero-wash" aria-hidden="true"></div>

    <div class="shell hero-grid">
      <!-- 左：文案 -->
      <div class="hero-copy">
        <p class="eyebrow hero-eyebrow">
          <span class="dot" aria-hidden="true"></span>
          Android 平板专业创作 · GPL-3.0 开源 · QQ群 729283213
        </p>

        <h1 class="hero-title">
          把桌面级图像内核，<br />
          <em>装进安卓平板</em>
        </h1>

        <p class="hero-sub">
          融合 <b>Krita C++ 原生图像处理内核</b>与现代化触控交互。具备 240+ 官方笔刷预设、动态稀疏瓦片图层、多协议压感手写笔专属调校与全流程事件流延时回放，让专业创作在移动端彻底摆脱妥协。
        </p>

        <div class="hero-actions">
          <a
            class="btn btn-primary"
            href="https://github.com/LanRhyme/ReveriePaint/releases"
            target="_blank"
            rel="noopener"
            @mousemove="onBtnMouseMove"
            @mouseleave="onBtnMouseLeave"
          >
            下载 APK
          </a>
          <a
            class="btn btn-secondary"
            href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android"
            target="_blank"
            rel="noopener"
            @mousemove="onBtnMouseMove"
            @mouseleave="onBtnMouseLeave"
          >
            Mirror酱 高速下载
          </a>
          <a
            class="btn btn-ghost"
            href="https://github.com/LanRhyme/ReveriePaint"
            target="_blank"
            rel="noopener"
            @mousemove="onBtnMouseMove"
            @mouseleave="onBtnMouseLeave"
          >
            查看源码
          </a>
        </div>

        <dl class="hero-facts">
          <div>
            <dt>{{ brushCount }}+</dt>
            <dd>官方物理笔刷</dd>
          </div>
          <div>
            <dt>{{ blendCount }} 种</dt>
            <dd>图层混合模式</dd>
          </div>
          <div>
            <dt>{{ filterCount }} 种</dt>
            <dd>无损实时滤镜</dd>
          </div>
          <div>
            <dt>GPL-3.0</dt>
            <dd>永久免费开源</dd>
          </div>
        </dl>
      </div>

      <!-- 右：设备框 -->
      <div class="hero-device">
        <div ref="deviceRef" class="device">
          <div class="device-screen">
            <div ref="shineRef" class="device-shine" aria-hidden="true"></div>
            <img
              :src="heroCanvas"
              :srcset="`${heroCanvasSm} 1000w, ${heroCanvas} 2000w`"
              sizes="(max-width: 960px) 90vw, 760px"
              alt="ReveriePaint 画布上绘制的飞龙与猫的线稿"
              fetchpriority="high"
              decoding="async"
            />
            <canvas
              ref="canvasRef"
              class="device-canvas"
              @pointerdown="startDraw"
              @pointermove="drawStroke"
              @pointerup="endDraw"
              @pointercancel="endDraw"
            ></canvas>
            <div class="canvas-hud">
              <span class="canvas-tip">
                <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
                  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" fill="currentColor"/>
                </svg>
                触摸或手写笔在此试笔
              </span>
              <button
                v-if="hasStrokes"
                type="button"
                class="btn-clear"
                @click.stop="clearCanvas"
              >
                清除笔迹
              </button>
            </div>
          </div>
        </div>
        <p class="device-note">实机绘制展示 · 支持直接触控涂抹测试</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding: clamp(104px, 14vh, 156px) 0 clamp(56px, 8vh, 88px);
  overflow: hidden;
}

.hero-wash {
  position: absolute;
  inset: -24% -12% auto -12%;
  height: 118%;
  pointer-events: none;
  background:
    radial-gradient(42% 32% at 78% 14%, rgba(143, 163, 180, 0.14) 0%, transparent 68%),
    radial-gradient(36% 28% at 6% 4%, rgba(195, 163, 158, 0.11) 0%, transparent 66%),
    radial-gradient(50% 38% at 44% 70%, rgba(200, 180, 141, 0.09) 0%, transparent 70%);
  filter: blur(6px);
}

.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  align-items: center;
  gap: clamp(40px, 5vw, 76px);
}

/* ── 文案 ─────────────────────────────────── */
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 24px;
  opacity: 0;
}
.hero-eyebrow .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--moss);
  box-shadow: 0 0 0 3px rgba(157, 169, 142, 0.2);
}
.ready .hero-eyebrow {
  animation: heroRise 0.85s var(--ease-out-expo) 0.05s forwards;
}

.hero-title {
  font-size: clamp(1.9rem, 4.1vw, 3.15rem);
  line-height: 1.26;
  letter-spacing: -0.032em;
  font-weight: 400;
  color: var(--ink-mid);
  opacity: 0;
}
.hero-title em {
  font-style: normal;
  font-weight: 600;
  color: var(--ink);
}
.ready .hero-title {
  animation: heroRise 1s var(--ease-out-expo) 0.14s forwards;
}

.hero-sub {
  margin-top: 26px;
  max-width: 46ch;
  font-size: clamp(0.9375rem, 1.25vw, 1.0625rem);
  line-height: 1.92;
  color: var(--ink-mid);
  opacity: 0;
}
.hero-sub b {
  color: var(--ink);
  font-weight: 500;
}
.ready .hero-sub {
  animation: heroRise 1s var(--ease-out-expo) 0.26s forwards;
}

.hero-actions {
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
  opacity: 0;
}
.ready .hero-actions {
  animation: heroRise 1s var(--ease-out-expo) 0.36s forwards;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  padding: 13px 26px;
  border-radius: 999px;
  will-change: transform;
  transition: background 0.3s, border-color 0.3s, box-shadow 0.35s;
}
.btn-primary {
  background: var(--ink);
  color: var(--paper);
  box-shadow: var(--shadow-m);
}
.btn-primary:hover {
  background: var(--ink-soft);
  box-shadow: var(--shadow-l);
}
.btn-secondary {
  color: var(--ink);
  background: rgba(20, 22, 26, 0.05);
  border: 1px solid var(--line-strong);
}
.btn-secondary:hover {
  background: rgba(20, 22, 26, 0.09);
  border-color: var(--ink);
}
.btn-ghost {
  color: var(--ink);
  border: 1px solid var(--line-strong);
  background: rgba(253, 252, 250, 0.55);
}
.btn-ghost:hover {
  border-color: var(--ink);
}

.hero-facts {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--line-faint);
  display: flex;
  flex-wrap: wrap;
  gap: clamp(24px, 3.4vw, 44px);
  opacity: 0;
}
.ready .hero-facts {
  animation: heroRise 0.9s var(--ease-out-expo) 0.46s forwards;
}
.hero-facts dt {
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  font-feature-settings: "tnum";
  line-height: 1.2;
}
.hero-facts dd {
  margin-top: 3px;
  font-size: 0.75rem;
  color: var(--ink-soft-2);
}

/* ── 设备框 ───────────────────────────────── */
.hero-device {
  position: relative;
  opacity: 0;
  perspective: 1100px;
}
.ready .hero-device {
  animation: heroRise 1.2s var(--ease-out-expo) 0.2s forwards;
}

.device {
  /* 深色平板边框，圆角与内边距模拟真实设备 */
  position: relative;
  padding: 13px;
  border-radius: 22px;
  background: linear-gradient(158deg, #34383e 0%, #1c1f23 42%, #121417 100%);
  box-shadow:
    0 2px 3px rgba(20, 22, 26, 0.14),
    0 18px 40px rgba(20, 22, 26, 0.2),
    0 44px 90px rgba(20, 22, 26, 0.16);
  transform-style: preserve-3d;
  will-change: transform;
}
/* 屏幕外圈高光，做出金属收边 */
.device::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 17px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  pointer-events: none;
}

.device-screen {
  position: relative;
  border-radius: 11px;
  overflow: hidden;
  background: #eceae6;
  aspect-ratio: 16 / 10;
}
.device-shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  border-radius: inherit;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 62%);
  transition: background 0.12s ease-out;
  mix-blend-mode: overlay;
}
.device-screen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}

.device-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  touch-action: none;
  cursor: crosshair;
}

.canvas-hud {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  z-index: 6;
}

.canvas-tip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.6875rem;
  letter-spacing: 0.02em;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--ink-mid);
  border: 1px solid rgba(20, 22, 26, 0.08);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.btn-clear {
  pointer-events: auto;
  font-family: inherit;
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(28, 32, 38, 0.78);
  color: #fff;
  border: none;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: background 0.2s, transform 0.2s;
}
.btn-clear:hover {
  background: rgba(28, 32, 38, 0.94);
  transform: translateY(-1px);
}
.btn-clear:active {
  transform: scale(0.92);
}

.device-note {
  margin-top: 14px;
  text-align: right;
  font-size: 0.75rem;
  color: var(--ink-ghost);
  letter-spacing: 0.02em;
}

@media (max-width: 960px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 40px;
  }
  .hero-device {
    order: 2;
  }
  .device-note {
    text-align: left;
  }
}
</style>

<style>
@keyframes heroRise {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
