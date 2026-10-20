/**
 * Home page sections in the "Fusion" style: the 3D capability-map hero, live console,
 * module cards, pipeline, deployments and the closing call to action.
 */
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, Text, View, useWindowDimensions } from 'react-native';

import { CanvasLayer, useCycle, useScramble, useTypewriter, web, type CanvasDraw } from '@/components/fx';
import { Brackets, C, CTAButton, Counter, Dawn, FeedPhoto, Mono, MONO_B, quietNetwork, SectionTitle, useWrap } from '@/components/fusion/kit';
import { LogoArt } from '@/components/Logo';
import { ProductLogo } from '@/components/product/ProductLogo';
import { useLoop } from '@/components/Reveal';
import { about, domains, flagships, home } from '@/config/site';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { fonts, NAV_HEIGHT } from '@/theme';

const LOCAL = {
  'ai-ml': require('../../../assets/photos/ai-ml.jpg'),
  embedded: require('../../../assets/photos/embedded.jpg'),
  robotics: require('../../../assets/photos/robotics.jpg'),
  fintech: require('../../../assets/photos/fintech.jpg'),
} as const;

// ---------------------------------------------------------------------------
// Hero scene: live network (Deep Tech) + the Chaytr capability map as a 3D
// turntable lying on a glowing grid "table" (Chaitra's 3D floor).
// ---------------------------------------------------------------------------

const AREA_CAPTIONS: Record<string, string> = {
  'ai-ml': 'Learning · Perception',
  embedded: 'Firmware · Hardware',
  robotics: 'Sensing · Motion',
  fintech: 'Payments · Wallets',
};

/** Area cards sit on this ring; product chips (Bhedak, NexPay) on the outer one. */
const CARD_R = 1.0;
const CHIP_R = 1.42;
const PITCH = 1.0;
/** Perspective strength. Kept gentle so the front and back of the table look balanced. */
const PERSP = 0.15;

/**
 * Largest table scale at which every card and chip stays inside the box at every angle of the
 * turntable. Everything lies on a ring, so sampling angles around the ring covers all rotations.
 * Pads are the label sizes in pixels (before perspective/ui scaling).
 */
const fitScale = (cx: number, cy: number, box: { left: number; right: number; top: number; bottom: number }, ui: number, compact: boolean) => {
  const sinP = Math.sin(PITCH);
  const cosP = Math.cos(PITCH);
  const rings = [
    compact ? { r: CARD_R, y: 0.22, padX: 56, padTop: 42, padBottom: 4 } : { r: CARD_R, y: 0.22, padX: 92, padTop: 64, padBottom: 4 },
    { r: CHIP_R, y: 0.12, padX: 52, padTop: 18, padBottom: 18 },
  ];
  let S = Infinity;
  for (const ring of rings)
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const x = Math.cos(a) * ring.r;
      const z = Math.sin(a) * ring.r;
      const k = 1 / (1 - (z * cosP + ring.y * sinP) * PERSP);
      const ax = x * k;
      const ay = (z * sinP - ring.y * cosP) * k;
      // labels are drawn at one fixed size (ui), wherever they are on the table
      const kk = ui;
      if (ax > 0) S = Math.min(S, (box.right - ring.padX * kk - cx) / ax);
      if (ax < 0) S = Math.min(S, (cx - box.left - ring.padX * kk) / -ax);
      if (ay > 0) S = Math.min(S, (box.bottom - ring.padBottom * kk - cy) / ay);
      if (ay < 0) S = Math.min(S, (cy - box.top - ring.padTop * kk) / -ay);
    }
  return S;
};

/**
 * Shared geometry so the page can place the real logo exactly over the scene's hub.
 * `visible` is how much of the box is on screen (the hero can be taller than a laptop window);
 * the map is fitted into that part so nothing turns out of view below the fold.
 */
