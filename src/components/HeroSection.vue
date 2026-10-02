<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap, ScrollTrigger } from '../composables/useGsap.js'
import { useI18n } from '../composables/useI18n.js'
import heroCanvas from '../assets/shots/hero-canvas.webp'
import heroCanvasSm from '../assets/shots/hero-canvas-sm.webp'

const { t, isEn } = useI18n()

const ready = ref(false)
const heroRef = ref(null)
const deviceRef = ref(null)
const shineRef = ref(null)
const washRef = ref(null)

const brushCount = ref(0)
const blendCount = ref(0)
const filterCount = ref(0)

let deviceQuickToX = null
let deviceQuickToY = null
let scrollCtx = null

function onHeroMouseMove(e) {
  if (!deviceRef.value || !heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5

  if (deviceQuickToX && deviceQuickToY) {
    deviceQuickToX(x * 10)
    deviceQuickToY(-y * 10)
  }

  if (shineRef.value) {
    const shineX = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const shineY = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    shineRef.value.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.18) 0%, transparent 62%)`
  }
}

function onHeroMouseLeave() {
  if (deviceQuickToX && deviceQuickToY) {
    deviceQuickToX(0)
    deviceQuickToY(0)
  }
  if (shineRef.value) {
    shineRef.value.style.background = 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 62%)'
  }
}

function onOrientation(e) {
  if (e.gamma == null || e.beta == null) return
  const tiltY = Math.max(-10, Math.min(10, e.gamma * 0.35))
  const tiltX = Math.max(-10, Math.min(10, (e.beta - 45) * 0.35))
  if (deviceQuickToX && deviceQuickToY) {
    deviceQuickToX(tiltY)
    deviceQuickToY(-tiltX)
  }
  if (shineRef.value) {
    const shineX = Math.round(50 + tiltY * 3.5)
    const shineY = Math.round(50 + tiltX * 3.5)
    shineRef.value.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.16) 0%, transparent 62%)`
  }
}

function onBtnMouseMove(e) {
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const dx = e.clientX - rect.left - rect.width / 2
  const dy = e.clientY - rect.top - rect.height / 2
  gsap.to(btn, { x: dx * 0.22, y: dy * 0.22 - 2, duration: 0.3, ease: 'power1.out' })
}

function onBtnMouseLeave(e) {
  gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.45)' })
}

