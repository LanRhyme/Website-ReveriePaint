<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getLenis } from '../composables/useLenis.js'
import { gsap, isFineHoverPointer } from '../composables/useGsap.js'
import { useI18n, SUPPORTED_LANGS } from '../composables/useI18n.js'
import LanguageSwitcher from './LanguageSwitcher.vue'

const { t, currentLang, setLang } = useI18n()

const isScrolled = ref(false)
const menuOpen = ref(false)
const activeId = ref('')
const progress = ref(0)

const navItems = computed(() => [
  { id: 'features', label: t('header.nav.features') },
  { id: 'toolkit', label: t('header.nav.toolkit') },
  { id: 'origin', label: t('header.nav.origin') },
  { id: 'get', label: t('header.nav.get') }
])

const isDownloadPage = computed(() => {
  if (typeof window === 'undefined') return false
  return window.location.pathname.includes('/download')
})

let rafId = 0

function update() {
  rafId = 0
  const y = window.scrollY
  isScrolled.value = y > 24

  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0

  // 视口上方三分之一处所属章节即为当前章节
  const line = y + window.innerHeight * 0.32
  let cur = ''
  for (const item of navItems.value) {
    const el = document.getElementById(item.id)
    if (!el) continue
    if (el.getBoundingClientRect().top + y <= line) cur = item.id
  }
  activeId.value = cur
}

function onScroll() {
  if (!rafId) rafId = requestAnimationFrame(update)
}

function goTo(id) {
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
  gsap.to(btn, { x: dx * 0.18, y: dy * 0.18, duration: 0.25, ease: 'power2.out' })
}

function onCtaMouseLeave(e) {
  if (!e?.currentTarget) return
  if (!isFineHoverPointer(e)) {
    gsap.set(e.currentTarget, { x: 0, y: 0 })
    return
  }
  gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.6)' })
}

function onKeydown(e) {
  if (e.key === 'Escape' && menuOpen.value) menuOpen.value = false
}

