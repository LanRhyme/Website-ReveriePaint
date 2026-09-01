<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import anime from 'animejs'
import { useIntersection } from '../composables/useIntersection.js'

const SCENES = [
  {
    id: '01',
    cn: '雾起山岚',
    en: 'Mist & Mountain',
    sub: '苍翠隐现，晨雾叠嶂',
    accent: '#9da98e'
  },
  {
    id: '02',
    cn: '月白清辉',
    en: 'Moonlit Serenity',
    sub: '银辉倾泻，静夜如洗',
    accent: '#c8b48d'
  },
  {
    id: '03',
    cn: '花眠幽香',
    en: 'Slumber Blossom',
    sub: '暗香浮动，花事未了',
    accent: '#c3a39e'
  },
  {
    id: '04',
    cn: '沙语大漠',
    en: 'Desert Whisper',
    sub: '沙丘低语，瀚海无垠',
    accent: '#b08a75'
  }
]

const sectionRef = ref(null)
const trackRef = ref(null)
const progressRef = ref(null)
const { target: obsTarget, isVisible } = useIntersection({ threshold: 0.12 })

let raf = 0
let playing = false
let maxX = 0
let reduced = false

function measure() {
  const track = trackRef.value
  if (!track) return
  maxX = Math.max(0, track.scrollWidth - window.innerWidth)
}

function update() {
  raf = 0
  if (!playing) return
  const section = sectionRef.value
  const track = trackRef.value
  if (!section || !track) return
  const rect = section.getBoundingClientRect()
  const vh = window.innerHeight
  const total = Math.max(1, rect.height - vh)
  const p = Math.min(1, Math.max(0, (vh - rect.top) / total))
  track.style.transform = `translate3d(${-p * maxX}px, 0, 0)`
  track.querySelectorAll('.scene-art').forEach((el, i) => {
    const dir = i % 2 === 0 ? 1 : -1
    el.style.transform = `translate3d(${dir * p * 6}%, 0, 0) scale(${1 + p * 0.02})`
  })
  if (progressRef.value) progressRef.value.style.transform = `scaleX(${p})`
}

function onScroll() {
  if (!raf && playing) raf = requestAnimationFrame(update)
}

function splitTitle() {
  const el = sectionRef.value?.querySelector('.showcase-title')
  if (!el || el.dataset.split === '1') return
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)
  const texts = []
  while (walker.nextNode()) texts.push(walker.currentNode)
  texts.forEach((node) => {
    if (!node.textContent.trim()) return
    const frag = document.createDocumentFragment()
    ;[...node.textContent].forEach((ch) => {
      if (ch === ' ') {
        frag.appendChild(document.createTextNode(' '))
      } else {
        const s = document.createElement('span')
        s.className = 'char'
        s.textContent = ch
        s.style.display = 'inline-block'
        s.style.willChange = 'transform, opacity'
        frag.appendChild(s)
      }
    })
    node.parentNode.replaceChild(frag, node)
  })
  el.dataset.split = '1'
}

function playEntrance() {
  const tl = anime.timeline({ easing: 'easeOutExpo' })
  tl.add({
    targets: '.showcase-label',
    translateY: [14, 0],
    opacity: [0, 1],
    duration: 700
  })
    .add({
      targets: '.showcase-title .char',
      translateY: ['115%', '0%'],
      rotate: [4, 0],
      opacity: [0, 1],
      duration: 1100,
      delay: anime.stagger(60),
      easing: 'easeOutExpo'
    }, '-=450')
    .add({
      targets: '.scene-card',
      translateY: [36, 0],
      opacity: [0, 1],
      duration: 900,
      delay: anime.stagger(110),
      easing: 'easeOutExpo'
    }, '-=700')
    .add({
      targets: '.showcase-scrollbar',
      opacity: [0, 1],
      duration: 600
    }, '-=300')
}

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  measure()
  window.addEventListener('resize', measure)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('lenis:scroll', onScroll)

  if (!reduced) {
    splitTitle()
    anime.set('.showcase-label, .showcase-title .char, .scene-card, .showcase-scrollbar', { opacity: 0 })
  }
})