const sceneGeometry = (w: number, boxH: number, wide: boolean, visible = boxH) => {
  const h = Math.max(320, Math.min(boxH, visible));
  /** Phones get compact, title-only cards; tablets and up get the full cards. */
  const compact = !wide && w < 640;
  /** Label size: the same for every card and chip, front or back. */
  const ui = wide ? 1.12 : compact ? 0.8 : 1.05;
  const m = 14;
  // On wide screens the map lives to the right of the headline column (max 600 px wide).
  const gutter = w < 640 ? 20 : w < 1024 ? 32 : 48;
  const textRight = Math.max(0, (w - (1200 + gutter * 2)) / 2) + gutter + 600;
  const box = { left: wide ? textRight + m : m, right: w - m, top: m, bottom: h - m };
  const cx = (box.left + box.right) / 2;
  // Pick the height that lets the table be largest, then cap it so it never gets oversized.
  let best = { cy: h * 0.55, S: 0 };
  for (let f = 0.4; f <= 0.66; f += 0.02) {
    const S = fitScale(cx, h * f, box, ui, compact);
    if (S > best.S) best = { cy: h * f, S };
  }
  const cy = best.cy;
  const S = Math.max(40, Math.min(best.S, wide ? w * 0.16 : w * 0.25, h * 0.3));
  const P = PITCH;
  const HUB_Y = 0.5;
  const k = 1 / (1 - HUB_Y * Math.sin(P) * PERSP);
  const hubK = compact ? 0.56 : wide ? ui : ui * 0.85;
  return { cx, cy, S, P, HUB_Y, ui, compact, hub: { x: cx, y: cy - HUB_Y * Math.cos(P) * S * k, k: hubK } };
};

