<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import anime from 'animejs'

const props = defineProps({ ready: Boolean })
const isScrolled = ref(false)
const isMenuOpen = ref(false)

const GITHUB_URL = 'https://github.com/LanRhyme/ReveriePaint'
const RELEASE_URL = 'https://github.com/LanRhyme/ReveriePaint/releases'

function onScroll() {
  isScrolled.value = window.scrollY > 20
}

function playEntrance() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  anime.timeline({ easing: 'easeOutExpo' })
    .add({
      targets: '.brand-mark',
      translateY: [-12, 0],
      opacity: [0, 1],
      duration: 800
    })
    .add({
      targets: '.header-coords',
      opacity: [0, 1],
      translateY: [-8, 0],
      duration: 600
    }, '-=500')
    .add({
      targets: '.nav-links .nav-link-item',
      translateY: [-10, 0],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(60)
    }, '-=400')
}

function scrollToId(id) {
  const el = document.querySelector(id)
  if (!el) return
  const lenis = window.__lenis
  if (lenis) {
    const offset = window.innerWidth <= 1024 ? -16 : -28
    lenis.scrollTo(el, { offset, duration: 1.2 })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function onNavClick(e, id) {
  e.preventDefault()
  scrollToId(id)
  close()
  history.pushState(null, '', id)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('lenis:navigate', () => close())
  if (props.ready) playEntrance()
})
watch(() => props.ready, (v) => { if (v) playEntrance() })
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

function close() {
  if (!isMenuOpen.value) return
  isMenuOpen.value = false
}
function toggle() {
  isMenuOpen.value = !isMenuOpen.value
}

watch(isMenuOpen, (v) => {
  // 锁滚动：lenis 模式下停止，平滑回弹
  if (v) {
    window.__lenis?.stop?.()
    document.documentElement.style.overflow = 'hidden'
    requestAnimationFrame(() => {
      anime({
        targets: '.mobile-nav a',
        translateY: [18, 0],
        opacity: [0, 1],
        duration: 550,
        delay: anime.stagger(70),
        easing: 'easeOutExpo'
      })
    })
  } else {
    window.__lenis?.start?.()
    document.documentElement.style.overflow = ''
  }
})

function onBrandMove(e) {
  if (window.matchMedia('(pointer: coarse)').matches) return
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  const dx = (e.clientX - (r.left + r.width / 2)) / r.width
  anime({ targets: el, translateX: dx * 8, duration: 500, easing: 'easeOutQuad' })
}
function onBrandLeave(e) {
  anime({ targets: e.currentTarget, translateX: 0, duration: 700, easing: 'easeOutElastic(1,0.5)' })
}
</script>

<template>
  <header :class="{ scrolled: isScrolled, 'menu-open': isMenuOpen }">
    <a href="#" class="brand-mark" aria-label="ReveriePaint 首页" @mousemove="onBrandMove" @mouseleave="onBrandLeave" @click.prevent="window.scrollTo({ top: 0, behavior: 'smooth' }); window.__lenis?.scrollTo(0)">ReveriePaint</a>
    <div class="header-coords">[ LAT. 31.2304° N · KRITA CORE ENGINE ]</div>

    <nav class="nav-links" aria-label="主导航">
      <a class="nav-link-item" href="#inst-1" @click="onNavClick($event, '#inst-1')">笔刷</a>
      <a class="nav-link-item" href="#inst-2" @click="onNavClick($event, '#inst-2')">图层</a>
      <a class="nav-link-item" href="#inst-3" @click="onNavClick($event, '#inst-3')">色彩</a>
      <a class="nav-link-item" href="#inst-4" @click="onNavClick($event, '#inst-4')">回放</a>
      <a class="nav-link-item" :href="GITHUB_URL" target="_blank" rel="noopener">GitHub ↗</a>
      <a class="nav-link-item nav-link--accent" :href="RELEASE_URL" target="_blank" rel="noopener">下载 APK ↗</a>
    </nav>

    <button class="menu-toggle" :aria-expanded="isMenuOpen" aria-controls="mobile-nav" aria-label="菜单" @click="toggle">
      <span class="menu-line" :class="{ open: isMenuOpen }"></span>
      <span class="menu-line" :class="{ open: isMenuOpen }"></span>
    </button>
  </header>

  <transition name="nav-fade">
    <div v-if="isMenuOpen" id="mobile-nav" class="mobile-nav" role="dialog" aria-modal="true">
      <a @click="onNavClick($event, '#inst-1')" href="#inst-1">笔刷 <small>Brushes</small></a>
      <a @click="onNavClick($event, '#inst-2')" href="#inst-2">图层 <small>Layers</small></a>
      <a @click="onNavClick($event, '#inst-3')" href="#inst-3">色彩 <small>Palette</small></a>
      <a @click="onNavClick($event, '#inst-4')" href="#inst-4">回放 <small>Timelapse</small></a>
      <div class="mobile-actions">
        <a class="mobile-github" :href="GITHUB_URL" target="_blank" rel="noopener">GitHub 仓库 ↗</a>
        <a class="mobile-download" :href="RELEASE_URL" target="_blank" rel="noopener">下载 APK · Releases ↗</a>
      </div>
      <div class="mobile-meta">GPL-3.0 · ARM64-V8A · ReveriePaint 2026</div>
    </div>
  </transition>
</template>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2.4rem 8vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  mix-blend-mode: difference;
  transition: padding 0.4s var(--ease-out-expo), background 0.4s, border-color 0.4s;
  pointer-events: auto;
}
header.scrolled {
  padding: 1.2rem 8vw;
  background: rgba(11, 12, 14, 0.0);
}
header.menu-open {
  mix-blend-mode: normal;
  background: rgba(11, 12, 14, 0.72);
  backdrop-filter: blur(16px);
}

