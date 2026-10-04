<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  enableInteraction: {
    type: Boolean,
    default: true
  }
})

const canvasRef = ref(null)
let renderer = null
let scene = null
let camera = null
let animationFrameId = null
let blobMesh = null
let material = null
let originalPositions = null
let clock = null

// 莫兰迪流体调色板
const MORANDI_PALETTES = [
  new THREE.Color('#8fa3b4'), // 雾霾蓝
  new THREE.Color('#c3a39e'), // 干燥玫瑰
  new THREE.Color('#a8b09c'), // 灰绿
  new THREE.Color('#c8b48d'), // 暖砂黄
  new THREE.Color('#606b7d')  // 深冷青
]

// 交互指针与滚动位移状态
const pointer = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  isDown: false
}

const scrollState = {
  scrollY: 0,
  targetScrollY: 0,
  maxScroll: 1
}

function initThree() {
  if (!canvasRef.value) return
  const width = window.innerWidth
  const height = window.innerHeight

  clock = new THREE.Clock()

  // 1. Scene
  scene = new THREE.Scene()

  // 2. Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 0, 7.5)

  // 3. Renderer
  const isMobile = window.innerWidth < 768
  const pixelRatio = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance'
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(pixelRatio)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  // 4. Geometry - 动态流体液滴微表面 (更细腻轻盈的尺寸)
  const detail = isMobile ? 36 : 72
  const geometry = new THREE.SphereGeometry(1.75, detail, detail)
  originalPositions = geometry.attributes.position.clone()

  // 5. Shader Material - 柔和半透莫兰迪水彩胶质（低侵入度，不抢眼）
  material = new THREE.MeshPhysicalMaterial({
    color: 0x8fa3b4,
    roughness: 0.28,
    metalness: 0.05,
    transmission: 0.65,
    ior: 1.35,
    thickness: 1.6,
    opacity: 0.75,
    transparent: true,
    specularIntensity: 0.6,
    specularColor: new THREE.Color(0xffffff),
    clearcoat: 0.7,
    clearcoatRoughness: 0.2,
    reflectivity: 0.7
  })

  blobMesh = new THREE.Mesh(geometry, material)
  scene.add(blobMesh)

  // 6. Lights - 柔和环境漫射光与适度轮廓光
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.6)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8)
  keyLight.position.set(5, 5, 5)
  scene.add(keyLight)

  const rimLight1 = new THREE.DirectionalLight(0xc3a39e, 1.8)
  rimLight1.position.set(-5, -4, -4)
  scene.add(rimLight1)

  const rimLight2 = new THREE.DirectionalLight(0x8fa3b4, 1.4)
  rimLight2.position.set(-4, 4, 3)
  scene.add(rimLight2)

  // 7. Event Listeners
  window.addEventListener('resize', onWindowResize, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })

  if (props.enableInteraction) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
  }

  updateScrollMax()
  animate()
}

function updateScrollMax() {
  scrollState.maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
}

function onWindowResize() {
  if (!camera || !renderer) return
  const width = window.innerWidth
  const height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  updateScrollMax()
}

function onScroll() {
  scrollState.targetScrollY = window.scrollY
}

function onPointerMove(e) {
  pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1
  pointer.targetY = -(e.clientY / window.innerHeight) * 2 + 1
}

function onPointerDown() {
  pointer.isDown = true
}

function onPointerUp() {
  pointer.isDown = false
}