onMounted(() => {
  requestAnimationFrame(() => {
    ready.value = true
  })

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!reduceMotion && deviceRef.value) {
    deviceQuickToX = gsap.quickTo(deviceRef.value, 'rotationY', { duration: 0.7, ease: 'power2.out' })
    deviceQuickToY = gsap.quickTo(deviceRef.value, 'rotationX', { duration: 0.7, ease: 'power2.out' })
    gsap.set(deviceRef.value, { transformPerspective: 1100, transformStyle: 'preserve-3d' })

    // 移动端/平板设备陀螺仪体感倾斜
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
      window.addEventListener('deviceorientation', onOrientation, { passive: true })
    }

    if (washRef.value) {
      gsap.to(washRef.value, {
        scale: 1.06,
        rotation: 2.5,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    }

    // 针对手机与平板：首屏设备随页面滚动纵深后退折叠
    scrollCtx = gsap.matchMedia(heroRef.value)
    scrollCtx.add('(max-width: 960px)', () => {
      gsap.to(deviceRef.value, {
        rotationX: 10,
        scale: 0.94,
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.value,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      })
    })
  }

  if (reduceMotion) {
    brushCount.value = 240
    blendCount.value = 25
    filterCount.value = 35
  } else {
    const obj = { b: 0, l: 0, f: 0 }
    gsap.to(obj, {
      b: 240,
      l: 25,
      f: 35,
      duration: 1.8,
      delay: 0.35,
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
  window.removeEventListener('deviceorientation', onOrientation)
  scrollCtx?.revert()
})
</script>

<template>
  <section
    id="top"
    ref="heroRef"
    class="hero"
    :class="{ ready }"
    @mousemove="onHeroMouseMove"
    @mouseleave="onHeroMouseLeave"
  >
    <div ref="washRef" class="hero-wash" aria-hidden="true"></div>

    <div class="shell hero-grid">
      <!-- 左：文案 -->
      <div class="hero-copy">
        <p class="eyebrow hero-eyebrow">
          <span class="dot" aria-hidden="true"></span>
          {{ t('hero.eyebrow') }}
        </p>

        <h1 class="hero-title">
          {{ t('hero.titleLine1') }}<br />
          <em>{{ t('hero.titleLine2') }}</em>
        </h1>

        <p class="hero-sub">
          {{ t('hero.sub') }}
        </p>

        <div class="hero-actions">
          <a
            class="btn btn-primary"
            href="https://github.com/LanRhyme/ReveriePaint/releases"
            target="_blank"
            rel="noopener"
            @mousemove="onBtnMouseMove"
            @mouseleave="onBtnMouseLeave"
          >
            {{ t('hero.downloadApk') }}
          </a>
          <a
            class="btn btn-secondary btn-docs"
            href="/docs/"
            @mousemove="onBtnMouseMove"
            @mouseleave="onBtnMouseLeave"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v10.766c-.917-.35-2.107-.691-3.287-.811-1.094-.11-2.278-.037-3.213.493V2.687z" fill="currentColor"/>
            </svg>
            <span>{{ t('hero.docs') }}</span>
          </a>
          <a
            class="btn btn-ghost"
            href="https://github.com/LanRhyme/ReveriePaint"
            target="_blank"
            rel="noopener"
            @mousemove="onBtnMouseMove"
            @mouseleave="onBtnMouseLeave"
          >
            {{ t('hero.source') }}
          </a>
        </div>

        <dl class="hero-facts">
          <div>
            <dt>{{ brushCount }}+</dt>
            <dd>{{ t('hero.statBrushes') }}</dd>
          </div>
          <div>
            <dt>{{ blendCount }}{{ t('hero.unitKinds') }}</dt>
            <dd>{{ t('hero.statBlend') }}</dd>
          </div>
          <div>
            <dt>{{ filterCount }}{{ t('hero.unitKinds') }}</dt>
            <dd>{{ t('hero.statFilters') }}</dd>
          </div>
          <div>
            <dt>GPL-3.0</dt>
            <dd>{{ t('hero.statLicense') }}</dd>
          </div>
        </dl>
      </div>

      <!-- 右：设备框 -->
      <div class="hero-device">
        <div ref="deviceRef" class="device">
          <div class="device-screen">
            <div ref="shineRef" class="device-shine" aria-hidden="true"></div>
            <img
              :src="heroCanvas"
              :srcset="`${heroCanvasSm} 1000w, ${heroCanvas} 2000w`"
              sizes="(max-width: 960px) 90vw, 760px"
              :alt="t('hero.deviceAlt')"
              fetchpriority="high"
              decoding="async"
            />
          </div>
        </div>
        <p class="device-note">{{ t('hero.deviceNote') }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding: clamp(104px, 14vh, 156px) 0 clamp(56px, 8vh, 88px);
  overflow: hidden;
}

.hero-wash {
  position: absolute;
  inset: -24% -12% auto -12%;
  height: 118%;
  pointer-events: none;
  background:
    radial-gradient(42% 32% at 78% 14%, rgba(143, 163, 180, 0.14) 0%, transparent 68%),
    radial-gradient(36% 28% at 6% 4%, rgba(195, 163, 158, 0.11) 0%, transparent 66%),
    radial-gradient(50% 38% at 44% 70%, rgba(200, 180, 141, 0.09) 0%, transparent 70%);
  filter: blur(6px);
}

.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  align-items: center;
  gap: clamp(40px, 5vw, 76px);
}

/* ── 文案 ─────────────────────────────────── */
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 24px;
  opacity: 0;
}
.hero-eyebrow .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--moss);
  box-shadow: 0 0 0 3px rgba(157, 169, 142, 0.2);
}
.ready .hero-eyebrow {
  animation: heroRise 0.85s var(--ease-out-expo) 0.05s forwards;
}

.hero-title {
  font-size: clamp(1.9rem, 4.1vw, 3.15rem);
  line-height: 1.26;
  letter-spacing: -0.032em;
  font-weight: 400;
  color: var(--ink-mid);
  opacity: 0;
}
.hero-title em {
  font-style: normal;
  font-weight: 600;
  color: var(--ink);
}
.ready .hero-title {
  animation: heroRise 1s var(--ease-out-expo) 0.14s forwards;
}

.hero-sub {
  margin-top: 26px;
  max-width: 46ch;
  font-size: clamp(0.9375rem, 1.25vw, 1.0625rem);
  line-height: 1.92;
  color: var(--ink-mid);
  opacity: 0;
}
.hero-sub b {
  color: var(--ink);
  font-weight: 500;
}
.ready .hero-sub {
  animation: heroRise 1s var(--ease-out-expo) 0.26s forwards;
}

