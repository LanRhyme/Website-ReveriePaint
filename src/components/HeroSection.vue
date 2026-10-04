<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap, ScrollTrigger, isFineHoverPointer } from '../composables/useGsap.js'
import { useI18n } from '../composables/useI18n.js'
import ThreeFluidSculpture from './ThreeFluidSculpture.vue'
import heroCanvas from '../assets/shots/hero-canvas.webp'
import heroCanvasSm from '../assets/shots/hero-canvas-sm.webp'

const { t, isEn } = useI18n()

const ready = ref(false)
const activeHeroView = ref('3d')
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
  if (!isFineHoverPointer(e)) return
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

function onHeroMouseLeave(e) {
  if (!isFineHoverPointer(e)) return
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
  if (!isFineHoverPointer(e)) return
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const dx = e.clientX - rect.left - rect.width / 2
  const dy = e.clientY - rect.top - rect.height / 2
  gsap.to(btn, { x: dx * 0.22, y: dy * 0.22 - 2, duration: 0.3, ease: 'power1.out' })
}

function onBtnMouseLeave(e) {
  if (!isFineHoverPointer(e)) {
    if (e?.currentTarget) gsap.set(e.currentTarget, { x: 0, y: 0 })
    return
  }
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

    // 滚动景深视差
    scrollCtx = gsap.matchMedia(heroRef.value)
    scrollCtx.add('(min-width: 961px)', () => {
      gsap.to(deviceRef.value, {
        yPercent: 12,
        rotationZ: -1.2,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.value,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      })
    })
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
    class="hero lusion-hero"
    :class="{ ready }"
    @mousemove="onHeroMouseMove"
    @mouseleave="onHeroMouseLeave"
  >
    <div ref="washRef" class="hero-wash" aria-hidden="true"></div>

    <div class="shell hero-content-center">
      <!-- 顶部小标与巨幕标题 -->
      <div class="hero-top-block">
        <p class="eyebrow hero-eyebrow">
          <span class="dot" aria-hidden="true"></span>
          {{ t('hero.eyebrow') }}
        </p>

        <h1 class="hero-title lusion-mega-title">
          <span class="line-mask"><span class="line-inner">{{ t('hero.titleLine1') }}</span></span>
          <span class="line-mask"><em class="line-inner line-delay-1">{{ t('hero.titleLine2') }}</em></span>
        </h1>

        <p class="hero-sub lusion-sub">
          {{ t('hero.sub') }}
        </p>

        <div class="hero-actions lusion-actions">
          <a
            class="btn btn-primary"
            href="/download/"
            data-cursor="DOWNLOAD"
            @mousemove="onBtnMouseMove"
            @mouseleave="onBtnMouseLeave"
          >
            {{ t('hero.downloadApk') }}
          </a>
          <a
            class="btn btn-secondary btn-docs"
            href="/docs/"
            data-cursor="DOCS"
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
            data-cursor="GITHUB"
            @mousemove="onBtnMouseMove"
            @mouseleave="onBtnMouseLeave"
          >
            {{ t('hero.source') }}
          </a>
        </div>
      </div>

      <!-- 舞台区：悬浮硬件设备与微交互 -->
      <div class="hero-device lusion-stage-device">
        <div class="hero-view-toggle">
          <button
            type="button"
            class="toggle-pill"
            :class="{ active: activeHeroView === '3d' }"
            data-cursor="SCULPT"
            @click="activeHeroView = '3d'"
          >
            <span>3D Fluid Sculpt</span>
          </button>
          <button
            type="button"
            class="toggle-pill"
            :class="{ active: activeHeroView === 'canvas' }"
            data-cursor="UI"
            @click="activeHeroView = 'canvas'"
          >
            <span>App Canvas</span>
          </button>
        </div>

        <div ref="deviceRef" class="device" data-cursor="INTERACT">
          <div class="device-screen">
            <div ref="shineRef" class="device-shine" aria-hidden="true"></div>

            <transition name="fade-view">
              <div v-show="activeHeroView === '3d'" class="view-3d-wrap">
                <ThreeFluidSculpture />
                <div class="sculpture-hint">
                  <span>{{ isEn ? 'Click & Drag to deform 3D ink drop' : '按住鼠标拖拽拉伸 3D 彩墨流体雕塑' }}</span>
                </div>
              </div>
            </transition>

            <transition name="fade-view">
              <img
                v-show="activeHeroView === 'canvas'"
                :src="heroCanvas"
                :srcset="`${heroCanvasSm} 1000w, ${heroCanvas} 2000w`"
                sizes="(max-width: 960px) 90vw, 980px"
                :alt="t('hero.deviceAlt')"
                fetchpriority="high"
                decoding="async"
              />
            </transition>
          </div>
        </div>
        <p class="device-note">{{ activeHeroView === '3d' ? (isEn ? 'Real-time WebGL Physical Vertex Simulation' : 'Three.js 实时物理级顶点流体变形与 PBR 渲染') : t('hero.deviceNote') }}</p>
      </div>

      <!-- 底部指标浮带 -->
      <dl class="hero-facts lusion-facts">
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
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding: clamp(100px, 13vh, 140px) 0 clamp(64px, 8vh, 96px);
  overflow: hidden;
}

