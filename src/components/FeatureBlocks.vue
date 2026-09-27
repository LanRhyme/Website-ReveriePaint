<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap, ScrollTrigger } from '../composables/useGsap.js'
import brushBench from '../assets/shots/ui-brush-bench.webp'
import penSettings from '../assets/shots/ui-pen-settings.webp'
import filters from '../assets/shots/ui-filters.webp'
import blend from '../assets/shots/ui-blend.webp'
import toolbar from '../assets/shots/ui-toolbar.webp'
import lasso from '../assets/shots/work-lasso.webp'
import reference from '../assets/shots/work-reference.webp'

/**
 * 交错图文：每段聚焦一个「为什么它更好画」的理由。
 * flip = true 时图在右、文在左，形成节奏变化。
 */
const blocks = [
  {
    id: 'bench',
    kicker: '笔刷工坊',
    title: '深植 Krita 原生内核，自由掌控每一道笔触',
    body: '直接复用 Krita 核心笔刷渲染引擎，提供真实的物理笔触与颜料混合模拟。笔尖形状印记、色彩涂抹混合、动态阻尼与压感曲线全开，支持保存为个人专属笔刷预设。',
    points: ['复用 Krita 官方图像与物理颜料模拟内核', '圆形、方形与自定义笔尖贴图导入', '完整保留压感动态曲线与参数微调'],
    img: brushBench,
    alt: '笔刷工作台，左侧为参数分类，右侧为笔尖贴图选择、边缘羽化、抗锯齿与随机翻转设置',
    flip: false
  },
  {
    id: 'pen',
    kicker: '手写笔适配',
    title: '硬件级压感调校，深度适配多品牌手写笔',
    body: '针对华为 M-Pencil（支持第三代星闪 16384 级超高压感与快捷手势）、OPPO / 一加手写笔（笔身滑动调节、线性触感微震与毫秒级轨迹预测）、三星 S Pen（悬浮感应与按键映射）以及标准 Android 触控笔协议提供全方位底层调校。内置自定义压力过渡曲线与悬空光标预览，彻底告别断触与延迟。',
    points: [
      '华为 M-Pencil 星闪 16K 压感与侧键手势',
      'OPPO / 一加笔身触控滑动与真实纸感微震',
      '三星 S Pen 与通用 Android 协议深度支持',
      '多控制点自定义压力曲线与实时试笔区'
    ],
    img: penSettings,
    alt: '手写笔设置页，包含多品牌手写笔专属适配与自定义压力曲线微调',
    flip: true
  },
  {
    id: 'lasso',
    kicker: '精准选区',
    title: '逐点可控的多段折线套索',
    body: '专为复杂插画构图打造的折线选区系统，节点落位精准，支持单点独立撤销与无缝闭合。协同加选、减选、反选与实时边缘羽化，让局部精修和构图微调精确到每一个像素。',
    points: ['逐点精确落位与独立单点回溯撤销', '支持加选、减选、反选与实时羽化', '自由手绘与折线节点无缝混合'],
    img: lasso,
    alt: '多段折线套索正在画布上框选区域，下方悬浮工具条提供闭合、撤销与羽化操作',
    flip: false
  },
  {
    id: 'reference',
    kicker: '悬浮参考',
    title: '双模式悬浮参考窗，全局构图尽在掌控',
    body: '画布上方自由悬浮、平移与缩放。不仅支持载入高分辨率外部参考图，更支持将当前主画布实时镜像投影，随时比对整体构图、翻转检查比例与局部明暗。',
    points: ['外部参考图片与主画布镜像双模式', '任意拖曳、双指缩放与独立锁定', '零遮挡主工作区，保持沉浸心流'],
    img: reference,
    alt: '画布界面，悬浮参考窗口显示参考图像，主画布正在绘制人物线稿',
    flip: true
  }
]

const pills = [
  { img: filters, title: '35 种实时滤镜', desc: '色彩调整、模糊平滑、边缘增强、通道映射、艺术效果与空间扭曲，实时渲染预览' },
  { img: blend, title: '25 种混合模式', desc: '正片叠底、滤色、叠加、柔光、强光、颜色减淡等完整支持，图层效果直观可视' },
  { img: toolbar, title: '自由定制工具栏', desc: '按个人绘画习惯随心布置 28 个常用工具位，画布界面干净纯粹' }
]

const sectionRef = ref(null)
let ctx = null

function onMediaMouseMove(e) {
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
        <p class="eyebrow">核心特性</p>
        <h2 class="h-section">
          不妥协的桌面级创作工作流
        </h2>
        <p class="lede sec-sub">摒弃移动端绘画软件常见的阉割与简化，把核心参数控制权完整交还给画师</p>
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
            @mousemove="onMediaMouseMove"
            @mouseleave="onMediaMouseLeave"
          >
            <img :src="b.img" :alt="b.alt" loading="lazy" decoding="async" />
          </div>

          <div class="block-copy">
            <p class="eyebrow">{{ b.kicker }}</p>
            <h3 class="block-title">{{ b.title }}</h3>
            <p class="block-body">{{ b.body }}</p>
            <ul class="block-points">
              <li v-for="p in b.points" :key="p">{{ p }}</li>
            </ul>
          </div>
        </article>
      </div>

      <!-- ── 三张并列 ───────────────────────── -->
      <div class="pills">
        <article v-for="p in pills" :key="p.title" class="pill">
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
.block-media:hover {
  box-shadow: var(--shadow-xl);
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
.pill:hover .pill-shot img {
  transform: scale(1.03);
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
