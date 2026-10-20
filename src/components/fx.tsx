/**
 * Animation and effects toolkit used across the site (and the concept previews):
 * a canvas layer for live backgrounds, text effects, and the signature gradient.
 */
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { GRADIENT } from '@/theme';

/** CSS-only style passthrough for web (filters, transitions, gradients). Ignored on native. */
export const web = (style: Record<string, string | number>) => (Platform.OS === 'web' ? (style as object) : {});

// ---------------------------------------------------------------------------
// Canvas layer (web only) for high-performance animations
// ---------------------------------------------------------------------------

export type CanvasDraw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, mouse: { x: number; y: number; active: boolean }) => void;

/**
 * Fills its parent with a <canvas> driven by requestAnimationFrame. `setup` runs on resize and
 * returns the per-frame draw function. Renders nothing on native.
 */
export function CanvasLayer({ setup }: { setup: (w: number, h: number) => CanvasDraw }) {
  const host = useRef<View>(null);
  const setupRef = useRef(setup);

  useEffect(() => {
    if (Platform.OS !== 'web' || !host.current) return;
    const el = host.current as unknown as HTMLElement;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;
    const mouse = { x: -9999, y: -9999, active: false };
    let draw: CanvasDraw = () => {};
    let raf = 0;
    let w = 0;
    let h = 0;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw = setupRef.current(w, h);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= r.width && mouse.y <= r.height;
    };
    const start = performance.now();
    const loop = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, (now - start) / 1000, mouse);
      if (!reduce) raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      canvas.remove();
    };
  }, []);

  return <View ref={host} pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />;
}

// ---------------------------------------------------------------------------
// Text effects
// ---------------------------------------------------------------------------

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFXYZ';

/** Text that "decodes" from random glyphs into the target, re-running whenever `text` changes. */
export function useScramble(text: string, speed = 28) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    let frame = 0;
    const total = text.length + 12;
    const id = setInterval(() => {
      frame++;
      setOut(
        text
          .split('')
          .map((ch, i) => (ch === ' ' || i < frame - 10 ? ch : i < frame ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : ''))
          .join(''),
      );
      if (frame >= total) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

/** Cycles through `items` every `ms`. */
export function useCycle<T>(items: T[], ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % items.length), ms);
    return () => clearInterval(id);
  }, [items.length, ms]);
  return items[i];
}

/** Typewriter over a list of lines; returns the lines typed so far (last one partial). */
export function useTypewriter(lines: string[], cps = 38, pause = 900) {
  const [state, setState] = useState({ line: 0, char: 0 });
  useEffect(() => {
    const { line, char } = state;
    const current = lines[line % lines.length];
    const done = char >= current.length;
    const delay = done ? pause : 1000 / cps;
    const id = setTimeout(() => {
      if (!done) setState({ line, char: char + 1 });
      else setState({ line: line + 1, char: 0 });
    }, delay);
    return () => clearTimeout(id);
  }, [state, lines, cps, pause]);
  const visible = 6;
  const start = Math.max(0, state.line - visible + 1);
  const shown: string[] = [];
  for (let l = start; l <= state.line; l++) {
    const text = lines[l % lines.length];
    shown.push(l === state.line ? text.slice(0, state.char) : text);
  }
  return shown;
}

// ---------------------------------------------------------------------------
// Signature gradient + the live network background
// ---------------------------------------------------------------------------

/** Fills its parent with the cyan → violet → saffron gradient (put it first inside a View with overflow hidden). */
export function GradientFill({ id, opacity = 1, children }: { id: string; opacity?: number; children?: ReactNode }) {
  return (
    <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={GRADIENT[0]} stopOpacity={opacity} />
          <Stop offset="0.5" stopColor={GRADIENT[1]} stopOpacity={opacity} />
          <Stop offset="1" stopColor={GRADIENT[2]} stopOpacity={opacity} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
      {children}
    </Svg>
  );
}

/**
 * Drifting network: cyan links, saffron nodes, nodes lean towards the mouse.
 * `density` scales the node count; keep it low for sections that sit behind text.
 */
export const networkScene =
  (density = 1) =>
  (w: number, h: number): CanvasDraw => {
    const count = Math.max(16, Math.min(90, Math.floor(((w * h) / 18000) * density)));
    const pts = Array.from({ length: count }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28 }));
    const pulses: { a: number; b: number; p: number }[] = [];
    return (ctx, w, h, _t, mouse) => {
      for (const p of pts) {
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < 180 && d > 1) {
            p.vx += (dx / d) * 0.008;
            p.vy += (dy / d) * 0.008;
          }
        }
        p.vx *= 0.995;
        p.vy *= 0.995;
        if (Math.hypot(p.vx, p.vy) < 0.08) {
          p.vx += (Math.random() - 0.5) * 0.03;
          p.vy += (Math.random() - 0.5) * 0.03;
        }
        p.x = (p.x + p.vx + w + 40) % (w + 40);
        p.y = (p.y + p.vy + h + 40) % (h + 40);
      }
      const links: [number, number][] = [];
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 150) {
            links.push([i, j]);
            ctx.strokeStyle = `rgba(34,211,238,${(1 - d / 150) * 0.2})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      if (mouse.active)
        for (const p of pts) {
          const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (d < 170) {
            ctx.strokeStyle = `rgba(139,92,246,${(1 - d / 170) * 0.5})`;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      if (links.length && pulses.length < 6 && Math.random() < 0.08) {
        const [a, b] = links[Math.floor(Math.random() * links.length)];
        pulses.push({ a, b, p: 0 });
      }
      for (let k = pulses.length - 1; k >= 0; k--) {
        const q = pulses[k];
        q.p += 0.03;
        if (q.p >= 1) {
          pulses.splice(k, 1);
          continue;
        }
        const x = pts[q.a].x + (pts[q.b].x - pts[q.a].x) * q.p;
        const y = pts[q.a].y + (pts[q.b].y - pts[q.a].y) * q.p;
        ctx.fillStyle = '#FFC07A';
        ctx.shadowColor = '#FF9933';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = 'rgba(207,250,254,0.55)';
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    };
  };
