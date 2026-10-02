<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()

const editUrl = computed(() => {
  const path = page.value.relativePath
  return `https://github.com/LanRhyme/Website-ReveriePaint/edit/main/docs/${path}`
})

const webIdeUrl = computed(() => {
  const path = page.value.relativePath
  return `https://github.dev/LanRhyme/Website-ReveriePaint/blob/main/docs/${path}`
})

const issueUrl = computed(() => {
  const title = encodeURIComponent(`[文档反馈] ${page.value.title || '文档内容优化'}`)
  const body = encodeURIComponent(`**相关页面**：${page.value.relativePath}\n\n**建议内容或错误描述**：\n`)
  return `https://github.com/LanRhyme/Website-ReveriePaint/issues/new?title=${title}&body=${body}`
})
</script>

<template>
  <div v-if="page.relativePath && page.relativePath !== 'index.md'" class="doc-contribute-card">
    <div class="contribute-header">
      <div class="contribute-title-wrap">
        <span class="contribute-badge">开源协同</span>
        <h4 class="contribute-title">参与完善此篇文档</h4>
      </div>
      <p class="contribute-desc">
        如果你发现了错别字、功能表述偏差或希望补充新的画师实战技巧，欢迎直接在浏览器中发起修改，每一份贡献都将署名合并至官方手册
      </p>
    </div>

    <div class="contribute-actions">
      <a :href="editUrl" target="_blank" rel="noopener" class="contribute-btn primary">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <span>在 GitHub 编辑此页</span>
      </a>

      <a :href="webIdeUrl" target="_blank" rel="noopener" class="contribute-btn secondary">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        <span>Web VS Code 打开</span>
      </a>

      <a :href="issueUrl" target="_blank" rel="noopener" class="contribute-btn ghost">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>反馈此页问题</span>
      </a>

      <a href="/docs/guide/contributing" class="contribute-btn text-link">
        <span>贡献指南 →</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.doc-contribute-card {
  margin-top: 2.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem 1.6rem;
  background-color: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  box-shadow: var(--vp-shadow-1);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.doc-contribute-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--vp-shadow-2);
  border-color: var(--vp-c-brand-3);
}

.contribute-header {
  margin-bottom: 1.1rem;
}

.contribute-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.35rem;
}

.contribute-badge {
  font-size: 0.72rem;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-brand-3);
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.04em;
}

.contribute-title {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.contribute-desc {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0;
}

.contribute-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.contribute-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84rem;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 6px;
  text-decoration: none !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.contribute-btn.primary {
  background-color: var(--vp-c-brand-1);
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.contribute-btn.primary:hover {
  background-color: var(--vp-c-brand-2);
  transform: translateY(-1px);
}

.contribute-btn.secondary {
  background-color: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-border);
}

.contribute-btn.secondary:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}

.contribute-btn.ghost {
  background-color: transparent;
  color: var(--vp-c-text-2);
  border: 1px dashed var(--vp-c-border);
}

.contribute-btn.ghost:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
}

.contribute-btn.text-link {
  color: var(--vp-c-brand-1);
  padding: 6px 8px;
}

.contribute-btn.text-link:hover {
  text-decoration: underline !important;
}
</style>
