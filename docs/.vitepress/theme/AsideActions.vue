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
</script>

<template>
  <div v-if="page.relativePath && page.relativePath !== 'index.md'" class="aside-actions-box">
    <div class="aside-actions-title">协助完善文档</div>
    <div class="aside-links">
      <a :href="editUrl" target="_blank" rel="noopener" class="aside-link-item">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <span>在 GitHub 编辑此页</span>
      </a>

      <a :href="webIdeUrl" target="_blank" rel="noopener" class="aside-link-item">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        <span>Web IDE 在线编写</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.aside-actions-box {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--vp-c-divider);
}

.aside-actions-title {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
  margin-bottom: 0.6rem;
}

.aside-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.aside-link-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  text-decoration: none !important;
  transition: color 0.15s ease, transform 0.15s ease;
  padding: 3px 0;
}

.aside-link-item:hover {
  color: var(--vp-c-brand-1);
  transform: translateX(2px);
}
</style>
