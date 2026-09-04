// ReveriePaint VGPU WebGPU Optical Renderer
// Encapsulates vgpu library pipelines with graceful WebGL2 fallback

export async function isWebGPUSupported() {
  if (typeof window === 'undefined' || !navigator.gpu) return false
  try {
    const adapter = await navigator.gpu.requestAdapter()
    return Boolean(adapter)
  } catch {
    return false
  }
}

export async function createBackgroundVgpuPipeline(canvas) {
  const supported = await isWebGPUSupported()

  if (supported) {
    try {
      const { init, surface, effect, frameLoop, clock } = await import('vgpu')
      const bgShader = (await import('./shaders/background.wgsl')).default

      const gpu = await init()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const surf = surface(gpu, canvas, { dpr })

      let currentScroll = 0
      let currentMouse = [0.5, 0.5]

      const bgEffect = effect(gpu, bgShader, {
        set: {
          resolution: [canvas.clientWidth * dpr, canvas.clientHeight * dpr],
          mouse: currentMouse,
          time: 0,
          scroll: currentScroll,
        }
      })

      const timeClock = clock(gpu)
      let active = true

      const loop = frameLoop(gpu, (f) => {
        if (!active) return
        bgEffect.set({
          time: timeClock.time,
          resolution: [canvas.width, canvas.height],
          mouse: currentMouse,
          scroll: currentScroll,
        })
        f.pass(surf, bgEffect)
      })

      return {
        backend: 'webgpu',
        set(uniforms) {
          if (uniforms.scroll !== undefined) currentScroll = uniforms.scroll
          if (uniforms.mouse) currentMouse = uniforms.mouse
          bgEffect.set(uniforms)
        },
        dispose() {
          active = false
          loop?.stop?.()
          gpu.dispose?.()
        }
      }
    } catch (err) {
      console.warn('[VGPU] WebGPU background init failed:', err)
    }
  }

  return null
}

export async function createPrismVgpuPipeline(canvas, options = {}) {
  const supported = await isWebGPUSupported()

  if (supported) {
    try {
      const { init, surface, effect, frameLoop, clock } = await import('vgpu')
      const prismShader = (await import('./shaders/prism-stage.wgsl')).default

      const gpu = await init()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const surf = surface(gpu, canvas, { dpr })

      const prismEffect = effect(gpu, prismShader, {
        set: {
          resolution: [canvas.clientWidth * dpr, canvas.clientHeight * dpr],
          mouse: [0.5, 0.5],
          time: 0,
          refractiveIndex: options.refractiveIndex ?? 1.52,
          dispersion: options.dispersion ?? 0.65,
          beamAngle: options.beamAngle ?? 0.0,
          intensity: options.intensity ?? 1.0,
        }
      })

      const timeClock = clock(gpu)
      let active = true

      const loop = frameLoop(gpu, (f) => {
        if (!active) return
        prismEffect.set({
          time: timeClock.time,
          resolution: [canvas.width, canvas.height],
        })
        f.pass(surf, prismEffect)
      })

      return {
        backend: 'webgpu',
        set(uniforms) {
          prismEffect.set(uniforms)
        },
        dispose() {
          active = false
          loop?.stop?.()
          gpu.dispose?.()
        }
      }
    } catch (err) {
      console.warn('[VGPU] WebGPU initialization error, falling back to WebGL2:', err)
    }
  }

  // Graceful WebGL2 Fallback Pipeline
  return createWebGL2PrismPipeline(canvas, options)
}

