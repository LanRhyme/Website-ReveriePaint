<script setup>
import { ref, watch, onMounted } from 'vue'
import anime from 'animejs'
import { useIntersection } from '../composables/useIntersection.js'

const props = defineProps({
  index: String,
  title: String,
  essay: String,
  specs: Array,
  id: String,
  reverse: Boolean
})

const { target, isVisible } = useIntersection({ threshold: 0.15 })
const curationRef = ref(null)
const stageRef = ref(null)
let hasPlayed = false

function play() {
  if (hasPlayed) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    hasPlayed = true
    return
  }
  hasPlayed = true
  const root = curationRef.value
  if (!root) return
  const tl = anime.timeline({ easing: 'easeOutExpo' })
  tl.add({
    targets: root.querySelector('.curation-index'),
    translateY: [16, 0],
    opacity: [0, 1],
    duration: 700
  })
  .add({
    targets: root.querySelector('.curation-title'),
    translateY: [24, 0],
    opacity: [0, 1],
    duration: 900
  }, '-=450')
  .add({
    targets: root.querySelector('.curation-essay'),
    translateY: [18, 0],
    opacity: [0, 1],
    duration: 750
  }, '-=500')
  .add({
    targets: root.querySelectorAll('.telemetry-node'),
    translateY: [16, 0],
    opacity: [0, 1],
    duration: 650,
    delay: anime.stagger(100)
  }, '-=450')
  .add({
    targets: stageRef.value,
    opacity: [0, 1],
    scale: [0.96, 1],
    duration: 1100,
    easing: 'easeOutExpo'
  }, '-=700')
}

watch(isVisible, (v) => { if (v) play() })

onMounted(() => {
  const root = curationRef.value
  if (!root) return
  anime.set(root.querySelectorAll('.curation-index, .curation-title, .curation-essay, .telemetry-node'), { opacity: 0 })
  anime.set(stageRef.value, { opacity: 0 })
})
</script>

<template>
  <section :id="id" ref="target" class="installation-frame" :class="{ visible: isVisible, reverse }">
    <!-- Fluid background glow blending with section -->
    <div class="frame-ambient-glow" aria-hidden="true"></div>

    <div ref="curationRef" class="installation-curation">
      <span class="curation-index">CHAPTER / {{ index }}</span>
      <h2 class="curation-title" v-html="title"></h2>
      <p class="curation-essay">{{ essay }}</p>
      <div v-if="specs?.length" class="spec-telemetry">
        <div v-for="(s, i) in specs" :key="i" class="telemetry-node">
          <span class="t-num" v-html="s.value"></span>
          <span class="t-label">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <!-- Borderless, fluid animation stage seamlessly integrated into page -->
    <div ref="stageRef" class="stage-fluid-canvas">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.installation-frame {
  min-height: 100vh;
  min-height: 100dvh;
  padding: 8rem 8vw;
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: 5rem;
  align-items: center;
  position: relative;
  overflow: visible;
}
.installation-frame::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8vw;
  right: 8vw;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07) 20%, rgba(255, 255, 255, 0.07) 80%, transparent);
}
.installation-frame.reverse {
  direction: rtl;
}
.installation-frame.reverse > * {
  direction: ltr;
}

.frame-ambient-glow {
  position: absolute;
  top: 15%;
  right: 0%;
  width: 75vw;
  height: 70vh;
  background: radial-gradient(ellipse at center, rgba(196, 154, 143, 0.06) 0%, rgba(107, 130, 148, 0.03) 50%, transparent 75%);
  pointer-events: none;
  z-index: 0;
  filter: blur(60px);
}
.installation-frame.reverse .frame-ambient-glow {
  right: auto;
  left: 0%;
  background: radial-gradient(ellipse at center, rgba(107, 130, 148, 0.06) 0%, rgba(213, 195, 178, 0.03) 50%, transparent 75%);
}

.installation-curation {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
}
.curation-index {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.32em;
  color: var(--c-clay);
  margin-bottom: 1.4rem;
  display: block;
}
.curation-title {
  font-family: var(--font-serif);
  font-size: clamp(2.3rem, 4.4vw, 4.2rem);
  font-weight: 300;
  line-height: 1.2;
  margin-bottom: 1.8rem;
  letter-spacing: 0.03em;
  color: var(--c-text);
}
.curation-title :deep(em) {
  font-family: var(--font-serif);
  font-style: normal;
  color: var(--c-sand);
  font-weight: 400;
  letter-spacing: 0.04em;
}
.curation-essay {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  line-height: 2.1;
  color: var(--c-mist);
  font-weight: 300;
  letter-spacing: 0.04em;
  margin-bottom: 2.6rem;
  max-width: 520px;
}
.spec-telemetry {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  position: relative;
  padding-top: 2rem;
  max-width: 480px;
}
.spec-telemetry::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 60px;
  height: 1px;
  background: var(--c-clay);
}
.telemetry-node .t-num {
  font-family: var(--font-display);
  font-size: 2.2rem;
  color: var(--c-text);
  display: block;
  font-weight: 400;
  line-height: 1;
  font-feature-settings: var(--font-feature-tabular);
}
.telemetry-node .t-num :deep(small) {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--c-mist);
  margin-left: 0.3rem;
  letter-spacing: 0.08em;
}
.telemetry-node .t-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--c-mist);
  margin-top: 0.6rem;
  display: block;
}

/* Borderless fluid canvas: blends seamlessly with section */
.stage-fluid-canvas {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 540px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  overflow: visible;
}

@media (max-width: 1024px) {
  .installation-frame {
    grid-template-columns: 1fr;
    gap: 3.5rem;
    padding: 6rem 6vw;
    min-height: auto;
  }
  .stage-fluid-canvas {
    height: 440px;
  }
}

@media (max-width: 640px) {
  .installation-frame {
    padding: 4rem 5vw;
    gap: 2.5rem;
  }
  .curation-title {
    font-size: clamp(1.8rem, 7.5vw, 2.4rem);
    line-height: 1.2;
  }
  .curation-essay {
    font-size: 0.88rem;
    line-height: 1.85;
  }
  .stage-fluid-canvas {
    height: 360px;
  }
}
</style>
