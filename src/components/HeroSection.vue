<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap, isFineHoverPointer, prefersReducedMotion } from '../composables/useGsap.js'
import { useI18n } from '../composables/useI18n.js'
import heroCanvas from '../assets/shots/hero-canvas.png'

const { t } = useI18n()

const ready = ref(false)
const heroRef = ref(null)
const stageRef = ref(null)
const plateRef = ref(null)
const shineRef = ref(null)

const brushCount = ref(0)
const blendCount = ref(0)
const filterCount = ref(0)

let tiltX = null
let tiltY = null

function onPlateMouseMove(e) {
  if (!isFineHoverPointer(e) || !plateRef.value) return
  const rect = plateRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5

  // 幅度很小：图版像被指尖轻压，而不是整块翻转
  tiltX?.(x * 5)
  tiltY?.(-y * 5)

  if (shineRef.value) {
    const sx = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const sy = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    shineRef.value.style.background = `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.14) 0%, transparent 55%)`
  }
}

function onPlateMouseLeave(e) {
  if (!isFineHoverPointer(e)) return
  tiltX?.(0)
  tiltY?.(0)
  if (shineRef.value) {
    shineRef.value.style.background = 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.05) 0%, transparent 55%)'
  }
}

function onBtnMouseMove(e) {
  if (!isFineHoverPointer(e)) return
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const dx = e.clientX - rect.left - rect.width / 2
  const dy = e.clientY - rect.top - rect.height / 2
  gsap.to(btn, { x: dx * 0.16, y: dy * 0.16, duration: 0.3, ease: 'power2.out' })
}

function onBtnMouseLeave(e) {
  if (!e?.currentTarget) return
  if (!isFineHoverPointer(e)) {
    gsap.set(e.currentTarget, { x: 0, y: 0 })
    return
  }
  gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.6)' })
}

onMounted(() => {
  requestAnimationFrame(() => {
    ready.value = true
  })

  const reduce = prefersReducedMotion()

  if (!reduce && plateRef.value) {
    tiltX = gsap.quickTo(plateRef.value, 'rotationY', { duration: 0.9, ease: 'power3.out' })
    tiltY = gsap.quickTo(plateRef.value, 'rotationX', { duration: 0.9, ease: 'power3.out' })
    gsap.set(plateRef.value, { transformPerspective: 1600, transformStyle: 'preserve-3d' })

    // 图版随滚动缓慢上移，比正文慢一点，形成纸面层次
    if (stageRef.value) {
      gsap.to(stageRef.value, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.value,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      })
    }
  }

  if (reduce) {
    brushCount.value = 240
    blendCount.value = 25
    filterCount.value = 35
  } else {
    const obj = { b: 0, l: 0, f: 0 }
    gsap.to(obj, {
      b: 240,
      l: 25,
      f: 35,
      duration: 1.6,
      delay: 0.45,
      ease: 'power2.out',
      onUpdate() {
        brushCount.value = Math.round(obj.b)
        blendCount.value = Math.round(obj.l)
        filterCount.value = Math.round(obj.f)
      }
    })
  }
})

onUnmounted(() => {
  gsap.killTweensOf(stageRef.value)
})
</script>