// 抽屉展开时暂停平滑滚动，避免手指划过菜单时页面跟着动
watch(menuOpen, (open) => {
  const lenis = getLenis()
  if (open) {
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    isScrolled.value = true
  } else {
    lenis?.start()
    document.body.style.overflow = ''
    update()
  }
})

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  window.removeEventListener('keydown', onKeydown)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <header class="site-header" :class="{ 'is-scrolled': isScrolled, 'has-menu': menuOpen }">
    <div class="shell bar">
      <a class="brand" href="/" @click.prevent="handleBrandClick">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="44 49 300 300" width="22" height="22" aria-hidden="true">
            <g transform="translate(0,376) scale(0.1,-0.1)" fill="currentColor">
              <path d="M1920 3132 c0 -62 -67 -341 -160 -662 -36 -127 -56 -179 -71 -191 -12 -9 -67 -40 -123 -69 -108 -56 -145 -86 -178 -138 -11 -18 -41 -47 -66 -64 -40 -27 -56 -32 -106 -33 -54 0 -60 2 -87 34 -27 33 -29 34 -71 23 -24 -6 -67 -16 -95 -22 -29 -7 -53 -16 -53 -21 0 -5 5 -9 12 -9 12 0 326 -91 378 -110 14 -5 72 -23 130 -40 58 -17 139 -43 181 -56 86 -28 71 -7 136 -188 15 -44 33 -81 38 -82 6 -1 27 18 49 44 49 59 468 541 518 596 21 23 38 45 38 49 0 9 -58 35 -155 67 -38 13 -74 27 -78 31 -8 6 -83 310 -94 382 -7 44 -15 46 -34 10 -8 -15 -31 -56 -51 -90 -21 -35 -38 -67 -38 -73 0 -5 -4 -10 -10 -10 -13 0 -13 15 -1 38 6 9 17 44 25 77 8 33 24 95 36 138 l20 78 -35 144 c-19 79 -35 151 -35 159 0 9 -4 16 -10 16 -5 0 -10 -13 -10 -28z" />
              <path d="M2394 2107 c-27 -29 -83 -90 -124 -137 -41 -47 -77 -87 -80 -90 -3 -3 -39 -43 -80 -90 -41 -47 -77 -87 -80 -90 -3 -3 -54 -60 -113 -128 -83 -94 -106 -128 -103 -145 3 -12 10 -51 16 -87 6 -36 15 -83 20 -105 5 -22 14 -71 21 -110 6 -38 15 -83 20 -99 5 -16 9 -44 9 -62 0 -72 26 -43 49 56 25 108 73 308 81 340 5 19 23 94 40 165 37 157 51 207 62 221 4 6 27 17 50 24 24 8 48 16 53 20 6 4 30 13 55 20 25 7 50 16 55 20 6 4 30 13 55 20 25 7 50 16 55 20 6 3 28 12 50 19 22 7 49 16 60 21 11 4 47 18 80 30 33 12 69 26 80 30 11 4 57 23 103 40 45 18 82 35 82 39 0 4 -28 13 -62 20 -35 7 -79 17 -98 21 -48 12 -114 27 -180 41 -30 6 -68 15 -84 20 -41 13 -38 14 -92 -44z" />
              <path d="M2825 1464 c-76 -10 -393 -117 -524 -176 -25 -11 -59 -26 -76 -33 -135 -57 -160 -79 -202 -173 -45 -101 -21 -139 64 -101 26 12 62 27 78 34 17 7 56 25 88 39 32 14 60 26 62 26 2 0 30 12 62 26 32 14 73 32 91 40 84 36 100 43 142 62 25 11 110 46 190 78 205 81 250 114 216 158 -11 16 -131 28 -191 20z" />
              <path d="M1730 1068 c-14 -6 -45 -19 -69 -30 -120 -53 -607 -415 -755 -561 -64 -63 -68 -70 -52 -85 11 -11 33 -16 69 -16 56 1 102 21 157 71 62 55 111 77 173 76 56 -1 62 2 165 70 59 38 132 84 162 100 30 17 82 50 115 75 33 24 84 58 113 75 45 25 53 33 48 51 -4 12 -11 41 -16 66 -26 121 -24 115 -55 117 -17 1 -41 -3 -55 -9z" />
            </g>
          </svg>
        </span>
        <span class="brand-text">
          <b>ReveriePaint</b>
          <i>{{ t('header.tagline') }}</i>
        </span>
      </a>

      <nav class="nav" aria-label="主导航">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="nav-link"
          :class="{ active: activeId === item.id }"
          type="button"
          @click="goTo(item.id)"
        >
          {{ item.label }}
        </button>
        <a href="/docs/" class="nav-link">{{ t('header.nav.docs') }}</a>
      </nav>

      <LanguageSwitcher class="desktop-only" />

      <a
        class="cta"
        :href="isDownloadPage ? '#download-action' : '/download/'"
        @mousemove="onCtaMouseMove"
        @mouseleave="onCtaMouseLeave"
      >
        <span>{{ t('header.download') }}</span>
        <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
          <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        :aria-label="t('header.menu')"
        @click="menuOpen = !menuOpen"
      >
        <span class="menu-line" :class="{ 'is-open': menuOpen }"></span>
        <span class="menu-line" :class="{ 'is-open': menuOpen }"></span>
      </button>
    </div>

    <!-- 阅读进度：一条发丝线，不抢内容 -->
    <div class="progress" aria-hidden="true">
      <span :style="{ transform: `scaleX(${progress})` }"></span>
    </div>

    <transition name="drawer">
      <div v-if="menuOpen" class="mobile-drawer" @click.self="menuOpen = false">
        <nav class="mobile-nav" aria-label="移动端导航菜单">
          <button
            v-for="item in navItems"
            :key="item.id"
            class="mobile-nav-link"
            type="button"
            :class="{ active: activeId === item.id }"
            @click="handleNavClick(item.id)"
          >
            <span>{{ item.label }}</span>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M6 3 L11 8 L6 13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <a class="mobile-nav-link" href="/docs/" @click="menuOpen = false">
            <span>{{ t('header.nav.docs') }}</span>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M6 3 L11 8 L6 13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>

          <div class="mobile-nav-divider"></div>

          <div class="mobile-lang-row">
            <span class="mobile-lang-label">{{ t('header.langTitle') }}</span>
            <div class="mobile-lang-pills">
              <button
                v-for="l in SUPPORTED_LANGS"
                :key="l.id"
                type="button"
                class="mobile-lang-pill"
                :class="{ active: currentLang === l.id }"
                @click="setLang(l.id)"
              >
                {{ l.short }}
              </button>
            </div>
          </div>

          <a
            class="mobile-nav-cta"
            :href="isDownloadPage ? '#download-action' : '/download/'"
            @click="menuOpen = false"
          >
            <span>{{ isDownloadPage ? t('header.download') : t('header.mobileDownload') }}</span>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </nav>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 80;
  transition: background var(--dur-mid) var(--ease-silk), border-color var(--dur-mid) var(--ease-silk);
  border-bottom: 1px solid transparent;
}
.site-header.is-scrolled {
  background: rgba(245, 242, 236, 0.78);
  backdrop-filter: saturate(140%) blur(16px);
  -webkit-backdrop-filter: saturate(140%) blur(16px);
  border-bottom-color: var(--line-faint);
}

.bar {
  height: var(--nav-h);
  display: flex;
  align-items: center;
  gap: 24px;
}

