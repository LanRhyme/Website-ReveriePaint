import { ref } from 'vue'

const isSoundEnabled = ref(false)
let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function useSound() {
  function toggleSound() {
    isSoundEnabled.value = !isSoundEnabled.value
    if (isSoundEnabled.value) {
      getAudioContext()
      playClick()
    }
  }

  function playTone(freq = 440, duration = 0.08, type = 'sine', volume = 0.05) {
    if (!isSoundEnabled.value) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch {
      // Audio context might be restricted
    }
  }

  function playClick() {
    playTone(520, 0.06, 'triangle', 0.04)
  }

  function playHover() {
    playTone(880, 0.03, 'sine', 0.015)
  }

  function playTransition() {
    if (!isSoundEnabled.value) return
    const ctx = getAudioContext()
    if (!ctx) return
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(120, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + 0.3)

      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } catch {
      // ignore
    }
  }

  return {
    isSoundEnabled,
    toggleSound,
    playTone,
    playClick,
    playHover,
    playTransition
  }
}
