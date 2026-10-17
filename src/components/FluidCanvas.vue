<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 背景纸感晕染。
 *
 * 性能约定：底色晕染只在挂载 / 尺寸变化时绘制一次（本来就是几乎静止的），
 * 不再常驻 rAF。只有鼠标划过时才启动逐帧循环画墨点，墨点散完即停。
 * 触屏设备不注册指针监听、不跑循环，只画一张静态底。
 */

const baseRef = ref(null)   // 静态晕染
const inkRef = ref(null)    // 交互墨点（叠在上层）

const PALETTE = [
  [91, 127, 199],   // 莫兰迪蓝
  [143, 163, 180],  // 灰雾青
  [195, 163, 158],  // 赭红豆沙
  [157, 169, 142],  // 灰苔绿
  [176, 138, 117],  // 暖陶褐
  [167, 155, 182]   // 灰紫
]

// 固定构图的晕染块：位置、半径都按视口比例给，避免每次刷新随机成一团乱
const BLOBS = [
  { x: 0.08, y: 0.02, r: 0.62, ci: 0, a: 0.1 },
  { x: 0.92, y: -0.06, r: 0.54, ci: 1, a: 0.09 },
  { x: 0.24, y: 0.72, r: 0.58, ci: 3, a: 0.08 },
  { x: 0.78, y: 0.58, r: 0.5, ci: 2, a: 0.07 },
  { x: 0.52, y: 0.24, r: 0.46, ci: 5, a: 0.055 },
  { x: 0.06, y: 0.44, r: 0.34, ci: 4, a: 0.05 }
]

let baseCtx = null
let inkCtx = null
let width = 0
let height = 0
let dpr = 1
let rafId = 0
let spriteCache = new Map()
let ripples = []
let lastX = 0
let lastY = 0
let hasLast = false
let finePointer = false

const MAX_RIPPLES = 18

/** 把一个颜色预渲染成 160px 的径向渐变贴图，之后只做 drawImage */
function getSprite(ci) {
  if (spriteCache.has(ci)) return spriteCache.get(ci)
  const size = 160
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const [r, gg, b] = PALETTE[ci]
  const grad = g.createRadialGradient(size / 2, size / 2, 1, size / 2, size / 2, size / 2)
  grad.addColorStop(0, `rgba(${r},${gg},${b},1)`)
  grad.addColorStop(0.45, `rgba(${r},${gg},${b},0.45)`)
  grad.addColorStop(1, `rgba(${r},${gg},${b},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  spriteCache.set(ci, c)
  return c
}

function sizeCanvas(canvas) {
  if (!canvas) return
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
}

function paintBase() {
  if (!baseCtx) return
  baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  baseCtx.clearRect(0, 0, width, height)

  const min = Math.min(width, height)
  BLOBS.forEach((b) => {
    const r = b.r * min
    baseCtx.globalAlpha = b.a
    baseCtx.drawImage(
      getSprite(b.ci),
      b.x * width - r,
      b.y * height - r,
      r * 2,
      r * 2
    )
  })
  baseCtx.globalAlpha = 1
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  width = window.innerWidth
  height = window.innerHeight
  sizeCanvas(baseRef.value)
  sizeCanvas(inkRef.value)
  if (inkCtx) inkCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  paintBase()
}

function spawn(x, y, dx, dy) {
  if (ripples.length >= MAX_RIPPLES) return
  const ci = Math.floor(Math.random() * PALETTE.length)
  ripples.push({
    x,
    y,
    vx: dx * 0.28 + (Math.random() - 0.5) * 1.2,
    vy: dy * 0.28 + (Math.random() - 0.5) * 1.2,
    r: 14 + Math.random() * 18,
    grow: 0.9 + Math.random() * 1.6,
    max: 70 + Math.random() * 80,
    life: 1,
    decay: 0.014 + Math.random() * 0.012,
    ci
  })
  startLoop()
}

function onPointerMove(e) {
  const x = e.clientX
  const y = e.clientY
  if (!hasLast) {
    lastX = x
    lastY = y
    hasLast = true
    return
  }
  const dx = x - lastX
  const dy = y - lastY
  if (Math.hypot(dx, dy) < 22) return
  spawn(x, y, dx, dy)
  lastX = x
  lastY = y
}

function tick() {
  if (!inkCtx) return
  inkCtx.clearRect(0, 0, width, height)

  for (let i = ripples.length - 1; i >= 0; i--) {
    const p = ripples[i]
    p.x += p.vx
    p.y += p.vy
    p.vx *= 0.93
    p.vy *= 0.93
    p.r += p.grow
    p.life -= p.decay

    if (p.life <= 0.01 || p.r >= p.max) {
      ripples.splice(i, 1)
      continue
    }

    inkCtx.globalAlpha = p.life * 0.13
    inkCtx.drawImage(getSprite(p.ci), p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)
  }
  inkCtx.globalAlpha = 1

  if (ripples.length) {
    rafId = requestAnimationFrame(tick)
  } else {
    rafId = 0
    inkCtx.clearRect(0, 0, width, height)
  }
}

function startLoop() {
  if (!rafId) rafId = requestAnimationFrame(tick)
}

function onResize() {
  ripples = []
  resize()
}

onMounted(() => {
  if (!baseRef.value || !inkRef.value) return

  baseCtx = baseRef.value.getContext('2d', { alpha: true })
  inkCtx = inkRef.value.getContext('2d', { alpha: true })

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  resize()
  window.addEventListener('resize', onResize, { passive: true })

  if (finePointer && !reduced) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
  }
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onPointerMove)
  spriteCache.clear()
})
</script>

<template>
  <div class="paper-wash" aria-hidden="true">
    <canvas ref="baseRef" class="layer base"></canvas>
    <canvas ref="inkRef" class="layer ink"></canvas>
  </div>
</template>

<style scoped>
.paper-wash {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  contain: strict;
  mix-blend-mode: multiply;
}

.layer {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
}

/* 触屏设备：不做 multiply 混合，避免滚动时整屏逐帧重混合 */
@media (hover: none) and (pointer: coarse) {
  .paper-wash {
    mix-blend-mode: normal;
    opacity: 0.92;
  }
  .ink {
    display: none;
  }
}
</style>
