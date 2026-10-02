<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()

const editUrl = computed(() => {
  const path = page.value.relativePath || 'index.md'
  return `https://github.com/LanRhyme/Website-ReveriePaint/edit/main/docs/${path}`
})

const webIdeUrl = computed(() => {
  const path = page.value.relativePath || 'index.md'
  return `https://github.dev/LanRhyme/Website-ReveriePaint/blob/main/docs/${path}`
})

const issueUrl = computed(() => {
  const title = encodeURIComponent(`[文档反馈] ${page.value.title || '文档内容建议'}`)
  const body = encodeURIComponent(`**相关页面**：${page.value.relativePath}\n\n**建议内容或错误描述**：\n`)
  return `https://github.com/LanRhyme/Website-ReveriePaint/issues/new?title=${title}&body=${body}`
})
</script>

<template>
  <div v-if="page.relativePath" class="doc-contribute-bar">
    <div class="contribute-left">
      <span class="contribute-tag">开源协同</span>
      <span class="contribute-desc">发现表述偏差或希望补充技巧？欢迎直接发起 PR 共同完善</span>
    </div>

    <div class="contribute-right">
      <a :href="editUrl" target="_blank" rel="noopener" class="contribute-btn primary" title="跳转至 GitHub 源码在线编辑">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <span>在 GitHub 编辑此页</span>
      </a>

      <a :href="webIdeUrl" target="_blank" rel="noopener" class="contribute-btn" title="在网页版 VS Code 中打开">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        <span>Web IDE</span>
      </a>

      <a :href="issueUrl" target="_blank" rel="noopener" class="contribute-btn ghost" title="提交 Issue 报告">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>反馈问题</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.doc-contribute-bar {
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background-color: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  box-shadow: var(--vp-shadow-1);
}

.contribute-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.contribute-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-brand-3);
  padding: 1px 6px;
  border-radius: 4px;
  letter-spacing: 0.02em;
}

.contribute-desc {
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
}

.contribute-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.contribute-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 5px;
  text-decoration: none !important;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-border);
  transition: all 0.15s ease;
}

.contribute-btn:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg);
}

.contribute-btn.primary {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-3);
}

.contribute-btn.primary:hover {
  background-color: var(--vp-c-brand-2);
  color: #ffffff;
  border-color: var(--vp-c-brand-2);
}

.contribute-btn.ghost {
  color: var(--vp-c-text-3);
  background-color: transparent;
  border: 1px dashed var(--vp-c-border);
}

.contribute-btn.ghost:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-2);
}
</style>
