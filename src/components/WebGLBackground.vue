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
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.05;
    float n = snoise(st * 1.6 + vec2(t * 0.2, t * 0.15) + (u_mouse * 0.1));
    float n2 = snoise(st * 3.0 - vec2(t * 0.1, t * 0.25) + n * 0.4);

    vec3 c0 = vec3(0.043, 0.047, 0.055);
    vec3 cSlate = vec3(0.42, 0.51, 0.58);
    vec3 cClay  = vec3(0.77, 0.60, 0.56);
    vec3 cSand  = vec3(0.83, 0.76, 0.70);

    vec3 color = c0;
    color = mix(color, cSlate, smoothstep(-0.4, 0.8, n) * 0.25);
    color = mix(color, cClay, smoothstep(-0.2, 0.9, n2) * 0.18);
    color = mix(color, cSand, smoothstep(0.4, 1.0, n + n2) * 0.10);

    gl_FragColor = vec4(color, 1.0);
  }
`

function onResize() {
  if (!renderer || !container.value) return
  const w = window.innerWidth
  const h = window.innerHeight
  renderer.setSize(w, h)
  uniforms.u_resolution.value.set(w, h)
}

function onMouseMove(e) {
  if (!uniforms) return
  uniforms.u_mouse.value.x = e.clientX / window.innerWidth
  uniforms.u_mouse.value.y = 1.0 - e.clientY / window.innerHeight
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
  uniforms.u_time.value = ts * 0.001
  renderer.render(scene, camera)
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // still render static frame but no loop
  }

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.value.appendChild(renderer.domElement)

  uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) }
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
  document.addEventListener('visibilitychange', onVisibility)

  // respect reduced motion: if user prefers reduced, render once and don't loop
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
  <div ref="container" id="webgl-stage" aria-hidden="true"></div>
</template>

<style scoped>
#webgl-stage {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  opacity: 0.7;
}
#webgl-stage :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
