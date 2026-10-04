<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap } from '../composables/useGsap.js'
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()

const pillars = computed(() => t('origin.pillars') || [])

const originRef = ref(null)
let ctx = null

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !originRef.value) return

  ctx = gsap.context(() => {
    const rule = originRef.value.querySelector('.note-rule')
    if (rule) {
      gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: rule,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }
      )
    }
  }, originRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section id="origin" ref="originRef" class="origin">
    <div class="shell">
      <header class="sec-head reveal">
        <p class="eyebrow">{{ t('origin.eyebrow') }}</p>
        <h2 class="h-section">
          <span class="line-mask"><span class="line-inner">{{ t('origin.title') }}</span></span>
        </h2>
        <p class="sec-sub lede">{{ t('origin.sub') }}</p>
      </header>

      <div class="pillars">
        <article
          v-for="(p, i) in pillars"
          :key="p.num"
          class="pillar-card reveal"
          data-cursor="PHILOSOPHY"
          :style="{ transitionDelay: `${i * 90}ms` }"
        >
          <div class="card-top">
            <span class="pillar-num">{{ p.num }}</span>
            <div class="card-bar" aria-hidden="true"></div>
          </div>
          <h3 class="pillar-title">{{ p.title }}</h3>
          <p class="pillar-desc">{{ p.desc }}</p>
        </article>
      </div>

      <div class="origin-note reveal">
        <div class="note-rule" aria-hidden="true"></div>
        <p class="quote-serif line-mask">
          <span class="line-inner">{{ t('origin.quote') }}</span>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.origin {
  position: relative;
  padding: clamp(72px, 11vh, 128px) 0 clamp(64px, 10vh, 112px);
}

.sec-head {
  max-width: 52ch;
  margin-bottom: clamp(44px, 7vh, 64px);
}
.sec-head .h-section {
  margin-top: 14px;
}
.sec-sub {
  margin-top: 16px;
}

/* ── 三大支柱卡片 ───────────────────────────── */
.pillars {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(20px, 3vw, 32px);
}

.pillar-card {
  background: var(--card);
  border: 1px solid var(--line-faint);
  border-radius: 14px;
  padding: clamp(26px, 3.2vw, 36px);
  display: flex;
  flex-direction: column;
  transition: transform 0.45s var(--ease-out-expo), box-shadow 0.45s, border-color 0.4s;
}
@media (hover: hover) and (pointer: fine) {
  .pillar-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-m);
    border-color: var(--line);
  }
  .pillar-card:hover .card-bar {
    width: 48px;
    opacity: 0.8;
    background: var(--ink);
  }
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}
.pillar-num {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--ink-soft-2);
}
.card-bar {
  width: 32px;
  height: 2px;
  background: var(--line-strong);
  opacity: 0.4;
  transition: width 0.35s var(--ease-out-expo), background 0.35s, opacity 0.35s;
}

.pillar-title {
  font-size: clamp(1.125rem, 1.8vw, 1.25rem);
  font-weight: 500;
  color: var(--ink);
  letter-spacing: -0.015em;
  margin-bottom: 14px;
}

.pillar-desc {
  font-size: 0.875rem;
  line-height: 1.82;
  color: var(--ink-mid);
  flex: 1;
}

/* ── 结论注脚 ─────────────────────────────── */
.origin-note {
  margin-top: clamp(48px, 8vh, 72px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 64ch;
}
.note-rule {
  width: 48px;
  height: 2px;
  background: var(--ink);
  transform-origin: left;
  will-change: transform;
}
.origin-note p {
  font-size: clamp(1.0625rem, 1.6vw, 1.25rem);
  line-height: 1.8;
  color: var(--ink);
}

@media (max-width: 960px) {
  .origin {
    padding: clamp(52px, 8vh, 96px) 0;
  }
  .pillars {
    gap: 16px;
  }
  .pillar-card {
    padding: 22px 20px;
  }
}

@media (max-width: 720px) {
  .origin {
    padding: clamp(44px, 7vh, 72px) 0;
  }
  .sec-head {
    margin-bottom: 32px;
  }
  .pillars {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
  .origin-note {
    margin-top: 36px;
  }
  .origin-note p {
    font-size: 1.0625rem;
    line-height: 1.7;
  }
}
</style>
