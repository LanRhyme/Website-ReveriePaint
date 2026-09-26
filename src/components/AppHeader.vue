<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)

const NAV = [
  { id: 'features', label: '核心特性' },
  { id: 'toolkit', label: '色彩工坊' },
  { id: 'origin', label: '设计理念' },
  { id: 'get', label: '获取应用' }
]

function onScroll() {
  isScrolled.value = window.scrollY > 24
}

function goTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 76
  window.scrollTo({ top, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="site-header" :class="{ 'is-scrolled': isScrolled }">
    <div class="shell bar">
      <a class="brand" href="#top" @click.prevent="goTo('top')">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 22 22" width="22" height="22">
            <rect x="1" y="1" width="20" height="20" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.3" />
            <path d="M6.4 15.6 L11 6.4 L15.6 15.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="11" cy="13" r="1.5" fill="currentColor" />
          </svg>
        </span>
        <span class="brand-text">
          <b>ReveriePaint</b>
          <i>Android 原生数字绘画</i>
        </span>
      </a>

      <nav class="nav" aria-label="主导航">
        <button v-for="item in NAV" :key="item.id" class="nav-link" type="button" @click="goTo(item.id)">
          {{ item.label }}
        </button>
      </nav>

      <a
        class="cta"
        href="https://github.com/LanRhyme/ReveriePaint/releases"
        target="_blank"
        rel="noopener"
      >
        <span>下载</span>
        <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
          <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
    </div>
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
  transition: transform 0.3s var(--ease-out-expo), background 0.3s;
}
.cta:hover {
  background: var(--ink-soft);
  transform: translateY(-1px);
}
.cta svg {
  transition: transform 0.3s var(--ease-out-expo);
}
.cta:hover svg {
  transform: translate(2px, -2px);
}

@media (max-width: 720px) {
  .nav,
  .brand-text i {
    display: none;
  }
  .cta {
    margin-left: auto;
  }
}
</style>
