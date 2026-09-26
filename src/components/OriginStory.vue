<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from '../composables/useGsap.js'

const pillars = [
  {
    num: '01',
    title: '拒绝功能阉割',
    desc: '不以移动端为借口简化核心参数。完整保留桌面级图层混合、物理颜料计算与深度压感微调，让专业画师在平板上同样拥有无妥协的创作上限。'
  },
  {
    num: '02',
    title: '沉浸心流状态',
    desc: '零商业广告、零内购弹窗、完全离线可用。毫秒级自动保活与草稿恢复，界面与辅助工具静默退至画布之后，让注意力全然聚焦于画作本身。'
  },
  {
    num: '03',
    title: '纯粹开源基石',
    desc: '基于 GPL-3.0 协议全量开源。自研 .revp 独立工程与笔迹事件流开放归档，代码属于全球创作者社区，永不设限、永不捆绑。'
  }
]

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
        <p class="eyebrow">设计理念</p>
        <h2 class="h-section">纯粹、专注、不妥协的创作体验</h2>
        <p class="sec-sub lede">为真正热爱画画的人而打造，让工具成为双手的自然延伸</p>
      </header>

      <div class="pillars">
        <article
          v-for="(p, i) in pillars"
          :key="p.num"
          class="pillar-card reveal"
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
        <p class="quote-serif">
          让复杂的技术在画布背后无声运转，把最纯粹的掌控感交还给创作者。
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

@media (max-width: 860px) {
  .pillars {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
}
</style>