watch(isVisible, (v) => {
  if (v && !playing) {
    playing = true
    if (!reduced) playEntrance()
    update()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', measure)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('lenis:scroll', onScroll)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <section ref="sectionRef" class="showcase" aria-label="入梦四景">
    <div class="showcase-pin">
      <div class="showcase-head">
        <div class="showcase-label label-caps">
          <span class="line-seq"></span>04 — 入梦 · DREAMS
        </div>
        <h2 class="showcase-title text-veil">入梦四景</h2>
        <p class="showcase-sub">Dreams, drawn awake. 四种梦境的低饱和光谱切片。</p>
        <span class="v-text showcase-side" aria-hidden="true">沉浸 · 绘画 · 梦境</span>
      </div>

      <div ref="trackRef" class="showcase-track">
        <article
          v-for="s in SCENES"
          :key="s.id"
          class="scene-card"
          :style="{ '--accent': s.accent }"
        >
          <div class="scene-art">
            <svg class="scene-svg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <template v-if="s.id === '01'">
                <defs>
                  <linearGradient id="g01-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#1d1913" />
                    <stop offset="1" stop-color="#26211a" />
                  </linearGradient>
                  <linearGradient id="g01-far" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#9da98e" />
                    <stop offset="1" stop-color="#2a2620" />
                  </linearGradient>
                </defs>
                <rect width="400" height="500" fill="url(#g01-sky)" />
                <path d="M0 500V300L95 185l60 75 75-110 70 95 100-70v125z" fill="url(#g01-far)" opacity="0.45" />
                <path d="M0 500V380l110-85 75 70 105-80 110 70v125z" fill="#3a342a" opacity="0.6" />
                <path d="M0 500V430l130-75 120 60 150-70v155z" fill="#16130f" />
                <circle cx="322" cy="118" r="2.2" fill="#c8b48d" opacity="0.85" />
              </template>

              <template v-else-if="s.id === '02'">
                <defs>
                  <linearGradient id="g02-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#211d16" />
                    <stop offset="1" stop-color="#1d1913" />
                  </linearGradient>
                  <radialGradient id="g02-moon" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stop-color="#f4efe2" />
                    <stop offset="1" stop-color="#c8b48d" />
                  </radialGradient>
                </defs>
                <rect width="400" height="500" fill="url(#g02-sky)" />
                <circle cx="200" cy="180" r="72" fill="url(#g02-moon)" opacity="0.95" />
                <circle cx="200" cy="180" r="72" fill="none" stroke="#c8b48d" stroke-opacity="0.35" stroke-width="1" />
                <path d="M0 500V420c60-26 130-26 190 0s130 26 210 0v80z" fill="#16130f" />
                <path d="M0 500V455c60-22 130-22 190 0s130 22 210 0v45z" fill="#1d1913" />
                <circle cx="92" cy="96" r="1.6" fill="#ece6d8" opacity="0.6" />
                <circle cx="316" cy="140" r="1.3" fill="#ece6d8" opacity="0.45" />
              </template>

              <template v-else-if="s.id === '03'">
                <defs>
                  <linearGradient id="g03-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#2a1f1d" />
                    <stop offset="1" stop-color="#1d1913" />
                  </linearGradient>
                  <radialGradient id="g03-petal" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stop-color="#c3a39e" stop-opacity="0.7" />
                    <stop offset="1" stop-color="#c3a39e" stop-opacity="0" />
                  </radialGradient>
                  <radialGradient id="g03-petal2" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stop-color="#a79bb6" stop-opacity="0.6" />
                    <stop offset="1" stop-color="#a79bb6" stop-opacity="0" />
                  </radialGradient>
                </defs>
                <rect width="400" height="500" fill="url(#g03-sky)" />
                <circle cx="110" cy="150" r="60" fill="url(#g03-petal)" />
                <circle cx="300" cy="110" r="70" fill="url(#g03-petal2)" />
                <circle cx="210" cy="260" r="80" fill="url(#g03-petal)" />
                <circle cx="150" cy="360" r="90" fill="url(#g03-petal2)" />
                <circle cx="330" cy="330" r="65" fill="url(#g03-petal)" />
                <path d="M0 500V440c60-20 130-20 190 0s130 20 210 0v60z" fill="#16130f" opacity="0.9" />
                <circle cx="130" cy="150" r="2" fill="#ece6d8" opacity="0.5" />
                <circle cx="318" cy="118" r="1.6" fill="#ece6d8" opacity="0.4" />
              </template>

              <template v-else>
                <defs>
                  <linearGradient id="g04-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#201a14" />
                    <stop offset="1" stop-color="#16130f" />
                  </linearGradient>
                </defs>
                <rect width="400" height="500" fill="url(#g04-sky)" />
                <path d="M0 500V330c40-70 100-70 140 0s100 70 140 0 100-70 120-10v180z" fill="#b08a75" opacity="0.35" />
                <path d="M0 500V390c50-55 120-55 170 0s120 55 170 0 60-30 60 10v100z" fill="#c8b48d" opacity="0.22" />
                <path d="M0 500V445c60-40 130-40 190 0s130 40 210 0v55z" fill="#16130f" />
                <circle cx="90" cy="120" r="1.5" fill="#c8b48d" opacity="0.6" />
                <circle cx="330" cy="160" r="1.8" fill="#c8b48d" opacity="0.5" />
              </template>
            </svg>
            <div class="noise"></div>
            <div class="scene-art-glow"></div>
          </div>

          <div class="scene-meta">
            <div class="label-caps scene-index">{{ s.id }}</div>
            <h3 class="scene-cn">{{ s.cn }}</h3>
            <div class="scene-en label-caps">{{ s.en }}</div>
            <p class="scene-sub">{{ s.sub }}</p>
          </div>
        </article>
      </div>

      <div class="showcase-scrollbar" aria-hidden="true">
        <div ref="progressRef" class="showcase-scrollbar-fill"></div>
      </div>
      <span class="showcase-hint label-caps" aria-hidden="true">SCROLL · 横向入梦</span>
    </div>
  </section>
</template>

<style scoped>
.showcase {
  position: relative;
  height: 320vh;
  overflow-x: clip;
  border-top: 1px solid var(--border-wire);
}
.showcase-pin {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6rem 0 4rem;
}

.showcase-head {
  position: relative;
  padding: 0 8vw;
  margin-bottom: 3rem;
}
.showcase-label {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  color: var(--c-clay);
}
.showcase-label .line-seq {
  width: 40px;
  height: 1px;
  background: var(--c-clay);
  flex-shrink: 0;
}
.showcase-title {
  font-family: var(--font-serif);
  font-size: clamp(2.6rem, 5.4vw, 5.2rem);
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.06em;
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: fit-content;
}
.showcase-title .char {
  display: inline-block;
  overflow: hidden;
  will-change: transform, opacity;
}
.showcase-sub {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: var(--c-mist);
}
.showcase-side {
  position: absolute;
  right: 8vw;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--ip-cream-40);
  display: none;
}

.showcase-track {
  display: flex;
  align-items: center;
  gap: 2.4rem;
  padding: 0 8vw;
  width: max-content;
  will-change: transform;
}

.scene-card {
  position: relative;
  flex-shrink: 0;
  width: min(26vw, 380px);
  aspect-ratio: 4 / 5;
  border-radius: 26px;
  border: 1px solid var(--ip-hairline);
  background: var(--ip-ink2);
  overflow: hidden;
  will-change: transform, opacity;
}
.scene-art {
  position: absolute;
  inset: 0;
  overflow: hidden;
  will-change: transform;
}
.scene-svg {
  width: 100%;
  height: 100%;
  display: block;
}
.scene-art-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(90% 70% at 50% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%);
  opacity: 0;
  transition: opacity 0.6s var(--ease-silk);
  pointer-events: none;
}
.scene-card:hover .scene-art-glow {
  opacity: 1;
}

.scene-meta {
  position: absolute;
  left: 1.4rem;
  right: 1.4rem;
  bottom: 1.4rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.scene-index {
  font-size: 0.58rem;
  color: var(--ip-cream-40);
}
.scene-cn {
  font-family: var(--font-serif);
  font-size: 1.7rem;
  font-weight: 300;
  color: var(--ip-cream);
  letter-spacing: 0.14em;
  line-height: 1.1;
}
.scene-en {
  font-size: 0.58rem;
  color: var(--accent);
}
.scene-sub {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: var(--ip-cream-dim);
  margin-top: 0.2rem;
}

.showcase-scrollbar {
  position: absolute;
  left: 8vw;
  bottom: 2.2rem;
  width: min(32vw, 380px);
  height: 1px;
  background: var(--ip-hairline);
  overflow: hidden;
}
.showcase-scrollbar-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--ip-moss), var(--ip-sand), var(--ip-bean));
  transform-origin: left;
  will-change: transform;
}
.showcase-hint {
  position: absolute;
  right: 8vw;
  bottom: 2.2rem;
  font-size: 0.58rem;
  color: var(--ip-cream-40);
}

@media (min-width: 1180px) {
  .showcase-side {
    display: block;
  }
}
@media (max-width: 1024px) {
  .scene-card {
    width: min(62vw, 360px);
  }
  .showcase-track {
    gap: 1.6rem;
    padding: 0 6vw;
  }
  .showcase-head {
    padding: 0 6vw;
    margin-bottom: 2rem;
  }
  .showcase {
    height: 300vh;
  }
  .showcase-scrollbar {
    left: 6vw;
    bottom: 1.8rem;
    width: 42vw;
  }
  .showcase-hint {
    right: 6vw;
    bottom: 1.8rem;
  }
}
@media (max-width: 640px) {
  .scene-card {
    width: 76vw;
    border-radius: 20px;
  }
  .scene-meta {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
  .scene-cn {
    font-size: 1.4rem;
  }
  .showcase-hint {
    display: none;
  }
}
</style>
