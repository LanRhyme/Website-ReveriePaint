<script setup>
import { ref, computed } from 'vue'
import { gsap, isFineHoverPointer } from '../composables/useGsap.js'
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()
const copied = ref(false)
const getRef = ref(null)

function copyQQ(e) {
  if (!navigator?.clipboard?.writeText) return
  navigator.clipboard.writeText('729283213')
  copied.value = true
  if (e?.currentTarget) {
    gsap.fromTo(e.currentTarget, { scale: 0.98 }, { scale: 1, duration: 0.4, ease: 'back.out(2.5)' })
  }
  setTimeout(() => (copied.value = false), 2200)
}

function onLinkMouseMove(e) {
  if (!isFineHoverPointer(e)) return
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const dx = e.clientX - rect.left - rect.width / 2
  gsap.to(el, { x: dx * 0.04, duration: 0.3, ease: 'power2.out' })
}

function onLinkMouseLeave(e) {
  if (!e?.currentTarget) return
  if (!isFineHoverPointer(e)) {
    gsap.set(e.currentTarget, { x: 0 })
    return
  }
  gsap.to(e.currentTarget, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.6)' })
}

const meta = computed(() => t('get.meta') || [])
const ways = computed(() => {
  const list = t('get.ways') || []
  return list.map((w, idx) => ({
    ...w,
    primary: idx === 0,
    isQQ: idx === 1,
    num: String(idx + 1).padStart(2, '0')
  }))
})
</script>

<template>
  <section id="get" ref="getRef" class="get">
    <div class="shell">
      <header class="sec-head reveal">
        <div class="sec-rail">
          <span class="sec-num">04</span>
          <span class="sec-label">{{ t('get.eyebrow') }}</span>
        </div>
        <h2 class="h-section">
          <span class="line-mask"><span class="line-inner" style="--d: 70ms">{{ t('get.title') }}</span></span>
        </h2>
        <p class="sec-sub lede">{{ t('get.sub') }}</p>
      </header>

      <dl class="meta reveal">
        <div v-for="m in meta" :key="m.k" class="meta-item">
          <dt>{{ m.k }}</dt>
          <dd>{{ m.v }}</dd>
        </div>
      </dl>

      <div class="ways">
        <article
          v-for="(w, i) in ways"
          :key="i"
          class="way reveal"
          :class="{ primary: w.primary }"
          :style="{ '--d': `${i * 80}ms` }"
        >
          <div class="way-head">
            <span class="way-num">{{ w.num }}</span>
            <h3>{{ w.title }}</h3>
          </div>
          <p class="way-body">{{ w.body }}</p>

          <div class="way-links">
            <button v-if="w.isQQ" type="button" class="way-link" @click="copyQQ($event)">
              <span>{{ copied ? t('get.copiedQQ') : t('get.copyQQ') }}</span>
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3" />
                <path d="M3 11 V3 h8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
              </svg>
            </button>

            <a
              v-for="l in w.links"
              :key="l.text"
              :href="l.href"
              class="way-link"
              :target="l.href.startsWith('http') ? '_blank' : undefined"
              :rel="l.href.startsWith('http') ? 'noopener' : undefined"
              @mousemove="onLinkMouseMove"
              @mouseleave="onLinkMouseLeave"
            >
              <span>{{ l.text }}</span>
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </a>
          </div>
        </article>
      </div>

      <p class="colophon reveal">
        <span>{{ t('get.starNote') }}</span>
        <a class="colophon-link" href="https://github.com/LanRhyme/ReveriePaint" target="_blank" rel="noopener">GitHub ↗</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.get {
  padding-block: var(--sec-air);
}

/* ── 规格表 ─────────────────────────────────── */
.meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--ink);
  border-bottom: 1px solid var(--line);
  margin-bottom: clamp(40px, 6vh, 64px);
}
.meta-item {
  padding: 18px 24px 22px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.meta-item + .meta-item {
  padding-left: 24px;
  border-left: 1px solid var(--line);
}
.meta-item dt {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-soft-2);
}
.meta-item dd {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink);
  line-height: 1.45;
}