.hero-actions {
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
  opacity: 0;
}
.ready .hero-actions {
  animation: heroRise 1s var(--ease-out-expo) 0.36s forwards;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  padding: 13px 26px;
  border-radius: 999px;
  will-change: transform;
  transition: background 0.3s, border-color 0.3s, box-shadow 0.35s;
}
.btn-primary {
  background: var(--ink);
  color: var(--paper);
  box-shadow: var(--shadow-m);
}
.btn-primary:hover {
  background: var(--ink-soft);
  box-shadow: var(--shadow-l);
}
.btn-secondary {
  color: var(--ink);
  background: rgba(20, 22, 26, 0.05);
  border: 1px solid var(--line-strong);
}
.btn-secondary:hover {
  background: rgba(20, 22, 26, 0.09);
  border-color: var(--ink);
}
.btn-ghost {
  color: var(--ink);
  border: 1px solid var(--line-strong);
  background: rgba(253, 252, 250, 0.55);
}
.btn-ghost:hover {
  border-color: var(--ink);
}

.hero-facts {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--line-faint);
  display: flex;
  flex-wrap: wrap;
  gap: clamp(24px, 3.4vw, 44px);
  opacity: 0;
}
.ready .hero-facts {
  animation: heroRise 0.9s var(--ease-out-expo) 0.46s forwards;
}
.hero-facts dt {
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  font-feature-settings: "tnum";
  line-height: 1.2;
}
.hero-facts dd {
  margin-top: 3px;
  font-size: 0.75rem;
  color: var(--ink-soft-2);
}

/* ── 设备框 ───────────────────────────────── */
.hero-device {
  position: relative;
  opacity: 0;
  perspective: 1100px;
}
.ready .hero-device {
  animation: heroRise 1.2s var(--ease-out-expo) 0.2s forwards;
}

.device {
  /* 深色平板边框，圆角与内边距模拟真实设备 */
  position: relative;
  padding: 13px;
  border-radius: 22px;
  background: linear-gradient(158deg, #34383e 0%, #1c1f23 42%, #121417 100%);
  box-shadow:
    0 2px 3px rgba(20, 22, 26, 0.14),
    0 18px 40px rgba(20, 22, 26, 0.2),
    0 44px 90px rgba(20, 22, 26, 0.16);
  transform-style: preserve-3d;
  will-change: transform;
}
/* 屏幕外圈高光，做出金属收边 */
.device::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 17px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  pointer-events: none;
}

.device-screen {
  position: relative;
  border-radius: 11px;
  overflow: hidden;
  background: #eceae6;
  aspect-ratio: 16 / 10;
}
.device-shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  border-radius: inherit;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 62%);
  transition: background 0.12s ease-out;
  mix-blend-mode: overlay;
}
.device-screen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}

.device-note {
  margin-top: 14px;
  text-align: right;
  font-size: 0.75rem;
  color: var(--ink-ghost);
  letter-spacing: 0.03em;
}

@media (max-width: 960px) {
  .hero {
    padding: clamp(84px, 12vh, 120px) 0 52px;
  }
  .hero-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 44px;
    max-width: 700px;
    margin-inline: auto;
  }
  .hero-copy {
    width: 100%;
  }
  .hero-device {
    order: 2;
    width: 100%;
  }
  .device-note {
    text-align: center;
  }
}

@media (max-width: 680px) {
  .hero {
    padding-top: calc(var(--nav-h, 68px) + 20px);
    padding-bottom: 44px;
  }
  .hero-eyebrow {
    font-size: 0.6875rem;
    gap: 7px;
    margin-bottom: 18px;
    line-height: 1.5;
    flex-wrap: wrap;
  }
  .hero-title {
    font-size: clamp(2rem, 7.8vw, 2.65rem);
    line-height: 1.22;
    letter-spacing: -0.025em;
  }
  .hero-sub {
    margin-top: 18px;
    font-size: 0.9375rem;
    line-height: 1.78;
  }
  .hero-actions {
    margin-top: 24px;
    gap: 10px;
    width: 100%;
  }
  .hero-actions .btn {
    flex: 1 1 calc(50% - 6px);
    min-width: 138px;
    min-height: 48px;
    padding: 12px 16px;
    justify-content: center;
    text-align: center;
  }
  .hero-actions .btn-ghost {
    flex-basis: 100%;
  }
  .hero-facts {
    margin-top: 32px;
    padding-top: 20px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 20px;
  }
  .device {
    padding: 9px;
    border-radius: 18px;
  }
  .device::after {
    inset: 4px;
    border-radius: 14px;
  }
  .device-screen {
    border-radius: 10px;
  }
}

@media (max-width: 440px) {
  .hero-actions .btn {
    flex-basis: 100%;
  }
}
</style>

<style>
@keyframes heroRise {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
