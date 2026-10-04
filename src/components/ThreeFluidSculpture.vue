<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  enableInteraction: {
    type: Boolean,
    default: true
  }
})

const containerRef = ref(null)
let renderer = null
let scene = null
let camera = null
let animationFrameId = null
let blobMesh = null
let material = null
let originalPositions = null

// 模拟水墨/彩墨颜料色彩调色板 (Morandi Chroma)
const MORANDI_PALETTES = [
  new THREE.Color('#8fa3b4'), // 雾霾蓝
  new THREE.Color('#c3a39e'), // 干燥玫瑰
  new THREE.Color('#a8b09c'), // 灰绿
  new THREE.Color('#c8b48d'), // 暖砂黄
  new THREE.Color('#4c5462')  // 深冷青
]

// 交互物理状态
const pointer = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  vx: 0,
  vy: 0,
  isDown: false,
  dragDist: 0
}

let clock = null

function initThree() {
  if (!containerRef.value) return
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  if (width === 0 || height === 0) return

  clock = new THREE.Clock()

  // 1. Scene
  scene = new THREE.Scene()

  // 2. Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 0, 5)

  // 3. Renderer
  const isMobile = window.innerWidth < 768
  const pixelRatio = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2)

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance'
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(pixelRatio)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  containerRef.value.appendChild(renderer.domElement)

  // 4. Geometry - 动态细分球体雕塑 (Icosahedron / Sphere)
  const detail = isMobile ? 32 : 64
  const geometry = new THREE.SphereGeometry(1.4, detail, detail)
  originalPositions = geometry.attributes.position.clone()

  // 5. Shader Material - 模拟 Lusion 级别彩墨/油彩金属流体微表面
  material = new THREE.MeshPhysicalMaterial({
    color: 0x8fa3b4,
    roughness: 0.18,
    metalness: 0.1,
    transmission: 0.35,
    ior: 1.45,
    thickness: 1.8,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xffffff),
    clearcoat: 0.95,
    clearcoatRoughness: 0.12,
    reflectivity: 0.9
  })

  blobMesh = new THREE.Mesh(geometry, material)
  scene.add(blobMesh)

  // 6. Lights - 电影级三点光照与彩色边缘光
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
  keyLight.position.set(5, 5, 4)
  scene.add(keyLight)

  const rimLight1 = new THREE.DirectionalLight(0xc3a39e, 3.0) // 玫瑰暖逆光
  rimLight1.position.set(-5, -3, -3)
  scene.add(rimLight1)

  const rimLight2 = new THREE.DirectionalLight(0x8fa3b4, 2.2) // 雾蓝侧面光
  rimLight2.position.set(-4, 4, 2)
  scene.add(rimLight2)

  // 7. Event Listeners
  window.addEventListener('resize', onWindowResize)
  if (props.enableInteraction) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
  }

  animate()
}

function onWindowResize() {
  if (!containerRef.value || !camera || !renderer) return
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  if (width === 0 || height === 0) return

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function onPointerMove(e) {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  pointer.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointer.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
}

function onPointerDown() {
  pointer.isDown = true
}

function onPointerUp() {
  pointer.isDown = false
}

// 顶点动态形变计算 (物理流体呼吸与鼠标冲量形变)
function updateBlobGeometry(time, intensity) {
  if (!blobMesh || !originalPositions) return
  const posAttr = blobMesh.geometry.attributes.position
  const origArray = originalPositions.array
  const posArray = posAttr.array

  const vertexCount = posAttr.count
  const mouseDistFactor = pointer.isDown ? 0.9 : 0.35

  for (let i = 0; i < vertexCount; i++) {
    const ix = i * 3
    const iy = i * 3 + 1
    const iz = i * 3 + 2

    const ox = origArray[ix]
    const oy = origArray[iy]
    const oz = origArray[iz]

    // 高频复合正弦波产生水墨表面张力流体颤动
    const wave =
      Math.sin(ox * 2.2 + time * 1.5) * 0.12 +
      Math.cos(oy * 2.8 + time * 1.2) * 0.12 +
      Math.sin(oz * 2.5 + time * 1.8) * 0.08

    // 鼠标距离拉扯形变
    const dx = ox - pointer.x * 1.5
    const dy = oy - pointer.y * 1.5
    const distSq = dx * dx + dy * dy
    const mousePull = Math.exp(-distSq * 1.5) * mouseDistFactor

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

  // 缓动追随鼠标
  pointer.x += (pointer.targetX - pointer.x) * 0.06
  pointer.y += (pointer.targetY - pointer.y) * 0.06

  // 旋转与漂浮动效
  blobMesh.rotation.x = time * 0.18 + pointer.y * 0.45
  blobMesh.rotation.y = time * 0.25 + pointer.x * 0.65
  blobMesh.position.y = Math.sin(time * 0.8) * 0.1 + pointer.y * 0.2
  blobMesh.position.x = pointer.x * 0.25

  // 动态顶点流体形变
  const deformIntensity = pointer.isDown ? 1.6 : 0.9
  updateBlobGeometry(time, deformIntensity)

  // 莫兰迪水墨材质色彩呼吸过渡
  colorProgress += delta * 0.18
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
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('pointerup', onPointerUp)

  if (blobMesh) {
    if (blobMesh.geometry) blobMesh.geometry.dispose()
    if (blobMesh.material) blobMesh.material.dispose()
  }
  if (renderer) {
    renderer.dispose()
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }
  renderer = null
  scene = null
  camera = null
}

onMounted(() => {
  // 检查 WebGL 可用性
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl) {
      initThree()
    }
  } catch (e) {
    console.warn('WebGL not supported, falling back gracefully', e)
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div ref="containerRef" class="lusion-blob-canvas" data-cursor="SCULPT"></div>
</template>

<style scoped>
.lusion-blob-canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  pointer-events: auto;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
