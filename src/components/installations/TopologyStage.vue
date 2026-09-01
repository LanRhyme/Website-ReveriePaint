<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import anime from 'animejs'

const stageRef = ref(null)
const pathsGroupRef = ref(null)
let animInstance = null
let mouseX = 0.5
let mouseY = 0.5
let targetMouseX = 0.5
let targetMouseY = 0.5
let rafId = null

const PATH_COUNT = 18
const morandiColors = [
  'rgba(196, 154, 143, 0.55)', // clay
  'rgba(107, 130, 148, 0.45)', // slate
  'rgba(213, 195, 178, 0.50)', // sand
  'rgba(157, 169, 142, 0.45)', // moss
  'rgba(191, 163, 124, 0.40)'  // gold
]

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const group = pathsGroupRef.value
  if (!group) return

  // Create multi-layer topological contour paths
  const pathEls = []
  for (let i = 0; i < PATH_COUNT; i++) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    p.setAttribute('fill', 'none')
    p.setAttribute('stroke', morandiColors[i % morandiColors.length])
    p.setAttribute('stroke-width', (1.4 - (i / PATH_COUNT) * 0.9).toFixed(2))
    p.setAttribute('stroke-linecap', 'round')
    group.appendChild(p)
    pathEls.push(p)
  }

  const engine = { phase: 0, tension: 1 }

  animInstance = anime({
    targets: engine,
    phase: Math.PI * 2,
    duration: 6000,
    easing: 'linear',
    loop: true,
    update: () => {
      const ph = engine.phase
      // Smooth lerp mouse
      mouseX += (targetMouseX - mouseX) * 0.08
      mouseY += (targetMouseY - mouseY) * 0.08
      const mouseInfluence = (mouseY - 0.5) * 60

      pathEls.forEach((p, idx) => {
        const factor = idx / PATH_COUNT
        const yBase = 70 + idx * 14
        
        // Multi-harmonic wave equation with mouse displacement
        const cp1x = 160 + Math.sin(ph * 1.2 + idx * 0.22) * 55 + (mouseX - 0.5) * 40
        const cp1y = yBase - 55 + Math.cos(ph + idx * 0.18) * (35 + idx * 1.5) + mouseInfluence * (1 - factor)
        
        const cp2x = 440 + Math.cos(ph * 0.9 + idx * 0.16) * 60 - (mouseX - 0.5) * 40
        const cp2y = yBase + 55 + Math.sin(ph * 1.1 + idx * 0.24) * (38 + idx * 1.2) - mouseInfluence * factor
        
        const endY = yBase + Math.sin(ph + idx * 0.3) * 22
        const d = `M 30,${yBase} C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} 570,${endY.toFixed(1)}`
        p.setAttribute('d', d)
      })

      // Update telemetry display dynamically if present
      const curvatureEl = document.querySelector('.num-curvature-js')
      if (curvatureEl) {
        const curv = (0.0034 + Math.sin(ph * 2) * 0.0009 + Math.abs(mouseX - 0.5) * 0.0012).toFixed(4)
        curvatureEl.textContent = curv
      }
    }
  })

  // Pulsing nodal points along the primary spline
  anime({
    targets: '.topo-pulse-node',
    scale: [0.7, 1.4],
    opacity: [0.3, 0.95],
    duration: 2200,
    delay: anime.stagger(280),
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine'
  })

  // Floating tangent markers
  anime({
    targets: '.tangent-vector',
    translateX: [-15, 15],
    translateY: [-10, 10],
    rotate: [-12, 12],
    duration: 3400,
    delay: anime.stagger(300),
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutQuad'
  })
})

function onMouseMove(e) {
  if (!stageRef.value) return
  const r = stageRef.value.getBoundingClientRect()
  targetMouseX = (e.clientX - r.left) / r.width
  targetMouseY = (e.clientY - r.top) / r.height
}

function onMouseLeave() {
  targetMouseX = 0.5
  targetMouseY = 0.5
}

onUnmounted(() => {
  if (animInstance) animInstance.pause()
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div ref="stageRef" class="topology-stage" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
    <!-- SVG Vector Field -->
    <svg class="svg-topology" viewBox="0 0 600 380" fill="none">
      <defs>
        <radialGradient id="topo-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="var(--c-clay)" stop-opacity="0.25" />
          <stop offset="100%" stop-color="var(--c-clay)" stop-opacity="0" />
        </radialGradient>
        <filter id="glow-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background Ambient Resonance Glow -->
      <circle cx="300" cy="190" r="160" fill="url(#topo-glow)" />

      <!-- Dynamic Harmonic Bezier Curves -->
      <g ref="pathsGroupRef" class="topo-paths-layer"></g>

      <!-- Precision Tangent Grid Markers -->
      <g class="telemetry-markers" opacity="0.6">
        <line x1="30" y1="20" x2="30" y2="360" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2 4" />
        <line x1="300" y1="20" x2="300" y2="360" stroke="rgba(255,255,255,0.06)" stroke-dasharray="1 5" />
        <line x1="570" y1="20" x2="570" y2="360" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2 4" />
      </g>

      <!-- Pressure Vector Keyframe Nodes -->
      <g class="nodes-layer">
        <circle class="topo-pulse-node" cx="120" cy="140" r="4" fill="var(--c-clay)" filter="url(#glow-blur)" />
        <circle class="topo-pulse-node" cx="300" cy="200" r="5" fill="var(--c-sand)" filter="url(#glow-blur)" />
        <circle class="topo-pulse-node" cx="480" cy="160" r="3.5" fill="var(--c-slate)" filter="url(#glow-blur)" />
        
        <circle cx="300" cy="200" r="14" stroke="var(--c-sand)" stroke-width="0.75" stroke-dasharray="2 3" opacity="0.4" />
      </g>
    </svg>

    <!-- Overlay Telemetry Floating Badges -->
    <div class="field-badge top-left">TANGENT VECTOR [∇f(x,y)]</div>
    <div class="field-badge bottom-right">HERMITE HARMONIC FIELD · 120 FPS</div>
  </div>
</template>

<style scoped>
.topology-stage {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  user-select: none;
}
.svg-topology {
  width: 92%;
  height: 92%;
  overflow: visible;
}
.topo-paths-layer path {
  transition: stroke-opacity 0.3s;
}
.topo-paths-layer path:hover {
  stroke-opacity: 0.9 !important;
}
.field-badge {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  color: var(--c-ash);
  pointer-events: none;
  text-transform: uppercase;
}
.top-left { top: 1.2rem; left: 1.5rem; }
.bottom-right { bottom: 1.2rem; right: 1.5rem; opacity: 0.7; }
</style>