/* ── 三个入口 ───────────────────────────────── */
.ways {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: start;
  column-gap: var(--col-gap);
}
.way:nth-child(1) {
  grid-column: 1 / 6;
}
.way:nth-child(2) {
  grid-column: 6 / 9;
}
.way:nth-child(3) {
  grid-column: 9 / -1;
}
.way {
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  border-top: 1px solid var(--ink);
}
.way-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.way-num {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  color: var(--ochre);
}
.way h3 {
  font-size: 1.0625rem;
  font-weight: 500;
  letter-spacing: -0.012em;
}
.way-body {
  margin-top: 12px;
  font-size: 0.875rem;
  line-height: 1.85;
  color: var(--ink-mid);
  flex: 1;
}

.way-links {
  margin-top: 22px;
  display: flex;
  flex-direction: column;
}
.way-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 11px 0;
  border: 0;
  border-top: 1px solid var(--line-faint);
  background: transparent;
  font-family: inherit;
  font-size: 0.84375rem;
  font-weight: 500;
  color: var(--ink-soft);
  text-align: left;
  cursor: pointer;
  transition: color var(--dur-fast);
}
.way-link svg {
  flex-shrink: 0;
  color: var(--ink-ghost);
  transition: transform var(--dur-fast) var(--ease-out-expo), color var(--dur-fast);
}
@media (hover: hover) and (pointer: fine) {
  .way-link:hover {
    color: var(--ink);
  }
  .way-link:hover svg {
    transform: translate(2px, -2px);
    color: var(--ink);
  }
}

/* 首个入口：深色块，重心里排第一 */
.way.primary {
  padding: 26px 26px 22px;
  border-top: 0;
  background: var(--ui-900);
  color: var(--ui-text);
}
.way.primary h3 {
  color: #fff;
}
.way.primary .way-num {
  color: rgba(255, 255, 255, 0.4);
}
.way.primary .way-body {
  color: var(--ui-text-dim);
}
.way.primary .way-link {
  border-top-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.82);
}
.way.primary .way-link svg {
  color: rgba(255, 255, 255, 0.4);
}
@media (hover: hover) and (pointer: fine) {
  .way.primary .way-link:hover {
    color: #fff;
  }
  .way.primary .way-link:hover svg {
    color: #fff;
  }
}

/* ── 版权说明 ─────────────────────────────── */
.colophon {
  margin-top: clamp(40px, 6vh, 64px);
  padding-top: 18px;
  border-top: 1px solid var(--line);
  font-size: 0.8125rem;
  color: var(--ink-soft-2);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: baseline;
}
.colophon-link {
  color: var(--ink);
  border-bottom: 1px solid var(--line-strong);
  padding-bottom: 1px;
  transition: border-color var(--dur-fast);
}
.colophon-link:hover {
  border-bottom-color: var(--ink);
}

@media (max-width: 1024px) {
  .meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .meta-item:nth-child(odd) {
    padding-left: 0;
    border-left: 0;
  }
  .meta-item:nth-child(n + 3) {
    border-top: 1px solid var(--line);
  }
  .meta-item:nth-child(even) {
    padding-left: 24px;
    border-left: 1px solid var(--line);
  }
  .ways {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    row-gap: 36px;
  }
  .way:nth-child(1) {
    grid-column: 1 / -1;
  }
  .way:nth-child(2) {
    grid-column: 1 / 2;
  }
  .way:nth-child(3) {
    grid-column: 2 / 3;
  }
}

@media (max-width: 700px) {
  .get {
    padding: 48px 0 56px;
  }
  .ways {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 0;
  }
  .way,
  .way:nth-child(1),
  .way:nth-child(2),
  .way:nth-child(3) {
    grid-column: 1;
    padding-block: 20px;
  }
  .way.primary {
    padding: 22px 20px 18px;
    margin-bottom: 4px;
  }
  .way-body {
    margin-top: 10px;
  }
  .way-links {
    margin-top: 16px;
  }
  .way-link {
    padding: 12px 0;
  }
}
</style>
