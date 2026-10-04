<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let animId = null
let width = 0
let height = 0
let dpr = 1

let targetMouseX = 0
let targetMouseY = 0
let currentMouseX = 0
let currentMouseY = 0
let mouseMoved = false

function onPointerMove(e) {
  targetMouseX = e.clientX
  targetMouseY = e.clientY
  mouseMoved = true
}

function resize() {
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

function render() {
  if (!ctx) return

  // 阻尼平滑跟随
  currentMouseX += (targetMouseX - currentMouseX) * 0.04
  currentMouseY += (targetMouseY - currentMouseY) * 0.04

  ctx.clearRect(0, 0, width, height)

  // 1. 深度工作室环境渐变光晕 (深色莫兰迪蓝与墨灰，极其柔和纯净)
  if (mouseMoved) {
    const radial = ctx.createRadialGradient(
      currentMouseX,
      currentMouseY,
      0,
      currentMouseX,
      currentMouseY,
      Math.max(width, height) * 0.65
    )
    radial.addColorStop(0, 'rgba(91, 127, 199, 0.12)')
    radial.addColorStop(0.35, 'rgba(143, 163, 180, 0.04)')
    radial.addColorStop(1, 'rgba(6, 7, 9, 0)')

    ctx.fillStyle = radial
    ctx.fillRect(0, 0, width, height)
  }

  // 2. 极简精密微网格十字定位点 (Lusion Technical Grid)
  const gridSize = 140
  const offsetX = (width % gridSize) / 2
  const offsetY = (height % gridSize) / 2

  ctx.lineWidth = 1

  for (let x = offsetX; x < width; x += gridSize) {
    for (let y = offsetY; y < height; y += gridSize) {
      const dx = x - currentMouseX
      const dy = y - currentMouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxDist = 320

      let alpha = 0.06
      if (dist < maxDist) {
        alpha = 0.06 + (1 - dist / maxDist) * 0.22
      }

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`

      // 绘制微型细十字 (length: 4px)
      ctx.beginPath()
      ctx.moveTo(x - 3, y)
      ctx.lineTo(x + 3, y)
      ctx.moveTo(x, y - 3)
      ctx.lineTo(x, y + 3)
      ctx.stroke()
    }
  }

  animId = requestAnimationFrame(render)
}

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return

  targetMouseX = window.innerWidth / 2
  targetMouseY = window.innerHeight / 2
  currentMouseX = targetMouseX
  currentMouseY = targetMouseY

  ctx = canvasRef.value.getContext('2d')
  resize()
  window.addEventListener('resize', resize, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })

  animId = requestAnimationFrame(render)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', onPointerMove)
  if (animId) cancelAnimationFrame(animId)
})
</script>

<template>
  <!-- 严格位于所有前景文字与操作元素深层背景，绝不遮挡任何内容 -->
  <canvas ref="canvasRef" class="lusion-ambient-canvas" aria-hidden="true"></canvas>
</template>

<style scoped>
.lusion-ambient-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  background: #060709;
}
</style>
