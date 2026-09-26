<script setup>
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import HeroSection from './components/HeroSection.vue'
import FeatureBlocks from './components/FeatureBlocks.vue'
import ColorToolkit from './components/ColorToolkit.vue'
import OriginStory from './components/OriginStory.vue'
import GetSection from './components/GetSection.vue'
import AppFooter from './components/AppFooter.vue'
import { initReveal } from './composables/useReveal.js'

onMounted(() => initReveal())
</script>

<template>
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
