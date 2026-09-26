<script setup>
import { ref, onMounted } from 'vue'
import heroCanvas from '../assets/shots/hero-canvas.webp'
import heroCanvasSm from '../assets/shots/hero-canvas-sm.webp'

const ready = ref(false)
onMounted(() => requestAnimationFrame(() => (ready.value = true)))
</script>

<template>
  <section id="top" class="hero" :class="{ ready }">
    <div class="hero-wash" aria-hidden="true"></div>

    <div class="shell hero-grid">
      <!-- 左：文案 -->
      <div class="hero-copy">
        <p class="eyebrow hero-eyebrow">
          <span class="dot" aria-hidden="true"></span>
          Android 平板专业创作 · GPL-3.0 开源 · QQ群 729283213
        </p>

        <h1 class="hero-title">
          把桌面级图像内核，<br />
          <em>装进安卓平板</em>
        </h1>

        <p class="hero-sub">
          融合 <b>Krita C++ 原生图像处理内核</b>与现代化触控交互。具备 240+ 官方笔刷预设、动态稀疏瓦片图层、多协议压感手写笔专属调校与全流程事件流延时回放，让专业创作在移动端彻底摆脱妥协。
        </p>

        <div class="hero-actions">
          <a
            class="btn btn-primary"
            href="https://github.com/LanRhyme/ReveriePaint/releases"
            target="_blank"
            rel="noopener"
          >
            下载 APK
          </a>
          <a
            class="btn btn-secondary"
            href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android"
            target="_blank"
            rel="noopener"
          >
            Mirror酱 高速下载
          </a>
          <a
            class="btn btn-ghost"
            href="https://github.com/LanRhyme/ReveriePaint"
            target="_blank"
            rel="noopener"
          >
            查看源码
          </a>
        </div>

        <dl class="hero-facts">
          <div>
            <dt>240+</dt>
            <dd>官方物理笔刷</dd>
          </div>
          <div>
            <dt>25 种</dt>
            <dd>图层混合模式</dd>
          </div>
          <div>
            <dt>35 种</dt>
            <dd>无损实时滤镜</dd>
          </div>
          <div>
            <dt>GPL-3.0</dt>
            <dd>永久免费开源</dd>
          </div>
        </dl>
      </div>

      <!-- 右：设备框 -->
      <div class="hero-device">
        <div class="device">
          <div class="device-screen">
            <img
              :src="heroCanvas"
              :srcset="`${heroCanvasSm} 1000w, ${heroCanvas} 2000w`"
              sizes="(max-width: 960px) 90vw, 760px"
              alt="ReveriePaint 画布上绘制的飞龙与猫的线稿"
              fetchpriority="high"
              decoding="async"
            />
          </div>
        </div>
        <p class="device-note">实机绘制展示 · 线稿与笔刷测试</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding: clamp(104px, 14vh, 156px) 0 clamp(56px, 8vh, 88px);
  overflow: hidden;
}

.hero-wash {
  position: absolute;
  inset: -24% -12% auto -12%;
  height: 118%;
  pointer-events: none;
  background:
    radial-gradient(42% 32% at 78% 14%, rgba(143, 163, 180, 0.14) 0%, transparent 68%),
    radial-gradient(36% 28% at 6% 4%, rgba(195, 163, 158, 0.11) 0%, transparent 66%),
    radial-gradient(50% 38% at 44% 70%, rgba(200, 180, 141, 0.09) 0%, transparent 70%);
  filter: blur(6px);
}

.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  align-items: center;
  gap: clamp(40px, 5vw, 76px);
}

/* ── 文案 ─────────────────────────────────── */
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 24px;
  opacity: 0;
}
.hero-eyebrow .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--moss);
  box-shadow: 0 0 0 3px rgba(157, 169, 142, 0.2);
}
.ready .hero-eyebrow {
  animation: heroRise 0.85s var(--ease-out-expo) 0.05s forwards;
}

