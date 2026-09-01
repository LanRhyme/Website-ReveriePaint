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

const { target, isVisible } = useIntersection({ threshold: 0.22 })
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
    translateY: [14, 0],
    opacity: [0, 1],
    duration: 700,
    easing: 'easeOutExpo'
  })
    .add({
      targets: root.querySelector('.curation-title'),
      translateY: [22, 0],
      opacity: [0, 1],
      duration: 900,
      easing: 'easeOutExpo'
    }, '-=400')
    .add({
      targets: root.querySelector('.curation-essay'),
      translateY: [16, 0],
      opacity: [0, 1],
      duration: 700,
      easing: 'easeOutExpo'
    }, '-=500')
    .add({
      targets: root.querySelectorAll('.telemetry-node'),
      translateY: [14, 0],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(110),
      easing: 'easeOutExpo'
    }, '-=400')
    .add({
      targets: stageRef.value,
      scale: [0.96, 1],
      opacity: [0, 1],
      duration: 1100,
      easing: 'easeOutExpo'
    }, '-=800')
    .add({
      targets: stageRef.value?.querySelectorAll('.stage-corner'),
      scale: [0, 1],
      opacity: [0, 1],
      duration: 500,
      delay: anime.stagger(80),
      easing: 'easeOutBack'
    }, '-=600')

  root.querySelectorAll('.t-num').forEach((el) => {
    const raw = el.textContent.trim()
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''))
    if (!isNaN(num) && String(num) === raw.replace(/,/g, '')) {
      const obj = { v: 0 }
      anime({
        targets: obj,
        v: num,
        duration: 1600,
        easing: 'easeOutExpo',
        update: () => {
          el.textContent = raw.includes('.') ? obj.v.toFixed(raw.split('.')[1]?.length || 0) : Math.round(obj.v).toLocaleString()
        },
        delay: 400
      })
    }
  })
}

watch(isVisible, (v) => { if (v) play() })

onMounted(() => {
  const root = curationRef.value
  if (!root) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  anime.set(root.querySelectorAll('.curation-index, .curation-title, .curation-essay, .telemetry-node'), { opacity: 0 })
  anime.set(stageRef.value, { opacity: 0 })
})

