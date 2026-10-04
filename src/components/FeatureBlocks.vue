<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap, ScrollTrigger, isFineHoverPointer } from '../composables/useGsap.js'
import { useI18n } from '../composables/useI18n.js'
import brushBench from '../assets/shots/ui-brush-bench.webp'
import penSettings from '../assets/shots/ui-pen-settings.webp'
import filters from '../assets/shots/ui-filters.webp'
import blend from '../assets/shots/ui-blend.webp'
import toolbar from '../assets/shots/ui-toolbar.webp'
import lasso from '../assets/shots/work-lasso.webp'
import reference from '../assets/shots/work-reference.webp'

const { t } = useI18n()

const blockMeta = [
  { id: 'bench', img: brushBench, flip: false },
  { id: 'pen', img: penSettings, flip: true },
  { id: 'lasso', img: lasso, flip: false },
  { id: 'reference', img: reference, flip: true }
]

const blocks = computed(() => {
  const list = t('features.blocks') || []
  return blockMeta.map((meta, idx) => ({
    ...meta,
    ...(list[idx] || {})
  }))
})

const pillImgs = [filters, blend, toolbar]
const pills = computed(() => {
  const list = t('features.pills') || []
  return list.map((item, idx) => ({
    ...item,
    img: pillImgs[idx]
  }))
})

const sectionRef = ref(null)
let ctx = null

function onMediaMouseMove(e) {
  if (!isFineHoverPointer(e)) return
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  gsap.to(card, {
    rotationY: x * 6,
    rotationX: -y * 6,
    duration: 0.45,
    ease: 'power2.out',
    transformPerspective: 1000
  })
}

function onMediaMouseLeave(e) {
  if (!isFineHoverPointer(e)) {
    if (e?.currentTarget) gsap.set(e.currentTarget, { rotationY: 0, rotationX: 0 })
    return
  }
  gsap.to(e.currentTarget, {
    rotationY: 0,
    rotationX: 0,
    duration: 0.6,
    ease: 'power2.out'
  })
}

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !sectionRef.value) return

  ctx = gsap.matchMedia(sectionRef.value)

  // 桌面与平板端：视差滑动
  ctx.add('(min-width: 769px)', () => {
    const blockEls = sectionRef.value.querySelectorAll('.block')
    blockEls.forEach((block) => {
      const img = block.querySelector('.block-media img')
      if (img) {
        gsap.fromTo(
          img,
          { yPercent: -5, scale: 1.04 },
          {
            yPercent: 5,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: block,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            }
          }
        )
      }
    })
  })

  // 手机端：滚动到视口中央平滑放大聚焦
  ctx.add('(max-width: 768px)', () => {
    const blockEls = sectionRef.value.querySelectorAll('.block')
    blockEls.forEach((block) => {
      const media = block.querySelector('.block-media')
      if (media) {
        gsap.fromTo(
          media,
          { scale: 0.94, opacity: 0.78 },
          {
            scale: 1,
            opacity: 1,
            ease: 'power1.out',
            scrollTrigger: {
              trigger: block,
              start: 'top 88%',
              end: 'top 42%',
              scrub: 0.6
            }
          }
        )
      }
    })
  })

  // 核心卖点逐条阶梯出现
  const blockEls = sectionRef.value.querySelectorAll('.block')
  blockEls.forEach((block) => {
    const points = block.querySelectorAll('.block-points li')
    if (points.length) {
      gsap.from(points, {
        opacity: 0,
        x: -12,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: block,
          start: 'top 78%',
          toggleActions: 'play none none none'
        }
      })
    }
  })

  // 三张并列卡片阶梯出场
  const pillEls = sectionRef.value.querySelectorAll('.pill')
  if (pillEls.length) {
    gsap.from(pillEls, {
      opacity: 0,
      y: 26,
      duration: 0.75,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sectionRef.value.querySelector('.pills'),
        start: 'top 84%',
        toggleActions: 'play none none none'
      }
    })
  }
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section id="features" ref="sectionRef" class="features">
    <div class="shell">
      <header class="sec-head reveal">
        <p class="eyebrow">{{ t('features.eyebrow') }}</p>
        <h2 class="h-section">
          <span class="line-mask"><span class="line-inner">{{ t('features.title') }}</span></span>
        </h2>
        <p class="lede sec-sub">{{ t('features.sub') }}</p>
      </header>

      <!-- ── 交错图文 ───────────────────────── -->
      <div class="blocks">
        <article
          v-for="b in blocks"
          :key="b.id"
          class="block reveal"
          :class="{ 'is-flip': b.flip }"
        >
          <div
            class="block-media"
            data-cursor="STUDIO"
            @mousemove="onMediaMouseMove"
            @mouseleave="onMediaMouseLeave"
          >
            <img :src="b.img" :alt="b.alt" loading="lazy" decoding="async" />
          </div>

          <div class="block-copy">
            <p class="eyebrow">{{ b.kicker }}</p>
            <h3 class="block-title">
              <span class="line-mask"><span class="line-inner">{{ b.title }}</span></span>
            </h3>
            <p class="block-body">{{ b.body }}</p>
            <ul class="block-points">
              <li v-for="p in b.points" :key="p">{{ p }}</li>
            </ul>
          </div>
        </article>
      </div>

      <!-- ── 三张并列 ───────────────────────── -->
      <div class="pills">
        <article v-for="p in pills" :key="p.title" class="pill" data-cursor="EXPLORE">
          <div class="pill-shot">
            <img :src="p.img" :alt="`${p.title} 界面`" loading="lazy" decoding="async" />
          </div>
          <div class="pill-copy">
            <h3>{{ p.title }}</h3>
            <p>{{ p.desc }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  position: relative;
  padding: clamp(68px, 10vh, 116px) 0;
}