.hero-title {
  font-size: clamp(1.9rem, 4.1vw, 3.15rem);
  line-height: 1.26;
  letter-spacing: -0.032em;
  font-weight: 400;
  color: var(--ink-mid);
  opacity: 0;
}
.hero-title em {
  font-style: normal;
  font-weight: 600;
  color: var(--ink);
}
.ready .hero-title {
  animation: heroRise 1s var(--ease-out-expo) 0.14s forwards;
}

.hero-sub {
  margin-top: 26px;
  max-width: 46ch;
  font-size: clamp(0.9375rem, 1.25vw, 1.0625rem);
  line-height: 1.92;
  color: var(--ink-mid);
  opacity: 0;
}
.hero-sub b {
  color: var(--ink);
  font-weight: 500;
}
.ready .hero-sub {
  animation: heroRise 1s var(--ease-out-expo) 0.26s forwards;
}

.hero-actions {
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
  opacity: 0;
}
.ready .hero-actions {
  animation: heroRise 1s var(--ease-out-expo) 0.36s forwards;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  padding: 13px 26px;
  border-radius: 999px;
  transition: transform 0.35s var(--ease-out-expo), background 0.3s, border-color 0.3s,
    box-shadow 0.35s;
}
.btn-primary {
  background: var(--ink);
  color: var(--paper);
  box-shadow: var(--shadow-m);
}
.btn-primary:hover {
  background: var(--ink-soft);
  transform: translateY(-2px);
  box-shadow: var(--shadow-l);
}
.btn-secondary {
  color: var(--ink);
  background: rgba(20, 22, 26, 0.05);
  border: 1px solid var(--line-strong);
}
.btn-secondary:hover {
  background: rgba(20, 22, 26, 0.09);
  border-color: var(--ink);
  transform: translateY(-2px);
}
.btn-ghost {
  color: var(--ink);
  border: 1px solid var(--line-strong);
  background: rgba(253, 252, 250, 0.55);
}
.btn-ghost:hover {
  border-color: var(--ink);
  transform: translateY(-2px);
}

.hero-facts {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--line-faint);
  display: flex;
  flex-wrap: wrap;
  gap: clamp(24px, 3.4vw, 44px);
  opacity: 0;
}
.ready .hero-facts {
  animation: heroRise 0.9s var(--ease-out-expo) 0.46s forwards;
}
.hero-facts dt {
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  font-feature-settings: "tnum";
  line-height: 1.2;
}
.hero-facts dd {
  margin-top: 3px;
  font-size: 0.75rem;
  color: var(--ink-soft-2);
}

/* ── 设备框 ───────────────────────────────── */
.hero-device {
  position: relative;
  opacity: 0;
}
.ready .hero-device {
  animation: heroRise 1.2s var(--ease-out-expo) 0.2s forwards;
}

.device {
  /* 深色平板边框，圆角与内边距模拟真实设备 */
  position: relative;
  padding: 13px;
  border-radius: 22px;
  background: linear-gradient(158deg, #34383e 0%, #1c1f23 42%, #121417 100%);
  box-shadow:
    0 2px 3px rgba(20, 22, 26, 0.14),
    0 18px 40px rgba(20, 22, 26, 0.2),
    0 44px 90px rgba(20, 22, 26, 0.16);
}
/* 屏幕外圈高光，做出金属收边 */
.device::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 17px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  pointer-events: none;
}

.device-screen {
  position: relative;
  border-radius: 11px;
  overflow: hidden;
  background: #eceae6;
  aspect-ratio: 16 / 10;
}
.device-screen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.device-note {
  margin-top: 14px;
  text-align: right;
  font-size: 0.75rem;
  color: var(--ink-ghost);
  letter-spacing: 0.02em;
}

@media (max-width: 960px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 40px;
  }
  .hero-device {
    order: 2;
  }
  .device-note {
    text-align: left;
  }
}
</style>

<style>
@keyframes heroRise {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
