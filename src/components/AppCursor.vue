<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const dot = ref(null)
const ring = ref(null)

let mouseX = 0
let mouseY = 0
let ringX = 0
let ringY = 0
let rafId = 0
let isHovering = false

const isFinePointer = ref(true)

function onMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
  if (dot.value) {
    dot.value.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`
  }
}

function render() {
  ringX += (mouseX - ringX) * 0.15
  ringY += (mouseY - ringY) * 0.15
  if (ring.value) {
    ring.value.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`
  }
  rafId = requestAnimationFrame(render)
}

function onEnter() {
  if (!ring.value) return
  isHovering = true
  ring.value.style.width = '68px'
  ring.value.style.height = '68px'
  ring.value.style.borderColor = 'rgba(255,255,255,0.6)'
  ring.value.style.backgroundColor = 'rgba(255,255,255,0.05)'
}
function onLeave() {
  if (!ring.value) return
  isHovering = false
  ring.value.style.width = '44px'
  ring.value.style.height = '44px'
  ring.value.style.borderColor = 'rgba(255,255,255,0.25)'
  ring.value.style.backgroundColor = 'transparent'
}

let hoverEls = []

onMounted(() => {
  // only enable on fine pointer
  isFinePointer.value = window.matchMedia('(pointer: fine)').matches
  if (!isFinePointer.value) return
  // check prefers-reduced? still show but less motion
  document.body.classList.add('has-custom-cursor')

  mouseX = window.innerWidth / 2
  mouseY = window.innerHeight / 2
  ringX = mouseX
  ringY = mouseY

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  rafId = requestAnimationFrame(render)

  // delegate hover via mutation observer or simple query
  const bind = () => {
    hoverEls.forEach((el) => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    })
    hoverEls = Array.from(document.querySelectorAll('a, button, .stage-monolith'))
    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })
  }
  bind()
  // re-bind when dom changes (for dynamic)
  const mo = new MutationObserver(bind)
  mo.observe(document.body, { childList: true, subtree: true })
  // store for cleanup
  window.__cursorMO = mo
})

onUnmounted(() => {
  document.body.classList.remove('has-custom-cursor')
  window.removeEventListener('mousemove', onMouseMove)
  cancelAnimationFrame(rafId)
  hoverEls.forEach((el) => {
    el.removeEventListener('mouseenter', onEnter)
    el.removeEventListener('mouseleave', onLeave)
  })
  if (window.__cursorMO) {
    window.__cursorMO.disconnect()
    delete window.__cursorMO
  }
})
</script>

<template>
  <div v-if="isFinePointer" aria-hidden="true">
    <div ref="dot" id="cursor-dot"></div>
    <div ref="ring" id="cursor-ring"></div>
  </div>
</template>

<style scoped>
#cursor-dot {
  position: fixed;
  top: 0;
  left: 0;
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s, background 0.3s, opacity 0.3s;
  will-change: transform;
}
#cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s, border-color 0.3s, background-color 0.3s;
  will-change: transform;
}
@media (pointer: coarse) {
  #cursor-dot,
  #cursor-ring {
    display: none;
  }
}
</style>
