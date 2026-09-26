<script setup>
import { ref } from 'vue'

const copied = ref(false)
function copyQQ() {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText('729283213')
    copied.value = true
    setTimeout(() => (copied.value = false), 2200)
  }
}

const meta = [
  { k: '系统要求', v: 'Android 7.0+（API 24）' },
  { k: '芯片架构', v: '仅 64 位 arm64-v8a' },
  { k: '开源协议', v: 'GPL-3.0 开放源码' },
  { k: '交流社群', v: 'QQ 群 729283213' }
]

const ways = [
  {
    title: '获取安装包',
    body: '国内设备推荐使用 Mirror酱 免翻高速通道直接下载，亦可访问 GitHub Releases 获取官方构建包。',
    links: [
      { text: 'Mirror酱 高速下载', href: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android', primary: true },
      { text: 'GitHub Releases', href: 'https://github.com/LanRhyme/ReveriePaint/releases', primary: false }
    ],
    primary: true
  },
  {
    title: '创作者交流群',
    body: '欢迎加入 ReveriePaint 创作者交流群，交流平板手绘体验、反馈功能建议与获取最新构建。',
    isQQ: true,
    links: [
      { text: '跳转加群', href: 'https://qm.qq.com/q/729283213', primary: false }
    ],
    primary: false
  },
  {
    title: '源码与共建',
    body: '基于 Kotlin + Jetpack Compose 响应式架构与 C++ Krita 内核。欢迎提交 Issue 反馈与 PR 贡献代码。',
    links: [
      { text: '浏览 GitHub 仓库', href: 'https://github.com/LanRhyme/ReveriePaint', primary: false },
      { text: '提交 Issue 反馈', href: 'https://github.com/LanRhyme/ReveriePaint/issues', primary: false }
    ],
    primary: false
  }
]
</script>

<template>
  <section id="get" class="get">
    <div class="shell">
      <header class="sec-head reveal">
        <p class="eyebrow">获取应用</p>
        <h2 class="h-section">自由创作，现已就绪</h2>
      </header>

      <dl class="meta reveal">
        <div v-for="m in meta" :key="m.k" class="meta-item">
          <dt>{{ m.k }}</dt>
          <dd>{{ m.v }}</dd>
        </div>
      </dl>

      <div class="ways">
        <article
          v-for="(w, i) in ways"
          :key="w.title"
          class="way reveal"
          :class="{ primary: w.primary }"
          :style="{ transitionDelay: `${i * 70}ms` }"
        >
          <h3>{{ w.title }}</h3>
          <p>{{ w.body }}</p>
          <div class="way-actions">
            <button
              v-if="w.isQQ"
              type="button"
              class="way-cta cta-copy"
              @click="copyQQ"
            >
              {{ copied ? '已复制群号 729283213' : '复制群号: 729283213' }}
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3" />
                <path d="M3 11 V3 h8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
              </svg>
            </button>
            <a
              v-for="l in w.links"
              :key="l.text"
              :href="l.href"
              class="way-cta"
              :class="{ 'cta-solid': l.primary }"
              target="_blank"
              rel="noopener"
            >
              {{ l.text }}
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </a>
          </div>
        </article>
      </div>

      <p class="star-note reveal">
        如果 ReveriePaint 对你的创作有所启发，欢迎在 GitHub 为项目点亮 Star
      </p>
    </div>
  </section>
</template>

<style scoped>
.get {
  padding: clamp(72px, 11vh, 128px) 0 clamp(64px, 9vh, 104px);
}

.sec-head {
  max-width: 60ch;
  margin-bottom: clamp(34px, 5vh, 48px);
}
.sec-head .h-section {
  margin-top: 14px;
}

/* ── 规格条 ─────────────────────────────────── */
.meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: var(--line-faint);
  border: 1px solid var(--line-faint);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: clamp(34px, 5vh, 48px);
}
.meta-item {
  background: var(--card);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.meta-item dt {
  font-size: 0.75rem;
  color: var(--ink-soft-2);
  letter-spacing: 0.02em;
}
.meta-item dd {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink);
}

/* ── 三个入口 ───────────────────────────────── */
.ways {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 2.2vw, 22px);
}
.way {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: clamp(24px, 2.8vw, 32px);
  border: 1px solid var(--line-faint);
  border-radius: 14px;
  background: var(--card);
  transition: transform 0.45s var(--ease-out-expo), box-shadow 0.45s, border-color 0.4s;
}
.way:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-m);
  border-color: var(--line);
}
.way h3 {
  font-size: 1.0625rem;
  font-weight: 500;
}
.way p {
  font-size: 0.90625rem;
  line-height: 1.8;
  color: var(--ink-mid);
  flex: 1;
}
.way-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.way-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84375rem;
  font-weight: 500;
  color: var(--ink);
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(20, 22, 26, 0.05);
  border: 1px solid var(--line);
  transition: transform 0.25s var(--ease-out-expo), background 0.25s, border-color 0.25s;
}
button.way-cta {
  font-family: inherit;
  cursor: pointer;
}
.way-cta svg {
  transition: transform 0.3s var(--ease-out-expo);
}
.way-cta:hover {
  background: rgba(20, 22, 26, 0.09);
  border-color: var(--ink);
  transform: translateY(-1px);
}
.way-cta:hover svg {
  transform: translate(2px, -2px);
}

/* 首个入口用深色强调 */
.way.primary {
  background: var(--ui-900);
  border-color: var(--ui-600);
  color: var(--ui-text);
}
.way.primary h3 {
  color: #fff;
}
.way.primary p {
  color: var(--ui-text-dim);
}
.way.primary .way-cta {
  color: #fff;
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.16);
}
.way.primary .way-cta:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.3);
}
.way.primary .way-cta.cta-solid {
  background: #fff;
  color: var(--ui-900);
  border-color: #fff;
  font-weight: 600;
}
.way.primary .way-cta.cta-solid:hover {
  background: #f0f1f2;
}

.star-note {
  margin-top: clamp(30px, 4.4vh, 44px);
  font-size: 0.90625rem;
  color: var(--ink-soft-2);
  text-align: center;
}

@media (max-width: 860px) {
  .meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .ways {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
