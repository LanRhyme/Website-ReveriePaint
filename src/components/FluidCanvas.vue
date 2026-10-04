<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let animId = null
let width = 0
let height = 0
let dpr = 1
let isReducedMotion = false
let isTouchDevice = false

// 莫兰迪水墨色板（低饱和、温暖水彩与墨色）
const INK_PALETTE = [
  { r: 91, g: 127, b: 199, a: 0.18 },   // 莫兰迪蓝
  { r: 143, g: 163, b: 180, a: 0.16 }, // 灰雾青
  { r: 195, g: 163, b: 158, a: 0.15 }, // 赭红豆沙
  { r: 157, g: 169, b: 142, a: 0.16 }, // 灰苔绿
  { r: 176, g: 138, b: 117, a: 0.14 }, // 暖陶褐
  { r: 20, g: 22, b: 26, a: 0.08 }     // 水墨极淡黑
]

// 水墨粒子与流体扩散环池
const ripples = []
const ambientNodes = []
const MAX_RIPPLES = 48
const MAX_AMBIENT = 16

let lastPointerX = 0
let lastPointerY = 0
let pointerMoving = false
let pointerMoveTimer = null

class InkRipple {
  constructor(x, y, vx, vy, color) {
    this.x = x
    this.y = y
    this.vx = vx * 0.4 + (Math.random() - 0.5) * 1.5
    this.vy = vy * 0.4 + (Math.random() - 0.5) * 1.5
    this.color = color || INK_PALETTE[Math.floor(Math.random() * INK_PALETTE.length)]
    this.radius = Math.random() * 12 + 10
    this.maxRadius = this.radius + (Math.random() * 45 + 35)
    this.life = 1
    this.decay = Math.random() * 0.012 + 0.008
    this.wobblePhase = Math.random() * Math.PI * 2
    this.wobbleSpeed = (Math.random() - 0.5) * 0.04
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.vx *= 0.94
    this.vy *= 0.94
    this.radius += (this.maxRadius - this.radius) * 0.04
    this.wobblePhase += this.wobbleSpeed
    this.life -= this.decay
    return this.life > 0.01
  }

  draw(c) {
    const alpha = this.life * this.color.a
    if (alpha <= 0.005) return

    c.save()
    c.translate(this.x, this.y)
    
    // 微小有机墨晕形变
    const scaleX = 1 + Math.sin(this.wobblePhase) * 0.12
    const scaleY = 1 + Math.cos(this.wobblePhase) * 0.12
    c.scale(scaleX, scaleY)

    const grad = c.createRadialGradient(0, 0, this.radius * 0.1, 0, 0, this.radius)
    grad.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 1.3})`)
    grad.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.6})`)
    grad.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`)

    c.fillStyle = grad
    c.beginPath()
    c.arc(0, 0, this.radius, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }
}

class AmbientBlob {
  constructor(w, h, idx) {
    this.reset(w, h, idx)
    this.t = Math.random() * 100
  }

  reset(w, h, idx) {
    this.x = (idx / MAX_AMBIENT) * w + (Math.random() - 0.5) * 160
    this.y = (Math.random() * 0.9 + 0.05) * h
    this.baseRadius = Math.min(w, h) * (Math.random() * 0.18 + 0.14)
    this.color = INK_PALETTE[idx % INK_PALETTE.length]
    this.speed = Math.random() * 0.0015 + 0.0008
  }

  update(time) {
    this.t += this.speed
    this.currX = this.x + Math.sin(this.t) * 45
    this.currY = this.y + Math.cos(this.t * 0.8) * 35
    this.currRadius = this.baseRadius + Math.sin(this.t * 1.4) * 20
  }

  draw(c) {
    c.save()
    const grad = c.createRadialGradient(
      this.currX, this.currY, this.currRadius * 0.08,
      this.currX, this.currY, this.currRadius
    )
    const baseAlpha = this.color.a * 0.5
    grad.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${baseAlpha})`)
    grad.addColorStop(0.65, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${baseAlpha * 0.3})`)
    grad.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`)

    c.fillStyle = grad
    c.beginPath()
    c.arc(this.currX, this.currY, this.currRadius, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }
}

function resize() {
  if (!canvasRef.value) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight

  canvasRef.value.width = width * dpr
  canvasRef.value.height = height * dpr
  canvasRef.value.style.width = `${width}px`
  canvasRef.value.style.height = `${height}px`

  if (ctx) {
    ctx.scale(dpr, dpr)
  }

  // 初始化环境呼吸晕染斑
  if (ambientNodes.length === 0) {
    const count = isTouchDevice ? 8 : MAX_AMBIENT
    for (let i = 0; i < count; i++) {
      ambientNodes.push(new AmbientBlob(width, height, i))
    }
  }
}

function spawnRipple(x, y, vx, vy) {
  if (isReducedMotion) return
  if (ripples.length >= (isTouchDevice ? 24 : MAX_RIPPLES)) {
    ripples.shift()
  }
  ripples.push(new InkRipple(x, y, vx, vy))
}

function onPointerMove(e) {
  const x = e.clientX
  const y = e.clientY
  const vx = x - lastPointerX
  const vy = y - lastPointerY
  const dist = Math.hypot(vx, vy)

  // 移动距离足够时喷射墨晕
  if (dist > 12) {
    spawnRipple(x, y, vx, vy)
    lastPointerX = x
    lastPointerY = y
  }

  pointerMoving = true
  clearTimeout(pointerMoveTimer)
  pointerMoveTimer = setTimeout(() => {
    pointerMoving = false
  }, 120)
}

function onPointerDown(e) {
  // 点击/触摸时激起较浓扩散墨花
  for (let i = 0; i < (isTouchDevice ? 2 : 3); i++) {
    spawnRipple(e.clientX, e.clientY, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
  }
}

function loop(time) {
  if (!ctx || !width || !height) {
    animId = requestAnimationFrame(loop)
    return
  }

  ctx.clearRect(0, 0, width, height)

  // 1. 绘制底层莫兰迪温和水彩呼吸光晕
  for (let i = 0; i < ambientNodes.length; i++) {
    ambientNodes[i].update(time)
    ambientNodes[i].draw(ctx)
  }

  // 2. 绘制用户交互激发的物理水墨粒子与墨花
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i]
    if (r.update()) {
      r.draw(ctx)
    } else {
      ripples.splice(i, 1)
    }
  }

  animId = requestAnimationFrame(loop)
}

onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d', { alpha: true })

  isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches

  resize()
  window.addEventListener('resize', resize, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerdown', onPointerDown, { passive: true })

  animId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerdown', onPointerDown)
  clearTimeout(pointerMoveTimer)
})
</script>

<template>
  <canvas
    ref={canvasRef}
    class="fluid-canvas"
    aria-hidden="true"
  ></canvas>
</template>

<style scoped>
.fluid-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  mix-blend-mode: multiply;
  opacity: 0.9;
  contain: strict;
}
</style>
