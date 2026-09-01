<script setup>
import { ref } from 'vue'
import AppCursor from './components/AppCursor.vue'
import WebGLBackground from './components/WebGLBackground.vue'
import GridOverlay from './components/GridOverlay.vue'
import AppHeader from './components/AppHeader.vue'
import HeroSection from './components/HeroSection.vue'
import InstallationFrame from './components/InstallationFrame.vue'
import TopologyStage from './components/installations/TopologyStage.vue'
import LatticeStage from './components/installations/LatticeStage.vue'
import PrismStage from './components/installations/PrismStage.vue'
import AttractorStage from './components/installations/AttractorStage.vue'
import Showcase from './components/Showcase.vue'
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
  <GridOverlay />
  <AppHeader :ready="loaded" />

  <main>
    <HeroSection :ready="loaded" />

    <InstallationFrame
      id="inst-1"
      index="01"
      title="墨迹拓扑，<em>微分谐振流。</em>"
      essay="下笔不是坐标的简单连线，而是高阶贝塞尔张力场随硬件压感、倾角与角速度的瞬时微分演化。每一丝游移，皆呈现纯粹的物理美感。"
      :specs="[
        { value: '8192', label: 'Pressure Resolution' },
        { value: '<span class=\'num-curvature-js\'>0.0034</span>', label: 'Spline Curvature Error' }
      ]"
    >
      <TopologyStage />
    </InstallationFrame>

    <InstallationFrame
      id="inst-2"
      index="02"
      title="稀疏瓦片，<em>超维空间折叠。</em>"
      essay="彻底解构传统固定画幅的内存壁垒。按需分配的 64px 稀疏瓦片在三维空间中动态调入调出，赋予创作无垠的图层纵深。"
      :specs="[
        { value: '64<small>PX</small>', label: 'Sparse Tile Unit' },
        { value: '∞', label: 'Canvas Boundary' }
      ]"
    >
      <LatticeStage />
    </InstallationFrame>

    <InstallationFrame
      id="inst-3"
      index="03"
      title="光子干涉，<em>莫兰迪色阶。</em>"
      essay="色彩不再是刺眼的纯色堆砌，而是经由薄膜干涉折射算法过滤后的沉静灰调。在低反差的柔和灰阶中，捕捉光影最微妙的呼吸。"
      :specs="[
        { value: '32<small>BIT</small>', label: 'Linear Float Precision' },
        { value: 'ΔE&lt;0.8', label: 'Color Harmony Index' }
      ]"
    >
      <PrismStage />
    </InstallationFrame>

    <InstallationFrame
      id="inst-4"
      index="04"
      title="时空相图，<em>拓扑事件回溯。</em>"
      essay="画作的本质是时间的凝固。非破坏性底层历史堆栈以相空间吸引子轨迹精确锚定每一次落笔与擦除，实现真正无损的时序重构。"
      :specs="[
        { value: '0<small> LOSS</small>', label: 'Vector Phase Storage' },
        { value: '.REVP', label: 'Container Architecture' }
      ]"
    >
      <AttractorStage />
    </InstallationFrame>

    <Showcase />
  </main>

  <AppFooter />
</template>

<style scoped>
main {
  position: relative;
  z-index: 10;
}
</style>