const scene =
  (wide: boolean, visible?: number) =>
  (w: number, h: number): CanvasDraw => {
    const { cx, cy, S, P, HUB_Y, ui, hub, compact } = sceneGeometry(w, h, wide, visible); // P = camera pitch
    const sinP = Math.sin(P);
    const cosP = Math.cos(P);

    let yaw = 0;
    let yawNudge = 0;
    const project = (x: number, y: number, z: number) => {
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      const xr = x * c - z * s;
      const zr = x * s + z * c;
      const depth = zr * cosP + y * sinP; // positive = towards the viewer
      const k = 1 / (1 - depth * PERSP);
      return { x: cx + xr * S * k, y: cy + (zr * sinP - y * cosP) * S * k, depth, k };
    };

    // capability map layout on the table
    const areaAngle = (i: number) => (i * Math.PI) / 2 + Math.PI / 4;
    const areas = domains.map((d, i) => ({ label: d.tab, caption: AREA_CAPTIONS[d.key], a: areaAngle(i), r: CARD_R, y: 0.22 }));
    const ai = areas[0];
    const emb = areas[1];
    const fin = areas[3];
    // Product chips sit halfway between two area cards, out near the table edge, so the
    // cards never crowd them as the table turns (Bhedak: AI/Embedded, NexPay: Fintech/AI).
    const products = [
      { label: 'Bhedak', a: (ai.a + emb.a) / 2, r: CHIP_R, y: 0.12, from: [0, 1] },
      { label: 'NexPay', a: fin.a + Math.PI / 4, r: CHIP_R, y: 0.12, from: [3] },
    ];
    const pos = (a: number, r: number) => [Math.cos(a) * r, Math.sin(a) * r] as const;

    type Link = { from: [number, number, number]; to: [number, number, number]; warm: boolean };
    const links: Link[] = [];
    areas.forEach((ar) => {
      const [x, z] = pos(ar.a, ar.r);
      links.push({ from: [0, HUB_Y, 0], to: [x, ar.y, z], warm: false });
    });
    products.forEach((p) =>
      p.from.forEach((i) => {
        const [x1, z1] = pos(areas[i].a, areas[i].r);
        const [x2, z2] = pos(p.a, p.r);
        links.push({ from: [x1, areas[i].y, z1], to: [x2, p.y, z2], warm: true });
      }),
    );
    const pulses = links.map((_, i) => ({ i, p: Math.random() }));
    const arcPoint = (l: Link, s: number) => {
      const x = l.from[0] + (l.to[0] - l.from[0]) * s;
      const z = l.from[2] + (l.to[2] - l.from[2]) * s;
      const y = l.from[1] + (l.to[1] - l.from[1]) * s + Math.sin(Math.PI * s) * 0.18;
      return project(x, y, z);
    };

    // background network
    const M = Math.max(30, Math.min(80, Math.floor((w * h) / 16000)));
    const nodes = Array.from({ length: M }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 }));

    const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, rw: number, rh: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + rw, y, x + rw, y + rh, r);
      ctx.arcTo(x + rw, y + rh, x, y + rh, r);
      ctx.arcTo(x, y + rh, x, y, r);
      ctx.arcTo(x, y, x + rw, y, r);
      ctx.closePath();
    };

    return (ctx, w, h, t, mouse) => {
      // ---- background network (cyan, Deep Tech)
      for (const n of nodes) {
        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d = Math.hypot(dx, dy);
          if (d < 200 && d > 1) {
            n.vx += (dx / d) * 0.01;
            n.vy += (dy / d) * 0.01;
          }
        }
        n.vx *= 0.994;
        n.vy *= 0.994;
        if (Math.hypot(n.vx, n.vy) < 0.1) {
          n.vx += (Math.random() - 0.5) * 0.04;
          n.vy += (Math.random() - 0.5) * 0.04;
        }
        n.x = (n.x + n.vx + w + 40) % (w + 40);
        n.y = (n.y + n.vy + h + 40) % (h + 40);
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < M; i++)
        for (let j = i + 1; j < M; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < 140) {
            ctx.strokeStyle = `rgba(34,211,238,${(1 - d / 140) * 0.22})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      if (mouse.active)
        for (const n of nodes) {
          const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (d < 180) {
            ctx.strokeStyle = `rgba(139,92,246,${(1 - d / 180) * 0.55})`;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
      ctx.fillStyle = 'rgba(207,250,254,0.5)';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- turntable rotation (mouse nudges it)
      const target = mouse.active ? ((mouse.x - cx) / w) * 0.9 : 0;
      yawNudge += (target - yawNudge) * 0.04;
      yaw = t * 0.1 + yawNudge;

      // ---- the table: glow, grid, rings
      const hub0 = project(0, 0, 0);
      const glow = ctx.createRadialGradient(hub0.x, hub0.y, 0, hub0.x, hub0.y, S * 2.1);
      glow.addColorStop(0, 'rgba(255,153,51,0.28)');
      glow.addColorStop(0.35, 'rgba(139,92,246,0.16)');
      glow.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const TABLE = 1.7;
      const seg = (pts: { x: number; y: number }[]) => {
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
      };
      for (let g = -TABLE; g <= TABLE + 0.001; g += 0.25) {
        const half = Math.sqrt(Math.max(0, TABLE * TABLE - g * g));
        const a1: { x: number; y: number }[] = [];
        const a2: { x: number; y: number }[] = [];
        for (let s = 0; s <= 12; s++) {
          const u = -half + (2 * half * s) / 12;
          a1.push(project(g, 0, u));
          a2.push(project(u, 0, g));
        }
        ctx.strokeStyle = 'rgba(34,211,238,0.13)';
        seg(a1);
        seg(a2);
      }
      [0.5, 1.0, CHIP_R, TABLE].forEach((r, idx) => {
        const pts = Array.from({ length: 73 }, (_, s) => project(Math.cos((s / 72) * Math.PI * 2) * r, 0, Math.sin((s / 72) * Math.PI * 2) * r));
        ctx.strokeStyle = idx === 3 ? 'rgba(34,211,238,0.55)' : idx === 1 ? 'rgba(139,92,246,0.5)' : 'rgba(255,153,51,0.28)';
        ctx.lineWidth = idx === 3 ? 1.6 : 1;
        seg(pts);
      });
      // expanding signal ring on the table (Chaitra's sunrise rings)
      const ph = (t * 0.35) % 1;
      const rr = 0.3 + ph * 1.65;
      ctx.strokeStyle = `rgba(255,153,51,${(1 - ph) * 0.6})`;
      ctx.lineWidth = 1.4;
      seg(Array.from({ length: 73 }, (_, s) => project(Math.cos((s / 72) * Math.PI * 2) * rr, 0, Math.sin((s / 72) * Math.PI * 2) * rr)));
      ctx.lineWidth = 1;

      // ---- links (arcs) + pulses
      links.forEach((l) => {
        const pts = Array.from({ length: 21 }, (_, s) => arcPoint(l, s / 20));
        ctx.strokeStyle = l.warm ? 'rgba(255,153,51,0.55)' : 'rgba(34,211,238,0.55)';
        ctx.setLineDash(l.warm ? [4, 5] : []);
        seg(pts);
      });
      ctx.setLineDash([]);
      for (const p of pulses) {
        p.p += 0.009;
        if (p.p > 1) p.p = 0;
        const pt = arcPoint(links[p.i], p.p);
        ctx.fillStyle = links[p.i].warm ? '#FFC07A' : '#A5F3FC';
        ctx.shadowColor = links[p.i].warm ? '#FF9933' : '#22D3EE';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.6 * pt.k, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ---- billboards, drawn back-to-front
      type Item = { depth: number; draw: () => void };
      const items: Item[] = [];

      areas.forEach((ar, i) => {
        const [x, z] = pos(ar.a, ar.r);
        const top = project(x, ar.y, z);
        const base = project(x, 0, z);
        items.push({
          depth: top.depth,
          draw: () => {
            const k = ui;
            ctx.strokeStyle = 'rgba(34,211,238,0.5)';
            ctx.beginPath();
            ctx.moveTo(base.x, base.y);
            ctx.lineTo(top.x, top.y);
            ctx.stroke();
            ctx.fillStyle = '#22D3EE';
            ctx.beginPath();
            ctx.ellipse(base.x, base.y, 5 * k, 2.2 * k, 0, 0, Math.PI * 2);
            ctx.fill();
            if (compact) {
              // phones: compact title-only card
              const title = ar.label.replace(' Systems', '');
              ctx.font = `600 ${Math.round(14 * k)}px SpaceGrotesk_600SemiBold, sans-serif`;
              const cw2 = ctx.measureText(title).width + 30 * k;
              const ch2 = 30 * k;
              const bx2 = top.x - cw2 / 2;
              const by2 = top.y - ch2 - 6 * k;
              roundRect(ctx, bx2, by2, cw2, ch2, 9 * k);
              ctx.fillStyle = 'rgba(10,12,26,0.9)';
              ctx.fill();
              ctx.strokeStyle = 'rgba(34,211,238,0.45)';
              ctx.stroke();
              ctx.fillStyle = ['#22D3EE', '#8B5CF6', '#F472B6', '#FF9933'][i];
              roundRect(ctx, bx2 + 9 * k, by2 + 8 * k, 3.5 * k, ch2 - 16 * k, 2 * k);
              ctx.fill();
              ctx.fillStyle = '#F2F7FF';
              ctx.fillText(title, bx2 + 19 * k, by2 + 20 * k);
              return;
            }
            // card grows to fit its title (e.g. "Embedded Systems")
            ctx.font = `600 ${Math.round(15 * k)}px SpaceGrotesk_600SemiBold, sans-serif`;
            const cw = Math.max(156 * k, ctx.measureText(ar.label).width + 36 * k);
            const ch = 54 * k;
            const bx = top.x - cw / 2;
            const by = top.y - ch - 6 * k;
            roundRect(ctx, bx, by, cw, ch, 12 * k);
            ctx.fillStyle = 'rgba(10,12,26,0.88)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(34,211,238,0.45)';
            ctx.stroke();
            ctx.fillStyle = ['#22D3EE', '#8B5CF6', '#F472B6', '#FF9933'][i];
            roundRect(ctx, bx + 10 * k, by + 12 * k, 4 * k, ch - 24 * k, 2 * k);
            ctx.fill();
            ctx.fillStyle = '#F2F7FF';
            ctx.font = `600 ${Math.round(15 * k)}px SpaceGrotesk_600SemiBold, sans-serif`;
            ctx.fillText(ar.label, bx + 22 * k, by + 24 * k);
            ctx.fillStyle = 'rgba(165,180,210,0.9)';
            ctx.font = `${Math.round(11 * k)}px Inter_400Regular, sans-serif`;
            ctx.fillText(ar.caption, bx + 22 * k, by + 41 * k);
          },
        });
      });

      products.forEach((p) => {
        const [x, z] = pos(p.a, p.r);
        const top = project(x, p.y, z);
        items.push({
          // always drawn above the area cards so a product name is never hidden
          depth: top.depth + 10,
          draw: () => {
            const k = ui;
            ctx.font = `600 ${Math.round(13 * k)}px Inter_600SemiBold, sans-serif`;
            const tw = ctx.measureText(p.label).width;
            const pw = tw + 34 * k;
            const ph2 = 30 * k;
            roundRect(ctx, top.x - pw / 2, top.y - ph2 / 2, pw, ph2, ph2 / 2);
            ctx.fillStyle = 'rgba(255,153,51,0.95)';
            ctx.shadowColor = '#FF9933';
            ctx.shadowBlur = 16;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#1A0B00';
            ctx.beginPath();
            ctx.arc(top.x - pw / 2 + 13 * k, top.y, 3.2 * k, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText(p.label, top.x - pw / 2 + 22 * k, top.y + 4.5 * k);
          },
        });
      });

      // hub: beam, glowing core and the Chaytr logo
      const hubTop = project(0, HUB_Y, 0);
      items.push({
        depth: hubTop.depth,
        draw: () => {
          const k = hub.k;
          const beam = ctx.createLinearGradient(0, hub0.y, 0, hubTop.y);
          beam.addColorStop(0, 'rgba(255,153,51,0.7)');
          beam.addColorStop(1, 'rgba(255,153,51,0)');
          ctx.strokeStyle = beam;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(hub0.x, hub0.y);
          ctx.lineTo(hubTop.x, hubTop.y);
          ctx.stroke();
          ctx.lineWidth = 1;
          const pulse = 1 + Math.sin(t * 2.2) * 0.06;
          const R = 46 * k * pulse;
          const core = ctx.createRadialGradient(hubTop.x, hubTop.y, 0, hubTop.x, hubTop.y, R * 1.9);
          core.addColorStop(0, 'rgba(255,200,140,0.95)');
          core.addColorStop(0.35, 'rgba(255,120,80,0.55)');
          core.addColorStop(0.7, 'rgba(139,92,246,0.25)');
          core.addColorStop(1, 'rgba(34,211,238,0)');
          ctx.fillStyle = core;
          ctx.beginPath();
          ctx.arc(hubTop.x, hubTop.y, R * 1.9, 0, Math.PI * 2);
          ctx.fill();
          roundRect(ctx, hubTop.x - 70 * k, hubTop.y - 46 * k, 140 * k, 92 * k, 22 * k);
          ctx.fillStyle = 'rgba(10,12,26,0.9)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,153,51,0.8)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.lineWidth = 1;
          // the logo itself is placed over this box by the page (see HubLogo)
        },
      });

      items.sort((a, b) => a.depth - b.depth).forEach((it) => it.draw());
    };
  };

/** The real Chaytr logo, positioned over the scene's hub. */
function HubLogo({ w, h, wide, visible }: { w: number; h: number; wide: boolean; visible?: number }) {
  if (!w || !h) return null;
  const { hub } = sceneGeometry(w, h, wide, visible);
  const bw = 140 * hub.k;
  const bh = 92 * hub.k;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: hub.x - bw / 2, top: hub.y - bh / 2, width: bw, height: bh, alignItems: 'center', justifyContent: 'center' }}>
      <LogoArt tone="dark" width={bw * 0.72} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

const TERMINAL = [
  '$ chaytr init --stack=ai,embedded,robotics,fintech',
  '✓ 4 modules online',
  '$ bhedak status',
  '  radar: pulsed · gate 30–50 m · alerts: haptic',
  '$ nexpay status',
  '  rail: UPI · mode: visitor wallet · coming soon',
  '$ ping hello@chaytr',
  "  reply: let's build something together",
];

function Terminal() {
  const lines = useTypewriter(TERMINAL, 42, 700);
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 520);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={[{ flex: 1, backgroundColor: 'rgba(18,16,30,0.9)', borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 20, minHeight: 250 }, web({ backdropFilter: 'blur(6px)' })]}>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14, alignItems: 'center' }}>
        {[C.pink, C.saffron, C.green].map((c) => (
          <View key={c} style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: c }} />
        ))}
        <Mono size={11} style={{ marginLeft: 8 }}>
          chaytr@lab: ~/systems
        </Mono>
      </View>
      {lines.map((l, i) => (
        <Mono key={i} size={13} color={l.startsWith('$') ? C.cyan : l.startsWith('✓') ? C.green : C.text} style={{ lineHeight: 22 }}>
          {l}
          {i === lines.length - 1 && blink ? '▍' : ''}
        </Mono>
      ))}
    </View>
  );
}

function ModuleCard({ index, domain }: { index: number; domain: (typeof domains)[number] }) {
  const [scan] = useState(() => new Animated.Value(0));
  const [hov, setHov] = useState(false);
  useEffect(() => {
    if (!hov) return;
    scan.setValue(0);
    const loop = Animated.loop(Animated.timing(scan, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [hov, scan]);

  return (
    <Pressable onHoverIn={() => setHov(true)} onHoverOut={() => setHov(false)} style={{ flex: 1 }}>
      <View style={{ flex: 1, borderRadius: 18, padding: 1.5, overflow: 'hidden', backgroundColor: C.line }}>
        {hov && <Dawn id={`mod-${domain.key}`} />}
        <View style={{ flex: 1, borderRadius: 17, backgroundColor: C.panel, overflow: 'hidden' }}>
          <View style={{ aspectRatio: 16 / 10, overflow: 'hidden', backgroundColor: '#000' }}>
            <Image
              source={LOCAL[domain.key]}
              resizeMode="cover"
              style={[{ width: '100%', height: '100%', opacity: hov ? 1 : 0.75 }, web({ filter: hov ? 'none' : 'grayscale(0.85) contrast(1.1)', transitionDuration: '500ms' })]}
            />
            <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: hov ? 'rgba(34,211,238,0.06)' : 'rgba(34,211,238,0.14)' }, web({ mixBlendMode: 'screen', transitionDuration: '500ms' })]} />
            {hov && (
              <Animated.View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: C.saffron,
                  shadowColor: C.saffron,
                  shadowOpacity: 1,
                  shadowRadius: 10,
                  top: scan.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }}
              />
            )}
          </View>
          <View style={{ padding: 18, gap: 8 }}>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 20, color: C.text }}>{domain.name}</Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: C.muted }}>{domain.text}</Text>
            <Mono size={11} color={hov ? C.saffron : C.muted} style={{ marginTop: 6 }}>
              status: <Text style={{ color: C.green }}>active</Text>
            </Mono>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Process() {
  const { isTablet } = useBreakpoint();
  const sweep = useLoop(4200);
  return (
    <View style={{ flexDirection: isTablet ? 'column' : 'row', gap: isTablet ? 24 : 0 }}>
      {!isTablet && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 21, height: 2, backgroundColor: C.line, overflow: 'hidden' }}>
          <Dawn id="proc-line" opacity={0.25} />
          <Animated.View
            style={{
              position: 'absolute',
              top: -2,
              height: 6,
              width: 160,
              borderRadius: 3,
              backgroundColor: C.saffron,
              shadowColor: C.saffron,
              shadowOpacity: 1,
              shadowRadius: 12,
              left: sweep.interpolate({ inputRange: [0, 1], outputRange: ['-15%', '100%'] }),
            }}
          />
        </View>
      )}
      {about.process.map((p, i) => (
        <View key={p.title} style={{ flex: isTablet ? undefined : 1, gap: 14, paddingRight: 24 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: C.panel, borderWidth: 1, borderColor: C.line }}>
            {i === about.process.length - 1 && <Dawn id="proc-last" />}
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i === about.process.length - 1 ? '#FFFFFF' : C.cyan }} />
          </View>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 22, color: C.text }}>{p.title}</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: C.muted }}>{p.text}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

/** Hero: decoding headline + the 3D capability map turning on its grid table. */
export function FusionHero() {
  const { isMobile, isTablet, width } = useBreakpoint();
  const { height } = useWindowDimensions();
  const wrap = useWrap();
  const [hero, setHero] = useState({ w: 0, h: 0 });
  const word = useCycle(['intelligent', 'embedded', 'autonomous', 'financial'], 2600);
  const scrambled = useScramble(word, 32);
  // Below 1200 px there isn't enough room beside the headline, so the map goes underneath.
  const sideBySide = width >= 1200;

  const text = (
    <View style={[wrap, { paddingTop: isMobile ? 48 : 96, paddingBottom: sideBySide ? 0 : 24 }]}>
      <View style={{ maxWidth: isTablet ? undefined : 600, gap: 24 }}>
        <Text accessibilityRole="header" aria-level={1} style={{ fontFamily: fonts.displayBold, fontSize: isMobile ? 44 : 80, lineHeight: isMobile ? 48 : 84, color: C.text, letterSpacing: -2 }}>
          We build{'\n'}
          <Text style={{ fontFamily: MONO_B, color: C.cyan, letterSpacing: -3 }}>{scrambled || ' '}</Text>
          {'\n'}systems.
        </Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 18, lineHeight: 29, color: C.muted }}>{home.hero.subtext}</Text>
        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
          <CTAButton label="explore_projects →" href="/projects" solid />
          <CTAButton label="contact()" href="/contact" />
        </View>
      </View>
    </View>
  );

  // Wide screens: text on the left, the map turning on the right, one shared canvas.
  if (sideBySide) {
    // Part of the hero visible without scrolling (rounded so small resizes don't restart the scene).
    const visible = Math.round((height - NAV_HEIGHT) / 20) * 20;
    return (
      <View style={{ minHeight: Math.max(640, height - NAV_HEIGHT), overflow: 'hidden', backgroundColor: C.bg }} onLayout={(e) => setHero({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        <CanvasLayer key={`wide-${visible}`} setup={scene(true, visible)} />
        <HubLogo w={hero.w} h={hero.h} wide visible={visible} />
        {text}
      </View>
    );
  }

  // Narrow screens: text over the live network, then the map in its own block below.
  const mapH = Math.min(520, Math.max(380, width * 1.05));
  return (
    <View style={{ backgroundColor: C.bg }}>
      <View style={{ overflow: 'hidden' }}>
        <CanvasLayer setup={quietNetwork} />
        {text}
      </View>
      <View style={{ height: mapH, overflow: 'hidden' }} onLayout={(e) => setHero({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        <CanvasLayer key="narrow" setup={scene(false)} />
        <HubLogo w={hero.w} h={hero.h} wide={false} />
      </View>
    </View>
  );
}

/** Animated counters next to the live terminal. */
export function ConsoleSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const wrap = useWrap();
  return (
    <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line, backgroundColor: '#0A0C1A' }}>
      <View style={[wrap, { paddingVertical: isMobile ? 50 : 70, flexDirection: isTablet ? 'column' : 'row', gap: isTablet ? 32 : 48, alignItems: 'stretch' }]}>
        <View style={{ flex: isTablet ? undefined : 1, flexDirection: 'row', flexWrap: 'wrap' }}>
          {[
            { n: 4, label: 'DISCIPLINES' },
            { n: 2, label: 'FLAGSHIP PRODUCTS' },
            { n: 50, label: 'METRE DETECTION TARGET', suffix: 'm' },
            { n: 1, label: 'TEAM, ONE STACK' },
          ].map((s) => (
            <View key={s.label} style={{ width: '50%', paddingVertical: 18, paddingRight: 12 }}>
              <Text style={{ fontFamily: MONO_B, fontSize: isMobile ? 36 : 46, color: C.text }}>
                <Counter to={s.n} pad={1} suffix={s.suffix} />
              </Text>
              <Mono size={11} style={{ marginTop: 6 }}>
                {s.label}
              </Mono>
            </View>
          ))}
        </View>
        <View style={{ flex: isTablet ? undefined : 1.15 }}>
          <Terminal />
        </View>
      </View>
    </View>
  );
}

/** The four focus areas as module cards. */
export function ModulesSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const wrap = useWrap();
  return (
    <View style={{ overflow: 'hidden', backgroundColor: C.bg }}>
      <CanvasLayer setup={quietNetwork} />
      <View style={[wrap, { paddingVertical: isMobile ? 72 : 120 }]}>
        <SectionTitle tag="WHAT WE DO" title={'Four technologies.\nOne team that connects them.'} />
        <View style={{ flexDirection: isTablet ? 'column' : 'row', gap: 18 }}>
          {domains.map((d, i) => (
            <ModuleCard key={d.key} index={i} domain={d} />
          ))}
        </View>
      </View>
    </View>
  );
}

/** Discover → Design → Build → Launch. */
export function PipelineSection() {
  const { isMobile } = useBreakpoint();
  const wrap = useWrap();
  return (
    <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line, backgroundColor: '#0A0C1A' }}>
      <View style={[wrap, { paddingVertical: isMobile ? 70 : 110 }]}>
        <SectionTitle tag="HOW WE WORK" title="From idea to launch." />
        <Process />
      </View>
    </View>
  );
}

/** Product images from the NexPay (Team Vertex) and Bhedak decks, framed like a camera feed. */
const FLAGSHIP_PHOTOS = {
  nexpay: {
    source: require('../../../assets/photos/nexpay.jpg'),
    aspect: 674 / 449,
    feed: 'the problem',
    caption: 'A visitor, a "UPI only" counter, and no Indian bank account.',
  },
  bhedak: {
    source: require('../../../assets/photos/bhedak.jpg'),
    aspect: 1208 / 484,
    feed: 'ip54 mobility test',
    caption: 'Radar rover concept: built to keep moving over rough ground, even when flipped.',
  },
} as const;

/** NexPay and Bhedak as system-style panels. */
export function DeploymentsSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const wrap = useWrap();
  return (
    <View style={{ backgroundColor: C.bg }}>
      <View style={[wrap, { paddingVertical: isMobile ? 72 : 120, gap: 22 }]}>
        <SectionTitle tag="OUR PRODUCTS" title="What's running." />
        {flagships.map((f) => (
          <Link key={f.slug} href={`/projects/${f.slug}`} asChild>
            <Pressable>
              {(s) => (
                <View style={{ borderRadius: 24, padding: 1.5, overflow: 'hidden', backgroundColor: C.line }}>
                  {(s as { hovered?: boolean }).hovered && <Dawn id={`dep-${f.slug}`} />}
                  <View style={{ borderRadius: 23, backgroundColor: C.panel, flexDirection: isTablet ? 'column' : 'row', overflow: 'hidden' }}>
                    <View style={{ flex: 1, padding: isMobile ? 22 : 38, gap: 16 }}>
                      <Mono color={C.saffron} bold>{`> ${f.slug}.status`}</Mono>
                      <View accessibilityRole="header" aria-level={2} accessibilityLabel={f.name} style={{ paddingVertical: 4 }}>
                        <ProductLogo slug={f.slug} width={isMobile ? 200 : 280} />
                      </View>
                      <Text style={{ fontFamily: fonts.display, fontSize: 19, color: C.saffron }}>{f.headline}</Text>
                      <Text style={{ fontFamily: fonts.body, fontSize: 16, lineHeight: 26, color: C.muted, maxWidth: 520 }}>{f.summary}</Text>
                      <View style={{ gap: 6, marginTop: 4 }}>
                        {[
                          ['domain', f.industry.toLowerCase()],
                          ['state', f.status.toLowerCase()],
                          ['stack', f.domains.join(' + ')],
                        ].map(([k, v]) => (
                          <Mono key={k} size={13}>
                            <Text style={{ color: C.violet }}>{k.padEnd(8, ' ')}</Text> {v}
                          </Mono>
                        ))}
                      </View>
                      <Mono color={C.cyan} bold style={{ marginTop: 6 }}>
                        open_{f.slug}() →
                      </Mono>
                    </View>
                    <View style={{ flex: isTablet ? undefined : 1, justifyContent: 'center', borderLeftWidth: isTablet ? 0 : 1, borderTopWidth: isTablet ? 1 : 0, borderColor: C.line, overflow: 'hidden', padding: isMobile ? 18 : 30 }}>
                      <Brackets />
                      <FeedPhoto {...FLAGSHIP_PHOTOS[f.slug]} hovered={!!(s as { hovered?: boolean }).hovered} />
                    </View>
                  </View>
                </View>
              )}
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

/** "> ready_to_build?" closing call to action. */
export function ReadyCTA() {
  const { isMobile } = useBreakpoint();
  const wrap = useWrap();
  return (
    <View style={{ overflow: 'hidden', borderTopWidth: 1, borderColor: C.line, backgroundColor: C.bg }}>
      <CanvasLayer setup={quietNetwork} />
      <View style={[wrap, { paddingVertical: isMobile ? 90 : 140, alignItems: 'center', gap: 24 }]}>
        <Mono color={C.cyan} bold size={14}>
          {'> ready_to_build?'}
        </Mono>
        <Text style={{ fontFamily: fonts.displayBold, fontSize: isMobile ? 38 : 64, lineHeight: isMobile ? 44 : 70, color: C.text, textAlign: 'center', letterSpacing: -1.5 }}>
          {home.closing.headline}
        </Text>
        <CTAButton label="initialize_collaboration →" href="/contact" solid />
      </View>
    </View>
  );
}
