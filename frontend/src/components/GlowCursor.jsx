import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './GlowCursor.css';

const MAX_POINTS = 64;

const VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

#define MAX_POINTS 64

uniform vec2 uResolution;
uniform vec2 uPoints[MAX_POINTS];
uniform float uPointCount;
uniform vec4 uBounds;
uniform vec3 uColor;
uniform vec3 uSecondaryColor;
uniform float uTrailWidth;
uniform float uTaper;
uniform float uGlowIntensity;
uniform float uGlowSpread;
uniform float uHotspot;
uniform float uBrightness;
uniform float uOpacity;
uniform float uPulseSpeed;
uniform float uNoiseStrength;
uniform float uNormalBlend;
uniform float uDepth;
uniform float uShadow;
uniform float uTime;
uniform float uFade;

varying vec2 vUv;

float sRGB(float x) {
  if (x <= 0.00031308) return 12.92 * x;
  return 1.055 * pow(x, 1.0 / 2.4) - 0.055;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float filmGrain(vec2 p, float time) {
  float frame = time * 18.0;
  float frameIndex = mod(floor(frame), 256.0);
  float nextFrameIndex = mod(frameIndex + 1.0, 256.0);
  float blend = fract(frame);
  blend = blend * blend * (3.0 - 2.0 * blend);
  vec2 pixel = floor(p);
  float current = hash(pixel + vec2(frameIndex * 17.0, frameIndex * 31.0));
  float next = hash(pixel + vec2(nextFrameIndex * 17.0, nextFrameIndex * 31.0));
  return mix(current, next, blend) * 2.0 - 1.0;
}

void main() {
  vec2 pixel = vUv * uResolution;

  // Cheap early-out: most pixels are nowhere near the trail
  if (pixel.x < uBounds.x || pixel.y < uBounds.y || pixel.x > uBounds.z || pixel.y > uBounds.w) discard;

  float denominator = max(uPointCount - 1.0, 1.0);
  float strongest = 0.0;
  float strongestCore = 0.0;
  float colorWeight = 0.0;
  vec3 colorSum = vec3(0.0);

  // 3D tube state: the segment whose surface is closest to this pixel
  float bestTube = 1e9;
  vec2 tubeOffset = vec2(0.0);
  float tubeRadius = 1.0;
  float tubeProgress = 0.0;
  float tubeLife = 0.0;
  float shadow = 0.0;
  vec2 shadowShift = vec2(0.9, -1.4) * uTrailWidth;

  for (int i = 0; i < MAX_POINTS - 1; i++) {
    float index = float(i);
    float active = 1.0 - step(uPointCount - 1.0, index);
    vec2 start = uPoints[i];
    vec2 end = uPoints[i + 1];
    vec2 toPixel = pixel - start;
    vec2 segment = end - start;
    float segLen2 = max(dot(segment, segment), 0.0001);
    float along = clamp(dot(toPixel, segment) / segLen2, 0.0, 1.0);
    float progress = clamp((index + along) / denominator, 0.0, 1.0);
    float life = pow(max(1.0 - progress, 0.0), mix(0.55, 1.25, uTaper));
    float width = uTrailWidth * mix(1.0, 0.25, pow(progress, mix(0.55, 1.6, uTaper)));
    vec2 offsetVec = toPixel - segment * along;
    float distanceToTrail = length(offsetVec);
    float falloff = max(width * (0.8 + uGlowSpread * 1.4), 0.5);
    float beam = min(1.0, (falloff * falloff) / (distanceToTrail * distanceToTrail + falloff * falloff));
    float core = exp(-pow(distanceToTrail / max(width, 0.5), 2.0) * 2.5);
    float pulseAmount = min(abs(uPulseSpeed), 1.0);
    float pulse = 1.0 + sin(uTime * uPulseSpeed * 3.0 - progress * 11.0) * 0.16 * pulseAmount;
    float intensity = (core + beam * uGlowIntensity * 0.55) * life * pulse * active;
    vec3 segmentColor = mix(uColor, uSecondaryColor, progress);

    strongest = max(strongest, intensity);
    strongestCore = max(strongestCore, core * life * active);
    colorSum += segmentColor * intensity;
    colorWeight += intensity;

    // Distance to this segment, as a fraction of the tube radius
    float radius = max(width * 1.35, 0.5);
    float nd = distanceToTrail / radius;
    if (active > 0.5 && life > 0.02 && nd < bestTube) {
      bestTube = nd;
      tubeOffset = offsetVec;
      tubeRadius = radius;
      tubeProgress = progress;
      tubeLife = life;
    }

    // Soft contact shadow: the trail as seen from the shifted position
    vec2 toShadow = toPixel - shadowShift;
    float alongS = clamp(dot(toShadow, segment) / segLen2, 0.0, 1.0);
    float distS = length(toShadow - segment * alongS);
    shadow = max(shadow, exp(-pow(distS / (radius * 1.6), 2.0)) * life * active);
  }

  float grain = filmGrain(pixel, uTime);
  float noiseAmount = (1.0 - exp(-uNoiseStrength * 2.2)) * 0.4;
  float alpha = clamp(strongest * uOpacity * uFade, 0.0, 1.0);

  vec3 color = colorSum / max(colorWeight, 0.0001);
  color = mix(color, vec3(1.0), smoothstep(0.25, 0.95, strongestCore) * uHotspot);
  float luminance = sRGB(clamp(strongest * uBrightness, 0.0, 1.0));
  luminance *= 1.0 + grain * noiseAmount;
  vec3 additiveColor = color * luminance;
  float normalAlpha = clamp(strongest * uBrightness * uOpacity * uFade, 0.0, 1.0);
  vec3 normalColor = mix(color, vec3(1.0), smoothstep(0.45, 1.0, strongestCore) * uHotspot * 0.35);

  // ---- 3D tube shading -------------------------------------------------
  // Treat the trail as a glossy tube: rebuild a surface normal from the
  // offset to the tube's axis, then light it from the upper left.
  vec2 nxy = tubeOffset / tubeRadius;
  float nz = sqrt(max(1.0 - dot(nxy, nxy), 0.0));
  vec3 N = normalize(vec3(nxy, nz + 0.0001));
  vec3 L = normalize(vec3(-0.45, 0.65, 0.62));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float diffuse = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), 42.0);
  float rim = pow(1.0 - nz, 2.2);
  float bounce = pow(max(dot(N, normalize(vec3(0.5, -0.7, 0.35))), 0.0), 2.0);
  float recede = mix(1.0, 0.78, tubeProgress); // tail sits further from the viewer

  vec3 tubeBase = mix(uColor, uSecondaryColor, tubeProgress);
  vec3 lit = tubeBase * (0.5 + 0.8 * diffuse) * recede;
  lit += tubeBase * rim * 0.3;
  lit += mix(uSecondaryColor, uColor, 0.5) * bounce * 0.2 * recede;
  lit += vec3(1.0) * spec * (0.35 + 0.75 * uHotspot) * recede;
  lit *= uBrightness * (1.0 + grain * noiseAmount);
  lit = clamp(lit, 0.0, 1.0);

  float edge = clamp(1.0 / tubeRadius, 0.16, 0.6); // always at least ~1px of edge softness
  float tubeMask = (1.0 - smoothstep(1.0 - edge, 1.0, bestTube)) * smoothstep(0.02, 0.28, tubeLife);
  float depthMix = uDepth * tubeMask;
  float tubeAlpha = tubeMask * uOpacity * uFade;

  // Screen / additive path
  vec3 additiveFinal = mix(additiveColor, lit, depthMix);
  float alphaAdd = mix(alpha, max(alpha, tubeAlpha), uDepth);

  // Normal path: tube over halo, then composited over its own soft shadow
  vec3 topColor = mix(normalColor, lit, depthMix);
  float topAlpha = mix(normalAlpha, max(normalAlpha, tubeAlpha), uDepth);
  float shadowAlpha = shadow * uShadow * uDepth * uOpacity * uFade * 0.22;
  vec3 shadowColor = vec3(0.24, 0.14, 0.52);
  float outAlpha = topAlpha + shadowAlpha * (1.0 - topAlpha);
  vec3 normalFinal = (topColor * topAlpha + shadowColor * shadowAlpha * (1.0 - topAlpha)) / max(outAlpha, 0.0001);

  float finalAlpha = mix(alphaAdd, outAlpha, uNormalBlend);
  if (finalAlpha < 0.0005) discard;

  gl_FragColor = vec4(mix(additiveFinal, normalFinal, uNormalBlend), finalAlpha);
}
`;

const hexToRgb = hex => {
  let value = (hex || '').replace('#', '').trim();
  if (value.length === 3)
    value = value
      .split('')
      .map(char => char + char)
      .join('');
  const parsed = Number.parseInt(value || '000000', 16);
  return [((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255];
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const GlowCursor = ({
  color = '#67E8F9',
  secondaryColor = '#A78BFA',
  trailLength = 40,
  trailWidth = 8,
  trailTaper = 0.8,
  followSpeed = 0.16,
  glowIntensity = 1.9,
  glowSpread = 1.2,
  hotspot = 0.65,
  brightness = 1.25,
  opacity = 1,
  pulseSpeed = 1.1,
  noiseStrength = 0.035,
  idleFade = true,
  idleTimeout = 700,
  fadeDuration = 900,
  blendMode = 'screen',
  maxDevicePixelRatio = 1.5,
  enabled = true,
  // --- additions to the React Bits component ---
  depth = 0, // 0 = original flat glow, 1 = lit 3D tube with specular, rim light and soft shadow
  shadow = 0.7, // strength of the soft drop shadow (only with blendMode="normal" and depth > 0)
  fixed = false, // true = full-viewport overlay that tracks the pointer anywhere on the page
  children,
  className = '',
  style,
  ...rest
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const propsRef = useRef({});

  propsRef.current = {
    color,
    secondaryColor,
    trailLength,
    trailWidth,
    trailTaper,
    followSpeed,
    glowIntensity,
    glowSpread,
    hotspot,
    brightness,
    opacity,
    pulseSpeed,
    noiseStrength,
    idleFade,
    idleTimeout,
    fadeDuration,
    maxDevicePixelRatio,
    blendMode,
    enabled,
    depth,
    shadow
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const initialConfig = propsRef.current;
    const renderer = new Renderer({
      canvas,
      alpha: true,
      dpr: Math.min(window.devicePixelRatio || 1, initialConfig.maxDevicePixelRatio)
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const pointData = Array(MAX_POINTS * 2).fill(0);
    const points = Array.from({ length: MAX_POINTS }, () => ({ x: 0, y: 0 }));
    const target = { x: 0, y: 0 };
    const head = { x: 0, y: 0 };

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uResolution: { value: [1, 1] },
        uPoints: { value: pointData },
        uPointCount: { value: initialConfig.trailLength },
        uBounds: { value: [0, 0, 0, 0] },
        uColor: { value: hexToRgb(initialConfig.color) },
        uSecondaryColor: { value: hexToRgb(initialConfig.secondaryColor) },
        uTrailWidth: { value: initialConfig.trailWidth },
        uTaper: { value: initialConfig.trailTaper },
        uGlowIntensity: { value: initialConfig.glowIntensity },
        uGlowSpread: { value: initialConfig.glowSpread },
        uHotspot: { value: initialConfig.hotspot },
        uBrightness: { value: initialConfig.brightness },
        uOpacity: { value: initialConfig.opacity },
        uPulseSpeed: { value: initialConfig.pulseSpeed },
        uNoiseStrength: { value: initialConfig.noiseStrength },
        uNormalBlend: { value: initialConfig.blendMode === 'normal' ? 1 : 0 },
        uDepth: { value: initialConfig.depth },
        uShadow: { value: initialConfig.shadow },
        uTime: { value: 0 },
        uFade: { value: 0 }
      },
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    let width = 1;
    let height = 1;
    let initialized = false;
    let pointerInside = false;
    let fade = 0;
    let blank = false;
    let lastInputTime = performance.now();
    let lastFrameTime = performance.now();
    let raf = 0;
    let destroyed = false;

    const resize = () => {
      width = Math.max(container.clientWidth, 1);
      height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    };

    const initializeTrail = (x, y) => {
      target.x = x;
      target.y = y;
      head.x = x;
      head.y = y;
      for (const point of points) {
        point.x = x;
        point.y = y;
      }
      initialized = true;
      fade = 1;
    };

    const updatePointer = event => {
      const rect = container.getBoundingClientRect();
      const x = clamp(event.clientX - rect.left, 0, rect.width);
      const y = clamp(rect.height - (event.clientY - rect.top), 0, rect.height);
      if (!initialized) initializeTrail(x, y);
      target.x = x;
      target.y = y;
      pointerInside = true;
      lastInputTime = performance.now();
    };

    const onPointerLeave = () => {
      pointerInside = false;
      lastInputTime = performance.now();
    };

    const render = now => {
      if (destroyed) return;
      const config = propsRef.current;
      const elapsed = Math.min(now - lastFrameTime, 250);
      const delta = Math.min(elapsed / 16.667, 3);
      lastFrameTime = now;

      if (initialized) {
        const headEase = 1 - Math.pow(1 - clamp(config.followSpeed, 0.01, 0.99), delta);
        const chainBase = clamp(0.28 + config.followSpeed * 0.35, 0.08, 0.92);
        const chainEase = 1 - Math.pow(1 - chainBase, delta);
        head.x += (target.x - head.x) * headEase;
        head.y += (target.y - head.y) * headEase;
        points[0].x = head.x;
        points[0].y = head.y;

        for (let i = 1; i < MAX_POINTS; i++) {
          points[i].x += (points[i - 1].x - points[i].x) * chainEase;
          points[i].y += (points[i - 1].y - points[i].y) * chainEase;
        }

        for (let i = 0; i < MAX_POINTS; i++) {
          pointData[i * 2] = points[i].x;
          pointData[i * 2 + 1] = points[i].y;
        }
      }

      const idleFor = now - lastInputTime;
      const shouldFade = config.idleFade && (!pointerInside || idleFor > config.idleTimeout);
      // Fade on real elapsed time so slow frame rates can't leave a ghost trail behind
      const fadeStep = elapsed / Math.max(config.fadeDuration, 16);
      const fadeTarget = initialized && config.enabled && !shouldFade ? 1 : 0;
      fade += (fadeTarget - fade) * Math.min(1, fadeStep * 7);

      // Once fully faded, draw one empty frame to clear the canvas, then stop drawing
      const visible = fade > 0.002;
      if (visible || !blank) {
        const count = clamp(Math.round(config.trailLength), 2, MAX_POINTS);
        const trailW = Math.max(config.trailWidth, 0.1);

        // Bounding box of the trail plus the reach of its halo and shadow
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < count; i++) {
          const px = pointData[i * 2];
          const py = pointData[i * 2 + 1];
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }
        const reach = Math.max(trailW * (0.8 + Math.max(config.glowSpread, 0) * 1.4), 0.5) * 14 + trailW * 2;

        program.uniforms.uPointCount.value = count;
        program.uniforms.uBounds.value = visible
          ? [minX - reach, minY - reach, maxX + reach, maxY + reach]
          : [0, 0, 0, 0];
        program.uniforms.uColor.value = hexToRgb(config.color);
        program.uniforms.uSecondaryColor.value = hexToRgb(config.secondaryColor);
        program.uniforms.uTrailWidth.value = trailW;
        program.uniforms.uTaper.value = clamp(config.trailTaper, 0, 1);
        program.uniforms.uGlowIntensity.value = Math.max(config.glowIntensity, 0);
        program.uniforms.uGlowSpread.value = Math.max(config.glowSpread, 0);
        program.uniforms.uHotspot.value = clamp(config.hotspot, 0, 1);
        program.uniforms.uBrightness.value = Math.max(config.brightness, 0);
        program.uniforms.uOpacity.value = clamp(config.opacity, 0, 1);
        program.uniforms.uPulseSpeed.value = config.pulseSpeed;
        program.uniforms.uNoiseStrength.value = clamp(config.noiseStrength, 0, 1);
        program.uniforms.uNormalBlend.value = config.blendMode === 'normal' ? 1 : 0;
        program.uniforms.uDepth.value = clamp(config.depth, 0, 1);
        program.uniforms.uShadow.value = clamp(config.shadow, 0, 1);
        program.uniforms.uTime.value = now * 0.001;
        program.uniforms.uFade.value = visible ? fade : 0;

        renderer.render({ scene: mesh });
        blank = !visible;
      }
      if (!destroyed) raf = requestAnimationFrame(render);
    };

    // In fixed mode the overlay ignores pointer events, so listen on the page instead
    const moveTarget = fixed ? window : container;
    const leaveTarget = fixed ? document.documentElement : container;

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    moveTarget.addEventListener('pointermove', updatePointer);
    moveTarget.addEventListener('pointerenter', updatePointer);
    leaveTarget.addEventListener('pointerleave', onPointerLeave);
    if (fixed) window.addEventListener('blur', onPointerLeave);
    resize();
    raf = requestAnimationFrame(render);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      moveTarget.removeEventListener('pointermove', updatePointer);
      moveTarget.removeEventListener('pointerenter', updatePointer);
      leaveTarget.removeEventListener('pointerleave', onPointerLeave);
      if (fixed) window.removeEventListener('blur', onPointerLeave);
      mesh.geometry.remove();
      program.remove();
    };
  }, [maxDevicePixelRatio, fixed]);

  return (
    <div
      ref={containerRef}
      className={`glow-cursor${fixed ? ' glow-cursor--fixed' : ''}${className ? ` ${className}` : ''}`}
      style={style}
      {...rest}
    >
      <canvas ref={canvasRef} className="glow-cursor__canvas" style={{ mixBlendMode: blendMode }} aria-hidden="true" />
      {children && <div className="glow-cursor__content">{children}</div>}
    </div>
  );
};

export default GlowCursor;
