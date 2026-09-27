<script setup>
const year = new Date().getFullYear()

const links = [
  { label: '使用文档', href: '/docs/' },
  { label: 'GitHub', href: 'https://github.com/LanRhyme/ReveriePaint' },
  { label: 'Releases', href: 'https://github.com/LanRhyme/ReveriePaint/releases' },
  { label: 'Mirror酱 高速', href: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android' },
  { label: 'QQ群 729283213', href: 'https://qm.qq.com/q/729283213' },
  { label: 'Issues 反馈', href: 'https://github.com/LanRhyme/ReveriePaint/issues' },
  { label: 'GPL-3.0 协议', href: 'https://www.gnu.org/licenses/gpl-3.0.html' }
]
</script>

<template>
  <footer class="site-footer">
    <div class="shell foot-inner">
      <div class="foot-main">
        <div class="foot-brand">
          <svg viewBox="0 0 22 22" width="24" height="24" aria-hidden="true">
            <rect x="1" y="1" width="20" height="20" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.3" />
            <path d="M6.4 15.6 L11 6.4 L15.6 15.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="11" cy="13" r="1.5" fill="currentColor" />
          </svg>
          <div>
            <b>ReveriePaint</b>
            <span>Android 原生数字绘画</span>
          </div>
        </div>

        <nav class="foot-links" aria-label="页脚导航">
          <a
            v-for="l in links"
            :key="l.label"
            :href="l.href"
            target="_blank"
            rel="noopener"
          >{{ l.label }}</a>
        </nav>
      </div>

      <div class="foot-base">
        <p>© {{ year }} LanRhyme · 基于 GPL-3.0 协议开源</p>
        <p class="foot-meta">Krita 为其各自所有者的商标，本项目与 KDE 无隶属关系</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--line-faint);
  background: var(--paper-warm);
}

.foot-inner {
  padding-top: clamp(40px, 6vh, 56px);
  padding-bottom: clamp(28px, 4vh, 40px);
}

.foot-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 28px;
  flex-wrap: wrap;
  padding-bottom: 30px;
}

.foot-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--ink);
}
.foot-brand b {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.foot-brand span {
  font-size: 0.75rem;
  color: var(--ink-soft-2);
  letter-spacing: 0.02em;
}

.foot-links {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
}
.foot-links a {
  font-size: 0.875rem;
  color: var(--ink-mid);
  transition: color 0.25s;
}
.foot-links a:hover {
  color: var(--ink);
}

.foot-base {
  border-top: 1px solid var(--line-faint);
  padding-top: 22px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.foot-base p {
  font-size: 0.75rem;
  color: var(--ink-soft-2);
  line-height: 1.7;
}
.foot-meta {
  max-width: 46ch;
}

@media (max-width: 680px) {
  .foot-main {
    flex-direction: column;
    gap: 22px;
  }
  .foot-links {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 16px;
    width: 100%;
  }
  .foot-links a {
    padding: 3px 0;
  }
  .foot-base {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