/* ── 品牌 ─────────────────────────────── */
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  flex-shrink: 0;
}
.brand-mark {
  color: var(--ink);
  display: grid;
  place-items: center;
  transition: transform var(--dur-mid) var(--ease-out-expo);
}
.brand:hover .brand-mark {
  transform: rotate(-8deg);
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.brand-text b {
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.brand-text i {
  font-style: normal;
  font-size: 0.6875rem;
  color: var(--ink-soft-2);
  letter-spacing: 0.04em;
}

/* ── 导航 ─────────────────────────────── */
.nav {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}
.nav-link {
  position: relative;
  appearance: none;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 0.84375rem;
  letter-spacing: 0.01em;
  color: var(--ink-mid);
  padding: 8px 12px;
  cursor: pointer;
  transition: color var(--dur-fast);
}
/* 当前章节：底部一道短线，比整块底色更克制 */
.nav-link::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 3px;
  height: 1px;
  background: var(--ink);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.45s var(--ease-out-expo);
}
.nav-link.active {
  color: var(--ink);
}
.nav-link.active::after {
  transform: scaleX(1);
}
@media (hover: hover) and (pointer: fine) {
  .nav-link:hover {
    color: var(--ink);
  }
  .nav-link:hover::after {
    transform: scaleX(1);
    background: var(--line-strong);
  }
}

/* ── 下载按钮：方角，像印刷页上的一个标记 ───────── */
.cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--paper);
  background: var(--ink);
  padding: 10px 18px;
  border-radius: 3px;
  will-change: transform;
  transition: background var(--dur-fast);
}
.cta svg {
  transition: transform var(--dur-fast) var(--ease-out-expo);
}
@media (hover: hover) and (pointer: fine) {
  .cta:hover {
    background: var(--ink-soft);
  }
  .cta:hover svg {
    transform: translate(2px, -2px);
  }
}

/* ── 进度线 ───────────────────────────── */
.progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  overflow: hidden;
  pointer-events: none;
}
.progress span {
  display: block;
  height: 100%;
  background: var(--ink);
  opacity: 0.32;
  transform-origin: left;
  will-change: transform;
}

/* ── 汉堡按钮 ─────────────────────────── */
.menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 3px;
  border: 1px solid var(--line-strong);
  background: rgba(255, 255, 255, 0.6);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  padding: 0;
  color: var(--ink);
  flex-shrink: 0;
  transition: background var(--dur-fast), border-color var(--dur-fast);
}
.menu-line {
  display: block;
  width: 15px;
  height: 1.5px;
  background: currentColor;
  border-radius: 2px;
  transition: transform 0.32s var(--ease-out-expo);
}
.menu-line.is-open:first-child {
  transform: translateY(3.25px) rotate(45deg);
}
.menu-line.is-open:last-child {
  transform: translateY(-3.25px) rotate(-45deg);
}

/* ── 移动端抽屉 ───────────────────────── */
.mobile-drawer {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(245, 242, 236, 0.97);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 18px 40px rgba(20, 22, 26, 0.08);
  padding: 14px 20px 22px;
}
.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: var(--shell);
  margin-inline: auto;
}
.mobile-nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 13px 14px;
  border-radius: 10px;
  background: transparent;
  border: 0;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink-soft);
  text-align: left;
  cursor: pointer;
  transition: background var(--dur-fast), color var(--dur-fast);
}
.mobile-nav-link.active {
  color: var(--ink);
  background: rgba(20, 22, 26, 0.04);
}
.mobile-nav-link:active {
  background: rgba(20, 22, 26, 0.07);
}
.mobile-nav-link svg {
  color: var(--ink-ghost);
}
.mobile-nav-divider {
  height: 1px;
  background: var(--line-faint);
  margin: 10px 0;
}
.mobile-nav-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 18px;
  border-radius: 3px;
  background: var(--ink);
  color: var(--paper);
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 12px;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.24s var(--ease-out-expo), transform 0.24s var(--ease-out-expo);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1080px) {
  .nav-link {
    padding: 7px 10px;
    font-size: 0.84375rem;
  }
  .nav-link::after {
    left: 10px;
    right: 10px;
  }
}

.desktop-only {
  display: inline-flex;
}

.mobile-lang-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(20, 22, 26, 0.03);
  border-radius: 10px;
}
.mobile-lang-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink-mid);
}
.mobile-lang-pills {
  display: flex;
  gap: 4px;
  background: rgba(20, 22, 26, 0.06);
  padding: 3px;
  border-radius: 8px;
}
.mobile-lang-pill {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--ink-mid);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background var(--dur-fast), color var(--dur-fast);
}
.mobile-lang-pill.active {
  background: var(--paper);
  color: var(--ink);
  font-weight: 600;
}

@media (max-width: 768px) {
  .nav,
  .brand-text i,
  .desktop-only {
    display: none !important;
  }
  .menu-toggle {
    display: flex;
  }
  .cta {
    margin-left: auto;
    padding: 8px 15px;
    font-size: 0.75rem;
  }
  .bar {
    gap: 12px;
  }
}
</style>
