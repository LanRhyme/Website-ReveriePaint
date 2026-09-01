<script setup>
import { onMounted } from 'vue'
import anime from 'animejs'

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  
  // 经典的相图轨迹：旋转椭圆 + 路径往复
  const path = document.querySelector('.attractor-path')
  if (path) {
    const length = path.getTotalLength()
    anime.set(path, { strokeDasharray: length, strokeDashoffset: length })
    anime({
      targets: path,
      strokeDashoffset: [length, 0],
      duration: 3500,
      easing: 'easeInOutQuad',
      loop: true,
      direction: 'alternate'
    })
  }

  anime({
    targets: '.attractor-orbit',
    rotate: [0, 360],
    duration: 22000,
    loop: true,
    easing: 'linear'
  })
})
</script>

<template>
  <svg class="phase-attractor-svg" viewBox="0 0 500 500" fill="none" stroke="currentColor">
    <!-- 吸引子核心轨迹 -->
    <path class="attractor-path" d="M250,250 C300,100 400,400 250,250 C100,100 400,100 250,250" stroke-width="0.8" stroke-linecap="round" />
    
    <!-- 3D 旋转轨道 -->
    <ellipse class="attractor-orbit" cx="250" cy="250" rx="140" ry="60" stroke-width="0.4" opacity="0.3" />
    <ellipse class="attractor-orbit" cx="250" cy="250" rx="190" ry="90" stroke-width="0.3" opacity="0.2" />
    
    <circle cx="250" cy="250" r="3" fill="var(--c-clay)" stroke="none" />
  </svg>
</template>

<style scoped>
.phase-attractor-svg { width: 90%; height: 90%; }
.attractor-orbit { transform-origin: 250px 250px; }
</style>
