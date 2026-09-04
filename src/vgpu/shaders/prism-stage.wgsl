// ReveriePaint vgpu Optical Prism Shader
// Simulates 3D glass prism refraction, Cauchy chromatic dispersion, and Morandi caustics

struct PrismUniforms {
  resolution: vec2f,
  mouse: vec2f,
  time: f32,
  refractiveIndex: f32,
  dispersion: f32,
  beamAngle: f32,
  intensity: f32,
}

@group(0) @binding(0) var<uniform> u: PrismUniforms;

// Cauchy's dispersion equation: n(lambda) = n0 + B / lambda^2
fn getRefractiveIndex(baseN: f32, dispersion: f32, channel: f32) -> f32 {
  // channel 0.0 (red, 650nm), 0.5 (green, 530nm), 1.0 (violet, 430nm)
  let lambda = 0.43 + (1.0 - channel) * 0.22;
  return baseN + (dispersion * 0.04) / (lambda * lambda);
}

// Distance to equilateral triangle
fn sdEquilateralTriangle(p: vec2f, r: f32) -> f32 {
  let k = sqrt(3.0);
  var pt = vec2f(abs(p.x) - r, p.y + r / k);
  if (pt.x + k * pt.y > 0.0) {
    pt = vec2f(pt.x - k * pt.y, -k * pt.x - pt.y) * 0.5;
  }
  pt.x -= clamp(pt.x, -2.0 * r, 0.0);
  return -length(pt) * sign(pt.y);
}

fn rot2d(angle: f32) -> mat2x2f {
  let s = sin(angle);
  let c = cos(angle);
  return mat2x2f(vec2f(c, -s), vec2f(s, c));
}

// Morandi harmonic spectral color tones
fn morandiSpectrum(t: f32) -> vec3f {
  let cRed   = vec3f(0.80, 0.48, 0.45); // Rose Clay (630nm)
  let cGold  = vec3f(0.84, 0.72, 0.52); // Sand Gold (590nm)
  let cGreen = vec3f(0.54, 0.68, 0.58); // Sage Moss (520nm)
  let cCyan  = vec3f(0.48, 0.65, 0.75); // Mist Haze (480nm)
  let cBlue  = vec3f(0.58, 0.54, 0.72); // Mauve Slate (430nm)
  
  if (t < 0.25) {
    return mix(cRed, cGold, t / 0.25);
  } else if (t < 0.5) {
    return mix(cGold, cGreen, (t - 0.25) / 0.25);
  } else if (t < 0.75) {
    return mix(cGreen, cCyan, (t - 0.5) / 0.25);
  } else {
    return mix(cCyan, cBlue, (t - 0.75) / 0.25);
  }
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let aspect = u.resolution.x / u.resolution.y;
  let p = (uv - 0.5) * vec2f(aspect, 1.0);
  let m = (u.mouse - 0.5) * vec2f(aspect, 1.0);

  // Prism slow gyroscopic rotation + mouse tilt
  let rotAngle = sin(u.time * 0.2) * 0.08 + (m.x * 0.4);
  let rotP = rot2d(rotAngle) * p;

  let triangleRadius = 0.36;
  let dTri = sdEquilateralTriangle(rotP, triangleRadius);

  // Incident light beam calculation
  let beamDir = vec2f(cos(u.beamAngle), sin(u.beamAngle));
  let incidentOrigin = vec2f(-0.75 * aspect, 0.0);
  let toIncident = p - incidentOrigin;
  let incidentDist = abs(dot(toIncident, vec2f(-beamDir.y, beamDir.x)));
  let incidentRay = exp(-incidentDist * 32.0) * step(p.x, rotP.x);

  // Background deep dark canvas
  var color = vec3f(0.012, 0.014, 0.018);

  // Ambient caustic floor reflection
  let floorRadius = length(p * vec2f(1.0, 1.6) + vec2f(0.0, 0.2));
  let floorGlow = exp(-floorRadius * 2.0) * 0.3;
  color += vec3f(0.06, 0.07, 0.10) * floorGlow;

  // Prism edge facets
  let edgeWidth = 0.009;
  let edgeMask = smoothstep(edgeWidth, 0.0, abs(dTri));
  let outerGlow = exp(-max(dTri, 0.0) * 16.0) * 0.7;
  let innerGlow = exp(-max(-dTri, 0.0) * 20.0) * 0.5;

  // Multi-wavelength chromatic dispersion sampling
  let SAMPLES = 6;
  var spectralAcc = vec3f(0.0);

  for (var i = 0; i < SAMPLES; i = i + 1) {
    let fi = f32(i) / f32(SAMPLES - 1);
    let n = getRefractiveIndex(u.refractiveIndex, u.dispersion, fi);
    
    // Snell refraction shift
    let refractOffset = beamDir * (1.0 / n - 0.65) * 0.18;
    let sampleP = rot2d(rotAngle + (fi - 0.5) * u.dispersion * 0.28) * (p + refractOffset);
    let sampleDist = sdEquilateralTriangle(sampleP, triangleRadius);

    let internalFacet = exp(-abs(sampleDist) * 32.0);
    let causticBeam = exp(-abs(dot(normalize(sampleP), vec2f(cos(u.time * 0.35 + fi * 2.5), sin(u.time * 0.35)))) * 36.0) * 0.5;

    let spectralColor = morandiSpectrum(fi);
    spectralAcc += spectralColor * (internalFacet + causticBeam * 0.75);
  }
  spectralAcc /= f32(SAMPLES);

  if (dTri < 0.0) {
    // Glass prism interior
    let glassSheen = 0.2 + 0.8 * pow(clamp(1.0 + dTri * 2.8, 0.0, 1.0), 3.0);
    color += spectralAcc * (u.intensity * 2.4) * glassSheen;
    color += vec3f(0.18, 0.22, 0.28) * innerGlow;
  } else {
    // Exterior refractive rainbow rays fan
    let rayAngle = atan2(rotP.y, rotP.x);
    let causticFan = pow(0.5 + 0.5 * sin(rayAngle * 3.0 - u.time * 0.6), 5.0) * outerGlow;
    let spectrumSweep = morandiSpectrum(fract(rayAngle / 6.28318 + u.time * 0.03));
    color += spectrumSweep * causticFan * (u.intensity * 1.8);
  }

  // Incident light beam overlay
  color += vec3f(0.95, 0.92, 0.88) * incidentRay * 0.85;

  // Luminous Morandi facet edge glow
  let ledGlow = mix(vec3f(0.92, 0.86, 0.80), vec3f(0.82, 0.56, 0.50), 0.5 + 0.5 * sin(u.time * 1.5));
  color += ledGlow * (edgeMask * 2.0 + outerGlow * 0.3) * u.intensity;

  // Smooth vignette
  let vig = 1.0 - smoothstep(0.45, 1.4, length(uv - 0.5));
  color *= vig;

  return vec4f(color, 1.0);
}
