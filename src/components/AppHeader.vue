<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getLenis } from '../composables/useLenis.js'
import { gsap, isFineHoverPointer } from '../composables/useGsap.js'
import { useI18n, SUPPORTED_LANGS } from '../composables/useI18n.js'
import { useSound } from '../composables/useSound.js'
import LanguageSwitcher from './LanguageSwitcher.vue'

const { t, currentLang, setLang } = useI18n()
const { isSoundEnabled, toggleSound, playClick, playHover } = useSound()

const isScrolled = ref(false)
const menuOpen = ref(false)

const navItems = computed(() => [
  { id: 'features', label: t('header.nav.features'), num: '01' },
  { id: 'toolkit', label: t('header.nav.toolkit'), num: '02' },
  { id: 'origin', label: t('header.nav.origin'), num: '03' },
  { id: 'get', label: t('header.nav.get'), num: '04' }
])

const isDownloadPage = computed(() => {
  if (typeof window === 'undefined') return false
  return window.location.pathname.includes('/download')
})

function onScroll() {
  isScrolled.value = window.scrollY > 20
}

function goTo(id) {
  playClick()
  const el = id === 'top' ? document.body : document.getElementById(id)
  if (!el) {
    window.location.href = `/#${id}`
    return
  }
  const lenis = getLenis()
  const offset = id === 'top' ? 0 : -72
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.15 })
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

function handleBrandClick() {
  playClick()
  menuOpen.value = false
  if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '/index.html')) {
    goTo('top')
  } else {
    window.location.href = '/'
  }
}

function handleNavClick(id) {
  menuOpen.value = false
  goTo(id)
}

function onCtaMouseMove(e) {
  if (!isFineHoverPointer(e)) return
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const dx = e.clientX - rect.left - rect.width / 2
  const dy = e.clientY - rect.top - rect.height / 2
  gsap.to(btn, { x: dx * 0.22, y: dy * 0.22 - 1, duration: 0.25, ease: 'power1.out' })
}

function onCtaMouseLeave(e) {
  if (!isFineHoverPointer(e)) {
    if (e?.currentTarget) gsap.set(e.currentTarget, { x: 0, y: 0 })
    return
  }
  gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
}

function toggleMenu() {
  playClick()
  menuOpen.value = !menuOpen.value
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="lusion-header" :class="{ 'is-scrolled': isScrolled, 'has-menu': menuOpen }">
    <div class="shell header-container">
      <!-- 左侧：品牌 Logo -->
      <a class="header-logo" href="/" aria-label="ReveriePaint" @click.prevent="handleBrandClick">
        <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden="true" class="logo-mark">
          <rect x="1" y="1" width="20" height="20" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.3" />
          <path d="M6.4 15.6 L11 6.4 L15.6 15.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="11" cy="13" r="1.5" fill="currentColor" />
        </svg>
        <span class="logo-text">REVERIE PAINT</span>
        <span class="version-tag">v2.4</span>
      </a>

      <!-- 居中：技术架构微标签 -->
      <div class="header-center-pill desktop-only">
        <span class="pill-dot"></span>
        <span class="pill-text">KRITA C++ CORE // ANDROID</span>
      </div>

      <!-- 右侧：控件组 (音频可视化按钮 + 下载 CTA + 极客 Menu 按钮) -->
      <div class="header-right">
        <!-- 音频开关按钮 -->
        <button
          class="header-sound-btn"
          :class="{ 'is-active': isSoundEnabled }"
          type="button"
          :aria-label="isSoundEnabled ? 'Mute sound' : 'Enable audio feedback'"
          @click="toggleSound"
          @mouseenter="playHover"
        >
          <span class="sound-wave">
            <span class="bar bar-1"></span>
            <span class="bar bar-2"></span>
            <span class="bar bar-3"></span>
            <span class="bar bar-4"></span>
          </span>
        </button>

        <!-- 语言选择 -->
        <LanguageSwitcher class="desktop-only" />

        <!-- 下载行动按钮 -->
        <a
          class="header-action-btn"
          :href="isDownloadPage ? '#download-action' : '/download/'"
          @mouseenter="playHover"
          @mousemove="onCtaMouseMove"
          @mouseleave="onCtaMouseLeave"
        >
          <span class="btn-dot"></span>
          <span class="btn-text">{{ t('header.download') }}</span>
          <svg class="btn-arrow" viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.343 8h11.314m0 0L8.673 3.016M13.657 8l-4.984 4.984"/>
          </svg>
        </a>

        <!-- 极客全屏菜单切换按钮 (Lusion 1:1) -->
        <button
          class="header-menu-btn"
          type="button"
          :aria-expanded="menuOpen"
          aria-label="Menu"
          @click="toggleMenu"
          @mouseenter="playHover"
        >
          <span class="menu-btn-inner">
            <span class="menu-label">{{ menuOpen ? 'Close' : 'Menu' }}</span>
            <span class="menu-dots">
              <span class="dot" :class="{ 'is-open': menuOpen }"></span>
              <span class="dot" :class="{ 'is-open': menuOpen }"></span>
            </span>
          </span>
        </button>
      </div>
    </div>

    <!-- Lusion 全屏巨幕导航抽屉 -->
    <transition name="lusion-menu">
      <div v-if="menuOpen" class="fullscreen-menu-overlay" @click.self="menuOpen = false">
        <div class="menu-backdrop"></div>
        <div class="shell menu-content">
          <!-- 导航链接列表 -->
          <nav class="menu-nav" aria-label="全屏主导航">
            <button
              v-for="item in navItems"
              :key="item.id"
              class="menu-link-row"
              type="button"
              @click="handleNavClick(item.id)"
              @mouseenter="playHover"
            >
              <span class="link-num">{{ item.num }}</span>
              <span class="link-label">{{ item.label }}</span>
              <span class="link-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14m0 0l-6-6m6 6l-6 6"/>
                </svg>
              </span>
            </button>
            <a
              class="menu-link-row"
              href="/docs/"
              @click="menuOpen = false"
              @mouseenter="playHover"
            >
              <span class="link-num">05</span>
              <span class="link-label">{{ t('header.nav.docs') }}</span>
              <span class="link-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14m0 0l-6-6m6 6l-6 6"/>
                </svg>
              </span>
            </a>
          </nav>

          <!-- 侧边技术信息与多语言 -->
          <div class="menu-side-info">
            <div class="side-block">
              <div class="side-title">ARCHITECTURE</div>
              <div class="side-desc">Krita C++ Engine / Android Native 7.0+ / Sparse Tile Layers</div>
            </div>

            <div class="side-block">
              <div class="side-title">COMMUNITY & RELEASES</div>
              <div class="side-links">
                <a href="https://github.com/LanRhyme/ReveriePaint" target="_blank" rel="noopener" class="side-link">
                  GitHub Repository ↗
                </a>
                <span class="side-link">QQ Group: 729283213</span>
              </div>
            </div>

            <div class="side-block">
              <div class="side-title">LANGUAGE</div>
              <div class="lang-pills">
                <button
                  v-for="l in SUPPORTED_LANGS"
                  :key="l.id"
                  type="button"
                  class="lang-pill"
                  :class="{ active: currentLang === l.id }"
                  @click="setLang(l.id)"
                >
                  {{ l.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.lusion-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1.25rem 0;
  transition: background 0.35s ease, border-color 0.35s ease, padding 0.35s ease;
}

.lusion-header.is-scrolled {
  padding: 0.85rem 0;
  background: rgba(6, 7, 9, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 品牌 Logo */
.header-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
  mix-blend-mode: exclusion;
  user-select: none;
}

.logo-mark {
  flex-shrink: 0;
}

.logo-text {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.version-tag {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.05em;
}

/* 居中胶囊 */
.header-center-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.55);
}

.pill-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--accent);
}

