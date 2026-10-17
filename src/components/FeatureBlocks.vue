<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap, isFineHoverPointer, prefersReducedMotion } from '../composables/useGsap.js'
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
  { id: 'bench', img: brushBench, flip: false, ratio: '1700 / 968' },
  { id: 'pen', img: penSettings, flip: true, ratio: '1700 / 968' },
  { id: 'lasso', img: lasso, flip: false, ratio: '1800 / 1125' },
  { id: 'reference', img: reference, flip: true, ratio: '1800 / 1125' }
]

const blocks = computed(() => {
  const list = t('features.blocks') || []
  return blockMeta.map((meta, idx) => {
    const item = list[idx] || {}
    return {
      ...meta,
      ...item,
      num: String(idx + 2).padStart(2, '0'),
      titleLines: splitTitle(item.title)
    }
  })
})

/** 中文标题按逗号断行，比让浏览器随机断在词中间好看 */
function splitTitle(title = '') {
  const i = title.indexOf('，')
  if (i < 0 || i === title.length - 1) return [title]
  return [title.slice(0, i + 1), title.slice(i + 1)]
}

const pillImgs = [filters, blend, toolbar]
const pills = computed(() => {
  const list = t('features.pills') || []
  return list.map((item, idx) => ({
    ...item,
    img: pillImgs[idx],
    num: String(idx + 6).padStart(2, '0')
  }))
})

const sectionRef = ref(null)
let ctx = null

