<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap, isFineHoverPointer } from '../composables/useGsap.js'
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()
const copied = ref(false)
const getRef = ref(null)
let ctx = null

function copyQQ(e) {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText('729283213')
    copied.value = true
    if (e?.currentTarget) {
      gsap.fromTo(
        e.currentTarget,
        { scale: 0.92 },
        { scale: 1, duration: 0.4, ease: 'back.out(2.5)' }
      )
    }
    setTimeout(() => (copied.value = false), 2200)
  }
}

function onMagneticMouseMove(e) {
  if (!isFineHoverPointer(e)) return
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const dx = e.clientX - rect.left - rect.width / 2
  const dy = e.clientY - rect.top - rect.height / 2
  gsap.to(btn, { x: dx * 0.18, y: dy * 0.18, duration: 0.3, ease: 'power1.out' })
}

function onMagneticMouseLeave(e) {
  if (!isFineHoverPointer(e)) {
    if (e?.currentTarget) gsap.set(e.currentTarget, { x: 0, y: 0 })
    return
  }
  gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
}

const meta = computed(() => t('get.meta') || [])

const ways = computed(() => {
  const list = t('get.ways') || []
  return list.map((w, idx) => ({
    ...w,
    primary: idx === 0,
    isQQ: idx === 1,
    links: (w.links || []).map((l, lIdx) => ({
      ...l,
      primary: idx === 0 && lIdx === 0
    }))
  }))
})

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !getRef.value) return

  ctx = gsap.context(() => {
    const metaItems = getRef.value.querySelectorAll('.meta-item')
    if (metaItems.length) {
      gsap.from(metaItems, {
        opacity: 0,
        y: 16,
        duration: 0.55,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: getRef.value.querySelector('.meta'),
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      })
    }

    const wayCards = getRef.value.querySelectorAll('.way')
    if (wayCards.length) {
      gsap.from(wayCards, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: getRef.value.querySelector('.ways'),
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      })
    }
  }, getRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section id="get" ref="getRef" class="get">
    <div class="shell">
      <header class="sec-head reveal">
        <p class="eyebrow">{{ t('get.eyebrow') }}</p>
        <h2 class="h-section">
          <span class="line-mask"><span class="line-inner">{{ t('get.title') }}</span></span>
        </h2>
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
          :key="w.title"
          class="way reveal"
          :class="{ primary: w.primary }"
          data-cursor="GET"
          :style="{ transitionDelay: `${i * 70}ms` }"
        >
          <div class="card-cross cross-tl">+</div>
          <div class="card-cross cross-tr">+</div>
          <div class="card-cross cross-bl">+</div>
          <div class="card-cross cross-br">+</div>
          <h3>{{ w.title }}</h3>
          <p>{{ w.body }}</p>
          <div class="way-actions">
            <button
              v-if="w.isQQ"
              type="button"
              class="way-cta cta-copy"
              data-cursor="COPY"
              @click="copyQQ($event)"
              @mousemove="onMagneticMouseMove"
              @mouseleave="onMagneticMouseLeave"
            >
              {{ copied ? t('get.copiedQQ') : t('get.copyQQ') }}
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3" />
                <path d="M3 11 V3 h8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
              </svg>
            </button>
            <a
              v-for="l in w.links"
              :key="l.text"
              :href="l.href"
              class="way-cta"
              :class="{ 'cta-solid': l.primary }"
              :target="l.href.startsWith('http') ? '_blank' : undefined"
              :rel="l.href.startsWith('http') ? 'noopener' : undefined"
              :data-cursor="l.primary ? 'DOWNLOAD' : 'LINK'"
              @mousemove="onMagneticMouseMove"
              @mouseleave="onMagneticMouseLeave"
            >
              {{ l.text }}
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </a>
          </div>
        </article>
      </div>

      <p class="star-note reveal">
        如果 ReveriePaint 对你的创作有所启发，欢迎在 GitHub 为项目点亮 Star
      </p>
    </div>
  </section>
</template>

<style scoped>
.get {
  padding: clamp(72px, 11vh, 128px) 0 clamp(64px, 9vh, 104px);
}

.get {
  padding: clamp(72px, 11vh, 128px) 0 clamp(64px, 9vh, 104px);
  background: transparent;
  color: #ffffff;
}

.sec-head {
  max-width: 60ch;
  margin-bottom: clamp(34px, 5vh, 48px);
}
.sec-head .h-section {
  margin-top: 14px;
  color: #ffffff;
}

/* ── 规格条 ─────────────────────────────────── */
.meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: clamp(34px, 5vh, 48px);
}
.meta-item {
  background: #0d0f14;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.meta-item dt {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.meta-item dd {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #ffffff;
}

/* ── 三个入口 ───────────────────────────────── */
.ways {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 2.2vw, 22px);
}
.way {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: clamp(28px, 3.4vw, 40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: #0d0f14;
  transition: transform 0.5s var(--ease-out-expo), box-shadow 0.5s, border-color 0.4s;
}

.card-cross {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  user-select: none;
  line-height: 1;
}
.cross-tl { top: -6px; left: -6px; }
.cross-tr { top: -6px; right: -6px; }
.cross-bl { bottom: -6px; left: -6px; }
.cross-br { bottom: -6px; right: -6px; }

@media (hover: hover) and (pointer: fine) {
  .way:hover {
    transform: translateY(-6px);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9), 0 0 25px rgba(91, 127, 199, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }
}
.way h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
}
.way p {
  font-size: 0.90625rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.65);
  flex: 1;
}
.way-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.way-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84375rem;
  font-weight: 500;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  will-change: transform;
  transition: all 0.25s ease;
}
button.way-cta {
  font-family: inherit;
  cursor: pointer;
}
.way-cta svg {
  transition: transform 0.3s var(--ease-out-expo);
}

/* 首个入口高亮强调 */
.way.primary {
  background: #10131a;
  border-color: rgba(91, 127, 199, 0.3);
}
.way.primary .way-cta.cta-solid {
  background: #ffffff;
  color: #060709;
  border-color: #ffffff;
  font-weight: 600;
}

@media (hover: hover) and (pointer: fine) {
  .way-cta:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.35);
  }
  .way-cta:hover svg {
    transform: translate(2px, -2px);
  }
}

@media (hover: hover) and (pointer: fine) {
  .way:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-m);
    border-color: var(--line);
  }
  .way-cta:hover {
    background: rgba(20, 22, 26, 0.09);
    border-color: var(--ink);
  }
  .way-cta:hover svg {
    transform: translate(2px, -2px);
  }
  .way.primary .way-cta:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.3);
  }
  .way.primary .way-cta.cta-solid:hover {
    background: #f0f1f2;
  }
}

.star-note {
  margin-top: clamp(30px, 4.4vh, 44px);
  font-size: 0.90625rem;
  color: var(--ink-soft-2);
  text-align: center;
}

@media (max-width: 960px) {
  .get {
    padding: clamp(52px, 8vh, 96px) 0;
  }
  .meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .ways {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .ways {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 560px) {
  .get {
    padding: clamp(44px, 6vh, 72px) 0;
  }
  .sec-head {
    margin-bottom: 22px;
  }
  .meta {
    margin-bottom: 26px;
  }
  .meta-item {
    padding: 14px 16px;
  }
  .way {
    padding: 20px 18px;
  }
  .way-actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 8px;
    margin-top: 8px;
  }
  .way-cta {
    width: 100%;
    justify-content: center;
    min-height: 44px;
    font-size: 0.875rem;
    padding: 10px 16px;
  }
}
</style>
