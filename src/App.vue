<script setup>
import { ref } from 'vue'
import AppCursor from './components/AppCursor.vue'
import WebGLBackground from './components/WebGLBackground.vue'

import AppHeader from './components/AppHeader.vue'
import HeroSection from './components/HeroSection.vue'
import InstallationFrame from './components/InstallationFrame.vue'
import TopologyStage from './components/installations/TopologyStage.vue'
import LatticeStage from './components/installations/LatticeStage.vue'
import PrismStage from './components/installations/PrismStage.vue'
import AttractorStage from './components/installations/AttractorStage.vue'
import AppFooter from './components/AppFooter.vue'
import PageLoader from './components/PageLoader.vue'
import ScrollProgress from './components/ScrollProgress.vue'

const loaded = ref(false)
function onLoaded() { loaded.value = true }
</script>

<template>
  <PageLoader @done="onLoaded" />
  <ScrollProgress />
  <AppCursor />
  <WebGLBackground />
  <AppHeader :ready="loaded" />

  <main>
    <HeroSection :ready="loaded" />

    <InstallationFrame
      id="inst-1"
      index="01"
      title="Krita 笔刷内核，<em>真实颜料与物理混色。</em>"
      essay="直接复用 Krita C++ 原生图像处理内核，模拟真实颜料混色与笔触纹理。支持在笔刷工坊中自由调整混色比、动态响应曲线与子帧平滑插值。"
      :specs="[
        { value: '240<small>+</small>', label: 'Built-in Presets' },
        { value: 'Krita C++', label: 'Native Core Engine' }
      ]"
    >
      <TopologyStage />
    </InstallationFrame>

    <InstallationFrame
      id="inst-2"
      index="02"
      title="稀疏瓦片架构，<em>无限图层与分组。</em>"
      essay="基于稀疏瓦片内存管理，在移动端大幅面创作中按需分配内存。支持无限图层创建、分组嵌套、剪贴蒙版与 25 种专业混合模式。"
      :specs="[
        { value: '25<small> 种</small>', label: 'Blend Modes' },
        { value: 'Unlimited', label: 'Layer Grouping' }
      ]"
    >
      <LatticeStage />
    </InstallationFrame>

    <InstallationFrame
      id="inst-3"
      index="03"
      title="莫兰迪配色体系，<em>Material You 动态主题。</em>"
      essay="采用沉静典雅的莫兰迪低饱和配色，原生支持 Material You 动态莫奈取色与工作区底色定制，让界面隐于创作背景，专注于画布光影。"
      :specs="[
        { value: 'Monet', label: 'Material You Theme' },
        { value: 'Morandi', label: 'Color System' }
      ]"
    >
      <PrismStage />
    </InstallationFrame>

    <InstallationFrame
      id="inst-4"
      index="04"
      title="全流程事件录制，<em>独立工程与延时回放。</em>"
      essay="零性能开销记录笔迹、图层与参数演变全过程。录制数据随 .revp 独立工程文件归档，支持在画廊随时以 0.5x 至 4x 倍速无缝拖拽回放。"
      :specs="[
        { value: '.REVP', label: 'Project Archive' },
        { value: '0.5x–4x', label: 'Timelapse Playback' }
      ]"
    >
      <AttractorStage />
    </InstallationFrame>
  </main>

  <AppFooter />
</template>

<style scoped>
main {
  position: relative;
  z-index: 10;
}
</style>
