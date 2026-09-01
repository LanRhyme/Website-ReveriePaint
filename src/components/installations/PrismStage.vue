<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import anime from 'animejs'

const stageRef = ref(null)
const prismCoreRef = ref(null)
let raysAnim = null
let coreAnim = null
let pulseAnim = null
let mouseX = 0.5
let mouseY = 0.5
let targetMouseX = 0.5
let targetMouseY = 0.5

const RAY_COUNT = 16
const morandiRays = [
  { grad: 'linear-gradient(90deg, rgba(236,230,216,0.9), rgba(157,169,142,0.85), transparent)', color: 'var(--ip-moss)', lambda: '520nm' },
  { grad: 'linear-gradient(90deg, rgba(236,230,216,0.9), rgba(195,163,158,0.85), transparent)', color: 'var(--ip-bean)', lambda: '560nm' },
  { grad: 'linear-gradient(90deg, rgba(236,230,216,0.9), rgba(143,163,180,0.85), transparent)', color: 'var(--ip-haze)', lambda: '480nm' },
  { grad: 'linear-gradient(90deg, rgba(236,230,216,0.9), rgba(200,180,141,0.85), transparent)', color: 'var(--ip-sand)', lambda: '590nm' },
  { grad: 'linear-gradient(90deg, rgba(236,230,216,0.9), rgba(167,155,182,0.85), transparent)', color: 'var(--ip-mauve)', lambda: '430nm' },
  { grad: 'linear-gradient(90deg, rgba(236,230,216,0.9), rgba(196,154,143,0.85), transparent)', color: 'var(--c-clay)', lambda: '630nm' }
]

const rays = Array.from({ length: RAY_COUNT }, (_, i) => {
  const m = morandiRays[i % morandiRays.length]
  const baseAngle = -36 + (i / (RAY_COUNT - 1)) * 72
  return {
    id: i,
    baseAngle,
    grad: m.grad,
    color: m.color,
    lambda: m.lambda
  }
})

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // Continuous chromatic dispersion wave
  raysAnim = anime({
    targets: '.dispersion-ray',
    rotate: (el, i) => {
      const base = rays[i].baseAngle
      return [base - 8, base + 8]
    },
    scaleX: [0.75, 1.25],
    opacity: [0.25, 0.85, 0.25],
    delay: anime.stagger(90, { from: 'center' }),
    duration: 3600,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine'
  })

  // Core prism gyroscopic multi-axis rotation and breathing
  coreAnim = anime({
    targets: '.prism-facet-outer',
    rotate: [45, 405],
    duration: 24000,
    loop: true,
    easing: 'linear'
  })

  anime({
    targets: '.prism-facet-inner',
    rotate: [0, -360],
    scale: [0.9, 1.1, 0.9],
    duration: 16000,
    loop: true,
    easing: 'easeInOutSine'
  })

  // Spectral photon sparkles along dispersion field
  pulseAnim = anime({
    targets: '.photon-sparkle',
    translateX: (el, i) => [0, 160 + i * 15],
    opacity: [0, 0.9, 0],
    scale: [0.5, 1.2, 0.2],
    delay: anime.stagger(220),
    duration: 2400,
    loop: true,
    easing: 'easeOutQuad'
  })
})

function onMouseMove(e) {
  if (!stageRef.value) return
  const r = stageRef.value.getBoundingClientRect()
  targetMouseX = (e.clientX - r.left) / r.width
  targetMouseY = (e.clientY - r.top) / r.height

  anime({
    targets: '.incident-beam',
    rotate: -15 + (targetMouseY - 0.5) * 30,
    duration: 400,
    easing: 'easeOutQuad'
  })
}

function onMouseLeave() {
  anime({
    targets: '.incident-beam',
    rotate: 0,
    duration: 800,
    easing: 'easeOutElastic(1, 0.5)'
  })
}

onUnmounted(() => {
  if (raysAnim) raysAnim.pause()
  if (coreAnim) coreAnim.pause()
  if (pulseAnim) pulseAnim.pause()
})
</script>

