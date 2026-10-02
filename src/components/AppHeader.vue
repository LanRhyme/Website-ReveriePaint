<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getLenis } from '../composables/useLenis.js'
import { gsap } from '../composables/useGsap.js'
import { useI18n, SUPPORTED_LANGS } from '../composables/useI18n.js'
import LanguageSwitcher from './LanguageSwitcher.vue'

const { t, currentLang, setLang } = useI18n()

const isScrolled = ref(false)
const menuOpen = ref(false)

const navItems = computed(() => [
  { id: 'features', label: t('header.nav.features') },
  { id: 'toolkit', label: t('header.nav.toolkit') },
  { id: 'origin', label: t('header.nav.origin') },
  { id: 'get', label: t('header.nav.get') }
])

function onScroll() {
  isScrolled.value = window.scrollY > 24
}

function goTo(id) {
  const el = id === 'top' ? document.body : document.getElementById(id)
  if (!el) return
  const lenis = getLenis()
  const offset = id === 'top' ? 0 : -72
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.15 })
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

function handleNavClick(id) {
  menuOpen.value = false
  goTo(id)
}

function onCtaMouseMove(e) {
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const dx = e.clientX - rect.left - rect.width / 2
  const dy = e.clientY - rect.top - rect.height / 2
  gsap.to(btn, { x: dx * 0.2, y: dy * 0.2 - 1, duration: 0.25, ease: 'power1.out' })
}

function onCtaMouseLeave(e) {
  gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="site-header" :class="{ 'is-scrolled': isScrolled, 'has-menu': menuOpen }">
    <div class="shell bar">
      <a class="brand" href="#top" @click.prevent="handleNavClick('top')">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 22 22" width="22" height="22">
            <rect x="1" y="1" width="20" height="20" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.3" />
            <path d="M6.4 15.6 L11 6.4 L15.6 15.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="11" cy="13" r="1.5" fill="currentColor" />
          </svg>
        </span>
        <span class="brand-text">
          <b>ReveriePaint</b>
          <i>{{ t('header.tagline') }}</i>
        </span>
      </a>

      <nav class="nav" aria-label="主导航">
        <button v-for="item in navItems" :key="item.id" class="nav-link" type="button" @click="goTo(item.id)">
          {{ item.label }}
        </button>
        <a href="/docs/" class="nav-link">{{ t('header.nav.docs') }}</a>
      </nav>

      <LanguageSwitcher class="desktop-only" />

      <a
        class="cta"
        href="https://github.com/LanRhyme/ReveriePaint/releases"
        target="_blank"
        rel="noopener"
        @mousemove="onCtaMouseMove"
        @mouseleave="onCtaMouseLeave"
      >
        <span>{{ t('header.download') }}</span>
        <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
          <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>

      <!-- 移动端汉堡菜单按钮 -->
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

    <!-- 移动端全屏/下拉式导航菜单 -->
    <transition name="drawer">
      <div v-if="menuOpen" class="mobile-drawer" @click.self="menuOpen = false">
        <nav class="mobile-nav" aria-label="移动端导航菜单">
          <button
            v-for="item in navItems"
            :key="item.id"
            class="mobile-nav-link"
            type="button"
            @click="handleNavClick(item.id)"
          >
            <span>{{ item.label }}</span>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M6 3 L11 8 L6 13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <a
            class="mobile-nav-link"
            href="/docs/"
            @click="menuOpen = false"
          >
            <span>{{ t('header.nav.docs') }}</span>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M6 3 L11 8 L6 13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>

          <div class="mobile-nav-divider"></div>

          <div class="mobile-lang-row">
            <span class="mobile-lang-label">
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm4.9 6.25h-2.1a10.6 10.6 0 0 0-.8-3.4A5.76 5.76 0 0 1 12.9 7.25zm-4.9-4.7a9.2 9.2 0 0 1 1.3 4.7H6.7a9.2 9.2 0 0 1 1.3-4.7zm-2 1.3a10.6 10.6 0 0 0-.8 3.4H3.1a5.76 5.76 0 0 1 2.9-3.4zM3.1 8.75h2.1a10.6 10.6 0 0 0 .8 3.4 5.76 5.76 0 0 1-2.9-3.4zm4.9 4.7a9.2 9.2 0 0 1-1.3-4.7h2.6a9.2 9.2 0 0 1-1.3 4.7zm2-.8a10.6 10.6 0 0 0 .8-3.4h2.1a5.76 5.76 0 0 1-2.9 3.4z" fill="currentColor"/>
              </svg>
              <span>{{ t('header.langTitle') }}</span>
            </span>
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

          <div class="mobile-nav-divider"></div>

          <a
            class="mobile-nav-cta"
            href="https://github.com/LanRhyme/ReveriePaint/releases"
            target="_blank"
            rel="noopener"
            @click="menuOpen = false"
          >
            <span>{{ t('header.mobileDownload') }}</span>
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
  transition: background 0.4s var(--ease-silk), border-color 0.4s var(--ease-silk),
    backdrop-filter 0.4s var(--ease-silk);
  border-bottom: 1px solid transparent;
}
.site-header.is-scrolled {
  background: rgba(245, 242, 236, 0.82);
  backdrop-filter: saturate(150%) blur(14px);
  -webkit-backdrop-filter: saturate(150%) blur(14px);
  border-bottom-color: var(--line-faint);
}

