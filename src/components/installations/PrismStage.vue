<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import anime from 'animejs'
import { createPrismVgpuPipeline } from '../../vgpu/vgpu-renderer.js'

const stageRef = ref(null)
const canvasRef = ref(null)

let pipelineInstance = null
let photonAnim = null
let currentAngle = 0.0

function onMouseMove(e) {
  if (!stageRef.value) return
  const r = stageRef.value.getBoundingClientRect()
  const mx = (e.clientX - r.left) / r.width
  const my = (e.clientY - r.top) / r.height

  // Smooth target beam angle and subtle dispersion modulation
  const targetAngle = (my - 0.5) * 0.5
  const dynamicDisp = 0.65 + Math.abs(mx - 0.5) * 0.35

  anime({
    targets: { angle: currentAngle },
    angle: targetAngle,
    duration: 350,
    easing: 'easeOutQuad',
    update(anim) {
      currentAngle = anim.animatables[0].target.angle
      pipelineInstance?.set({
        mouse: [mx, my],
        beamAngle: currentAngle,
        dispersion: dynamicDisp
      })
    }
  })
}

function onMouseLeave() {
  anime({
    targets: { angle: currentAngle },
    angle: 0,
    duration: 700,
    easing: 'easeOutElastic(1, 0.5)',
    update(anim) {
      currentAngle = anim.animatables[0].target.angle
      pipelineInstance?.set({
        beamAngle: 0,
        dispersion: 0.68
      })
    }
  })
}

onMounted(async () => {
  if (canvasRef.value) {
    pipelineInstance = await createPrismVgpuPipeline(canvasRef.value, {
      refractiveIndex: 1.54,
      dispersion: 0.68,
      intensity: 1.15
    })
  }

  // Floating photon particles along dispersion path
  photonAnim = anime({
    targets: '.photon-dust',
    translateX: (el, i) => [0, 90 + i * 14],
    translateY: () => anime.random(-22, 22),
    opacity: [0, 0.95, 0],
    scale: [0.35, 1.25, 0.3],
    duration: () => anime.random(2200, 3800),
    delay: anime.stagger(160),
    loop: true,
    easing: 'easeOutQuad'
  })
})

onUnmounted(() => {
  pipelineInstance?.dispose?.()
  photonAnim?.pause()
})
</script>

<template>
  <div
    ref="stageRef"
    class="vgpu-prism-stage"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <!-- vgpu WebGPU Prism Canvas -->
    <canvas ref="canvasRef" class="prism-webgpu-canvas"></canvas>

    <!-- Overlay: Photon Particle Flow -->
    <div class="photon-flow-layer" aria-hidden="true">
      <span
        v-for="i in 16"
        :key="`photon-${i}`"
        class="photon-dust"
        :style="{ top: `${40 + (i - 8) * 3}%` }"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.vgpu-prism-stage {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  user-select: none;
  background: transparent;
  mask-image: radial-gradient(ellipse 95% 85% at 50% 50%, black 55%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 95% 85% at 50% 50%, black 55%, transparent 100%);
}

.prism-webgpu-canvas {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

.photon-flow-layer {
  position: absolute;
  left: 45%;
  width: 55%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
.photon-dust {
  position: absolute;
  left: 20px;
  width: 3.5px;
  height: 3.5px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 10px #ffffff, 0 0 16px var(--c-sand);
}
</style>
