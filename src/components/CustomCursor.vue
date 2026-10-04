<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const cursorDotRef = ref(null)
const cursorRingRef = ref(null)

const isVisible = ref(false)
const isHovering = ref(false)
const isClicking = ref(false)
const cursorText = ref('')
const isMagnetic = ref(false)

let mouseX = -100
let mouseY = -100
let ringX = -100
let ringY = -100
let animId = null
let isTouch = false

function onMouseMove(e) {
  if (isTouch) return
  mouseX = e.clientX
  mouseY = e.clientY
  if (!isVisible.value) isVisible.value = true

  // 检查悬浮的交互元素类型
  const target = e.target.closest('a, button, [data-cursor], .c-item, .block-media, .pill, .channel-card, .proxy-pill')
  if (target) {
    isHovering.value = true
    const customText = target.getAttribute('data-cursor') || ''
    cursorText.value = customText

    // 检查磁吸倾向
    const isSmallButton = target.matches('button, .cta, .btn, .way-cta, .proxy-pill')
    isMagnetic.value = isSmallButton
  } else {
    isHovering.value = false
    cursorText.value = ''
    isMagnetic.value = false
  }
}

function onMouseDown() {
  if (isTouch) return
  isClicking.value = true
}

function onMouseUp() {
  if (isTouch) return
  isClicking.value = false
}

function onMouseLeave() {
  isVisible.value = false
}

function onMouseEnter() {
  if (!isTouch) isVisible.value = true
}

function render() {
  // 线性平滑插值 (Lerp) 实现 Lusion 级丝滑拖尾
  const ease = isHovering.value ? 0.22 : 0.16
  ringX += (mouseX - ringX) * ease
  ringY += (mouseY - ringY) * ease

  if (cursorDotRef.value && cursorRingRef.value) {
    cursorDotRef.value.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`
    cursorRingRef.value.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
  }

  animId = requestAnimationFrame(render)
}

onMounted(() => {
  if (typeof window === 'undefined') return
  isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  if (isTouch) return

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mousedown', onMouseDown, { passive: true })
  window.addEventListener('mouseup', onMouseUp, { passive: true })
  document.documentElement.addEventListener('mouseleave', onMouseLeave)
  document.documentElement.addEventListener('mouseenter', onMouseEnter)

  animId = requestAnimationFrame(render)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mouseup', onMouseUp)
  document.documentElement.removeEventListener('mouseleave', onMouseLeave)
  document.documentElement.removeEventListener('mouseenter', onMouseEnter)
})
</script>

<template>
  <div
    class="lusion-cursor-container"
    :class="{
      'is-visible': isVisible,
      'is-hovering': isHovering,
      'is-clicking': isClicking,
      'has-text': !!cursorText,
      'is-magnetic': isMagnetic
    }"
    aria-hidden="true"
  >
    <!-- 精准核心微点 -->
    <div ref="cursorDotRef" class="cursor-dot"></div>

    <!-- 柔和外光环与混合扩散光斑 -->
    <div ref="cursorRingRef" class="cursor-ring">
      <span v-if="cursorText" class="cursor-label">{{ cursorText }}</span>
    </div>
  </div>
</template>

<style scoped>
.lusion-cursor-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.35s ease;
  mix-blend-mode: exclusion;
}
.lusion-cursor-container.is-visible {
  opacity: 1;
}

/* 核心圆点 */
.cursor-dot {
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 6px;
  margin-top: -3px;
  margin-left: -3px;
  border-radius: 50%;
  background-color: #ffffff;
  will-change: transform;
  transition: transform 0.05s linear, opacity 0.2s ease;
}

/* 柔和外光环 */
.cursor-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 36px;
  height: 36px;
  margin-top: -18px;
  margin-left: -18px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(1px);
  will-change: transform;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.28s var(--ease-out-expo),
              height 0.28s var(--ease-out-expo),
              margin 0.28s var(--ease-out-expo),
              background 0.28s ease,
              border-color 0.28s ease;
}

/* 悬浮交互状态 */
.is-hovering .cursor-ring {
  width: 58px;
  height: 58px;
  margin-top: -29px;
  margin-left: -29px;
  background: rgba(255, 255, 255, 0.95);
  border-color: #ffffff;
}

.is-hovering .cursor-dot {
  opacity: 0;
}

/* 按压状态 */
.is-clicking .cursor-ring {
  transform-origin: center;
  scale: 0.88;
}

/* 携带文字胶囊模式 */
.has-text .cursor-ring {
  width: 72px;
  height: 72px;
  margin-top: -36px;
  margin-left: -36px;
}
.cursor-label {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #000000;
  text-transform: uppercase;
}

/* 触屏与减少动画环境彻底禁用 */
@media (hover: none) and (pointer: coarse), (prefers-reduced-motion: reduce) {
  .lusion-cursor-container {
    display: none !important;
  }
}
</style>
