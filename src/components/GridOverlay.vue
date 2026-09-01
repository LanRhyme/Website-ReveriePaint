<script setup>
import { onMounted } from 'vue'
import anime from 'animejs'

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  anime.set('.grid-col-line', { scaleY: 0, transformOrigin: 'top' })
  anime({
    targets: '.grid-col-line',
    scaleY: [0, 1],
    duration: 1400,
    delay: anime.stagger(180, { start: 900 }),
    easing: 'easeOutExpo'
  })
  anime({
    targets: '.film-grain',
    opacity: [0, 0.045],
    duration: 2000,
    delay: 600,
    easing: 'linear'
  })
  // subtle pulse on grid lines
  anime({
    targets: '.grid-col-line',
    opacity: [0.4, 0.7, 0.4],
    duration: 4000,
    loop: true,
    delay: anime.stagger(600),
    easing: 'easeInOutSine'
  })
})
</script>

<template>
  <div aria-hidden="true">
    <div class="grid-lines">
      <div></div>
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
      <div></div>
    </div>
    <div class="film-grain"></div>
  </div>
</template>

<style scoped>
.grid-lines {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  display: grid;
  grid-template-columns: 8vw 1fr 1fr 8vw;
  border-left: 1px solid var(--border-wire);
  border-right: 1px solid var(--border-wire);
}
.grid-col-line {
  border-right: 1px solid var(--border-wire);
  height: 100%;
  will-change: transform, opacity;
}
.film-grain {
  position: fixed;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  opacity: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
@media (max-width: 1024px) {
  .grid-lines {
    display: none;
  }
}
</style>
