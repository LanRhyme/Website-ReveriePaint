<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import anime from 'animejs'

const stageRef = ref(null)
const svgRef = ref(null)
let anims = []

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // 1. Central chaotic attractor parametric loop animation
  const knot = document.querySelector('.attractor-knot-path')
  if (knot) {
    const len = knot.getTotalLength()
    anime.set(knot, { strokeDasharray: len, strokeDashoffset: len })
    anims.push(
      anime({
        targets: knot,
        strokeDashoffset: [len, 0],
        duration: 4800,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
      })
    )
  }

  // 2. Gyroscopic phase rings multi-axis counter rotation
  anims.push(
    anime({
      targets: '.orbit-ring-cw',
      rotate: [0, 360],
      duration: 28000,
      loop: true,
      easing: 'linear'
    })
  )

  anims.push(
    anime({
      targets: '.orbit-ring-ccw',
      rotate: [0, -360],
      duration: 34000,
      loop: true,
      easing: 'linear'
    })
  )

  // 3. Orbiting quantum timeline events (beads)
  anims.push(
    anime({
      targets: '.orbital-event-bead',
      rotate: (el, i) => (i % 2 === 0 ? [0, 360] : [360, 0]),
      duration: (el, i) => 12000 + i * 4000,
      loop: true,
      easing: 'linear'
    })
  )

  // 4. Singularity core breathing
  anims.push(
    anime({
      targets: '.singularity-pulse',
      scale: [0.85, 1.3],
      opacity: [0.4, 0.95],
      duration: 2400,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    })
  )

  // 5. Dynamic telemetry radial wave oscillation
  anims.push(
    anime({
      targets: '.phase-ring-pulse',
      rx: (el, i) => [180 + i * 20, 195 + i * 20],
      ry: (el, i) => [70 + i * 15, 85 + i * 15],
      duration: 3800,
      delay: anime.stagger(200),
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutQuad'
    })
  )
})

function onMouseMove(e) {
  if (!svgRef.value) return
  const r = stageRef.value.getBoundingClientRect()
  const dx = (e.clientX - (r.left + r.width / 2)) / r.width
  const dy = (e.clientY - (r.top + r.height / 2)) / r.height

  anime({
    targets: svgRef.value,
    rotateX: -dy * 24,
    rotateY: dx * 24,
    duration: 600,
    easing: 'easeOutQuad'
  })
}

function onMouseLeave() {
  if (!svgRef.value) return
  anime({
    targets: svgRef.value,
    rotateX: 0,
    rotateY: 0,
    duration: 900,
    easing: 'easeOutElastic(1, 0.5)'
  })
}

onUnmounted(() => {
  anims.forEach(a => a && a.pause())
})
</script>

<template>
  <div ref="stageRef" class="attractor-stage" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
    <svg ref="svgRef" class="phase-attractor-svg" viewBox="0 0 500 500" fill="none">
      <defs>
        <radialGradient id="singularity-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="var(--c-sand)" stop-opacity="0.9" />
          <stop offset="30%" stop-color="var(--c-clay)" stop-opacity="0.4" />
          <stop offset="100%" stop-color="transparent" stop-opacity="0" />
        </radialGradient>
        <filter id="core-bloom" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background Phase Coordinate Axes -->
      <g opacity="0.35">
        <line x1="250" y1="50" x2="250" y2="450" stroke="rgba(255,255,255,0.15)" stroke-dasharray="3 5" />
        <line x1="50" y1="250" x2="450" y2="250" stroke="rgba(255,255,255,0.15)" stroke-dasharray="3 5" />
        <circle cx="250" cy="250" r="210" stroke="rgba(255,255,255,0.06)" stroke-dasharray="1 6" />
      </g>

      <!-- Outer Gyroscopic Orbital Rings -->
      <g class="orbit-ring-cw origin-center">
        <ellipse class="phase-ring-pulse" cx="250" cy="250" rx="200" ry="80" stroke="rgba(196,154,143,0.4)" stroke-width="0.9" stroke-dasharray="6 8" />
        <ellipse cx="250" cy="250" rx="140" ry="50" stroke="rgba(107,130,148,0.3)" stroke-width="0.75" stroke-dasharray="4 6" />
      </g>

      <g class="orbit-ring-ccw origin-center" transform="rotate(60 250 250)">
        <ellipse class="phase-ring-pulse" cx="250" cy="250" rx="180" ry="70" stroke="rgba(213,195,178,0.4)" stroke-width="0.85" stroke-dasharray="8 6" />
        <ellipse cx="250" cy="250" rx="120" ry="40" stroke="rgba(157,169,142,0.35)" stroke-width="0.6" stroke-dasharray="3 5" />
      </g>

      <!-- 3D Inclined Chaotic Attractor Knot Path (Lissajous) -->
      <g class="origin-center" transform="rotate(30 250 250)">
        <path
          class="attractor-knot-path"
          d="M 250,250 C 340,110 440,320 250,250 C 60,180 390,80 250,250 C 120,380 380,410 250,250"
          stroke="url(#singularity-glow)"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </g>

      <!-- Orbiting Quantum Event Beacons -->
      <g class="orbital-event-bead origin-center">
        <circle cx="450" cy="250" r="3.5" fill="var(--c-sand)" filter="url(#core-bloom)" />
        <circle cx="450" cy="250" r="8" stroke="var(--c-sand)" stroke-width="0.5" opacity="0.4" />
      </g>

      <g class="orbital-event-bead origin-center" transform="rotate(120 250 250)">
        <circle cx="390" cy="250" r="3" fill="var(--c-clay)" filter="url(#core-bloom)" />
      </g>

      <g class="orbital-event-bead origin-center" transform="rotate(240 250 250)">
        <circle cx="370" cy="250" r="2.5" fill="var(--c-slate)" filter="url(#core-bloom)" />
      </g>

      <!-- Central Singularity Gravitational Core -->
      <circle class="singularity-pulse" cx="250" cy="250" r="18" fill="url(#singularity-glow)" filter="url(#core-bloom)" />
      <circle cx="250" cy="250" r="4.5" fill="#fff" />
      <circle cx="250" cy="250" r="9" stroke="rgba(255,255,255,0.4)" stroke-width="0.75" stroke-dasharray="2 3" />
    </svg>

    <!-- HUD Telemetry Labels -->
    <div class="hud-badge hud-top-left">PHASE ATTRACTOR · [dx/dt = σ(y-x)]</div>
    <div class="hud-badge hud-bottom-right">TEMPORAL PHASE REWIND · 0-LOSS</div>
  </div>
</template>

<style scoped>
.attractor-stage {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  perspective: 1000px;
  user-select: none;
}

.phase-attractor-svg {
  width: 90%;
  height: 90%;
  transform-style: preserve-3d;
  transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.4, 1);
}

.origin-center {
  transform-origin: 250px 250px;
}

.hud-badge {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  color: var(--c-ash);
  pointer-events: none;
  text-transform: uppercase;
}
.hud-top-left { top: 1.2rem; left: 1.5rem; }
.hud-bottom-right { bottom: 1.2rem; right: 1.5rem; opacity: 0.7; }
</style>