function createWebGL2PrismPipeline(canvas, options = {}) {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  if (!gl) return { backend: 'none', set() {}, dispose() {} }

  const vs = `
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `

  const fs = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
    uniform float u_refractiveIndex;
    uniform float u_dispersion;
    uniform float u_beamAngle;
    uniform float u_intensity;

    float sdEquilateralTriangle(vec2 p, float r) {
      const float k = 1.7320508;
      vec2 pt = vec2(abs(p.x) - r, p.y + r / k);
      if (pt.x + k * pt.y > 0.0) {
        pt = vec2(pt.x - k * pt.y, -k * pt.x - pt.y) * 0.5;
      }
      pt.x -= clamp(pt.x, -2.0 * r, 0.0);
      return -length(pt) * sign(pt.y);
    }

    mat2 rot2d(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
    }

    vec3 morandiSpectrum(float t) {
      vec3 cRed   = vec3(0.80, 0.48, 0.45);
      vec3 cGold  = vec3(0.84, 0.72, 0.52);
      vec3 cGreen = vec3(0.54, 0.68, 0.58);
      vec3 cCyan  = vec3(0.48, 0.65, 0.75);
      vec3 cBlue  = vec3(0.58, 0.54, 0.72);
      if (t < 0.25) return mix(cRed, cGold, t / 0.25);
      if (t < 0.5)  return mix(cGold, cGreen, (t - 0.25) / 0.25);
      if (t < 0.75) return mix(cGreen, cCyan, (t - 0.5) / 0.25);
      return mix(cCyan, cBlue, (t - 0.75) / 0.25);
    }

    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      float aspect = u_resolution.x / u_resolution.y;
      vec2 p = (st - 0.5) * vec2(aspect, 1.0);
      vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);

      float rotAngle = sin(u_time * 0.2) * 0.08 + (m.x * 0.4);
      vec2 rotP = rot2d(rotAngle) * p;

      float dTri = sdEquilateralTriangle(rotP, 0.36);
      vec2 beamDir = vec2(cos(u_beamAngle), sin(u_beamAngle));
      vec2 incidentOrigin = vec2(-0.75 * aspect, 0.0);
      float incidentDist = abs(dot(p - incidentOrigin, vec2(-beamDir.y, beamDir.x)));
      float incidentRay = exp(-incidentDist * 32.0) * step(p.x, rotP.x);

      vec3 color = vec3(0.012, 0.014, 0.018);
      float floorGlow = exp(-length(p * vec2(1.0, 1.6) + vec2(0.0, 0.2)) * 2.0) * 0.3;
      color += vec3(0.06, 0.07, 0.10) * floorGlow;

      float edgeMask = smoothstep(0.009, 0.0, abs(dTri));
      float outerGlow = exp(-max(dTri, 0.0) * 16.0) * 0.7;
      float innerGlow = exp(-max(-dTri, 0.0) * 20.0) * 0.5;

      vec3 spectralAcc = vec3(0.0);
      for (int i = 0; i < 6; i++) {
        float fi = float(i) / 5.0;
        float lambda = 0.43 + (1.0 - fi) * 0.22;
        float n = u_refractiveIndex + (u_dispersion * 0.04) / (lambda * lambda);
        vec2 sampleP = rot2d(rotAngle + (fi - 0.5) * u_dispersion * 0.28) * (p + beamDir * (1.0 / n - 0.65) * 0.18);
        float sDist = sdEquilateralTriangle(sampleP, 0.36);
        spectralAcc += morandiSpectrum(fi) * exp(-abs(sDist) * 32.0);
      }
      spectralAcc /= 6.0;

      if (dTri < 0.0) {
        float glassSheen = 0.2 + 0.8 * pow(clamp(1.0 + dTri * 2.8, 0.0, 1.0), 3.0);
        color += spectralAcc * (u_intensity * 2.4) * glassSheen;
        color += vec3(0.18, 0.22, 0.28) * innerGlow;
      } else {
        float rayAngle = atan2(rotP.y, rotP.x);
        float causticFan = pow(0.5 + 0.5 * sin(rayAngle * 3.0 - u_time * 0.6), 5.0) * outerGlow;
        color += morandiSpectrum(fract(rayAngle / 6.28318 + u_time * 0.03)) * causticFan * (u_intensity * 1.8);
      }

      color += vec3(0.95, 0.92, 0.88) * incidentRay * 0.85;
      vec3 ledGlow = mix(vec3(0.92, 0.86, 0.80), vec3(0.82, 0.56, 0.50), 0.5 + 0.5 * sin(u_time * 1.5));
      color += ledGlow * (edgeMask * 2.0 + outerGlow * 0.3) * u_intensity;
      color *= (1.0 - smoothstep(0.45, 1.4, length(st - 0.5)));

      gl_FragColor = vec4(color, 1.0);
    }
  `

  function comp(type, src) {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }

  const p = gl.createProgram()
  gl.attachShader(p, comp(gl.VERTEX_SHADER, vs))
  gl.attachShader(p, comp(gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(p)
  gl.useProgram(p)

  const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)

  const pos = gl.getAttribLocation(p, 'position')
  gl.enableVertexAttribArray(pos)
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(p, 'u_resolution')
  const uMouse = gl.getUniformLocation(p, 'u_mouse')
  const uTime = gl.getUniformLocation(p, 'u_time')
  const uN = gl.getUniformLocation(p, 'u_refractiveIndex')
  const uDisp = gl.getUniformLocation(p, 'u_dispersion')
  const uAngle = gl.getUniformLocation(p, 'u_beamAngle')
  const uInt = gl.getUniformLocation(p, 'u_intensity')

  let mouse = [0.5, 0.5]
  let n = options.refractiveIndex ?? 1.52
  let disp = options.dispersion ?? 0.65
  let angle = options.beamAngle ?? 0.0
  let intensity = options.intensity ?? 1.0
  let rafId = 0
  let active = true

  function loop(ts) {
    if (!active) return
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }

    gl.uniform2f(uRes, canvas.width, canvas.height)
    gl.uniform2f(uMouse, mouse[0], mouse[1])
    gl.uniform1f(uTime, ts * 0.001)
    gl.uniform1f(uN, n)
    gl.uniform1f(uDisp, disp)
    gl.uniform1f(uAngle, angle)
    gl.uniform1f(uInt, intensity)

    gl.drawArrays(gl.TRIANGLES, 0, 6)
    rafId = requestAnimationFrame(loop)
  }

  rafId = requestAnimationFrame(loop)

  return {
    backend: 'webgl2',
    set(params) {
      if (params.mouse) mouse = params.mouse
      if (params.refractiveIndex !== undefined) n = params.refractiveIndex
      if (params.dispersion !== undefined) disp = params.dispersion
      if (params.beamAngle !== undefined) angle = params.beamAngle
      if (params.intensity !== undefined) intensity = params.intensity
    },
    dispose() {
      active = false
      cancelAnimationFrame(rafId)
    }
  }
}