/* 右侧控件组 */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 音频开关 */
.header-sound-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  color: #ffffff;
}

.header-sound-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.sound-wave {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 12px;
}

.sound-wave .bar {
  width: 2px;
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 1px;
  transition: height 0.2s ease, background 0.2s ease;
}

.header-sound-btn.is-active .sound-wave .bar {
  background: #ffffff;
}

.header-sound-btn.is-active .bar-1 { animation: soundBounce 0.7s infinite alternate ease-in-out; }
.header-sound-btn.is-active .bar-2 { animation: soundBounce 0.9s infinite alternate 0.15s ease-in-out; }
.header-sound-btn.is-active .bar-3 { animation: soundBounce 0.6s infinite alternate 0.3s ease-in-out; }
.header-sound-btn.is-active .bar-4 { animation: soundBounce 0.8s infinite alternate 0.1s ease-in-out; }

@keyframes soundBounce {
  0% { height: 3px; }
  100% { height: 12px; }
}

/* 行动按钮 */
.header-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 999px;
  background: #ffffff;
  color: #060709;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.header-action-btn:hover {
  background: #f0f2f5;
  transform: translateY(-1px);
}

.btn-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5b7fc7;
}

.btn-arrow {
  transition: transform 0.2s ease;
}

.header-action-btn:hover .btn-arrow {
  transform: translate(2px, -2px);
}

/* Menu 切换按钮 */
.header-menu-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.25s ease;
}

.header-menu-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.menu-btn-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.menu-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

.menu-dots .dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.3s ease, background 0.3s ease;
}

.menu-dots .dot.is-open {
  background: #5b7fc7;
}

/* Lusion 全屏导航抽屉 */
.fullscreen-menu-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  display: flex;
  align-items: center;
  overflow-y: auto;
}

.menu-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(6, 7, 9, 0.96);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
}

.menu-content {
  position: relative;
  z-index: 10;
  width: 100%;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: clamp(2rem, 6vw, 6rem);
  padding-block: 6rem;
  align-items: center;
}

.menu-nav {
  display: flex;
  flex-direction: column;
}

.menu-link-row {
  display: flex;
  align-items: center;
  gap: clamp(1rem, 2vw, 2rem);
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: clamp(1.2rem, 2.5vh, 2rem) 0;
  color: #ffffff;
  font-family: var(--font-sans);
  text-align: left;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;
}

.menu-link-row:hover {
  padding-left: 1.5rem;
  border-color: rgba(255, 255, 255, 0.3);
}

.link-num {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.1em;
}

.link-label {
  font-size: clamp(1.5rem, 3.5vw, 2.5rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  flex: 1;
}

.link-arrow {
  color: rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease, color 0.3s ease;
}

.menu-link-row:hover .link-arrow {
  transform: translateX(8px);
  color: #ffffff;
}

/* 侧边信息 */
.menu-side-info {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.side-title {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 0.75rem;
}

.side-desc {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
}

.side-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.side-link {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: #ffffff;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.lang-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lang-pill {
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-pill.active,
.lang-pill:hover {
  background: #ffffff;
  color: #060709;
}

/* 动画过渡 */
.lusion-menu-enter-active,
.lusion-menu-leave-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.lusion-menu-enter-from,
.lusion-menu-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 960px) {
  .desktop-only {
    display: none !important;
  }

  .menu-content {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    padding-top: 5rem;
  }
}
</style>