.sec-head {
  max-width: 44ch;
  margin-bottom: clamp(52px, 8vh, 84px);
}
.sec-head .h-section {
  margin-top: 14px;
  line-height: 1.3;
}
.sec-sub {
  margin-top: 18px;
}

/* ══ 交错图文 ═══════════════════════════════ */
.blocks {
  display: flex;
  flex-direction: column;
  gap: clamp(64px, 10vh, 116px);
}

.block {
  display: grid;
  grid-template-columns: minmax(0, 1.22fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(32px, 5vw, 72px);
}

/* 图片一侧 */
.block-media {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: var(--ui-900);
  border: 1px solid rgba(20, 22, 26, 0.14);
  box-shadow: var(--shadow-l);
  transform-style: preserve-3d;
  will-change: transform;
  transition: box-shadow 0.4s var(--ease-out-expo);
}
@media (hover: hover) and (pointer: fine) {
  .block-media:hover {
    box-shadow: var(--shadow-xl);
  }
}
.block-media img {
  width: 100%;
  height: auto;
  display: block;
  will-change: transform;
}

/* 文案一侧 */
.block-copy {
  max-width: 42ch;
}
.block-title {
  margin-top: 12px;
  font-size: clamp(1.25rem, 2.1vw, 1.6875rem);
  font-weight: 500;
  line-height: 1.36;
  letter-spacing: -0.022em;
  color: var(--ink);
}
.block-body {
  margin-top: 16px;
  font-size: 0.9375rem;
  line-height: 1.88;
  color: var(--ink-mid);
}
.block-points {
  margin-top: 20px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.block-points li {
  position: relative;
  padding-left: 18px;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--ink-soft);
}
.block-points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.58em;
  width: 6px;
  height: 1px;
  background: var(--ink-ghost);
}

/* 交替方向：图移到右列 */
.block.is-flip .block-media {
  order: 2;
}
.block.is-flip .block-copy {
  order: 1;
}

/* ══ 三张并列 ═══════════════════════════════ */
.pills {
  margin-top: clamp(64px, 10vh, 116px);
  padding-top: clamp(44px, 7vh, 68px);
  border-top: 1px solid var(--line-faint);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(20px, 3vw, 34px);
}

.pill-shot {
  border-radius: 10px;
  overflow: hidden;
  background: var(--ui-800);
  border: 1px solid rgba(20, 22, 26, 0.12);
  margin-bottom: 18px;
  box-shadow: var(--shadow-s);
  aspect-ratio: 16 / 10.2;
}
.pill-shot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.7s var(--ease-out-expo);
}
@media (hover: hover) and (pointer: fine) {
  .pill:hover .pill-shot img {
    transform: scale(1.03);
  }
}

.pill-copy h3 {
  font-size: 1.0625rem;
  font-weight: 500;
  letter-spacing: -0.012em;
}
.pill-copy p {
  margin-top: 8px;
  font-size: 0.875rem;
  line-height: 1.78;
  color: var(--ink-mid);
}

/* ══ 响应式 ═════════════════════════════════ */
@media (max-width: 960px) {
  .block {
    gap: 28px;
  }
  .pills {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .features {
    padding: clamp(48px, 8vh, 84px) 0;
  }
  .sec-head {
    margin-bottom: 38px;
  }
  .blocks {
    gap: clamp(40px, 7vh, 60px);
  }
  .block,
  .block.is-flip {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
  /* 移动端统一图在上、文在下 */
  .block.is-flip .block-media {
    order: 0;
  }
  .block.is-flip .block-copy {
    order: 0;
  }
  .block-copy {
    max-width: 100%;
  }
  .block-title {
    font-size: clamp(1.1875rem, 4.6vw, 1.45rem);
    line-height: 1.35;
  }
  .block-body {
    margin-top: 12px;
    line-height: 1.76;
  }
  .block-points {
    margin-top: 14px;
    gap: 7px;
  }
  .pills {
    margin-top: clamp(44px, 7vh, 64px);
    padding-top: clamp(32px, 5vh, 48px);
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
  }
}
</style>
