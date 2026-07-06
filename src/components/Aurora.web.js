// src/components/Aurora.web.js
// Static import — Metro-compatible. WebGL failure dihandle gracefully via try/catch.
import { Color, Mesh, Program, Renderer, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform float uTime, uAmplitude, uBlend;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
out vec4 fragColor;

vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)), x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
  i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m*m*m;
  vec3 x=2.0*fract(p*C.www)-1.0, h=abs(x)-0.5, ox=floor(x+0.5), a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}

void main(){
  vec2 uv=gl_FragCoord.xy/uResolution;
  // simple 3-stop color ramp
  vec3 c = uv.x < 0.5
    ? mix(uColorStops[0], uColorStops[1], uv.x * 2.0)
    : mix(uColorStops[1], uColorStops[2], (uv.x - 0.5) * 2.0);
  float h=exp(snoise(vec2(uv.x*2.0+uTime*0.1,uTime*0.25))*0.5*uAmplitude);
  float intensity=0.6*(uv.y*2.0-h+0.2);
  float alpha=smoothstep(0.20-uBlend*0.5, 0.20+uBlend*0.5, intensity);
  fragColor=vec4(intensity*c*alpha, alpha);
}`;

export default function Aurora({
  colorStops = ['#FF6347', '#FF8C00', '#FF4500'],
  amplitude  = 1.0,
  blend      = 0.5,
  speed      = 1.0,
}) {
  const ctnRef   = useRef(null);
  const propsRef = useRef({ colorStops, amplitude, blend, speed });
  propsRef.current = { colorStops, amplitude, blend, speed };

  useEffect(() => {
    const ctn = ctnRef.current;
    if (!ctn) return;

    let animId, cancelled = false, canvasEl = null;
    const toRGB = hex => { const c = new Color(hex); return [c.r, c.g, c.b]; };

    try {
      const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      canvasEl = gl.canvas;
      canvasEl.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
      ctn.appendChild(canvasEl);

      const geometry = new Triangle(gl);
      if (geometry.attributes.uv) delete geometry.attributes.uv;

      const program = new Program(gl, {
        vertex: VERT, fragment: FRAG,
        uniforms: {
          uTime:       { value: 0 },
          uAmplitude:  { value: amplitude },
          uColorStops: { value: colorStops.map(toRGB) },
          uResolution: { value: [ctn.offsetWidth || 1, ctn.offsetHeight || 1] },
          uBlend:      { value: blend },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });

      const resize = () => {
        if (cancelled) return;
        renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
        program.uniforms.uResolution.value = [ctn.offsetWidth, ctn.offsetHeight];
      };
      window.addEventListener('resize', resize);
      resize();

      const update = t => {
        if (cancelled) return;
        animId = requestAnimationFrame(update);
        const p = propsRef.current;
        program.uniforms.uTime.value       = t * 0.001 * (p.speed ?? 1);
        program.uniforms.uAmplitude.value  = p.amplitude ?? 1;
        program.uniforms.uBlend.value      = p.blend ?? 0.5;
        program.uniforms.uColorStops.value = (p.colorStops ?? colorStops).map(toRGB);
        renderer.render({ scene: mesh });
      };
      animId = requestAnimationFrame(update);

      return () => {
        cancelled = true;
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        if (canvasEl?.parentNode === ctn) {
          try { ctn.removeChild(canvasEl); } catch { /* ignore */ }
        }
        try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* ignore */ }
      };

    } catch {
      // WebGL tidak tersedia — komponen render null, tidak crash
      return () => { cancelled = true; };
    }
  }, []);

  return (
    <div
      ref={ctnRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
