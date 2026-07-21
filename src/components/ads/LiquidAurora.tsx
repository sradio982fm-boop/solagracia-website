"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type LiquidAuroraProps = {
  className?: string;
};

/**
 * Tall chromatic tongues of liquid light — domain-warped aurora with
 * thin dark ink creases. Cursor ripples the field. Solagracia loft spectrum.
 * Pauses on prefers-reduced-motion; CSS fallback if WebGL2 unavailable.
 */
export function LiquidAurora({ className }: LiquidAuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"pending" | "gpu" | "fallback">("pending");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      setMode("fallback");
      return;
    }

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    if (!gl) {
      setMode("fallback");
      return;
    }

    const vert = `#version 300 es
in vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

    const frag = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 u_res;
uniform float u_t;
uniform vec2 u_mouse;
uniform float u_amp;
uniform vec3 u_ring0;
uniform vec3 u_ring1;
uniform vec3 u_ring2;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

float creases(vec2 p, float t){
  float n = fbm(p * 2.4 + vec2(0.0, t * 0.15));
  float g = fbm(p * 5.5 - vec2(t * 0.08, 0.0));
  float ridge = abs(n - 0.5) * 2.0;
  float line = smoothstep(0.08, 0.0, ridge) * (0.55 + 0.45 * g);
  float fine = smoothstep(0.04, 0.0, abs(g - 0.48)) * 0.35;
  return clamp(line + fine, 0.0, 1.0);
}

vec2 ringWarp(vec2 p, vec3 ring, float now){
  float age = now - ring.z;
  if (age < 0.0 || age > 2.4) return vec2(0.0);
  vec2 d = p - ring.xy;
  float md = length(d);
  float radius = age * 0.72;
  float band = abs(md - radius);
  float crest = exp(-band * band * 55.0) * exp(-age * 0.85);
  float push = crest * 0.028;
  return (d / max(md, 1e-4)) * push;
}

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  p.x *= 0.85;
  float t = u_t * 0.32;
  float now = u_t;

  vec2 toM = p - u_mouse;
  float md = length(toM);
  vec2 mDir = toM / max(md, 1e-4);
  float live = sin(md * 14.0 - now * 5.5) * exp(-md * 2.8) * u_amp;
  p += mDir * live * 0.028;
  p += ringWarp(p, u_ring0, now);
  p += ringWarp(p, u_ring1, now);
  p += ringWarp(p, u_ring2, now);
  p += mDir * exp(-md * 3.8) * u_amp * 0.018;

  vec2 q = vec2(
    fbm(p * 1.35 + vec2(0.0, t * 0.55)),
    fbm(p * 1.35 + vec2(5.2, -t * 0.4))
  );
  vec2 r = vec2(
    fbm(p * 2.1 + 3.2 * q + vec2(1.7, 9.2) + t * 0.12),
    fbm(p * 2.1 + 3.2 * q + vec2(8.3, 2.8) - t * 0.1)
  );

  float columns = 0.0;
  for (float i = 0.0; i < 5.0; i++) {
    float cx = -1.05 + i * 0.48 + 0.16 * sin(t * 0.85 + i * 1.9);
    float sway = 0.22 * sin(p.y * 2.4 + t * 1.25 + i * 0.9) * fbm(vec2(i * 0.7, p.y + t));
    float d = abs(p.x - cx - sway - 0.32 * (r.x - 0.5));
    float tongue = exp(-d * d * (14.0 + 8.0 * q.y));
    float rise = smoothstep(-1.25, 0.95, p.y + 0.4 * r.y + 0.2 * sin(t * 0.9 + i));
    columns += tongue * rise;
  }
  columns = clamp(columns, 0.0, 1.65);

  float field = fbm(p * 1.8 + r * 1.4 + vec2(0.0, t * 0.25));
  float glow = pow(columns * (0.55 + 0.45 * field), 1.25);
  glow += exp(-md * 5.0) * u_amp * 0.12;
  glow = min(glow, 1.15);

  vec3 voidC = vec3(0.039, 0.039, 0.043);
  vec3 deep = vec3(0.1, 0.07, 0.055);
  vec3 amber = vec3(0.78, 0.42, 0.14);
  vec3 terracotta = vec3(0.7, 0.34, 0.15);
  vec3 gold = vec3(0.88, 0.66, 0.32);
  vec3 tealGlass = vec3(0.2, 0.45, 0.48);

  float hueMix = clamp(field * 0.7 + r.y * 0.4 + p.y * 0.2, 0.0, 1.0);
  vec3 spectrum = mix(terracotta, amber, hueMix);
  spectrum = mix(spectrum, gold, pow(glow, 2.0) * 0.45);
  spectrum = mix(spectrum, tealGlass, pow(1.0 - hueMix, 2.0) * 0.22 * glow);

  vec3 col = mix(voidC, deep, smoothstep(-0.2, 0.9, p.y * 0.5 + 0.5));
  col = mix(col, spectrum, clamp(glow * 0.85, 0.0, 0.92));
  col += gold * pow(glow, 3.2) * 0.22;
  col += amber * pow(smoothstep(0.2, 1.0, columns), 3.4) * 0.18;
  col += tealGlass * pow(q.x * glow, 2.0) * 0.1;
  col += gold * exp(-md * 6.0) * u_amp * 0.08;

  float ink = creases(p * vec2(1.1, 1.6) + r * 0.6, t);
  col *= 1.0 - ink * 0.62;
  col -= vec3(0.05, 0.035, 0.03) * ink;

  float vig = smoothstep(1.45, 0.25, length(p * vec2(0.7, 0.9)));
  col *= 0.55 + 0.4 * vig;
  // Soft ceiling so hot spots never bleach text
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col *= mix(1.0, 0.72, smoothstep(0.42, 0.78, luma));
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.02;
  col = pow(max(col, 0.0), vec3(0.94));
  o = vec4(col, 1.0);
}`;

    function compile(type: number, src: string) {
      const s = gl.createShader(type);
      if (!s) throw new Error("shader create failed");
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(s) || "compile error";
        gl.deleteShader(s);
        throw new Error(log);
      }
      return s;
    }

    let prog: WebGLProgram | null = null;
    let buf: WebGLBuffer | null = null;
    let raf = 0;
    let disposed = false;

    try {
      prog = gl.createProgram();
      if (!prog) throw new Error("program create failed");
      const vs = compile(gl.VERTEX_SHADER, vert);
      const fs = compile(gl.FRAGMENT_SHADER, frag);
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prog) || "link error");
      }
      gl.useProgram(prog);

      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(prog, "u_res");
      const uT = gl.getUniformLocation(prog, "u_t");
      const uMouse = gl.getUniformLocation(prog, "u_mouse");
      const uAmp = gl.getUniformLocation(prog, "u_amp");
      const uRing0 = gl.getUniformLocation(prog, "u_ring0");
      const uRing1 = gl.getUniformLocation(prog, "u_ring1");
      const uRing2 = gl.getUniformLocation(prog, "u_ring2");

      const t0 = performance.now();
      const pointer = {
        x: 0.5,
        y: 0.5,
        sx: 0.5,
        sy: 0.5,
        amp: 0,
        lastRingAt: -1,
        ringIdx: 0,
        rings: [
          { x: 0, y: 0, t: -10 },
          { x: 0, y: 0, t: -10 },
          { x: 0, y: 0, t: -10 },
        ],
      };

      const toShaderSpace = (clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect();
        const nx = (clientX - rect.left) / Math.max(rect.width, 1);
        const ny = (clientY - rect.top) / Math.max(rect.height, 1);
        const aspect = rect.width / Math.max(rect.height, 1);
        return {
          x: (nx - 0.5) * aspect * 0.85,
          y: 1 - ny - 0.5,
        };
      };

      const nowSec = () => (performance.now() - t0) * 0.001;

      const spawnRing = (x: number, y: number) => {
        const t = nowSec();
        if (t - pointer.lastRingAt < 0.38) return;
        pointer.lastRingAt = t;
        const ring = pointer.rings[pointer.ringIdx % 3]!;
        ring.x = x;
        ring.y = y;
        ring.t = t;
        pointer.ringIdx += 1;
      };

      const onPointerMove = (e: PointerEvent) => {
        const pos = toShaderSpace(e.clientX, e.clientY);
        const speed = Math.hypot(pos.x - pointer.x, pos.y - pointer.y);
        pointer.x = pos.x;
        pointer.y = pos.y;
        // Soft saturating gain — fast swipes don't explode the field
        const gain = Math.min(speed, 0.045) * 1.1;
        pointer.amp = Math.min(0.55, pointer.amp + gain);
        if (speed > 0.035) spawnRing(pos.x, pos.y);
      };

      const onPointerDown = (e: PointerEvent) => {
        const pos = toShaderSpace(e.clientX, e.clientY);
        pointer.x = pos.x;
        pointer.y = pos.y;
        pointer.amp = Math.min(0.55, pointer.amp + 0.22);
        spawnRing(pos.x, pos.y);
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
        const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
      };

      resize();
      {
        const rect = canvas.getBoundingClientRect();
        const mid = toShaderSpace(
          rect.left + rect.width * 0.5,
          rect.top + rect.height * 0.45,
        );
        pointer.x = pointer.sx = mid.x;
        pointer.y = pointer.sy = mid.y;
      }

      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
      setMode("gpu");

      const tick = (now: number) => {
        if (disposed) return;
        const sec = (now - t0) * 0.001;
        pointer.sx += (pointer.x - pointer.sx) * 0.06;
        pointer.sy += (pointer.y - pointer.sy) * 0.06;
        pointer.amp *= 0.978;

        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uT, sec);
        gl.uniform2f(uMouse, pointer.sx, pointer.sy);
        gl.uniform1f(uAmp, pointer.amp);
        const [r0, r1, r2] = pointer.rings;
        gl.uniform3f(uRing0, r0!.x, r0!.y, r0!.t);
        gl.uniform3f(uRing1, r1!.x, r1!.y, r1!.t);
        gl.uniform3f(uRing2, r2!.x, r2!.y, r2!.t);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerdown", onPointerDown);
        if (buf) gl.deleteBuffer(buf);
        if (prog) gl.deleteProgram(prog);
      };
    } catch (err) {
      console.error("[LiquidAurora]", err);
      setMode("fallback");
    }
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 h-full w-full",
          mode !== "gpu" && "opacity-0",
        )}
      />
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          mode === "gpu" ? "opacity-0" : "opacity-100",
          "bg-[radial-gradient(ellipse_at_25%_0%,rgba(196,92,38,0.45),transparent_42%),radial-gradient(ellipse_at_70%_40%,rgba(232,176,74,0.22),transparent_40%),radial-gradient(ellipse_at_40%_90%,rgba(46,107,122,0.18),transparent_45%),linear-gradient(180deg,#0a0a0b_0%,#121014_100%)]",
        )}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,11,0.28)_0%,rgba(10,10,11,0.48)_48%,rgba(10,10,11,0.78)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,rgba(10,10,11,0.42)_0%,rgba(10,10,11,0.18)_42%,rgba(10,10,11,0.32)_78%)]" />
    </div>
  );
}