function onPlateMouseMove(e) {
  if (!isFineHoverPointer(e)) return
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  gsap.to(el, {
    rotationY: x * 3.5,
    rotationX: -y * 3.5,
    duration: 0.55,
    ease: 'power2.out',
    transformPerspective: 1600
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

onMounted(() => {
  if (prefersReducedMotion() || !sectionRef.value) return

  // 图版在框内做极小幅度的反向位移，滚动时有纸张错位的感觉
  ctx = gsap.matchMedia(sectionRef.value)
  ctx.add('(min-width: 861px)', () => {
    sectionRef.value.querySelectorAll('.block-plate .plate-img img').forEach((img) => {
      gsap.fromTo(
        img,
        { yPercent: -2.6 },
        {
          yPercent: 2.6,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.block'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        }
      )
    })
  })
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section id="features" ref="sectionRef" class="features">
    <div class="shell">
      <header class="sec-head reveal">
        <div class="sec-rail">
          <span class="sec-num">01</span>
          <span class="sec-label">{{ t('features.eyebrow') }}</span>
        </div>
        <h2 class="h-section">
          <span class="line-mask"><span class="line-inner" style="--d: 70ms">{{ t('features.title') }}</span></span>
        </h2>
        <p class="lede sec-sub">{{ t('features.sub') }}</p>
      </header>
    </div>

    <div class="shell blocks">
      <article
        v-for="b in blocks"
        :key="b.id"
        class="block reveal"
        :class="{ 'is-flip': b.flip }"
      >
        <div class="block-plate">
          <div class="plate" @mousemove="onPlateMouseMove" @mouseleave="onPlateMouseLeave">
            <div class="plate-img" :style="{ aspectRatio: b.ratio }">
              <img :src="b.img" :alt="b.alt" loading="lazy" decoding="async" />
            </div>
          </div>
          <p class="plate-cap"><b>{{ b.num }}</b><span>{{ b.kicker }}</span></p>
        </div>

        <div class="block-copy">
          <h3 class="h-block block-title">
            <span
              v-for="(line, i) in b.titleLines"
              :key="i"
              class="line-mask"
            ><span class="line-inner" :style="{ '--d': `${i * 80}ms` }">{{ line }}</span></span>
          </h3>
          <p class="body-text">{{ b.body }}</p>
          <ul class="block-points">
            <li v-for="p in b.points" :key="p">{{ p }}</li>
          </ul>
        </div>
      </article>
    </div>

    <div class="shell">
      <div class="pills">
        <article
          v-for="(p, i) in pills"
          :key="p.title"
          class="pill reveal"
          :style="{ '--d': `${i * 80}ms` }"
        >
          <div class="plate">
            <div class="plate-img pill-img">
              <img :src="p.img" :alt="`${p.title} 界面`" loading="lazy" decoding="async" />
            </div>
          </div>
          <p class="plate-cap"><b>{{ p.num }}</b></p>
          <h3>{{ p.title }}</h3>
          <p class="pill-desc">{{ p.desc }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  position: relative;
  padding-block: var(--sec-air);
}

/* ══ 交错图文 ═══════════════════════════════ */
.blocks {
  display: flex;
  flex-direction: column;
  gap: clamp(64px, 9vh, 120px);
}

.block {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--col-gap);
  align-items: center;
}

/* 图版固定占 6 栏，另一侧文案占 5 栏，中间空一整栏 */
.block-plate {
  grid-column: 1 / 7;
  /* 图版贴边时，四角裁切标记会多出 9px，这里裁掉，避免横向溢出 */
  overflow: hidden;
}
.block-copy {
  grid-column: 8 / -1;
}
.block-copy p.body-text {
  margin-top: 18px;
  max-width: 30em;
}

/* 图版左右交替：一边永远贴到屏幕边 */
.block.is-flip .block-plate {
  grid-column: 7 / -1;
}
.block.is-flip .block-copy {
  grid-column: 1 / 6;
}

.block-plate .plate-img {
  /* 不指定比例：内联 style 用图片自身的比例，cover 等于原样铺满，
     不会横向裁掉截图里的左侧工具栏 */
  background: var(--ui-900);
  will-change: transform;
}
.block-plate .plate-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 图版说明：编号跟着图版外侧对齐 */
.block-plate .plate-cap {
  padding-right: 2px;
}

.block-title {
  color: var(--ink);
}
.block-points {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.block-points li {
  position: relative;
  padding-left: 16px;
  font-size: 0.84375rem;
  line-height: 1.7;
  color: var(--ink-soft);
}
.block-points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.66em;
  width: 6px;
  height: 1px;
  background: var(--ink-ghost);
}

/* ══ 三张并列 ═══════════════════════════════ */
.pills {
  margin-top: clamp(64px, 9vh, 120px);
  padding-top: clamp(28px, 4vh, 40px);
  border-top: 1px solid var(--ink);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: var(--col-gap);
}

.pill-img {
  aspect-ratio: 1 / 1;
  background: var(--ui-800);
}
.pill-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform var(--dur-slow) var(--ease-out-expo);
}
@media (hover: hover) and (pointer: fine) {
  .pill:hover .pill-img img {
    transform: scale(1.025);
  }
}

.pill .plate-cap {
  margin-top: 12px;
}
.pill h3 {
  margin-top: 10px;
  font-size: 1.0625rem;
  font-weight: 500;
  letter-spacing: -0.014em;
}
.pill-desc {
  margin-top: 8px;
  font-size: 0.84375rem;
  line-height: 1.8;
  color: var(--ink-mid);
}

/* ══ 响应式 ═════════════════════════════════ */
@media (max-width: 1024px) {
  .block-plate {
    grid-column: 1 / 7;
  }
  .block-copy {
    grid-column: 7 / -1;
  }
  .block.is-flip .block-plate {
    grid-column: 7 / -1;
  }
  .block.is-flip .block-copy {
    grid-column: 1 / 7;
  }
}

@media (max-width: 860px) {
  .features {
    padding: 44px 0 64px;
  }
  .blocks {
    gap: clamp(48px, 8vh, 72px);
  }
  .block,
  .block.is-flip {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 20px;
  }
  /* 手机上统一图在上、文在下，图版左右都出血 */
  .block.is-flip .block-plate,
  .block-plate {
    grid-column: 1;
  }
  .block.is-flip .block-copy,
  .block-copy {
    grid-column: 1;
    max-width: 100%;
  }
  .block-title {
    font-size: clamp(1.25rem, 5vw, 1.5rem);
  }
  .pills {
    margin-top: 56px;
    padding-top: 28px;
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }
}
</style>