.hero-content-center {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 1100px;
  margin-inline: auto;
}

.hero-top-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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

.lusion-mega-title {
  font-size: clamp(2.6rem, 6.2vw, 5.2rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
  font-weight: 400;
  color: var(--ink-mid);
  opacity: 0;
  max-width: 22ch;
  margin-inline: auto;
}
.lusion-mega-title em {
  font-style: normal;
  font-weight: 600;
  color: var(--ink);
}
.ready .lusion-mega-title {
  animation: heroRise 1s var(--ease-out-expo) 0.14s forwards;
}

.lusion-sub {
  margin-top: 24px;
  max-width: 58ch;
  margin-inline: auto;
  font-size: clamp(1rem, 1.35vw, 1.15rem);
  line-height: 1.85;
  color: var(--ink-mid);
  opacity: 0;
}
.lusion-sub b {
  color: var(--ink);
  font-weight: 500;
}
.ready .lusion-sub {
  animation: heroRise 1s var(--ease-out-expo) 0.26s forwards;
}

.lusion-actions {
  margin-top: 36px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  opacity: 0;
}
.ready .lusion-actions {
  animation: heroRise 1s var(--ease-out-expo) 0.36s forwards;
}

.lusion-stage-device {
  width: 100%;
  max-width: 920px;
  margin-top: clamp(48px, 6vh, 68px);
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
.btn-secondary {
  color: var(--ink);
  background: rgba(20, 22, 26, 0.05);
  border: 1px solid var(--line-strong);
}
.btn-ghost {
  color: var(--ink);
  border: 1px solid var(--line-strong);
  background: rgba(253, 252, 250, 0.55);
}

@media (hover: hover) and (pointer: fine) {
  .btn-primary:hover {
    background: var(--ink-soft);
    box-shadow: var(--shadow-l);
  }
  .btn-secondary:hover {
    background: rgba(20, 22, 26, 0.09);
    border-color: var(--ink);
  }
  .btn-ghost:hover {
    border-color: var(--ink);
  }
}

.hero-facts {
  margin-top: clamp(40px, 5vh, 60px);
  padding-top: 28px;
  border-top: 1px solid var(--line-faint);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(32px, 5vw, 64px);
  width: 100%;
  max-width: 820px;
  opacity: 0;
}
.ready .hero-facts {
  animation: heroRise 0.9s var(--ease-out-expo) 0.46s forwards;
}
.hero-facts dt {
  font-size: 1.35rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  font-feature-settings: "tnum";
  line-height: 1.2;
}
.hero-facts dd {
  margin-top: 4px;
  font-size: 0.8rem;
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

/* ── 3D 流体雕塑容器与视图切换器 ──────────────── */
.hero-view-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-bottom: 12px;
}
.toggle-pill {
  appearance: none;
  border: 1px solid var(--line-faint);
  background: rgba(253, 252, 250, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-family: inherit;
  font-weight: 500;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.25s var(--ease-out-expo);
}
.toggle-pill:hover {
  border-color: var(--ink-ghost);
  color: var(--ink);
}
.toggle-pill.active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
  box-shadow: 0 2px 8px rgba(20, 22, 26, 0.16);
}

.view-3d-wrap {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, #f6f5f1 0%, #e2dfd7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.sculpture-hint {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.72rem;
  color: var(--ink-ghost);
  letter-spacing: 0.04em;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 3px 12px;
  border-radius: 999px;
  pointer-events: none;
  border: 1px solid rgba(20, 22, 26, 0.06);
  z-index: 2;
  white-space: nowrap;
}

.fade-view-enter-active,
.fade-view-leave-active {
  transition: opacity 0.35s ease;
}
.fade-view-enter-from,
.fade-view-leave-to {
  opacity: 0;
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
