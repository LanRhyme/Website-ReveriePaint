<script setup>
import { ref, onMounted, watch } from 'vue'
import anime from 'animejs'
import { useMagnetic } from '../composables/useMagnetic.js'

const props = defineProps({ ready: Boolean })

const sectionRef = ref(null)
const titleRef = ref(null)
const btn1Ref = ref(null)
const btn2Ref = ref(null)

useMagnetic(btn1Ref, 0.22)
useMagnetic(btn2Ref, 0.22)

const GITHUB_URL = 'https://github.com/LanRhyme/ReveriePaint'
const RELEASE_URL = 'https://github.com/LanRhyme/ReveriePaint/releases'

function splitTitle() {
  const el = titleRef.value
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

function playHero() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sectionRef.value?.classList.add('is-visible')
    return
  }
  splitTitle()
  const tl = anime.timeline({ easing: 'easeOutExpo' })
  tl.add({
    targets: '.hero-precision-tag .line-seq',
    scaleX: [0, 1],
    opacity: [0, 1],
    duration: 800,
    easing: 'easeOutExpo'
  })
    .add({
      targets: '.hero-precision-tag .tag-text',
      translateY: [12, 0],
      opacity: [0, 1],
      duration: 700,
      easing: 'easeOutExpo'
    }, '-=500')
    .add({
      targets: '.hero-title-giant .char',
      translateY: ['110%', '0%'],
      opacity: [0, 1],
      rotateZ: [3, 0],
      duration: 900,
      delay: anime.stagger(38),
      easing: 'easeOutExpo'
    }, '-=400')
    .add({
      targets: '.hero-bottom-manifesto',
      opacity: [0, 1],
      duration: 600,
      easing: 'linear'
    }, '-=600')
    .add({
      targets: '.manifesto-col',
      translateY: [18, 0],
      opacity: [0, 1],
      duration: 700,
      delay: anime.stagger(140),
      easing: 'easeOutExpo'
    }, '-=400')
    .add({
      targets: '.cta-wrap',
      translateY: [18, 0],
      opacity: [0, 1],
      duration: 700,
      easing: 'easeOutExpo'
    }, '-=500')
    .add({
      targets: '.pill-btn',
      scale: [0.96, 1],
      duration: 700,
      delay: anime.stagger(90),
      easing: 'easeOutExpo'
    }, '-=450')
    .add({
      targets: '.scroll-hint',
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 700,
      easing: 'easeOutQuad'
    }, '-=200')

  anime({
    targets: '.scroll-hint .scroll-dot',
    translateY: [0, 6, 0],
    duration: 1800,
    loop: true,
    easing: 'easeInOutSine',
    delay: 2000
  })

  const title = titleRef.value
  if (title && !window.matchMedia('(pointer: coarse)').matches) {
    const onMove = (e) => {
      const rect = title.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      anime({
        targets: '.hero-title-giant .char',
        translateX: (el, i) => dx * (6 + (i % 4) * 2),
        translateY: (el, i) => dy * (4 + (i % 3) * 2),
        duration: 900,
        easing: 'easeOutQuad'
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
  }
}

onMounted(() => { if (props.ready) playHero() })
watch(() => props.ready, (v) => { if (v) playHero() })
</script>

<template>
  <section ref="sectionRef" class="hero-exhibition">
    <div class="hero-precision-tag">
      <span class="line-seq"></span>
      <span class="tag-text">Aesthetic Pure Digital Canvas · Android / ARMv8-A</span>
    </div>

    <h1 ref="titleRef" class="hero-title-giant">
      心之所向<br />
      落笔<span class="serif-italic">成境</span>
    </h1>

    <div class="hero-bottom-manifesto">
      <div class="manifesto-col">
        <strong>内核构型</strong>
        基于 Krita C++ 经典图像处理管道构建，将工业级多核栅格化算力无损封装于移动手持终端
      </div>
      <div class="manifesto-col">
        <strong>美学准则</strong>
        摒除冗余工具堆叠，以莫兰迪低饱和光谱与瑞士理性网格重新编排手势与手写笔的灵感流转
      </div>
      <div class="cta-wrap">
        <a ref="btn1Ref" :href="RELEASE_URL" class="pill-btn pill-btn--primary" target="_blank" rel="noopener">
          <span class="pill-fill" aria-hidden="true"></span>
          <span class="pill-label">下载 APK · Releases</span>
          <span class="pill-arrow" aria-hidden="true">↗</span>
        </a>
        <a ref="btn2Ref" :href="GITHUB_URL" class="pill-btn pill-btn--ghost" target="_blank" rel="noopener">
          <span class="pill-fill" aria-hidden="true"></span>
          <span class="pill-label">GitHub 仓库</span>
          <span class="pill-arrow" aria-hidden="true">↗</span>
        </a>
        <div class="cta-sub"><span>GPL-3.0</span><i></i><span>ARM64-V8A</span><i></i><span>120 FPS</span><i></i><span>开源开放</span></div>
      </div>
    </div>

    <div class="scroll-hint" aria-hidden="true">
      <span class="scroll-label">SCROLL</span>
      <span class="scroll-track"><span class="scroll-dot"></span></span>
    </div>
  </section>
</template>

<style scoped>
.hero-exhibition {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 7rem 8vw 4rem;
  position: relative;
  overflow: hidden;
}

.hero-precision-tag {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--c-clay);
  margin-bottom: 2.2rem;
  display: flex;
  align-items: center;
  gap: 1.4rem;
}
.hero-precision-tag .line-seq {
  width: 40px;
  height: 1px;
  background: var(--c-clay);
  flex-shrink: 0;
  transform-origin: left;
}
.tag-text { display: inline-block; }

.hero-title-giant {
  font-family: var(--font-serif);
  font-size: clamp(3.2rem, 8.4vw, 8.2rem);
  font-weight: 300;
  line-height: 1.14;
  letter-spacing: 0.03em;
  max-width: 1400px;
  margin-bottom: 3rem;
  overflow: visible;
}
.hero-title-giant :deep(.char) {
  display: inline-block;
  will-change: transform, opacity;
}
.hero-title-giant .serif-italic {
  font-family: var(--font-serif);
  color: var(--c-sand);
  font-weight: 400;
  letter-spacing: 0.05em;
  margin-left: 0.35rem;
}

.hero-bottom-manifesto {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  border-top: 1px solid var(--border-wire);
  padding-top: 2rem;
  gap: 2.4rem;
  align-items: flex-start;
}
.manifesto-col {
  font-family: var(--font-sans);
  font-size: 0.82rem;
  line-height: 2.0;
  color: var(--c-mist);
  letter-spacing: 0.04em;
  font-weight: 300;
}
.manifesto-col strong {
  font-family: var(--font-mono);
  color: var(--c-text);
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.7rem;
}

.cta-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
  will-change: transform;
}
.pill-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.95rem 1.9rem;
  border-radius: 999px;
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  overflow: hidden;
  cursor: pointer;
  isolation: isolate;
  transition: border-color 0.4s var(--ease-silk), color 0.4s var(--ease-silk);
}
.pill-fill {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  transform: translateY(101%);
  transition: transform 0.55s var(--ease-silk);
}
.pill-btn:hover .pill-fill { transform: translateY(0); }
.pill-label { position: relative; z-index: 1; }
.pill-arrow {
  position: relative;
  z-index: 1;
  font-size: 0.85rem;
  transition: transform 0.4s var(--ease-silk);
}
.pill-btn:hover .pill-arrow { transform: translate(3px, -3px); }

