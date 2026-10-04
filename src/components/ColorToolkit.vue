<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap, isFineHoverPointer } from '../composables/useGsap.js'
import { useI18n } from '../composables/useI18n.js'
import wheel from '../assets/shots/ui-wheel.webp'
import harmony from '../assets/shots/harmony.webp'
import sphere3d from '../assets/shots/ui-sphere3d.webp'
import palette from '../assets/shots/ui-palette.webp'

const { t } = useI18n()

const colorShots = [wheel, harmony, sphere3d, palette]
const colors = computed(() => {
  const list = t('toolkit.colors') || []
  return list.map((item, idx) => ({
    ...item,
    shot: colorShots[idx]
  }))
})

const specs = computed(() => t('toolkit.specs') || [])

const activeColorIndex = ref(0)
const colorRowRef = ref(null)
const toolkitRef = ref(null)
let ctx = null

function onColorScroll() {
  if (!colorRowRef.value) return
  const el = colorRowRef.value
  const itemWidth = el.scrollWidth / colors.length
  activeColorIndex.value = Math.min(
    colors.length - 1,
    Math.max(0, Math.round(el.scrollLeft / itemWidth))
  )
}

function scrollToColor(index) {
  if (!colorRowRef.value) return
  const el = colorRowRef.value
  const items = el.querySelectorAll('.c-item')
  if (items[index]) {
    items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}

function onCardMouseMove(e) {
  if (!isFineHoverPointer(e)) return
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  gsap.to(card, {
    rotationY: x * 7,
    rotationX: -y * 7,
    duration: 0.4,
    ease: 'power2.out',
    transformPerspective: 900
  })
}

function onCardMouseLeave(e) {
  if (!isFineHoverPointer(e)) {
    if (e?.currentTarget) gsap.set(e.currentTarget, { rotationY: 0, rotationX: 0 })
    return
  }
  gsap.to(e.currentTarget, {
    rotationY: 0,
    rotationX: 0,
    duration: 0.55,
    ease: 'power2.out'
  })
}

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !toolkitRef.value) return

  ctx = gsap.context(() => {
    const items = toolkitRef.value.querySelectorAll('.rest-item')
    if (items.length) {
      gsap.from(items, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: toolkitRef.value.querySelector('.rest-list'),
          start: 'top 86%',
          toggleActions: 'play none none none'
        }
      })
    }
  }, toolkitRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section id="toolkit" ref="toolkitRef" class="toolkit">
    <div class="shell">
      <header class="sec-head reveal">
        <p class="eyebrow">{{ t('toolkit.eyebrow') }}</p>
        <h2 class="h-section">{{ t('toolkit.title') }}</h2>
        <p class="sec-sub lede">{{ t('toolkit.sub') }}</p>
      </header>

      <!-- ── 色彩四图 ───────────────────────── -->
      <div ref="colorRowRef" class="color-row" @scroll.passive="onColorScroll">
        <figure
          v-for="(c, i) in colors"
          :key="c.title"
          class="c-item reveal"
          :style="{ transitionDelay: `${i * 70}ms` }"
        >
          <div
            class="c-shot"
            @mousemove="onCardMouseMove"
            @mouseleave="onCardMouseLeave"
          >
            <img :src="c.shot" :alt="c.alt" loading="lazy" decoding="async" />
          </div>
          <figcaption>
            <h3>{{ c.title }}</h3>
            <p>{{ c.desc }}</p>
          </figcaption>
        </figure>
      </div>

      <!-- 手机端轮播指示点 -->
      <div class="mobile-dots" aria-hidden="true">
        <button
          v-for="(_, i) in colors"
          :key="i"
          type="button"
          class="dot"
          :class="{ active: activeColorIndex === i }"
          :aria-label="`切换到第 ${i + 1} 项色彩功能`"
          @click="scrollToColor(i)"
        ></button>
      </div>

      <!-- ── 全架构特性矩阵 ──────────────────── -->
      <div class="rest reveal">
        <p class="eyebrow">{{ t('toolkit.specsEyebrow') }}</p>
        <div class="rest-list">
          <div v-for="s in specs" :key="s.title" class="rest-item">
            <h4>{{ s.title }}</h4>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.toolkit {
  padding: clamp(68px, 10vh, 116px) 0;
}

