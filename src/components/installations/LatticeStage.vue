<script setup>
import { onMounted } from 'vue'
import anime from 'animejs'

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  
  anime({
    targets: '.lattice-node',
    scale: [0, 1],
    opacity: [0, 1],
    delay: anime.stagger(120),
    duration: 1200,
    easing: 'easeOutExpo'
  })
})
</script>

<template>
  <div class="isometric-lattice">
    <template v-for="i in 9" :key="i">
      <div class="lattice-node"></div>
    </template>
  </div>
</template>

<style scoped>
.isometric-lattice {
  width: 320px; height: 320px; position: relative;
  transform-style: preserve-3d;
  transform: rotateX(60deg) rotate(-45deg);
}
.lattice-node {
  position: absolute; width: 60px; height: 60px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(107, 130, 148, 0.08);
  backdrop-filter: blur(6px);
  transform-style: preserve-3d;
  transition: background 0.6s;
}
.lattice-node:hover {
  background: rgba(213, 195, 178, 0.2);
}
/* 手动定位 3x3，保持最原始的结构 */
.lattice-node:nth-child(1) { top: 0; left: 0; }
.lattice-node:nth-child(2) { top: 0; left: 80px; }
.lattice-node:nth-child(3) { top: 0; left: 160px; }
.lattice-node:nth-child(4) { top: 80px; left: 0; }
.lattice-node:nth-child(5) { top: 80px; left: 80px; }
.lattice-node:nth-child(6) { top: 80px; left: 160px; }
.lattice-node:nth-child(7) { top: 160px; left: 0; }
.lattice-node:nth-child(8) { top: 160px; left: 80px; }
.lattice-node:nth-child(9) { top: 160px; left: 160px; }
</style>
