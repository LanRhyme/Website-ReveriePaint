<script setup>
import { ref, computed } from 'vue'
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
    shot: colorShots[idx],
    num: String(idx + 9).padStart(2, '0')
  }))
})

const specs = computed(() => t('toolkit.specs') || [])

const activeColorIndex = ref(0)
const colorRowRef = ref(null)

function onColorScroll() {
  if (!colorRowRef.value) return
  const el = colorRowRef.value
  const itemWidth = el.scrollWidth / colors.value.length
  activeColorIndex.value = Math.min(
    colors.value.length - 1,
    Math.max(0, Math.round(el.scrollLeft / itemWidth))
  )
}

function scrollToColor(index) {
  const el = colorRowRef.value
  if (!el) return
  el.querySelectorAll('.c-item')[index]?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}

function onPlateMouseMove(e) {
  if (!isFineHoverPointer(e)) return
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  gsap.to(el, {
    rotationY: x * 4,
    rotationX: -y * 4,
    duration: 0.55,
    ease: 'power2.out',
    transformPerspective: 1200
  })
}

function onPlateMouseLeave(e) {
  if (!e?.currentTarget) return
  if (!isFineHoverPointer(e)) {
    gsap.set(e.currentTarget, { rotationY: 0, rotationX: 0 })
    return
  }
  gsap.to(e.currentTarget, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'power3.out' })
}
</script>

<template>
  <section id="toolkit" class="toolkit">
    <!-- 深色带：整页最暗的一段，取色器图版直接放进去 -->
    <div class="band-dark">
      <div class="shell band-inner">
        <header class="sec-head reveal">
          <div class="sec-rail">
            <span class="sec-num">02</span>
            <span class="sec-label">{{ t('toolkit.eyebrow') }}</span>
          </div>
          <h2 class="h-section">
            <span class="line-mask"><span class="line-inner" style="--d: 70ms">{{ t('toolkit.title') }}</span></span>
          </h2>
          <p class="sec-sub lede">{{ t('toolkit.sub') }}</p>
        </header>

        <div ref="colorRowRef" class="color-row" @scroll.passive="onColorScroll">
          <figure
            v-for="(c, i) in colors"
            :key="c.title"
            class="c-item reveal"
            :style="{ '--d': `${i * 90}ms` }"
          >
            <div class="plate" @mousemove="onPlateMouseMove" @mouseleave="onPlateMouseLeave">
              <div class="plate-img c-shot">
                <img :src="c.shot" :alt="c.alt" loading="lazy" decoding="async" />
              </div>
            </div>
            <figcaption>
              <p class="plate-cap"><b>PL. {{ c.num }}</b></p>
              <h3>{{ c.title }}</h3>
              <p class="c-desc">{{ c.desc }}</p>
            </figcaption>
          </figure>
        </div>

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
      </div>
    </div>

    <!-- 回到浅色：架构矩阵 -->
    <div class="shell">
      <div class="rest reveal">
        <div class="rest-head">
          <span class="sec-num">02 / B</span>
          <span class="sec-label">{{ t('toolkit.specsEyebrow') }}</span>
          <span class="rest-line" aria-hidden="true"></span>
        </div>
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
  position: relative;
}

.band-dark {
  padding-block: var(--sec-air);
  background:
    radial-gradient(120% 90% at 50% -10%, #22262c 0%, #17191c 58%, #141619 100%);
}
.band-inner {
  position: relative;
}

/* 深色带里的角标改成半透明白 */
.c-item .plate::before {
  filter: invert(1);
  opacity: 0.22;
}

/* ── 四张色彩图版 ─────────────────────────── */
.color-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: var(--col-gap);
}

.c-item {
  display: flex;
  flex-direction: column;
}

.c-shot {
  aspect-ratio: 3 / 4.6;
  background: #101215;
}
.c-shot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform var(--dur-slow) var(--ease-out-expo);
}

@media (hover: hover) and (pointer: fine) {
  .c-item:hover .c-shot img {
    transform: scale(1.025);
  }
  .c-item:hover h3 {
    color: #fff;
  }
}

.c-item figcaption {
  margin-top: 16px;
}
.c-item .plate-cap {
  color: var(--ui-text-dim);
  margin-bottom: 8px;
}
.c-item h3 {
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: #edecea;
  transition: color var(--dur-fast);
}
.c-desc {
  margin-top: 8px;
  font-size: 0.8125rem;
  line-height: 1.8;
  color: var(--ui-text-dim);
}

/* ── 手机端指示点 ─────────────────────────── */
.mobile-dots {
  display: none;
  justify-content: center;
  align-items: center;
  gap: 7px;
  margin-top: 28px;
}
.mobile-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: width 0.35s var(--ease-out-expo), background 0.3s;
}
.mobile-dots .dot.active {
  width: 22px;
  background: #fff;
}

/* ── 架构矩阵（浅色） ─────────────────────── */
.rest {
  padding-top: var(--sec-air);
  padding-bottom: var(--sec-air);
}

.rest-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 26px;
}
.rest-line {
  flex: 1;
  height: 1px;
  background: var(--line);
}

.rest-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: var(--col-gap);
  row-gap: 0;
}
.rest-item {
  padding-block: 24px;
  border-top: 1px solid var(--line);
}
/* 三列时，每列第一项的线由父级提供，避免双线 */
.rest-list .rest-item:nth-child(-n + 3) {
  border-top: 1px solid var(--ink);
}
.rest-item + .rest-item {
  border-left: 0;
}
.rest-item h4 {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink);
  letter-spacing: -0.01em;
}
.rest-item p {
  margin-top: 10px;
  font-size: 0.84375rem;
  line-height: 1.85;
  color: var(--ink-mid);
}

@media (max-width: 1024px) {
  .rest-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .rest-list .rest-item:nth-child(-n + 3) {
    border-top: 1px solid var(--line);
  }
  .rest-list .rest-item:nth-child(-n + 2) {
    border-top: 1px solid var(--ink);
  }
}

@media (max-width: 980px) {
  .color-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 30px 20px;
  }
}

@media (max-width: 680px) {
  .band-dark {
    padding: 48px 0 52px;
  }
  .color-row {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 14px;
    padding-block: 4px 8px;
    margin-inline: calc(var(--gutter) * -1);
    padding-inline: var(--gutter);
    scrollbar-width: none;
  }
  .color-row::-webkit-scrollbar {
    display: none;
  }
  .c-item {
    flex: 0 0 clamp(232px, 76vw, 300px);
    scroll-snap-align: center;
  }
  .mobile-dots {
    display: flex;
  }
  .rest {
    padding-top: 44px;
    padding-bottom: 56px;
  }
  .rest-list {
    grid-template-columns: minmax(0, 1fr);
  }
  .rest-list .rest-item {
    border-top: 1px solid var(--line);
  }
  .rest-list .rest-item:first-child {
    border-top: 1px solid var(--ink);
  }
  .rest-item {
    padding-block: 20px;
  }
}
</style>