.sec-head {
  max-width: 44ch;
  margin-bottom: clamp(40px, 6vh, 58px);
}
.sec-head .h-section {
  margin-top: 14px;
}

/* ── 色彩四图 ─────────────────────────────── */
.color-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(16px, 2.2vw, 26px);
}

.c-shot {
  border-radius: 12px;
  overflow: hidden;
  background: var(--ui-900);
  border: 1px solid rgba(20, 22, 26, 0.14);
  box-shadow: var(--shadow-m);
  aspect-ratio: 3 / 4.2;
  transform-style: preserve-3d;
  will-change: transform;
  transition: box-shadow 0.4s var(--ease-out-expo);
}
.c-shot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.8s var(--ease-out-expo);
}

@media (hover: hover) and (pointer: fine) {
  .c-item:hover .c-shot {
    box-shadow: var(--shadow-l);
  }
  .c-item:hover .c-shot img {
    transform: scale(1.03);
  }
}

.c-item figcaption {
  margin-top: 16px;
}
.c-item h3 {
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: -0.012em;
}
.c-item figcaption p {
  margin-top: 8px;
  font-size: 0.84375rem;
  line-height: 1.78;
  color: var(--ink-mid);
}
.c-item abbr {
  text-decoration: none;
  border-bottom: 1px dotted var(--ink-ghost);
  cursor: help;
}

/* ── 清单 ─────────────────────────────────── */
.rest {
  margin-top: clamp(56px, 8.6vh, 92px);
  padding-top: clamp(38px, 5.6vh, 54px);
  border-top: 1px solid var(--line-faint);
}

.rest-list {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--line-faint);
  border: 1px solid var(--line-faint);
  border-radius: 12px;
  overflow: hidden;
}
.rest-item {
  background: var(--card);
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: background 0.35s ease, transform 0.35s var(--ease-out-expo);
}

@media (hover: hover) and (pointer: fine) {
  .rest-item:hover {
    background: rgba(255, 255, 255, 0.85);
    transform: translateY(-2px);
  }
}
.rest-item h4 {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink);
  letter-spacing: -0.01em;
}
.rest-item p {
  font-size: 0.875rem;
  line-height: 1.78;
  color: var(--ink-mid);
}

.mobile-dots {
  display: none;
  justify-content: center;
  align-items: center;
  gap: 7px;
  margin-top: 22px;
}
.mobile-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--line-strong);
  opacity: 0.35;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: width 0.35s var(--ease-out-expo), opacity 0.35s, background 0.35s;
}
.mobile-dots .dot.active {
  width: 22px;
  opacity: 1;
  background: var(--ink);
}

@media (max-width: 980px) {
  .toolkit {
    padding: clamp(52px, 8vh, 96px) 0;
  }
  .color-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 26px 20px;
  }
  .rest-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .toolkit {
    padding: clamp(44px, 7vh, 72px) 0;
  }
  .sec-head {
    margin-bottom: 28px;
  }
  .color-row {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 16px;
    padding-block: 8px 14px;
    margin-inline: calc(var(--gutter) * -1);
    padding-inline: var(--gutter);
    scrollbar-width: none;
  }
  .color-row::-webkit-scrollbar {
    display: none;
  }
  .c-item {
    flex: 0 0 clamp(240px, 78vw, 300px);
    scroll-snap-align: center;
  }
  .mobile-dots {
    display: flex;
  }
  .rest {
    margin-top: clamp(40px, 6vh, 60px);
    padding-top: clamp(28px, 4vh, 40px);
  }
}

@media (max-width: 640px) {
  .rest-list {
    grid-template-columns: minmax(0, 1fr);
  }
  .rest-item {
    padding: 18px 20px;
    gap: 8px;
  }
}
</style>
