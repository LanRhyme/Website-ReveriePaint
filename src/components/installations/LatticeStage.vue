<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import anime from 'animejs'

const GRID_SIZE = 4
const TOTAL_TILES = GRID_SIZE * GRID_SIZE
const stageRef = ref(null)
const latticeGridRef = ref(null)
let loopAnim = null
let pulseAnim = null

const tiles = Array.from({ length: TOTAL_TILES }, (_, i) => {
  const row = Math.floor(i / GRID_SIZE)
  const col = i % GRID_SIZE
  const hex = (0x2a + i * 7).toString(16).toUpperCase()
  return {
    id: i,
    row,
    col,
    tag: `0x${hex}`,
    isCore: i === 5 || i === 10
  }
})

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // Entry animation
  anime({
    targets: '.lattice-tile',
    scale: [0, 1],
    opacity: [0, 1],
    translateZ: () => anime.random(20, 80),
    delay: anime.stagger(60, { grid: [GRID_SIZE, GRID_SIZE], from: 'center' }),
    duration: 1200,
    easing: 'easeOutExpo'
  })

  // Continuous 3D wave ripple across the isometric grid
  loopAnim = anime({
    targets: '.lattice-tile',
    translateZ: [
      { value: (el, i) => Math.sin(i) * 20, duration: 1800 },
      { value: (el, i) => 30 + Math.cos(i) * 35, duration: 2200 },
      { value: 0, duration: 2000 }
    ],
    rotateX: [
      { value: -8, duration: 1800 },
      { value: 12, duration: 2200 },
      { value: 0, duration: 2000 }
    ],
    rotateY: [
      { value: 10, duration: 2000 },
      { value: -10, duration: 2000 },
      { value: 0, duration: 2000 }
    ],
    borderColor: [
      { value: 'rgba(255, 255, 255, 0.12)' },
      { value: 'rgba(196, 154, 143, 0.65)' },
      { value: 'rgba(107, 130, 148, 0.55)' },
      { value: 'rgba(213, 195, 178, 0.35)' },
      { value: 'rgba(255, 255, 255, 0.12)' }
    ],
    backgroundColor: [
      { value: 'rgba(18, 20, 24, 0.5)' },
      { value: 'rgba(196, 154, 143, 0.14)' },
      { value: 'rgba(107, 130, 148, 0.18)' },
      { value: 'rgba(18, 20, 24, 0.5)' }
    ],
    delay: anime.stagger(130, { grid: [GRID_SIZE, GRID_SIZE], from: 'center' }),
    duration: 5400,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutQuad'
  })

  // Memory allocation badge pulsing
  pulseAnim = anime({
    targets: '.tile-badge',
    opacity: [0.3, 1],
    scale: [0.92, 1.05],
    delay: anime.stagger(200),
    duration: 1600,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine'
  })
})

function onTileHover(i) {
  anime({
    targets: `.tile-${i}`,
    translateZ: 95,
    scale: 1.08,
    duration: 400,
    easing: 'easeOutBack(2)'
  })
}

function onTileLeave(i) {
  anime({
    targets: `.tile-${i}`,
    scale: 1,
    duration: 600,
    easing: 'easeOutQuad'
  })
}

function onStageMove(e) {
  if (!latticeGridRef.value) return
  const r = stageRef.value.getBoundingClientRect()
  const dx = (e.clientX - (r.left + r.width / 2)) / r.width
  const dy = (e.clientY - (r.top + r.height / 2)) / r.height
  
  anime({
    targets: latticeGridRef.value,
    rotateX: 55 - dy * 18,
    rotateZ: -45 + dx * 18,
    duration: 600,
    easing: 'easeOutQuad'
  })
}

function onStageLeave() {
  if (!latticeGridRef.value) return
  anime({
    targets: latticeGridRef.value,
    rotateX: 55,
    rotateZ: -45,
    duration: 900,
    easing: 'easeOutElastic(1, 0.5)'
  })
}

onUnmounted(() => {
  if (loopAnim) loopAnim.pause()
  if (pulseAnim) pulseAnim.pause()
})
</script>

<template>
  <div ref="stageRef" class="lattice-stage" @mousemove="onStageMove" @mouseleave="onStageLeave">
    <!-- Perspective Stage Floor Plane -->
    <div ref="latticeGridRef" class="isometric-lattice-grid">
      <!-- Underlying Infinite Projection Blueprint Mesh (Radially Faded) -->
      <div class="blueprint-base" aria-hidden="true"></div>

      <!-- 4x4 Sparse Tiles -->
      <div
        v-for="t in tiles"
        :key="t.id"
        :class="['lattice-tile', `tile-${t.id}`, { 'is-core': t.isCore }]"
        :style="{
          left: `${t.col * 64}px`,
          top: `${t.row * 64}px`
        }"
        @mouseenter="onTileHover(t.id)"
        @mouseleave="onTileLeave(t.id)"
      >
        <div class="tile-inner">
          <span class="tile-tag">{{ t.tag }}</span>
          <div class="tile-matrix-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <span v-if="t.isCore" class="tile-badge">64KB</span>
        </div>
        <!-- 3D Extrusion Side Wall illusion -->
        <span class="tile-depth-shadow"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lattice-stage {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  perspective: 1100px;
  user-select: none;
  background: transparent;
}

.isometric-lattice-grid {
  width: 256px;
  height: 256px;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(55deg) rotateZ(-45deg);
  transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.4, 1);
}

.blueprint-base {
  position: absolute;
  inset: -80px;
  border: none;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 32px 32px;
  transform: translateZ(-30px);
  pointer-events: none;
  mask-image: radial-gradient(circle at center, black 35%, transparent 75%);
  -webkit-mask-image: radial-gradient(circle at center, black 35%, transparent 75%);
}

.lattice-tile {
  position: absolute;
  width: 56px;
  height: 56px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(18, 20, 24, 0.55);
  backdrop-filter: blur(12px);
  border-radius: 6px;
  transform-style: preserve-3d;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.3s;
}

.lattice-tile:hover {
  box-shadow: 0 16px 36px rgba(196, 154, 143, 0.3);
  border-color: rgba(236, 230, 216, 0.8) !important;
}

.tile-inner {
  width: 100%;
  height: 100%;
  padding: 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.tile-tag {
  font-family: var(--font-mono);
  font-size: 0.5rem;
  color: var(--c-mist);
  letter-spacing: 0.1em;
}

.tile-matrix-dots {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  width: 12px;
  margin-top: auto;
}

.dot {
  width: 2.5px;
  height: 2.5px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
}

.tile-badge {
  position: absolute;
  bottom: 5px;
  right: 6px;
  font-family: var(--font-mono);
  font-size: 0.48rem;
  color: var(--c-sand);
  background: rgba(196, 154, 143, 0.2);
  padding: 1px 3px;
  border-radius: 3px;
  border: 1px solid rgba(196, 154, 143, 0.4);
}

.is-core {
  border-color: rgba(196, 154, 143, 0.4);
  background: rgba(196, 154, 143, 0.1);
}

.tile-depth-shadow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(0, 0, 0, 0.3);
  transform: translateZ(-8px);
  pointer-events: none;
  filter: blur(4px);
}


</style>