<template>
  <div ref="stageRef" class="prism-stage" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
    <!-- Incident White Light Beam -->
    <div class="incident-beam-wrap">
      <div class="incident-beam">
        <span class="incident-line"></span>
        <span class="incident-label">INCIDENT λ0</span>
      </div>
    </div>

    <!-- Central Chromatic Dispersion Prism Chamber -->
    <div class="prism-assembly">
      <!-- Outer Gyroscopic Facet -->
      <div class="prism-facet-outer">
        <span class="prism-edge-glow"></span>
      </div>

      <!-- Inner Morandi Refraction Crystal -->
      <div class="prism-facet-inner">
        <div class="prism-core-gem">
          <span class="core-dot"></span>
        </div>
      </div>
    </div>

    <!-- Refracted Morandi Dispersion Rays Fan -->
    <div class="dispersion-fan">
      <div
        v-for="r in rays"
        :key="r.id"
        class="dispersion-ray"
        :style="{
          background: r.grad,
          transform: `rotate(${r.baseAngle}deg)`
        }"
      >
        <span v-if="r.id % 4 === 0" class="ray-tag" :style="{ color: r.color }">{{ r.lambda }}</span>
      </div>

      <!-- Photon Floating Dust -->
      <div v-for="i in 8" :key="`spark-${i}`" class="photon-sparkle" :style="{ top: `${(i - 4) * 16}px` }"></div>
    </div>

    <!-- HUD Spectral Readout -->
    <div class="hud-badge hud-top-left">THIN-FILM INTERFERENCE · ΔE &lt; 0.8</div>
    <div class="hud-badge hud-bottom-right">CHROMA DISPERSION · 32-BIT FLOAT</div>
  </div>
</template>

<style scoped>
.prism-stage {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
}

/* Incident Light Source on Left */
.incident-beam-wrap {
  position: absolute;
  left: 0;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 38px;
  pointer-events: none;
  z-index: 2;
}
.incident-beam {
  position: relative;
  width: 100%;
  max-width: 220px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  transform-origin: right center;
}
.incident-line {
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.95));
  box-shadow: 0 0 16px rgba(255, 255, 255, 0.8), 0 0 32px rgba(213, 195, 178, 0.4);
}
.incident-label {
  position: absolute;
  top: -14px;
  right: 16px;
  font-family: var(--font-mono);
  font-size: 0.5rem;
  color: var(--c-sand);
  letter-spacing: 0.15em;
}

/* Central Prism Assembly */
.prism-assembly {
  position: relative;
  width: 84px;
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.prism-facet-outer {
  position: absolute;
  width: 72px;
  height: 72px;
  border: 1px solid rgba(236, 230, 216, 0.4);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  box-shadow: inset 0 0 20px rgba(196, 154, 143, 0.15), 0 0 30px rgba(107, 130, 148, 0.2);
  border-radius: 4px;
}

.prism-facet-inner {
  position: absolute;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(196, 154, 143, 0.5);
  background: rgba(18, 20, 24, 0.6);
  backdrop-filter: blur(24px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}

.prism-core-gem {
  width: 12px;
  height: 12px;
  background: var(--c-sand);
  border-radius: 50%;
  filter: blur(1px);
  box-shadow: 0 0 18px var(--c-sand);
}

/* Refracted Dispersion Rays Fan on Right */
.dispersion-fan {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 50%;
  height: 2px;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 4;
}

.dispersion-ray {
  position: absolute;
  left: 0;
  top: 0;
  width: 240px;
  height: 1.8px;
  transform-origin: left center;
  border-radius: 0 2px 2px 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 20px;
}

.ray-tag {
  font-family: var(--font-mono);
  font-size: 0.48rem;
  letter-spacing: 0.12em;
  opacity: 0.8;
  transform: translateY(-8px);
}

.photon-sparkle {
  position: absolute;
  left: 20px;
  width: 3px;
  height: 3px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
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