<template>
  <section id="top" ref="heroRef" class="hero" :class="{ ready }">
    <span class="hero-running" aria-hidden="true">ReveriePaint — Android Tablet</span>

    <div class="shell hero-grid">
      <div class="hero-copy">
        <p class="eyebrow hero-eyebrow">{{ t('hero.eyebrow') }}</p>

        <h1 class="hero-title">
          <span class="line-mask"><span class="line-inner">{{ t('hero.titleLine1') }}</span></span>
          <span class="line-mask"><em class="line-inner" style="--d: 90ms">{{ t('hero.titleLine2') }}</em></span>
        </h1>

        <p class="hero-sub">{{ t('hero.sub') }}</p>

        <div class="hero-actions">
          <a class="btn btn-primary" href="/download/" @mousemove="onBtnMouseMove" @mouseleave="onBtnMouseLeave">
            {{ t('hero.downloadApk') }}
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
          <a class="btn btn-quiet" href="/docs/">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v10.766c-.917-.35-2.107-.691-3.287-.811-1.094-.11-2.278-.037-3.213.493V2.687z" fill="currentColor"/>
            </svg>
            {{ t('hero.docs') }}
          </a>
          <a class="btn btn-quiet" href="https://github.com/LanRhyme/ReveriePaint" target="_blank" rel="noopener">
            {{ t('hero.source') }}
          </a>
        </div>
      </div>

      <div ref="stageRef" class="hero-stage">
        <figure class="hero-plate">
          <div ref="plateRef" class="plate">
            <div class="plate-img hero-plate-img">
              <div ref="shineRef" class="plate-shine" aria-hidden="true"></div>
              <img :src="heroCanvas" :alt="t('hero.deviceAlt')" fetchpriority="high" decoding="async" />
            </div>
          </div>
          <figcaption class="plate-cap">
            <b>PL. 01</b>
            <span>{{ t('hero.deviceNote') }}</span>
          </figcaption>
        </figure>
      </div>
    </div>

    <div class="shell">
      <dl class="hero-meta">
        <div>
          <dt>{{ brushCount }}<span class="unit">+</span></dt>
          <dd>{{ t('hero.statBrushes') }}</dd>
        </div>
        <div>
          <dt>{{ blendCount }}<span class="unit">{{ t('hero.unitKinds') }}</span></dt>
          <dd>{{ t('hero.statBlend') }}</dd>
        </div>
        <div>
          <dt>{{ filterCount }}<span class="unit">{{ t('hero.unitKinds') }}</span></dt>
          <dd>{{ t('hero.statFilters') }}</dd>
        </div>
        <div>
          <dt class="is-mono">GPL-3.0</dt>
          <dd>{{ t('hero.statLicense') }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding-top: calc(var(--nav-h) + clamp(40px, 6vh, 72px));
  padding-bottom: var(--sec-air);
  overflow: hidden;
}

/* 左文右图：文案占 1–6 栏，图版从第 7 栏起并越过版心贴到屏幕右边 */
.hero-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--col-gap);
  align-items: center;
}

.hero-copy {
  grid-column: 1 / 6;
}

.hero-stage {
  grid-column: 7 / -1;
}



/* 页边的竖排书脊字：只在宽屏出现，填补左栏外侧的空白 */
.hero-running {
  position: absolute;
  left: calc(var(--gutter) / 3);
  top: 50%;
  writing-mode: vertical-rl;
  transform: translateY(-50%) rotate(180deg);
  font-family: var(--font-mono);
  font-size: 0.5625rem;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--ink-ghost);
  opacity: 0;
  user-select: none;
  pointer-events: none;
}
.ready .hero-running {
  animation: heroFade 1.4s ease 0.8s forwards;
}

.hero-eyebrow {
  opacity: 0;
  font-size: 0.625rem;
  letter-spacing: 0.12em;
  color: var(--ink-soft-2);
}
.ready .hero-eyebrow {
  animation: heroRise 0.8s var(--ease-out-expo) 0.05s forwards;
}

/* ── 标题 ─────────────────────────────────── */
.hero-title {
  margin-top: 22px;
  font-size: clamp(2.05rem, 3.9vw, 3.4rem);
  line-height: 1.16;
  letter-spacing: -0.038em;
  font-weight: 400;
  color: var(--ink-soft);
}
.hero-title em {
  font-style: normal;
  font-weight: 600;
  color: var(--ink);
}

.hero-sub {
  margin-top: 24px;
  max-width: 32em;
  font-size: clamp(0.9375rem, 1.1vw, 1rem);
  line-height: 1.9;
  color: var(--ink-mid);
  opacity: 0;
}
.ready .hero-sub {
  animation: heroRise 0.9s var(--ease-out-expo) 0.3s forwards;
}

/* ── 按钮 ─────────────────────────────────── */
.hero-actions {
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  opacity: 0;
}
.ready .hero-actions {
  animation: heroRise 0.9s var(--ease-out-expo) 0.42s forwards;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.90625rem;
  font-weight: 500;
  padding: 14px 24px;
  border-radius: 3px;
  will-change: transform;
  transition: background var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast);
}
.btn svg {
  transition: transform var(--dur-fast) var(--ease-out-expo);
}
.btn-primary {
  background: var(--ink);
  color: var(--paper);
}
.btn-quiet {
  color: var(--ink-mid);
  border: 1px solid var(--line);
}
@media (hover: hover) and (pointer: fine) {
  .btn-primary:hover {
    background: var(--ink-soft);
  }
  .btn-primary:hover svg {
    transform: translate(2px, -2px);
  }
  .btn-quiet:hover {
    color: var(--ink);
    border-color: var(--ink-ghost);
  }
}