// 顶点动态形变与波动
function updateBlobGeometry(time, intensity) {
  if (!blobMesh || !originalPositions) return
  const posAttr = blobMesh.geometry.attributes.position
  const origArray = originalPositions.array
  const posArray = posAttr.array
  const vertexCount = posAttr.count
  const mouseDistFactor = pointer.isDown ? 1.2 : 0.45

  for (let i = 0; i < vertexCount; i++) {
    const ix = i * 3
    const iy = i * 3 + 1
    const iz = i * 3 + 2

    const ox = origArray[ix]
    const oy = origArray[iy]
    const oz = origArray[iz]

    // 有机流体波
    const wave =
      Math.sin(ox * 2.0 + time * 1.6) * 0.14 +
      Math.cos(oy * 2.4 + time * 1.3) * 0.14 +
      Math.sin(oz * 2.2 + time * 1.9) * 0.09

    // 鼠标拉扯计算
    const dx = ox - pointer.x * 2.2
    const dy = oy - pointer.y * 2.2
    const distSq = dx * dx + dy * dy
    const mousePull = Math.exp(-distSq * 1.2) * mouseDistFactor

    const scale = 1 + wave * intensity + mousePull

    posArray[ix] = ox * scale
    posArray[iy] = oy * scale
    posArray[iz] = oz * scale
  }

  posAttr.needsUpdate = true
  blobMesh.geometry.computeVertexNormals()
}

let colorIndex = 0
let colorProgress = 0

function animate() {
  animationFrameId = requestAnimationFrame(animate)
  if (!clock || !blobMesh || !renderer || !scene || !camera) return

  const delta = clock.getDelta()
  const time = clock.getElapsedTime()

  // 缓动鼠标指针
  pointer.x += (pointer.targetX - pointer.x) * 0.05
  pointer.y += (pointer.targetY - pointer.y) * 0.05

  // 缓动平滑滚动插值
  scrollState.scrollY += (scrollState.targetScrollY - scrollState.scrollY) * 0.08
  const scrollNorm = Math.min(1, Math.max(0, scrollState.scrollY / scrollState.maxScroll))

  // 核心视觉：3D 物体居中悬浮于视口中央背景，随滚动在中心纵深微幅漂移
  // 首页 (Hero) 时居于屏幕中央，随滚动微幅位移
  const targetX = pointer.x * 0.25 + Math.sin(scrollNorm * Math.PI) * 0.2
  const targetY = (0.5 - scrollNorm * 1.0) + pointer.y * 0.2
  const targetZ = -0.5 - scrollNorm * 1.5

  blobMesh.position.x += (targetX - blobMesh.position.x) * 0.05
  blobMesh.position.y += (targetY - blobMesh.position.y) * 0.05
  blobMesh.position.z += (targetZ - blobMesh.position.z) * 0.05

  // 旋转力学
  blobMesh.rotation.x = time * 0.12 + scrollNorm * Math.PI * 0.6 + pointer.y * 0.25
  blobMesh.rotation.y = time * 0.16 + scrollNorm * Math.PI * 0.8 + pointer.x * 0.35

  // 顶点形变 (更温和的呼吸)
  const deformIntensity = pointer.isDown ? 1.2 : 0.65
  updateBlobGeometry(time, deformIntensity)

  // 莫兰迪色谱平滑过渡
  colorProgress += delta * 0.16
  if (colorProgress >= 1) {
    colorProgress = 0
    colorIndex = (colorIndex + 1) % MORANDI_PALETTES.length
  }
  const nextIndex = (colorIndex + 1) % MORANDI_PALETTES.length
  material.color.lerpColors(MORANDI_PALETTES[colorIndex], MORANDI_PALETTES[nextIndex], colorProgress)

  renderer.render(scene, camera)
}

function cleanup() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('pointerup', onPointerUp)

  if (blobMesh) {
    if (blobMesh.geometry) blobMesh.geometry.dispose()
    if (blobMesh.material) blobMesh.material.dispose()
  }
  if (renderer) {
    renderer.dispose()
  }
  renderer = null
  scene = null
  camera = null
}

onMounted(() => {
  try {
    const testCanvas = document.createElement('canvas')
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
    if (gl) {
      initThree()
    }
  } catch (e) {
    console.warn('WebGL not supported', e)
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <canvas ref="canvasRef" class="lusion-global-canvas" aria-hidden="true"></canvas>
</template>

<style scoped>
.lusion-global-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0; /* 严格位于背景层，位于所有页面卡片、按钮与文字下方 */
  will-change: transform;
}
</style>
