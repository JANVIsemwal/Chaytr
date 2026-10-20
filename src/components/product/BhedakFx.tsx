/**
 * Bhedak visuals, drawn live on canvas: the radar scope (hero), the line-of-sight problem and the
 * dual-signature signal lanes. Illustrations of the concept, not recorded sensor data.
 */
import { View } from 'react-native';

import { CanvasLayer, type CanvasDraw } from '@/components/fx';
import { Brackets, C } from '@/components/fusion/kit';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const FONT = (size: number, bold = false) => `${bold ? 600 : 400} ${size}px ${bold ? 'JetBrainsMono_600SemiBold' : 'JetBrainsMono_400Regular'}, monospace`;
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

// ---------------------------------------------------------------------------
// 1. Radar scope: 60° fan, range rings, 30–50 m gate, sweep, detect, confirm, haptic.
// ---------------------------------------------------------------------------

const radarScope = (w: number, h: number): CanvasDraw => {
  const ox = w / 2;
  const oy = h * 0.9;
  const R = Math.min(h * 0.8, w * 0.8);
  const HALF = Math.PI / 6; // 30° either side
  const mToR = (m: number) => (m / 50) * R;
  const clutter = Array.from({ length: 140 }, () => ({ a: (Math.random() * 2 - 1) * HALF, m: 3 + Math.random() * 47, s: 0.6 + Math.random() * 1.6 }));
  const CYCLE = 11;
  let target = { a: 0.2, m: 38 };
  let lastCycle = -1;

  const pt = (a: number, r: number) => [ox + Math.sin(a) * r, oy - Math.cos(a) * r] as const;

  return (ctx, w, h, t) => {
    const cyc = Math.floor(t / CYCLE);
    const ct = t % CYCLE;
    if (cyc !== lastCycle) {
      lastCycle = cyc;
      target = { a: (Math.random() * 2 - 1) * HALF * 0.75, m: 33 + Math.random() * 14 };
    }
    const beam = Math.sin(ct * 1.25) * HALF; // the user's slow sweep
    const locked = ct > 6.2;

    // fan background
    ctx.fillStyle = 'rgba(34,211,238,0.035)';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.arc(ox, oy, R, -Math.PI / 2 - HALF, -Math.PI / 2 + HALF);
    ctx.closePath();
    ctx.fill();

    // 30–50 m gate
    ctx.fillStyle = 'rgba(255,153,51,0.07)';
    ctx.beginPath();
    ctx.arc(ox, oy, mToR(50), -Math.PI / 2 - HALF, -Math.PI / 2 + HALF);
    ctx.arc(ox, oy, mToR(30), -Math.PI / 2 + HALF, -Math.PI / 2 - HALF, true);
    ctx.closePath();
    ctx.fill();

    // rings + labels
    ctx.font = FONT(10);
    ctx.textAlign = 'left';
    for (let m = 10; m <= 50; m += 10) {
      ctx.strokeStyle = m === 30 || m === 50 ? 'rgba(255,153,51,0.35)' : 'rgba(34,211,238,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ox, oy, mToR(m), -Math.PI / 2 - HALF, -Math.PI / 2 + HALF);
      ctx.stroke();
      const [lx, ly] = pt(HALF, mToR(m));
      ctx.fillStyle = 'rgba(147,160,190,0.75)';
      ctx.fillText(`${m} m`, lx + 6, ly + 3);
    }
    // fan edges
    ctx.strokeStyle = 'rgba(34,211,238,0.25)';
    for (const s of [-1, 1]) {
      const [ex, ey] = pt(s * HALF, R);
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // foliage clutter (filtered out: dim, never alerts)
    for (const c of clutter) {
      const d = Math.abs(c.a - beam);
      const lit = Math.max(0, 1 - d / 0.22);
      const [x, y] = pt(c.a, mToR(c.m));
      ctx.fillStyle = `rgba(52,211,153,${0.2 + lit * 0.5})`;
      ctx.fillRect(x - c.s / 2, y - c.s / 2, c.s, c.s);
    }

    // beam with trail
    for (let k = 0; k < 14; k++) {
      const a = beam - Math.cos(ct * 1.25) * k * 0.012;
      ctx.strokeStyle = `rgba(34,211,238,${(0.5 * (14 - k)) / 14})`;
      ctx.lineWidth = k === 0 ? 2 : 6;
      const [bx, by] = pt(a, R);
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    // target
    const [tx, ty] = pt(target.a, mToR(target.m));
    const hit = Math.abs(target.a - beam) < 0.06;
    const metal = ct > 1.6;
    const breath = ct > 3.9;
    if (metal || hit) {
      // metal glint
      const g = hit ? 1 : 0.55;
      ctx.fillStyle = rgba(C.cyan, g);
      ctx.beginPath();
      ctx.moveTo(tx, ty - 7);
      ctx.lineTo(tx + 5, ty);
      ctx.lineTo(tx, ty + 7);
      ctx.lineTo(tx - 5, ty);
      ctx.closePath();
      ctx.fill();
    }
    if (breath) {
      // breathing: slow pulsing rings (~0.3 Hz)
      for (let k = 0; k < 2; k++) {
        const p = ((t * 0.45 + k * 0.5) % 1);
        ctx.strokeStyle = rgba(C.saffron, (1 - p) * 0.8);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(tx, ty, 6 + p * 22, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (locked) {
      const s = 26;
      const blink = Math.sin(t * 8) > -0.3;
      ctx.strokeStyle = rgba(C.saffron, blink ? 1 : 0.5);
      ctx.lineWidth = 2;
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
        ctx.beginPath();
        ctx.moveTo(tx + sx * s, ty + sy * (s - 9));
        ctx.lineTo(tx + sx * s, ty + sy * s);
        ctx.lineTo(tx + sx * (s - 9), ty + sy * s);
        ctx.stroke();
      }
      ctx.font = FONT(11, true);
      ctx.fillStyle = C.saffron;
      ctx.textAlign = tx > w * 0.6 ? 'right' : 'left';
      const lx = tx > w * 0.6 ? tx - s - 8 : tx + s + 8;
      ctx.fillText('THREAT CONFIRMED', lx, ty - 6);
      ctx.font = FONT(10);
      ctx.fillStyle = C.text;
      ctx.fillText(`${target.m.toFixed(0)} m · ${(target.a * (180 / Math.PI)).toFixed(0)}°`, lx, ty + 9);

      // haptic waves from the device
      for (let k = 0; k < 3; k++) {
        const p = ((t * 1.6 + k / 3) % 1);
        ctx.strokeStyle = rgba(C.saffron, (1 - p) * 0.7);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ox, oy, 10 + p * 34, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }
    }

    // device
    ctx.fillStyle = C.panel;
    ctx.strokeStyle = locked ? C.saffron : C.cyan;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect?.(ox - 16, oy - 6, 32, 18, 5);
    ctx.fill();
    ctx.stroke();

    // HUD readouts
    ctx.textAlign = 'left';
    ctx.font = FONT(10, true);
    ctx.fillStyle = C.cyan;
    ctx.fillText('SENTINEL PATHFINDER', 16, 24);
    ctx.font = FONT(10);
    ctx.fillStyle = C.muted;
    ctx.fillText('FOV 60° · GATE 30–50 m · MODE SILENT', 16, 40);
    const status = locked ? 'ALERT · HAPTIC' : breath ? 'METAL ✓  BREATHING ✓' : metal ? 'METAL ✓  BREATHING …' : 'SCANNING …';
    ctx.textAlign = 'right';
    ctx.font = FONT(10, true);
    ctx.fillStyle = locked ? C.saffron : C.text;
    ctx.fillText(status, w - 16, 24);
  };
};

export function RadarScope() {
  const { isMobile } = useBreakpoint();
  return (
    <View style={{ width: '100%', maxWidth: 580, height: isMobile ? 380 : 470, borderRadius: 22, borderWidth: 1, borderColor: C.line, backgroundColor: 'rgba(13,16,32,0.85)', overflow: 'hidden' }} accessibilityLabel="Animated radar scan finding a hidden armed person at 38 metres">
      <CanvasLayer setup={radarScope} />
      <Brackets />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 2. Line of sight: eyes stop at the first trees, radar pulses go through.
// ---------------------------------------------------------------------------

const lineOfSight = (w: number, h: number): CanvasDraw => {
  const ground = h * 0.78;
  const x0 = w * 0.07;
  const xm = (m: number) => x0 + (m / 50) * (w * 0.86);
  const trees = Array.from({ length: 13 }, (_, i) => {
    const r = 14 + Math.random() * 12;
    return {
      m: 5 + i * 3.5 + Math.random() * 1.8,
      hgt: 0.4 + Math.random() * 0.28,
      blobs: Array.from({ length: 4 + Math.floor(Math.random() * 3) }, () => ({ dx: (Math.random() - 0.5) * r * 1.6, dy: (Math.random() - 0.3) * r * 1.4, rx: r * (0.55 + Math.random() * 0.5), ry: r * (0.45 + Math.random() * 0.4) })),
    };
  });
  const farTrees = Array.from({ length: 18 }, () => ({ m: 4 + Math.random() * 46, hgt: 0.5 + Math.random() * 0.3, r: 10 + Math.random() * 10 }));
  const ferns = Array.from({ length: 22 }, (_, i) => ({ m: 4 + i * 2.2 + Math.random(), rx: 12 + Math.random() * 14, ry: 10 + Math.random() * 16 }));
  const targetM = 38;
  trees.push({ m: targetM - 1.2, hgt: 0.3, blobs: [{ dx: 0, dy: 10, rx: 22, ry: 18 }, { dx: 12, dy: 24, rx: 18, ry: 16 }] });

  return (ctx, w, h, t) => {
    // distance axis + gate
    ctx.fillStyle = 'rgba(255,153,51,0.06)';
    ctx.fillRect(xm(30), h * 0.08, xm(50) - xm(30), ground - h * 0.08);
    ctx.font = FONT(10);
    ctx.textAlign = 'center';
    for (let m = 0; m <= 50; m += 10) {
      ctx.fillStyle = m >= 30 ? 'rgba(255,153,51,0.8)' : 'rgba(147,160,190,0.7)';
      ctx.fillText(`${m} m`, xm(m), ground + 22);
      ctx.fillRect(xm(m) - 0.5, ground, 1, 6);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.moveTo(0, ground);
    ctx.lineTo(w, ground);
    ctx.stroke();

    const period = 2.6;
    const phase = (t / period) % 1;
    const tx = xm(targetM);

    // far trees: dim silhouettes for depth
    for (const tr of farTrees) {
      const x = xm(tr.m);
      const top = ground - h * tr.hgt;
      ctx.fillStyle = 'rgba(22,34,52,0.9)';
      ctx.fillRect(x - 2, top, 4, ground - top);
      ctx.beginPath();
      ctx.ellipse(x, top, tr.r * 0.8, tr.r * 1.25, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // hidden figure at 38 m (drawn behind the near foliage)
    const lit = phase > 0.55 && phase < 0.82;
    ctx.fillStyle = lit ? rgba(C.saffron, 0.95) : 'rgba(139,92,246,0.55)';
    ctx.beginPath();
    ctx.arc(tx, ground - h * 0.36, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(tx - 6, ground - h * 0.33, 12, h * 0.2);
    ctx.fillRect(tx - 5, ground - h * 0.13, 4, h * 0.13);
    ctx.fillRect(tx + 1, ground - h * 0.13, 4, h * 0.13);
    ctx.strokeStyle = lit ? C.saffron : 'rgba(139,92,246,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx - 10, ground - h * 0.27);
    ctx.lineTo(tx + 16, ground - h * 0.3);
    ctx.stroke();

    // near trees: trunk + layered, swaying canopy
    for (const tr of trees) {
      const x = xm(tr.m);
      const top = ground - h * tr.hgt;
      ctx.fillStyle = 'rgba(31,43,58,1)';
      ctx.fillRect(x - 3, top, 6, ground - top);
      for (const [k, b] of tr.blobs.entries()) {
        const sway = Math.sin(t * 0.7 + tr.m * 0.3 + k) * 2;
        ctx.fillStyle = k % 2 ? 'rgba(24,62,66,0.86)' : 'rgba(30,78,74,0.82)';
        ctx.beginPath();
        ctx.ellipse(x + b.dx + sway, top + b.dy, b.rx, b.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // radar pulses: out to the target and back, passing through the foliage
    for (let k = 0; k < 2; k++) {
      const p = (phase + k * 0.5) % 1;
      const out = p < 0.6;
      const q = out ? p / 0.6 : (p - 0.6) / 0.4;
      const x = out ? x0 + (tx - x0) * q : tx - (tx - x0) * q;
      for (let r = 0; r < 3; r++) {
        ctx.strokeStyle = out ? `rgba(34,211,238,${(0.85 - q * 0.3) * (1 - r * 0.3)})` : `rgba(255,153,51,${(0.85 - q * 0.3) * (1 - r * 0.3)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const ax = out ? x - r * 8 : x + r * 8;
        ctx.arc(ax, ground - h * 0.3, 22 + r * 4, out ? -0.7 : Math.PI - 0.7, out ? 0.7 : Math.PI + 0.7);
        ctx.stroke();
      }
    }

    // undergrowth in front of everything
    for (const f of ferns) {
      ctx.fillStyle = 'rgba(26,70,66,0.92)';
      ctx.beginPath();
      ctx.ellipse(xm(f.m), ground - 2, f.rx, f.ry, 0, Math.PI, 0);
      ctx.fill();
    }

    if (lit) {
      ctx.font = FONT(10, true);
      ctx.fillStyle = C.saffron;
      ctx.textAlign = 'center';
      ctx.fillText('HIDDEN · 38 m', tx, ground - h * 0.36 - 22);
    }

    // soldier + eye line that stops at the first trees
    const sy = ground - h * 0.3;
    ctx.fillStyle = C.cyan;
    ctx.beginPath();
    ctx.arc(x0, sy - 10, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x0 - 6, sy - 2, 12, h * 0.2);
    ctx.fillRect(x0 - 5, ground - h * 0.1, 4, h * 0.1);
    ctx.fillRect(x0 + 1, ground - h * 0.1, 4, h * 0.1);
    const eyeEnd = xm(5);
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = 'rgba(238,244,255,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0 + 8, sy - 10);
    ctx.lineTo(eyeEnd, sy - 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = C.red;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeEnd - 5, sy - 15);
    ctx.lineTo(eyeEnd + 5, sy - 5);
    ctx.moveTo(eyeEnd + 5, sy - 15);
    ctx.lineTo(eyeEnd - 5, sy - 5);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = FONT(10, true);
    ctx.fillStyle = C.text;
    ctx.fillText('EYES: < 5 m', 14, h * 0.1);
    ctx.fillStyle = C.cyan;
    ctx.fillText('RADAR: 30–50 m, through foliage', 14, h * 0.1 + 16);
  };
};

export function LineOfSight() {
  const { isMobile } = useBreakpoint();
  return (
    <View style={{ width: '100%', height: isMobile ? 260 : 330, borderRadius: 18, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, overflow: 'hidden' }} accessibilityLabel="Animation: a soldier's eyesight is blocked by trees after five metres, while radar pulses pass through to a hidden person at 38 metres">
      <CanvasLayer setup={lineOfSight} />
      <Brackets />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 3. Signal lanes: metal + breathing → alert only when both appear together.
// ---------------------------------------------------------------------------

const EVENTS = [
  { at: 1.6, len: 1.6, metal: true, breath: false, label: 'tin can → ignored' },
  { at: 4.6, len: 1.8, metal: false, breath: true, label: 'animal → ignored' },
  { at: 7.8, len: 2.2, metal: true, breath: true, label: 'armed person → ALERT' },
];
const LOOP = 10.5;

const signalLanes = (w: number, h: number): CanvasDraw => {
  const speed = w / 6.5; // px per second of history
  const lanes = [
    { y: h * 0.2, label: 'METAL GLINT', color: C.cyan },
    { y: h * 0.48, label: 'BREATHING', color: C.violet },
    { y: h * 0.78, label: 'ALERT', color: C.saffron },
  ];
  const noise = Array.from({ length: 512 }, () => Math.random() * 2 - 1);
  const evAt = (ts: number) => {
    const m = ((ts % LOOP) + LOOP) % LOOP;
    return EVENTS.find((e) => m >= e.at && m < e.at + e.len);
  };

  return (ctx, w, h, t) => {
    const amp = h * 0.09;
    // lanes
    for (const [li, lane] of lanes.entries()) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, lane.y);
      ctx.lineTo(w, lane.y);
      ctx.stroke();

      ctx.strokeStyle = lane.color;
      ctx.lineWidth = li === 2 ? 2.5 : 1.6;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const ts = t - (w - x) / speed;
        const e = evAt(ts);
        const n = noise[Math.abs(Math.floor(ts * 40)) % noise.length] * amp * 0.12;
        let y = lane.y + n;
        if (li === 0 && e?.metal) y = lane.y - Math.abs(Math.sin(ts * 23)) * amp * (0.6 + 0.4 * Math.abs(noise[Math.abs(Math.floor(ts * 9)) % 512])) + n;
        if (li === 1 && e?.breath) y = lane.y - Math.sin(ts * Math.PI * 1.6) * amp * 0.75 + n;
        if (li === 2) y = lane.y - (e?.metal && e?.breath ? amp * 0.9 : 0);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.font = FONT(10, true);
      ctx.textAlign = 'left';
      ctx.fillStyle = lane.color;
      ctx.fillText(lane.label, 12, lane.y - amp - 6);
    }

    // event labels, following their part of the trace
    ctx.font = FONT(11, true);
    ctx.textAlign = 'center';
    for (const e of EVENTS) {
      const k = Math.floor((t - e.at - e.len / 2) / LOOP);
      for (const kk of [k, k + 1]) {
        const tc = kk * LOOP + e.at + e.len / 2;
        const x = w - (t - tc) * speed;
        if (x < -80 || x > w + 80) continue;
        const alert = e.metal && e.breath;
        ctx.fillStyle = alert ? C.saffron : C.muted;
        ctx.fillText(e.label, x, h * 0.97);
      }
    }

    // "now" cursor
    ctx.strokeStyle = 'rgba(34,211,238,0.5)';
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(w - 2, 6);
    ctx.lineTo(w - 2, h - 6);
    ctx.stroke();
    ctx.setLineDash([]);
  };
};

export function SignalLanes() {
  const { isMobile } = useBreakpoint();
  return (
    <View style={{ width: '100%', height: isMobile ? 260 : 300, borderRadius: 18, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, overflow: 'hidden' }} accessibilityLabel="Animation: metal alone and breathing alone are ignored; only both together trigger an alert">
      <CanvasLayer setup={signalLanes} />
      <Brackets />
    </View>
  );
}
