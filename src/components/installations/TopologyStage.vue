<script setup>
import { onMounted } from 'vue'
import anime from 'animejs'

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  
  // 经典的墨迹拓扑绘制：保持原始的高雅感，但使用更细腻的缓动
  const path = document.querySelector('.topo-path')
  if (path) {
    const length = path.getTotalLength()
    anime.set(path, { strokeDasharray: length, strokeDashoffset: length })
    anime({
      targets: path,
      strokeDashoffset: [length, 0],
      duration: 2800,
      easing: 'easeInOutSine', // 更加柔和的 Sine 缓动
      loop: true,
      direction: 'alternate'
    })
  }

  anime({
    targets: '.topo-node',
    scale: [0, 1],
    opacity: [0, 1],
    delay: anime.stagger(180, { start: 400 }),
    duration: 1100,
    easing: 'easeOutQuart'
  })
})
</script>

<template>
  <div class="topology-stage">
    <svg class="svg-topology" viewBox="0 0 100 100" fill="none" stroke="currentColor">
      <path class="topo-path" d="M10,90 Q50,10 90,90 T170,90" stroke-width="0.8" stroke-linecap="round" />
      <path class="topo-path" d="M10,50 C30,50 70,20 90,50" stroke-width="0.4" opacity="0.4" />
      <circle class="topo-node" cx="10" cy="90" r="2" fill="currentColor" stroke="none" />
      <circle class="topo-node" cx="90" cy="90" r="2" fill="currentColor" stroke="none" />
      <circle class="topo-node" cx="50" cy="50" r="2.5" fill="var(--c-clay)" stroke="none" />
      <circle class="topo-node" cx="70" cy="30" r="1.5" fill="var(--c-sand)" stroke="none" />
    </svg>
  </div>
</template>

<style scoped>
.topology-stage {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
}
.svg-topology { width: 80%; height: 80%; color: var(--c-mist); }
</style>
