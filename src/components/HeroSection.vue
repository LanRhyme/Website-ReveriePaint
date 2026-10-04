<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap, ScrollTrigger, isFineHoverPointer } from '../composables/useGsap.js'
import { useI18n } from '../composables/useI18n.js'
import { useSound } from '../composables/useSound.js'
import heroCanvas from '../assets/shots/hero-canvas.png'

const { t } = useI18n()
const { playHover, playClick } = useSound()

const isReady = ref(false)
const heroRef = ref(null)
const stageRef = ref(null)
const glossRef = ref(null)

const brushCount = ref(0)
const blendCount = ref(0)
const filterCount = ref(0)

let stageQuickX = null
let stageQuickY = null
let scrollTriggerInstance = null

function onHeroMouseMove(e) {
  if (!isFineHoverPointer(e)) return
  if (!stageRef.value || !heroRef.value) return

  const rect = heroRef.value.getBoundingClientRect()
  const normX = (e.clientX - rect.left) / rect.width - 0.5
  const normY = (e.clientY - rect.top) / rect.height - 0.5

  if (stageQuickX && stageQuickY) {
    stageQuickX(normX * 8)
    stageQuickY(-normY * 8)
  }

  if (glossRef.value) {
    const gx = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const gy = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    glossRef.value.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 255, 255, 0.14) 0%, transparent 60%)`
  }
}

function onHeroMouseLeave(e) {
  if (!isFineHoverPointer(e)) return
  if (stageQuickX && stageQuickY) {
    stageQuickX(0)
    stageQuickY(0)
  }
  if (glossRef.value) {
    glossRef.value.style.background = 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)'
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

function scrollToExplore() {
  playClick()
  const target = document.getElementById('features')
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

function triggerHeroEntrance() {
  isReady.value = true

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    brushCount.value = 240
    blendCount.value = 25
    filterCount.value = 35
    return
  }

  // 标题文字切片梯级入场
  const titleLines = heroRef.value?.querySelectorAll('.hero-line-inner')
  if (titleLines && titleLines.length) {
    gsap.fromTo(titleLines, 
      { yPercent: 120, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'power4.out', delay: 0.1 }
    )
  }

  // 主舞台画布深度缩放淡入
  if (stageRef.value) {
    gsap.fromTo(stageRef.value,
      { scale: 0.92, opacity: 0, y: 40 },
      { scale: 1, opacity: 1, y: 0, duration: 1.25, ease: 'power3.out', delay: 0.2 }
    )
  }

  // 计数器增长动画
  const stats = { b: 0, bl: 0, f: 0 }
  gsap.to(stats, {
    b: 240,
    bl: 25,
    f: 35,
    duration: 1.8,
    delay: 0.3,
    ease: 'power2.out',
    onUpdate() {
      brushCount.value = Math.round(stats.b)
      blendCount.value = Math.round(stats.bl)
      filterCount.value = Math.round(stats.f)
    }
  })
}

onMounted(() => {
  // 监听 preloader 完成事件
  window.addEventListener('lusion-ready', triggerHeroEntrance)

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!reduceMotion && stageRef.value) {
    stageQuickX = gsap.quickTo(stageRef.value, 'rotationY', { duration: 0.8, ease: 'power2.out' })
    stageQuickY = gsap.quickTo(stageRef.value, 'rotationX', { duration: 0.8, ease: 'power2.out' })
    gsap.set(stageRef.value, { transformPerspective: 1400, transformStyle: 'preserve-3d' })

    // 滚动时舞台视差微倾斜
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: heroRef.value,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2,
      onUpdate: (self) => {
        if (stageRef.value) {
          gsap.set(stageRef.value, {
            y: self.progress * 80,
            scale: 1 - self.progress * 0.05
          })
        }
      }
    })
  }

  // 如果页面已经 ready（如从其它页面切回）
  setTimeout(() => {
    if (!isReady.value) {
      triggerHeroEntrance()
    }
  }, 1800)
})

onUnmounted(() => {
  window.removeEventListener('lusion-ready', triggerHeroEntrance)
  scrollTriggerInstance?.kill()
})
</script>

<template>
  <section
    id="top"
    ref="heroRef"
    class="lusion-hero-section"
    :class="{ 'is-ready': isReady }"
    @mousemove="onHeroMouseMove"
    @mouseleave="onHeroMouseLeave"
  >
    <!-- 顶部四角十字定位点 -->
    <div class="hero-grid-cross cross-tl">+</div>
    <div class="hero-grid-cross cross-tr">+</div>

    <div class="shell hero-shell">
      <!-- 顶部技术元信息 -->
      <div class="hero-eyebrow-row">
        <div class="eyebrow-badge">
          <span class="badge-dot"></span>
          <span>01 // ANDROID NATIVE DIGITAL PAINTING</span>
        </div>
        <div class="eyebrow-stats">
          <span>GPL-3.0 OPEN SOURCE</span>
          <span class="stat-divider">/</span>
          <span>QQ GROUP: 729283213</span>
        </div>
      </div>

      <!-- 巨幕级标题 (Lusion 1:1 Staggered Typography) -->
      <div class="hero-title-container">
        <h1 class="hero-mega-title">
          <div class="hero-line-mask">
            <span class="hero-line-inner">{{ t('hero.titleLine1') }}</span>
          </div>
          <div class="hero-line-mask">
            <span class="hero-line-inner line-accent">{{ t('hero.titleLine2') }}</span>
          </div>
        </h1>
      </div>

      <!-- 副文案 -->
      <p class="hero-lead-text">
        {{ t('hero.sub') }}
      </p>

      <!-- 按钮操作区 -->
      <div class="hero-actions-row">
        <a
          class="lusion-cta-btn btn-primary"
          href="/download/"
          @mouseenter="playHover"
          @click="playClick"
          @mousemove="onBtnMouseMove"
          @mouseleave="onBtnMouseLeave"
        >
          <span class="btn-text">{{ t('hero.downloadApk') }}</span>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M2.343 8h11.314m0 0L8.673 3.016M13.657 8l-4.984 4.984"/>
          </svg>
        </a>

        <a
          class="lusion-cta-btn btn-secondary"
          href="/docs/"
          @mouseenter="playHover"
          @click="playClick"
          @mousemove="onBtnMouseMove"
          @mouseleave="onBtnMouseLeave"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4" d="M2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H2V3zm0 0v13"/>
          </svg>
          <span class="btn-text">{{ t('hero.docs') }}</span>
        </a>

        <a
          class="lusion-cta-btn btn-ghost"
          href="https://github.com/LanRhyme/ReveriePaint"
          target="_blank"
          rel="noopener"
          @mouseenter="playHover"
          @click="playClick"
          @mousemove="onBtnMouseMove"
          @mouseleave="onBtnMouseLeave"
        >
          <span class="btn-text">{{ t('hero.source') }}</span>
          <span class="btn-ext">↗</span>
        </a>
      </div>

      <!-- Lusion Studio 主舞台：原生高保真画布视窗展示 -->
      <div class="hero-stage-wrapper">
        <div ref="stageRef" class="stage-frame">
          <!-- 边角精密十字准星 -->
          <div class="stage-cross stage-cross-tl">+</div>
          <div class="stage-cross stage-cross-tr">+</div>
          <div class="stage-cross stage-cross-bl">+</div>
          <div class="stage-cross stage-cross-br">+</div>

          <!-- 顶部状态信息条 -->
          <div class="stage-header-bar">
            <div class="stage-badge">
              <span class="stage-dot"></span>
              <span>KRITA C++ ENGINE</span>
            </div>
            <div class="stage-specs desktop-only">
              <span>60 FPS ZERO-JITTER</span>
              <span class="spec-sep">•</span>
              <span>LOW LATENCY STYLUS</span>
              <span class="spec-sep">•</span>
              <span>8K RESOLUTION</span>
            </div>
            <div class="stage-view-tag">STUDIO CANVAS</div>
          </div>

          <!-- 画布屏幕核心 (仅展示高分辨率原生 App Canvas 界面，去除多余平板外壳) -->
          <div class="stage-screen">
            <div ref="glossRef" class="stage-gloss" aria-hidden="true"></div>
            <img
              :src="heroCanvas"
              :alt="t('hero.deviceAlt')"
              class="hero-canvas-image"
              fetchpriority="high"
              decoding="async"
            />
          </div>

          <!-- 底部参数指示条 -->
          <div class="stage-footer-bar">
            <div class="stage-stat-item">
              <span class="stat-number">{{ brushCount }}+</span>
              <span class="stat-label">{{ t('hero.statBrushes') }}</span>
            </div>
            <div class="stage-stat-item">
              <span class="stat-number">{{ blendCount }}</span>
              <span class="stat-label">{{ t('hero.statBlends') }}</span>
            </div>
            <div class="stage-stat-item">
              <span class="stat-number">{{ filterCount }}</span>
              <span class="stat-label">{{ t('hero.statFilters') }}</span>
            </div>
            <div class="stage-stat-item">
              <span class="stat-number">0.00ms</span>
              <span class="stat-label">{{ t('hero.statInputLag') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部探索提示 (Lusion 1:1 Scroll to Explore) -->
      <div class="hero-scroll-container" @click="scrollToExplore">
        <div class="scroll-crosses">
          <span class="scroll-cross">+</span>
          <span class="scroll-cross">+</span>
          <span class="scroll-cross">+</span>
          <span class="scroll-cross">+</span>
          <span class="scroll-cross">+</span>
        </div>
        <div class="scroll-text-row">
          <span class="scroll-text">SCROLL TO EXPLORE</span>
          <div class="scroll-arrow">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 2.343v11.314m0 0L3.016 8.673M8 13.657l4.984-4.984"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lusion-hero-section {
  position: relative;
  min-height: 100vh;
  padding-top: clamp(6.5rem, 12vh, 9rem);
  padding-bottom: clamp(3rem, 6vh, 5rem);
  display: flex;
  align-items: center;
  background: transparent;
  color: #ffffff;
  overflow: hidden;
}

/* 顶部十字准星 */
.hero-grid-cross {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.2);
  user-select: none;
  pointer-events: none;
}
.cross-tl { top: 2rem; left: 2.5rem; }
.cross-tr { top: 2rem; right: 2.5rem; }

.hero-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

/* 顶部小标 */
.hero-eyebrow-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1100px;
  margin-bottom: clamp(1.5rem, 3vh, 2.5rem);
  font-family: var(--font-mono);
  font-size: clamp(0.6875rem, 0.8vw, 0.75rem);
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.eyebrow-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5b7fc7;
  box-shadow: 0 0 8px #5b7fc7;
}

.eyebrow-stats {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-divider {
  color: rgba(255, 255, 255, 0.2);
}

/* 巨幕标题 */
.hero-title-container {
  width: 100%;
  max-width: 1200px;
  margin-bottom: clamp(1rem, 2vh, 1.75rem);
}

.hero-mega-title {
  font-family: var(--font-sans);
  font-size: clamp(2.4rem, 6vw, 5.25rem);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.035em;
  text-wrap: balance;
  color: #ffffff;
}

.hero-line-mask {
  display: block;
  overflow: hidden;
  padding-bottom: 0.08em;
}

.hero-line-inner {
  display: inline-block;
  will-change: transform, opacity;
}

.line-accent {
  color: #8da6df;
  font-weight: 500;
}

/* 副文案 */
.hero-lead-text {
  font-family: var(--font-sans);
  font-size: clamp(1rem, 1.35vw, 1.25rem);
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.65);
  max-width: 820px;
  margin-bottom: clamp(2rem, 4vh, 3rem);
  text-wrap: pretty;
}

/* 按钮组 */
.hero-actions-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: clamp(3rem, 6vh, 4.5rem);
}

.lusion-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  border-radius: 999px;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.btn-primary {
  background: #ffffff;
  color: #060709;
}
.btn-primary:hover {
  background: #e6e8ec;
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.15);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.btn-ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  padding-inline: 18px;
}
.btn-ghost:hover {
  color: #ffffff;
}

.btn-ext {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

/* Lusion Studio 主舞台 */
.hero-stage-wrapper {
  width: 100%;
  max-width: 1080px;
  margin-bottom: clamp(3.5rem, 6vh, 5rem);
  perspective: 1400px;
}

.stage-frame {
  position: relative;
  background: #0a0c10;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: clamp(12px, 2vw, 20px);
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.8), 0 0 50px rgba(91, 127, 199, 0.12);
  will-change: transform;
}

/* 舞台四角十字准星 */
.stage-cross {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  user-select: none;
  line-height: 1;
}
.stage-cross-tl { top: -6px; left: -6px; }
.stage-cross-tr { top: -6px; right: -6px; }
.stage-cross-bl { bottom: -6px; left: -6px; }
.stage-cross-br { bottom: -6px; right: -6px; }

/* 舞台头部状态栏 */
.stage-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 14px;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.stage-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stage-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5b7fc7;
}

.stage-specs {
  display: flex;
  align-items: center;
  gap: 8px;
}
.spec-sep {
  color: rgba(255, 255, 255, 0.2);
}

.stage-view-tag {
  color: rgba(255, 255, 255, 0.3);
}

/* 原生画布视窗（确保 1024x724 高画质输出，绝不糊） */
.stage-screen {
  position: relative;
  width: 100%;
  aspect-ratio: 1024 / 724;
  border-radius: 10px;
  overflow: hidden;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stage-gloss {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  mix-blend-mode: screen;
  transition: background 0.1s ease;
}

.hero-canvas-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: high-quality;
}

/* 舞台底部参数栏 */
.stage-footer-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 14px;
}

.stage-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-family: var(--font-mono);
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 0.6875rem;
  font-family: var(--font-mono);
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* 底部探索滚轮提示 (Lusion 1:1) */
.hero-scroll-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  padding: 10px;
  transition: opacity 0.25s ease;
}

.hero-scroll-container:hover {
  opacity: 0.8;
}

.scroll-crosses {
  display: flex;
  gap: clamp(1rem, 3vw, 2.5rem);
  color: rgba(255, 255, 255, 0.2);
  font-family: var(--font-mono);
  font-size: 11px;
}

.scroll-text-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.45);
}

.scroll-arrow {
  animation: scrollDown 1.8s infinite ease-in-out;
}

@keyframes scrollDown {
  0% { transform: translateY(-2px); opacity: 0.4; }
  50% { transform: translateY(3px); opacity: 1; }
  100% { transform: translateY(-2px); opacity: 0.4; }
}

@media (max-width: 768px) {
  .hero-eyebrow-row {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
  .stage-footer-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
</style>