.pill-btn--primary {
  border: 1px solid var(--ip-sand);
  color: var(--ip-cream);
  background: rgba(236, 230, 216, 0.04);
}
.pill-btn--primary .pill-fill { background: var(--ip-cream); }
.pill-btn--primary:hover { border-color: var(--ip-sand); color: var(--ip-ink); }

.pill-btn--ghost {
  border: 1px solid var(--ip-hairline);
  color: var(--ip-cream-dim);
  background: transparent;
}
.pill-btn--ghost .pill-fill { background: var(--ip-ink3); }
.pill-btn--ghost:hover { border-color: var(--ip-cream-40); color: var(--ip-cream); }

.cta-sub {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  color: var(--c-ash);
  text-transform: uppercase;
  margin-top: 0.35rem;
  padding-left: 0.4rem;
}
.cta-sub i {
  width: 2px;
  height: 2px;
  background: var(--c-ash);
  border-radius: 50%;
  opacity: 0.6;
  display: inline-block;
}

.scroll-hint {
  position: absolute;
  left: 8vw;
  bottom: 1.8rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.28em;
  color: var(--c-ash);
}
.scroll-track { width: 1px; height: 32px; background: rgba(255,255,255,0.12); position: relative; overflow: hidden; }
.scroll-dot { position: absolute; top: 0; left: 0; width: 100%; height: 12px; background: var(--c-sand); }

@media (max-width: 1024px) {
  .hero-exhibition { padding: 6rem 6vw 3rem; }
  .hero-bottom-manifesto { grid-template-columns: 1fr; gap: 1.8rem; }
  .scroll-hint { display: none; }
}
@media (max-width: 640px) {
  .hero-exhibition { padding: 5.5rem 5vw 2.5rem; min-height: auto; }
  .hero-precision-tag { font-size: 0.58rem; letter-spacing: 0.18em; gap: 0.9rem; margin-bottom: 1.6rem; }
  .hero-precision-tag .line-seq { width: 24px; }
  .hero-title-giant { font-size: clamp(2.6rem, 11vw, 3.8rem); margin-bottom: 2rem; line-height: 0.95; }
  .hero-bottom-manifesto { padding-top: 1.4rem; gap: 1.2rem; }
  .manifesto-col { font-size: 0.68rem; line-height: 1.7; }
  .cta-wrap { gap: 0.65rem; }
  .pill-btn { padding: 0.85rem 1.4rem; font-size: 0.68rem; letter-spacing: 0.14em; }
}
</style>
