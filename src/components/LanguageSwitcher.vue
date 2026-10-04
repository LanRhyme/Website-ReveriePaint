<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../composables/useI18n.js'

const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  dropUp: {
    type: Boolean,
    default: false
  }
})

const { currentLang, supportedLangs, setLang, currentLangInfo } = useI18n()
const isOpen = ref(false)
const dropdownRef = ref(null)

function toggle() {
  isOpen.value = !isOpen.value
}

function selectLang(langId) {
  setLang(langId)
  isOpen.value = false
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="lang-dropdown" :class="{ 'is-open': isOpen, 'is-compact': compact, 'is-dropup': dropUp }">
    <button
      type="button"
      class="lang-trigger"
      :aria-expanded="isOpen"
      aria-label="Select Language / 切换语言"
      @click="toggle"
    >
      <svg class="lang-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span class="lang-label">{{ currentLangInfo.label }}</span>
      <svg class="chevron-icon" viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M2.5 4.5 L6 8 L9.5 4.5" />
      </svg>
    </button>

    <div v-show="isOpen" class="lang-menu">
      <button
        v-for="l in supportedLangs"
        :key="l.id"
        type="button"
        class="lang-option"
        :class="{ active: l.id === currentLang }"
        @click="selectLang(l.id)"
      >
        <span class="lang-name">{{ l.label }}</span>
        <svg v-if="l.id === currentLang" class="check-icon" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.lang-dropdown {
  position: relative;
  display: inline-block;
}

.lang-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.lang-trigger:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
}

.lang-icon {
  flex-shrink: 0;
  opacity: 0.8;
}

.chevron-icon {
  flex-shrink: 0;
  opacity: 0.6;
  transition: transform 0.2s ease;
}

.is-open .chevron-icon {
  transform: rotate(180deg);
}

.lang-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 140px;
  background: #0d0f14;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 100;
  animation: dropIn 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.is-dropup .lang-menu {
  top: auto;
  bottom: calc(100% + 6px);
}

@keyframes dropIn {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.lang-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.lang-option:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.lang-option.active {
  background: rgba(91, 127, 199, 0.2);
  color: #8da6df;
  font-weight: 600;
}

.check-icon {
  color: #8da6df;
}

.is-compact .lang-trigger {
  height: 30px;
  padding: 0 9px;
  font-size: 0.75rem;
}
</style>