.brand-mark {
  font-family: var(--font-display);
  font-size: 1.05rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  will-change: transform;
  position: relative;
  z-index: 1;
}
.brand-mark::before {
  content: '';
  width: 7px;
  height: 7px;
  border: 1px solid #fff;
  transform: rotate(45deg);
  flex-shrink: 0;
}

.header-coords {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.62);
  white-space: nowrap;
}

.nav-links {
  display: flex;
  gap: 2.2rem;
  align-items: center;
}
.nav-link-item {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.62);
  text-decoration: none;
  transition: color 0.3s;
  position: relative;
  cursor: pointer;
  padding: 6px 0;
}
.nav-link-item::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 1px;
  background: #fff;
  transition: width 0.38s var(--ease-out-expo);
}
.nav-link-item:hover {
  color: #fff;
}
.nav-link-item:hover::after {
  width: 100%;
}
.nav-link--accent {
  color: var(--ip-cream);
  border: 1px solid rgba(200, 180, 141, 0.35);
  border-radius: 999px;
  padding: 0.55rem 1.15rem;
  font-size: 0.64rem;
  letter-spacing: 0.22em;
  background: transparent;
  transition: all 0.4s var(--ease-silk);
}
.nav-link--accent::after { display: none; }
.nav-link--accent:hover {
  background: rgba(200, 180, 141, 0.1);
  border-color: rgba(200, 180, 141, 0.8);
  color: var(--ip-cream);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 6px;
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 101;
}
.menu-line {
  display: block;
  width: 22px;
  height: 1px;
  background: #fff;
  transition: transform 0.35s var(--ease-out-expo), opacity 0.3s;
}
.menu-line.open:first-child { transform: translateY(3.5px) rotate(45deg); }
.menu-line.open:last-child { transform: translateY(-3.5px) rotate(-45deg); }

.mobile-nav {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(11, 12, 14, 0.96);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8vw 6vw;
  gap: 1.6rem;
  overflow-y: auto;
}
.mobile-nav a {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 8vw, 2.6rem);
  color: var(--c-text);
  text-decoration: none;
  letter-spacing: 0.06em;
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  line-height: 1.1;
}
.mobile-nav a small {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  color: var(--c-mist);
  text-transform: uppercase;
}
.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.8rem;
  padding-top: 1.8rem;
  border-top: 1px solid var(--border-wire);
}
.mobile-github,
.mobile-download {
  font-family: var(--font-mono) !important;
  font-size: 0.82rem !important;
  letter-spacing: 0.14em !important;
  padding: 0.95rem 1.2rem;
  border: 1px solid var(--border-wire);
  justify-content: center;
  text-align: center;
  border-radius: 999px;
}
.mobile-download {
  background: var(--ip-cream);
  color: var(--ip-ink) !important;
  border-color: var(--ip-cream);
}
.mobile-meta {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  color: var(--c-ash);
  margin-top: 0.5rem;
}
.nav-fade-enter-active, .nav-fade-leave-active { transition: opacity 0.35s, transform 0.35s; }
.nav-fade-enter-from, .nav-fade-leave-to { opacity: 0; }

@media (max-width: 1180px) {
  .header-coords { display: none; }
  .nav-links { gap: 1.6rem; }
}
@media (max-width: 1024px) {
  .nav-links { display: none; }
  .menu-toggle { display: flex; }
  header {
    mix-blend-mode: normal;
    background: rgba(11, 12, 14, 0.56);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  header.scrolled { padding: 1rem 6vw; }
}
@media (max-width: 640px) {
  header { padding: 1rem 5vw; }
  .brand-mark { font-size: 0.9rem; letter-spacing: 0.22em; }
}
</style>
