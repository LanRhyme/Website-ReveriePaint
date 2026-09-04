<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const container = ref(null)

let renderer, scene, camera, material, mesh, raf
let uniforms

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_scroll;
  varying vec2 vUv;

  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 st = uv;
    st.x *= u_resolution.x / u_resolution.y;

    // Autonomous multi-cadence clock
    float t = u_time * 0.14;

    // 1. Organic autonomous drift vectors (Lissajous & Harmonic orbital paths)
    vec2 wander1 = vec2(
      sin(t * 0.45) * 0.35 + cos(t * 0.28) * 0.20,
      cos(t * 0.38) * 0.30 + sin(t * 0.19) * 0.22
    );
    vec2 wander2 = vec2(
      cos(t * 0.32 + 1.8) * 0.40 - sin(t * 0.52) * 0.18,
      sin(t * 0.41 + 2.4) * 0.32 + cos(t * 0.23) * 0.25
    );

    // Interactive mouse displacement overlay
    vec2 mOffset = (u_mouse - 0.5) * 0.28;
    float scrollOffset = u_scroll * 0.5;

    // 2. Continuous flowing Simplex eddies (always evolving even if static)
    float n1 = snoise(st * 1.5 + wander1 + vec2(t * 0.12 + scrollOffset * 0.3, t * 0.08) + mOffset);
    float n2 = snoise(st * 2.8 + wander2 - vec2(t * 0.15, t * 0.11 + scrollOffset * 0.4) + n1 * 0.45);
    float n3 = snoise(st * 4.2 + vec2(sin(t * 0.25) * 0.3, cos(t * 0.3) * 0.3) + n2 * 0.25);

    // 3. Autonomous breathing pulse
    float breath = sin(t * 0.5) * 0.04 + cos(t * 0.32) * 0.03;

    // Deep studio charcoal base
    vec3 c0     = vec3(0.043, 0.046, 0.053);
    // Morandi quiet spectrum
    vec3 cSlate = vec3(0.36, 0.46, 0.54);
    vec3 cClay  = vec3(0.72, 0.55, 0.50);
    vec3 cSand  = vec3(0.78, 0.71, 0.62);
    vec3 cMoss  = vec3(0.46, 0.58, 0.49);

    // Smooth harmonic blend with live convective dynamics
    vec3 color = c0;
    color = mix(color, cSlate, smoothstep(-0.45, 0.70, n1) * (0.28 + breath));
    color = mix(color, cClay,  smoothstep(-0.25, 0.80, n2) * (0.22 - breath * 0.5));
    color = mix(color, cMoss,  smoothstep(0.05, 0.90, n3) * 0.12);
    color = mix(color, cSand,  smoothstep(0.30, 1.05, n1 + n2 * 0.75) * (0.14 + breath));

    // Dynamic cursor lantern glow (soft subtle follow)
    float mouseDist = length(st - (u_mouse * vec2(u_resolution.x / u_resolution.y, 1.0)));
    float mouseLantern = exp(-mouseDist * 2.8) * 0.08;
    color += cSand * mouseLantern;

    // Soft organic vignette focused toward center
    float dCenter = length(uv - 0.5);
    float vignette = smoothstep(0.88, 0.22, dCenter);
    color *= (0.86 + 0.14 * vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`

let targetMouseX = 0.5
let targetMouseY = 0.5
let currentMouseX = 0.5
let currentMouseY = 0.5
let targetScroll = 0
let currentScroll = 0

function onResize() {
  if (!renderer || !container.value) return
  const w = window.innerWidth
  const h = window.innerHeight
  renderer.setSize(w, h)
  uniforms.u_resolution.value.set(w, h)
}

function onMouseMove(e) {
  targetMouseX = e.clientX / window.innerWidth
  targetMouseY = 1.0 - e.clientY / window.innerHeight
}

function onScroll() {
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
  targetScroll = window.scrollY / max
}

let isPaused = false
function onVisibility() {
  isPaused = document.hidden
  if (!isPaused && !raf) loop(performance.now())
}

function loop(ts) {
  if (isPaused) {
    raf = 0
    return
  }

  // Smooth physical lerp damping
  currentMouseX += (targetMouseX - currentMouseX) * 0.05
  currentMouseY += (targetMouseY - currentMouseY) * 0.05
  currentScroll += (targetScroll - currentScroll) * 0.06

  uniforms.u_time.value = ts * 0.001
  uniforms.u_mouse.value.set(currentMouseX, currentMouseY)
  uniforms.u_scroll.value = currentScroll

  renderer.render(scene, camera)
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.value.appendChild(renderer.domElement)

  uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_scroll: { value: 0 }
  }

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms
  })

  mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  scene.add(mesh)

  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    renderer.render(scene, camera)
  } else {
    raf = requestAnimationFrame(loop)
  }
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('visibilitychange', onVisibility)
  if (renderer) {
    renderer.dispose()
    if (renderer.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
  }
  if (material) material.dispose()
  if (mesh?.geometry) mesh.geometry.dispose()
})
</script>

<template>
  <div id="canvas-universe" aria-hidden="true">
    <div ref="container" id="webgl-stage"></div>
  </div>
</template>

<style scoped>
#canvas-universe {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background-color: var(--c-bg, #0b0c0e);
}

#webgl-stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.72;
}

#webgl-stage :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
