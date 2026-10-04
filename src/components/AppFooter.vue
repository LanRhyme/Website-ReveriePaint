<script setup>
import { computed } from 'vue'
import { useI18n } from '../composables/useI18n.js'
import { useSound } from '../composables/useSound.js'

const { t } = useI18n()
const { playClick, playHover } = useSound()
const year = new Date().getFullYear()

const links = computed(() => t('footer.links') || [])
const copyright = computed(() => {
  const tmpl = t('footer.copyright') || '© {year} LanRhyme'
  return tmpl.replace('{year}', year)
})

function scrollToTop() {
  playClick()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer id="footer-section" class="lusion-footer">
    <div class="shell foot-container">
      <!-- 顶部信息栏 -->
      <div class="footer-top-row">
        <div class="footer-brand-col">
          <div class="footer-logo">
            <svg viewBox="0 0 22 22" width="26" height="26" aria-hidden="true">
              <rect x="1" y="1" width="20" height="20" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.3" />
              <path d="M6.4 15.6 L11 6.4 L15.6 15.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="11" cy="13" r="1.5" fill="currentColor" />
            </svg>
            <span class="footer-brand-name">REVERIE PAINT</span>
          </div>
          <p class="footer-tagline">{{ t('footer.tagline') }}</p>
        </div>

        <div class="footer-meta-col">
          <div class="meta-label">STUDIO INFORMATION</div>
          <div class="meta-value">QQ Community: 729283213</div>
          <div class="meta-value">GPL-3.0 License / Free Forever</div>
        </div>

        <div class="footer-links-col">
          <div class="meta-label">NAVIGATION & SOURCE</div>
          <div class="links-list">
            <a
              v-for="l in links"
              :key="l.label"
              :href="l.href"
              target="_blank"
              rel="noopener"
              class="footer-link-item"
              @mouseenter="playHover"
            >
              <span>{{ l.label }}</span>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 13L13 3M13 3H5M13 3V11"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- 底部版权与回到顶部按钮 (Lusion 1:1) -->
      <div class="footer-bottom-row">
        <div class="copyright-text">{{ copyright }}</div>
        <div class="disclaimer-text">{{ t('footer.disclaimer') }}</div>
        
        <button
          class="footer-back-to-top"
          type="button"
          aria-label="Back to top"
          @click="scrollToTop"
          @mouseenter="playHover"
        >
          <span class="arrow-up">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </span>
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.lusion-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: #040507;
  color: #ffffff;
  padding-top: clamp(60px, 8vh, 90px);
  padding-bottom: clamp(32px, 5vh, 48px);
  position: relative;
  z-index: 10;
}

.foot-container {
  display: flex;
  flex-direction: column;
  gap: clamp(40px, 6vh, 60px);
}

.footer-top-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: clamp(30px, 4vw, 60px);
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
}

.footer-brand-name {
  font-family: var(--font-mono);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.footer-tagline {
  margin-top: 12px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  max-width: 38ch;
  line-height: 1.7;
}

.meta-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  margin-bottom: 14px;
}

.meta-value {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.8;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.75);
  transition: all 0.2s ease;
}

.footer-link-item:hover {
  color: #ffffff;
  transform: translateX(3px);
}

.footer-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 24px;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: rgba(255, 255, 255, 0.45);
}

.disclaimer-text {
  max-width: 50ch;
  line-height: 1.6;
}

/* 回到顶部按钮 (Lusion 1:1) */
.footer-back-to-top {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-back-to-top:hover {
  background: #ffffff;
  color: #060709;
  transform: translateY(-3px);
}

@media (max-width: 860px) {
  .footer-top-row {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .footer-bottom-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
