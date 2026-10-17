<script setup>
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import HeroSection from './components/HeroSection.vue'
import FeatureBlocks from './components/FeatureBlocks.vue'
import ColorToolkit from './components/ColorToolkit.vue'
import OriginStory from './components/OriginStory.vue'
import GetSection from './components/GetSection.vue'
import AppFooter from './components/AppFooter.vue'
import FluidCanvas from './components/FluidCanvas.vue'
import { initReveal } from './composables/useReveal.js'
import { initGsapScroll } from './composables/useGsap.js'

onMounted(() => {
  // 两个初始化互不牵连：任一挂掉都不该让整页内容停在不可见状态
  try {
    initReveal()
  } catch (err) {
    console.error('[reveal] init failed', err)
    document.querySelectorAll('.reveal, .reveal-fade').forEach((el) => el.classList.add('is-in'))
  }
  try {
    initGsapScroll()
  } catch (err) {
    console.error('[gsap] init failed', err)
  }
})
</script>

<template>
  <FluidCanvas />
  <AppHeader />

  <main>
    <HeroSection />
    <FeatureBlocks />
    <ColorToolkit />
    <OriginStory />
    <GetSection />
  </main>

  <AppFooter />
</template>