.bar {
  height: 68px;
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
  gap: 4px;
  margin-left: auto;
}
.nav-link {
  appearance: none;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 0.875rem;
  color: var(--ink-mid);
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.25s, background 0.25s;
}
.nav-link:hover {
  color: var(--ink);
  background: rgba(20, 22, 26, 0.05);
}

/* ── 下载按钮 ─────────────────────────── */
.cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--paper);
  background: var(--ink);
  padding: 9px 17px;
  border-radius: 999px;
  will-change: transform;
  transition: background 0.3s;
}
.cta:hover {
  background: var(--ink-soft);
}
.cta svg {
  transition: transform 0.3s var(--ease-out-expo);
}
.cta:hover svg {
  transform: translate(2px, -2px);
}

/* ── 移动端汉堡切换按钮 ─────────────────── */
.menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: rgba(255, 255, 255, 0.65);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  padding: 0;
  color: var(--ink);
  transition: background 0.25s, border-color 0.25s;
}
.menu-toggle:hover {
  background: #fff;
  border-color: var(--ink);
}
.menu-line {
  display: block;
  width: 16px;
  height: 1.5px;
  background: currentColor;
  border-radius: 2px;
  transition: transform 0.3s var(--ease-out-expo), opacity 0.3s;
}
.menu-line.is-open:first-child {
  transform: translateY(3.25px) rotate(45deg);
}
.menu-line.is-open:last-child {
  transform: translateY(-3.25px) rotate(-45deg);
}

/* ── 移动端菜单抽屉 ─────────────────────── */
.mobile-drawer {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(245, 242, 236, 0.95);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-bottom: 1px solid var(--line-faint);
  box-shadow: 0 16px 36px rgba(20, 22, 26, 0.1);
  padding: 16px 20px 24px;
}
.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: var(--shell);
  margin-inline: auto;
}
.mobile-nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 13px 16px;
  border-radius: 10px;
  background: transparent;
  border: 0;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.mobile-nav-link:active {
  background: rgba(20, 22, 26, 0.06);
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
  padding: 13px 18px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.25s;
}
.mobile-nav-cta:active {
  background: var(--ink-soft);
}

/* 抽屉过渡动效 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s var(--ease-out-expo), transform 0.25s var(--ease-out-expo);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 960px) {
  .bar {
    gap: 16px;
  }
  .nav {
    gap: 2px;
  }
  .nav-link {
    font-size: 0.8125rem;
    padding: 6px 10px;
  }
}

/* ── 语言切换 ───────────────────────────── */
.lang-switch-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink-mid);
  padding: 6px 12px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.25s var(--ease-silk);
}
.lang-switch-btn:hover {
  color: var(--ink);
  border-color: var(--ink-ghost);
  background: rgba(20, 22, 26, 0.04);
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
  transition: all 0.2s;
}
.mobile-lang-pill.active {
  background: var(--paper);
  color: var(--ink);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
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
    padding: 8px 14px;
    font-size: 0.75rem;
  }
}
</style>