/* ── 图版 ─────────────────────────────────── */
.hero-stage {
  opacity: 0;
  will-change: transform;
}
.ready .hero-stage {
  animation: heroRise 1.1s var(--ease-out-expo) 0.16s forwards;
}


.hero-plate {
  position: relative;
}
.hero-plate-img {
  aspect-ratio: 1024 / 724;
  border-radius: 2px;
  background: var(--ui-900);
  box-shadow:
    0 1px 2px rgba(20, 22, 26, 0.14),
    0 22px 50px rgba(20, 22, 26, 0.16);
  will-change: transform;
}
.plate-shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 55%);
  transition: background 0.15s ease-out;
  mix-blend-mode: overlay;
}
.hero-plate-img img {
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}

/* 图版说明左对齐，避免跟着出血跑到屏幕外 */
.hero-plate .plate-cap {
  justify-content: flex-start;
  text-align: left;
}

/* ── 指标条 ───────────────────────────────── */
.hero-meta {
  margin-top: clamp(44px, 6vh, 72px);
  padding-top: 20px;
  border-top: 1px solid var(--line);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  opacity: 0;
}
.ready .hero-meta {
  animation: heroRise 0.9s var(--ease-out-expo) 0.56s forwards;
}
.hero-meta > div {
  position: relative;
  padding-inline: 0 clamp(16px, 2vw, 32px);
}
.hero-meta > div + div {
  padding-left: clamp(16px, 2vw, 32px);
  border-left: 1px solid var(--line-faint);
}
.hero-meta dt {
  font-size: 1.625rem;
  font-weight: 500;
  letter-spacing: -0.035em;
  font-feature-settings: "tnum";
  line-height: 1.15;
  color: var(--ink);
}
.hero-meta dt .unit {
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: 0;
  color: var(--ink-soft-2);
  margin-left: 3px;
}
.hero-meta dt.is-mono {
  font-family: var(--font-mono);
  font-size: 1.0625rem;
  letter-spacing: 0.06em;
  line-height: 1.75;
}
.hero-meta dd {
  margin-top: 7px;
  font-size: 0.75rem;
  color: var(--ink-soft-2);
}

/* ── 中等屏：图版不再出血，改成上下排 ───────────── */
@media (max-width: 1200px) {
  .hero-running {
    display: none;
  }
}

@media (max-width: 1024px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr);
    row-gap: clamp(32px, 5vh, 52px);
  }
  .hero-copy,
  .hero-stage {
    grid-column: 1;
  }
  .hero-copy {
    max-width: 40em;
  }
  .hero-title {
    font-size: clamp(2.1rem, 6.2vw, 3.2rem);
  }
  .hero-plate .plate-cap {
    justify-content: flex-start;
    text-align: left;
  }
}

@media (max-width: 680px) {
  .hero {
    padding-top: calc(var(--nav-h) + 26px);
    padding-bottom: 40px;
  }
  .hero-eyebrow {
    font-size: 0.625rem;
    letter-spacing: 0.12em;
  }
  .hero-title {
    margin-top: 16px;
    font-size: clamp(1.9rem, 8.4vw, 2.5rem);
    line-height: 1.24;
    letter-spacing: -0.028em;
  }
  .hero-sub {
    margin-top: 18px;
    font-size: 0.90625rem;
    line-height: 1.82;
  }
  .hero-actions {
    margin-top: 24px;
    gap: 8px;
  }
  .hero-actions .btn {
    justify-content: center;
    min-height: 46px;
    padding: 11px 16px;
  }
  .hero-actions .btn-primary {
    flex: 1 1 100%;
  }
  .hero-actions .btn-quiet {
    flex: 1 1 calc(50% - 4px);
    font-size: 0.84375rem;
  }
  .hero-plate-img {
    box-shadow: none;
  }
  .hero-plate .plate-cap {
    margin-top: 12px;
    font-size: 0.625rem;
  }
  .hero-meta {
    margin-top: 34px;
    padding-top: 18px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px 0;
  }
  .hero-meta > div:nth-child(odd) {
    border-left: 0;
    padding-left: 0;
  }
  .hero-meta dt {
    font-size: 1.375rem;
  }
}
</style>

<style>
@keyframes heroRise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes heroFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