function onStageMove(e) {
  if (window.matchMedia('(pointer: coarse)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const el = stageRef.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const dx = (e.clientX - (r.left + r.width / 2)) / r.width
  const dy = (e.clientY - (r.top + r.height / 2)) / r.height
  anime({
    targets: el,
    translateX: dx * 10,
    translateY: dy * 8,
    rotateY: dx * 3,
    duration: 800,
    easing: 'easeOutQuad'
  })
}
function onStageLeave() {
  anime({
    targets: stageRef.value,
    translateX: 0,
    translateY: 0,
    rotateY: 0,
    duration: 900,
    easing: 'easeOutElastic(1, 0.52)'
  })
}
</script>

<template>
  <section :id="id" ref="target" class="installation-frame" :class="{ visible: isVisible, reverse }">
    <div ref="curationRef" class="installation-curation">
      <span class="curation-index">INSTALLATION / {{ index }}</span>
      <h2 class="curation-title" v-html="title"></h2>
      <p class="curation-essay">{{ essay }}</p>
      <div v-if="specs?.length" class="spec-telemetry">
        <div v-for="(s, i) in specs" :key="i" class="telemetry-node">
          <span class="t-num" v-html="s.value"></span>
          <span class="t-label">{{ s.label }}</span>
        </div>
      </div>
    </div>
    <div ref="stageRef" class="stage-monolith" @mousemove="onStageMove" @mouseleave="onStageLeave">
      <span class="stage-corner corner--tr" aria-hidden="true"></span>
      <span class="stage-corner corner--bl" aria-hidden="true"></span>
      <div class="stage-inner"><slot /></div>
      <div class="stage-glow"></div>
    </div>
  </section>
</template>

<style scoped>
.installation-frame {
  min-height: 100vh;
  padding: 7rem 8vw;
  display: grid;
  grid-template-columns: 0.9fr 1.3fr;
  gap: 5rem;
  align-items: center;
  border-top: 1px solid var(--border-wire);
  position: relative;
  opacity: 1;
}
.installation-frame.reverse { direction: rtl; }
.installation-frame.reverse > * { direction: ltr; }

.installation-curation { display: flex; flex-direction: column; }
.curation-index {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.28em;
  color: var(--c-clay);
  margin-bottom: 1.2rem;
  display: block;
}
.curation-title {
  font-family: var(--font-serif);
  font-size: clamp(2rem, 3.8vw, 3.8rem);
  font-weight: 300;
  line-height: 1.12;
  margin-bottom: 1.6rem;
  letter-spacing: 0.01em;
}
.curation-title :deep(em) { font-style: italic; color: var(--c-sand); }
.curation-essay {
  font-size: 0.88rem;
  line-height: 1.95;
  color: var(--c-mist);
  font-weight: 300;
  letter-spacing: 0.04em;
  margin-bottom: 2.4rem;
  max-width: 460px;
}
.spec-telemetry {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.6rem;
  border-top: 1px solid var(--border-wire);
  padding-top: 1.8rem;
}
.telemetry-node .t-num {
  font-family: var(--font-display);
  font-size: 1.9rem;
  color: var(--c-text);
  display: block;
  font-weight: 400;
  line-height: 1;
}
.telemetry-node .t-num :deep(small) { font-size: 0.9rem; color: var(--c-mist); }
.telemetry-node .t-label {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-mist);
  margin-top: 0.5rem;
  display: block;
}

.stage-monolith {
  aspect-ratio: 16 / 11;
  width: 100%;
  background: rgba(18, 20, 24, 0.45);
  border: 1px solid var(--border-wire);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(40px);
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
  transform-style: preserve-3d;
  will-change: transform;
}
.stage-inner { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; }
.stage-glow {
  position: absolute; inset: -20%;
  background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(213,195,178,0.08), transparent 60%);
  opacity: 0; transition: opacity 0.5s; pointer-events: none;
}
.stage-monolith:hover .stage-glow { opacity: 1; }
.stage-corner { position: absolute; width: 6px; height: 6px; z-index: 2; pointer-events: none; }
.corner--tr { top: 12px; right: 12px; border-top: 1px solid rgba(255,255,255,0.3); border-right: 1px solid rgba(255,255,255,0.3); }
.corner--bl { bottom: 12px; left: 12px; border-bottom: 1px solid rgba(255,255,255,0.3); border-left: 1px solid rgba(255,255,255,0.3); }

/* 平板 */
@media (max-width: 1024px) {
  .installation-frame {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 5rem 6vw;
    min-height: auto;
  }
  .stage-monolith { aspect-ratio: 16 / 10; }
}
/* 手机 */
@media (max-width: 640px) {
  .installation-frame {
    padding: 3.5rem 5vw;
    gap: 2rem;
  }
  .curation-index { font-size: 0.62rem; letter-spacing: 0.22em; margin-bottom: 0.9rem; }
  .curation-title { font-size: clamp(1.7rem, 7vw, 2.2rem); margin-bottom: 1rem; line-height: 1.15; }
  .curation-essay { font-size: 0.82rem; line-height: 1.8; margin-bottom: 1.6rem; }
  .spec-telemetry { gap: 1rem; padding-top: 1.2rem; }
  .telemetry-node .t-num { font-size: 1.5rem; }
  .telemetry-node .t-label { font-size: 0.58rem; }
  .stage-monolith { aspect-ratio: 4 / 3; backdrop-filter: blur(16px); }
}
/* 超小屏 */
@media (max-width: 380px) {
  .spec-telemetry { grid-template-columns: 1fr 1fr; gap: 0.8rem; }
}
</style>
