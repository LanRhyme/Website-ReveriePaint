// ReveriePaint vgpu Background Shader
// Architectural Morandi Atmospheric Pigment Canvas with Multi-layered Depth

struct Uniforms {
  resolution: vec2f,
  mouse: vec2f,
  time: f32,
  scroll: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;

fn hash22(p: vec2f) -> vec2f {
  var p3 = fract(vec3f(p.xyx) * vec3f(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let aspect = u.resolution.x / u.resolution.y;
  let p = vec2f((uv.x - 0.5) * aspect, uv.y - 0.5);

  let t = u.time * 0.045;

  // 1. Dynamic Cursor Lighting Follow
  let mPos = vec2f((u.mouse.x - 0.5) * aspect, u.mouse.y - 0.5);
  let dMouse = length(p - mPos);
  let mouseLantern = exp(-dMouse * 2.2) * 0.35;
  let mouseHalo = exp(-dMouse * 0.8) * 0.15;

  // 2. Multi-cluster Floating Morandi Pigment Clouds
  let pos1 = vec2f(cos(t * 0.7) * 0.52 + 0.15 * aspect, sin(t * 0.5) * 0.38 + 0.12);
  let pos2 = vec2f(sin(t * 0.6 + 2.1) * 0.58 - 0.22 * aspect, cos(t * 0.8 + 1.2) * 0.42 - 0.16);
  let pos3 = vec2f(sin(t * 0.4 + 4.2) * 0.35, cos(t * 0.35 + 2.8) * 0.48);
  let pos4 = vec2f(cos(t * 0.5 + 1.8) * 0.65 - 0.10 * aspect, sin(t * 0.65 + 3.5) * 0.32 + 0.25);

  let d1 = length(p - pos1);
  let d2 = length(p - pos2);
  let d3 = length(p - pos3);
  let d4 = length(p - pos4);

  let blob1 = exp(-d1 * 1.20);
  let blob2 = exp(-d2 * 1.30);
  let blob3 = exp(-d3 * 1.40);
  let blob4 = exp(-d4 * 1.50);

  // 3. Fluid Wave Caustics & Pigment Ripple Lines
  let wave1 = sin(p.x * 2.8 + p.y * 2.1 + t * 1.4) * 0.5 + 0.5;
  let wave2 = cos(p.x * 2.2 - p.y * 2.6 - t * 1.1) * 0.5 + 0.5;
  let wave3 = sin((p.x + p.y) * 3.4 + t * 0.8) * 0.5 + 0.5;
  let waveMod = (wave1 * 0.45 + wave2 * 0.35 + wave3 * 0.20);

  // 4. Subtle Drafting Grid / Fine Art Isometric Geometry lines
  let gridP = uv * vec2f(aspect * 24.0, 24.0);
  let gridLine = min(fract(gridP.x), fract(gridP.y));
  let isGrid = smoothstep(0.04, 0.0, gridLine) * 0.08;

  // 5. Morandi Spectrum
  let cVoid  = vec3f(0.043, 0.045, 0.052); // Studio Dark Slate
  let cClay  = vec3f(0.82, 0.58, 0.52);   // Terracotta Blush
  let cSlate = vec3f(0.42, 0.54, 0.64);   // Muted Slate Blue
  let cSand  = vec3f(0.86, 0.78, 0.68);   // Warm Cream Sand
  let cMoss  = vec3f(0.52, 0.65, 0.56);   // Celadon Sage
  let cMauve = vec3f(0.68, 0.58, 0.72);   // Twilight Mauve

  // 6. Scroll Phase Modulation
  let s = clamp(u.scroll, 0.0, 1.0);
  let phase1 = smoothstep(0.0, 0.35, s);
  let phase2 = smoothstep(0.35, 0.70, s);
  let phase3 = smoothstep(0.70, 1.00, s);

  var colClusterA = mix(cSand, cClay, phase1);
  colClusterA = mix(colClusterA, cSlate, phase2);
  colClusterA = mix(colClusterA, cMauve, phase3);

  var colClusterB = mix(cClay, cMoss, phase1);
  colClusterB = mix(colClusterB, cSand, phase2);
  colClusterB = mix(colClusterB, cClay, phase3);

  var colClusterC = mix(cSlate, cMauve, phase1);
  colClusterC = mix(colClusterC, cClay, phase2);
  colClusterC = mix(colClusterC, cSlate, phase3);

  // 7. Compose Volumetric Atmospheric Pigment Body
  var color = cVoid;
  color += colClusterA * (blob1 * 0.65 + waveMod * 0.16);
  color += colClusterB * (blob2 * 0.58 + waveMod * 0.12);
  color += colClusterC * (blob3 * 0.50);
  color += cSand * (blob4 * 0.42);
  color += cSand * mouseLantern * 1.8 + cClay * mouseHalo;
  color += vec3f(0.9, 0.9, 0.95) * isGrid;

  // Soft Vignette
  let edgeDist = length(vec2f((uv.x - 0.5) * 1.05, uv.y - 0.5));
  let vignette = smoothstep(0.98, 0.20, edgeDist);
  color *= (0.86 + 0.14 * vignette);

  return vec4f(color, 1.0);
}
