// src/components/GrainientBackground.web.js
// Static import — Metro-compatible. WebGL failure dihandle gracefully via try/catch.
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

const hexToRgb = hex => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return [1, 1, 1];
  return [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255];
};

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution; uniform float iTime;
uniform float uTimeSpeed,uColorBalance,uWarpStrength,uWarpFrequency,uWarpSpeed,uWarpAmplitude;
uniform float uBlendAngle,uBlendSoftness,uRotationAmount,uNoiseScale;
uniform float uGrainAmount,uGrainScale,uGrainAnimated,uContrast,uGamma,uSaturation;
uniform vec2 uCenterOffset; uniform float uZoom;
uniform vec3 uColor1,uColor2,uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);return 0.5+0.5*mix(mix(dot(-1.0+2.0*hash(i),f),dot(-1.0+2.0*hash(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0,1)),f-vec2(0,1)),dot(-1.0+2.0*hash(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);}
void main(){
  float t=iTime*uTimeSpeed;
  vec2 uv=gl_FragCoord.xy/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);
  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;
  float amplitude=uWarpAmplitude/max(uWarpStrength,0.001);
  float wt=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*uWarpFrequency+wt)/amplitude;
  tuv.y+=sin(tuv.x*(uWarpFrequency*1.5)+wt)/(amplitude*0.5);
  float b=uColorBalance,s=max(uBlendSoftness,0.0);
  float blendX=(tuv*Rot(radians(uBlendAngle))).x;
  vec3 layer1=mix(uColor3,uColor2,S(-0.3-b-s,0.2-b+s,blendX));
  vec3 layer2=mix(uColor2,uColor1,S(-0.3-b-s,0.2-b+s,blendX));
  vec3 col=mix(layer1,layer2,S(0.5-b+s,-0.3-b-s,tuv.y));
  vec2 gu=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5) gu+=vec2(iTime*0.05);
  col+=(fract(sin(dot(gu,vec2(12.9898,78.233)))*43758.5453)-0.5)*uGrainAmount;
  col=(col-0.5)*uContrast+0.5;
  col=mix(vec3(dot(col,vec3(0.2126,0.7152,0.0722))),col,uSaturation);
  col=clamp(pow(max(col,0.0),vec3(1.0/max(uGamma,0.001))),0.0,1.0);
  fragColor=vec4(col,1.0);
}
`;

const GrainientBackground = ({
  timeSpeed = 0.85, colorBalance = 0.05, warpStrength = 1.85, warpFrequency = 2.7,
  warpSpeed = 0.5, warpAmplitude = 50.0, blendAngle = 0.0, blendSoftness = 0.05,
  rotationAmount = 500.0, noiseScale = 2.0, grainAmount = 0.1, grainScale = 2.0,
  grainAnimated = true, contrast = 1.5, gamma = 1.0, saturation = 1.0,
  centerX = 0.0, centerY = 0.0, zoom = 0.95,
  color1 = '#533636', color2 = '#f29f40', color3 = '#aa391d',
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0, ro, cancelled = false;
    let canvasEl = null;

    try {
      // Coba buat renderer — akan throw kalau WebGL tidak tersedia
      const renderer = new Renderer({
        webgl: 2, alpha: true, antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      const gl = renderer.gl;
      canvasEl = gl.canvas;
      canvasEl.style.cssText = 'width:100%;height:100%;display:block;position:absolute;top:0;left:0;';
      container.appendChild(canvasEl);

      const program = new Program(gl, {
        vertex, fragment,
        uniforms: {
          iTime:          { value: 0 },
          iResolution:    { value: new Float32Array([1, 1]) },
          uTimeSpeed:     { value: timeSpeed },
          uColorBalance:  { value: colorBalance },
          uWarpStrength:  { value: warpStrength },
          uWarpFrequency: { value: warpFrequency },
          uWarpSpeed:     { value: warpSpeed },
          uWarpAmplitude: { value: warpAmplitude },
          uBlendAngle:    { value: blendAngle },
          uBlendSoftness: { value: blendSoftness },
          uRotationAmount:{ value: rotationAmount },
          uNoiseScale:    { value: noiseScale },
          uGrainAmount:   { value: grainAmount },
          uGrainScale:    { value: grainScale },
          uGrainAnimated: { value: grainAnimated ? 1.0 : 0.0 },
          uContrast:      { value: contrast },
          uGamma:         { value: gamma },
          uSaturation:    { value: saturation },
          uCenterOffset:  { value: new Float32Array([centerX, centerY]) },
          uZoom:          { value: zoom },
          uColor1:        { value: new Float32Array(hexToRgb(color1)) },
          uColor2:        { value: new Float32Array(hexToRgb(color2)) },
          uColor3:        { value: new Float32Array(hexToRgb(color3)) },
        },
      });

      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      const setSize = () => {
        if (cancelled) return;
        const rect = container.getBoundingClientRect();
        renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
        program.uniforms.iResolution.value[0] = gl.drawingBufferWidth;
        program.uniforms.iResolution.value[1] = gl.drawingBufferHeight;
      };
      ro = new ResizeObserver(setSize);
      ro.observe(container);
      setSize();

      const t0 = performance.now();
      const loop = t => {
        if (cancelled) return;
        program.uniforms.iTime.value = (t - t0) * 0.001;
        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

    } catch {
      // WebGL tidak tersedia — CSS gradient fallback sudah di div, tidak perlu aksi
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      if (canvasEl?.parentNode === container) {
        try { container.removeChild(canvasEl); } catch { /* ignore */ }
      }
    };
  }, [
    timeSpeed, colorBalance, warpStrength, warpFrequency, warpSpeed, warpAmplitude,
    blendAngle, blendSoftness, rotationAmount, noiseScale, grainAmount, grainScale,
    grainAnimated, contrast, gamma, saturation, centerX, centerY, zoom,
    color1, color2, color3,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        width: '100%', height: '100%', overflow: 'hidden',
        borderBottomLeftRadius: 35, borderBottomRightRadius: 35,
        // CSS gradient sebagai fallback jika WebGL gagal
        background: `linear-gradient(135deg, ${color3} 0%, ${color2} 50%, ${color1} 100%)`,
      }}
    />
  );
};

export default GrainientBackground;
