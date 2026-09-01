<script setup>
import { onMounted } from 'vue'
import anime from 'animejs'

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  
  anime({
    targets: '.prism-ray',
    opacity: [0, 0.6],
    scale: [0, 1],
    delay: anime.stagger(150),
    duration: 1500,
    easing: 'easeOutExpo'
  })

  anime({
    targets: '.prism-core',
    rotate: [0, 360],
    duration: 28000,
    loop: true,
    easing: 'linear'
  })
})
</script>

<template>
  <div class="chroma-prism-wrap">
    <template v-for="i in 8" :key="i">
      <div class="prism-ray" :style="{ 
        top: `${10 + i * 10}%`,
        background: `linear-gradient(90deg, var(--c-clay), transparent)`,
        transform: `rotate(${i * 3}deg)`
      }"></div>
    </template>
    <div class="prism-core"></div>
  </div>
</template>

<style scoped>
.chroma-prism-wrap {
  width: 85%; height: 75%; position: relative; display: flex; align-items: center; justify-content: center;
}
.prism-ray {
  position: absolute; height: 1px; width: 100%; transform-origin: left center;
}
.prism-core {
  width: 70px; height: 70px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transform: rotate(45deg);
  position: relative; z-index: 5;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
}
</style>
