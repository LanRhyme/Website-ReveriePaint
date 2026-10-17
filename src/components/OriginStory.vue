<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()
const pillars = computed(() => t('origin.pillars') || [])
const originRef = ref(null)
</script>

<template>
  <section id="origin" ref="originRef" class="origin">
    <div class="shell">
      <header class="sec-head reveal">
        <div class="sec-rail">
          <span class="sec-num">03</span>
          <span class="sec-label">{{ t('origin.eyebrow') }}</span>
        </div>
        <h2 class="h-section">
          <span class="line-mask"><span class="line-inner" style="--d: 70ms">{{ t('origin.title') }}</span></span>
        </h2>
        <p class="sec-sub lede">{{ t('origin.sub') }}</p>
      </header>

      <!-- 宣言：整页唯一的衬线大字，从第四栏起排 -->
      <blockquote class="origin-quote reveal">
        <p class="quote-serif line-mask">
          <span class="line-inner">{{ t('origin.quote') }}</span>
        </p>
      </blockquote>

      <div class="pillars">
        <article
          v-for="(p, i) in pillars"
          :key="i"
          class="pillar reveal"
          :style="{ '--d': `${i * 90}ms` }"
        >
          <div class="pillar-num">{{ p.num }}</div>
          <h3 class="pillar-title">{{ p.title }}</h3>
          <p class="pillar-desc">{{ p.desc }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.origin {
  position: relative;
  padding-block: var(--sec-air);
}

/* ── 宣言：从第四栏起排，左边留出书页的空白 ───────── */
.origin-quote {
  position: relative;
  margin: 0 0 clamp(56px, 8vh, 96px);
  padding: clamp(28px, 4vh, 44px) 0 clamp(28px, 4vh, 44px) clamp(28px, 4vw, 64px);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin-left: calc((100% / 12) * 3);
}

.origin-quote p {
  max-width: 18em;
  font-size: clamp(1.375rem, 2.5vw, 2.125rem);
  line-height: 1.6;
  letter-spacing: 0.01em;
  color: var(--ink);
  text-wrap: pretty;
}
/* 起首的短竖线，标出这是一段引文 */
.origin-quote::before {
  content: '';
  position: absolute;
  left: 0;
  top: clamp(30px, 4.2vh, 48px);
  width: 2px;
  height: clamp(28px, 4vh, 44px);
  background: var(--ink);
}

/* ── 三条支线 ─────────────────────────────── */
.pillars {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: var(--col-gap);
}

.pillar {
  padding-top: 20px;
  border-top: 1px solid var(--ink);
  display: flex;
  flex-direction: column;
}

.pillar-num {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  color: var(--ochre);
  margin-bottom: 18px;
}

.pillar-title {
  font-size: clamp(1.0625rem, 1.5vw, 1.25rem);
  font-weight: 500;
  color: var(--ink);
  letter-spacing: -0.016em;
  line-height: 1.45;
}
.pillar-desc {
  margin-top: 12px;
  font-size: 0.84375rem;
  line-height: 1.92;
  color: var(--ink-mid);
  flex: 1;
}

@media (max-width: 860px) {
  .origin {
    padding: 48px 0 56px;
  }
  .origin-quote {
    margin-left: 0;
    padding-left: 22px;
    margin-bottom: 42px;
  }
  .origin-quote p {
    max-width: 100%;
    font-size: clamp(1.25rem, 5.4vw, 1.5rem);
    line-height: 1.68;
  }
  .pillars {
    grid-template-columns: minmax(0, 1fr);
    column-gap: 0;
  }
  .pillar {
    padding-block: 20px;
  }
  .pillar + .pillar {
    border-top-color: var(--line);
  }
  .pillar-num {
    margin-bottom: 10px;
  }
  .pillar-desc {
    line-height: 1.82;
  }
}
</style>
