/**
 * NexPay visuals: a live wallet phone over a currency-flow animation, and the "how visitors pay
 * today" comparison. All figures shown in the phone are illustrative.
 */
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Text, View } from 'react-native';

import { CanvasLayer, type CanvasDraw } from '@/components/fx';
import { C, Dawn, Mono, MONO, MONO_B } from '@/components/fusion/kit';
import { NexPayLogo } from '@/components/product/NexPayLogo';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { fonts } from '@/theme';

const useNativeDriver = Platform.OS !== 'web';

// ---------------------------------------------------------------------------
// Currency flow: foreign currency glyphs drift in on flowing ribbons and turn into ₹.
// ---------------------------------------------------------------------------

const FOREIGN = ['$', '€', '£', '¥', '₩', 'A$', 'C$', 'CHF'];

const currencyFlow = (w: number, h: number): CanvasDraw => {
  const cx = w / 2;
  const cy = h / 2;
  type Glyph = { a: number; r: number; speed: number; g: string; size: number };
  const spawn = (): Glyph => ({ a: Math.random() * Math.PI * 2, r: Math.max(w, h) * (0.45 + Math.random() * 0.25), speed: 0.35 + Math.random() * 0.5, g: FOREIGN[Math.floor(Math.random() * FOREIGN.length)], size: 13 + Math.random() * 8 });
  const glyphs = Array.from({ length: 22 }, () => {
    const g = spawn();
    g.r *= Math.random();
    return g;
  });

  return (ctx, w, h, t) => {
    // flowing ribbons (a nod to the NexPay deck's cyan-violet ribbons)
    for (let k = 0; k < 3; k++) {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, `rgba(34,211,238,${0.22 - k * 0.05})`);
      grad.addColorStop(0.55, `rgba(139,92,246,${0.26 - k * 0.06})`);
      grad.addColorStop(1, `rgba(255,153,51,${0.14 - k * 0.03})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 38 - k * 11;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let x = -40; x <= w + 40; x += 12) {
        const y = cy + Math.sin(x / (w * 0.22) + t * (0.5 + k * 0.15) + k * 1.8) * h * (0.16 + k * 0.05) + Math.cos(x / (w * 0.5) - t * 0.3) * h * 0.06;
        if (x === -40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // glyphs spiral toward the phone and become rupees
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const g of glyphs) {
      g.r -= g.speed * 1.4;
      g.a += 0.0025;
      if (g.r < 30) Object.assign(g, spawn());
      const x = cx + Math.cos(g.a) * g.r;
      const y = cy + Math.sin(g.a) * g.r * 0.75;
      const near = g.r < Math.min(w, h) * 0.28;
      const fade = Math.min(1, g.r / 60) * Math.min(1, (Math.max(w, h) * 0.7 - g.r) / 80 + 0.2);
      ctx.font = `600 ${g.size}px JetBrainsMono_600SemiBold, monospace`;
      ctx.fillStyle = near ? `rgba(255,153,51,${0.85 * fade})` : `rgba(147,160,190,${0.55 * fade})`;
      ctx.fillText(near ? '₹' : g.g, x, y);
    }
  };
};

// ---------------------------------------------------------------------------
// Live wallet phone
// ---------------------------------------------------------------------------

const PAYMENTS = [
  { merchant: 'Chai stall', city: 'Jaipur', amount: 40 },
  { merchant: 'Saree emporium', city: 'Varanasi', amount: 2400 },
  { merchant: 'Auto-rickshaw', city: 'Delhi', amount: 180 },
  { merchant: 'Street food', city: 'Mumbai', amount: 120 },
  { merchant: 'Museum entry', city: 'Agra', amount: 650 },
  { merchant: 'Spice market', city: 'Kochi', amount: 560 },
];
const START_BALANCE = 18450;
const RATE = 85.5; // illustrative INR per USD

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

function PhoneRow({ p, fresh }: { p: (typeof PAYMENTS)[number]; fresh: boolean }) {
  const [v] = useState(() => new Animated.Value(fresh ? 0 : 1));
  useEffect(() => {
    if (fresh) Animated.timing(v, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver }).start();
  }, [fresh, v]);
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) }], flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
      <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(34,211,238,0.12)', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: MONO_B, fontSize: 12, color: C.cyan }}>₹</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: C.text }}>{p.merchant}</Text>
        <Text style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>{p.city} · UPI</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontFamily: MONO_B, fontSize: 13, color: C.text }}>−{inr(p.amount)}</Text>
        <Text style={{ fontFamily: MONO, fontSize: 10, color: C.green }}>+{Math.max(2, Math.round(p.amount / 50))} pts</Text>
      </View>
    </Animated.View>
  );
}
export function NexPhone() {
  const [n, setN] = useState(2); // payments made so far in this loop
  const [jitter, setJitter] = useState(0);
  const [toast] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const id = setInterval(() => setN((k) => (k >= PAYMENTS.length ? 1 : k + 1)), 2600);
    const fx = setInterval(() => setJitter(Math.random() * 0.12 - 0.06), 900);
    return () => {
      clearInterval(id);
      clearInterval(fx);
    };
  }, []);

  useEffect(() => {
    toast.setValue(0);
    Animated.sequence([
      Animated.timing(toast, { toValue: 1, duration: 300, useNativeDriver }),
      Animated.delay(1100),
      Animated.timing(toast, { toValue: 0, duration: 400, useNativeDriver }),
    ]).start();
  }, [n, toast]);

  const spent = PAYMENTS.slice(0, n).reduce((a, p) => a + p.amount, 0);
  const balance = START_BALANCE - spent;
  const rate = RATE + jitter;
  const points = PAYMENTS.slice(0, n).reduce((a, p) => a + Math.max(2, Math.round(p.amount / 50)), 0);
  const recent = PAYMENTS.slice(Math.max(0, n - 4), n).reverse();
  const last = PAYMENTS[n - 1];

  return (
    <View style={{ width: 290, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: '#05060F', padding: 9, shadowColor: C.violet, shadowOpacity: 0.45, shadowRadius: 40 }} accessibilityLabel="Illustration of the NexPay wallet app">
      <View style={{ borderRadius: 32, backgroundColor: C.panel, padding: 18, gap: 16, overflow: 'hidden' }}>
        <View style={{ alignSelf: 'center', width: 70, height: 6, borderRadius: 3, backgroundColor: '#1B2140' }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <NexPayLogo width={92} />
          <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99, borderWidth: 1, borderColor: C.lineWarm }}>
            <Text style={{ fontFamily: MONO_B, fontSize: 9, color: C.cyan, letterSpacing: 1 }}>VISITOR</Text>
          </View>
        </View>

        <View style={{ borderRadius: 20, padding: 16, overflow: 'hidden', gap: 6 }}>
          <Dawn id="phone-card" opacity={0.9} />
          <Text style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: 1 }}>BALANCE</Text>
          <Text style={{ fontFamily: MONO_B, fontSize: 30, color: '#FFFFFF', letterSpacing: -1 }}>{inr(balance)}</Text>
          <Text style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.9)' }}>
            ≈ ${(balance / rate).toFixed(2)} · live FX {rate.toFixed(2)}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.85)' }}>visitor.4821@nexpay</Text>
            <Text style={{ fontFamily: MONO_B, fontSize: 10, color: '#FFFFFF' }}>{points} pts</Text>
          </View>
        </View>

        <View>
          <Text style={{ fontFamily: MONO, fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 2 }}>RECENT</Text>
          <View style={{ height: 196, overflow: 'hidden' }}>
            {recent.map((p, i) => (
              <PhoneRow key={`${p.merchant}-${n}-${i}`} p={p} fresh={i === 0} />
            ))}
          </View>
        </View>

        <View style={{ height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          <Dawn id="phone-btn" />
          <Text style={{ fontFamily: MONO_B, fontSize: 13, color: '#FFFFFF' }}>Scan any UPI QR</Text>
        </View>

        {last && (
          <Animated.View
            pointerEvents="none"
            style={{ position: 'absolute', bottom: 74, left: 18, right: 18, opacity: toast, transform: [{ translateY: toast.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }], flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, backgroundColor: 'rgba(5,6,15,0.94)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.5)' }}
          >
            <Text style={{ fontFamily: MONO_B, fontSize: 13, color: C.green }}>✓</Text>
            <Text style={{ flex: 1, fontFamily: MONO, fontSize: 11, color: C.text }}>
              Paid {inr(last.amount)} · {last.merchant}
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

/** Hero visual: the phone over the currency flow. */
export function NexPayVisual() {
  const { isMobile } = useBreakpoint();
  return (
    <View style={{ width: '100%', maxWidth: 560, height: isMobile ? 640 : 660, alignItems: 'center', justifyContent: 'center' }}>
      <CanvasLayer setup={currencyFlow} />
      <NexPhone />
    </View>
  );
}

/** Currencies flowing into a glowing ₹, used beside the "at a glance" numbers. */
export function CurrencyField() {
  const { isMobile } = useBreakpoint();
  return (
    <View style={{ height: isMobile ? 240 : 300, alignItems: 'center', justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: C.line, backgroundColor: 'rgba(13,16,32,0.6)', overflow: 'hidden' }}>
      <CanvasLayer setup={currencyFlow} />
      <View style={{ width: 96, height: 96, borderRadius: 48, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', shadowColor: C.saffron, shadowOpacity: 0.6, shadowRadius: 30 }}>
        <Dawn id="rupee-core" />
        <Text style={{ fontFamily: MONO_B, fontSize: 44, color: '#FFFFFF' }}>₹</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Comparison table
// ---------------------------------------------------------------------------

const MARK = {
  yes: { t: '✓', c: C.green },
  no: { t: '✕', c: C.red },
  partial: { t: '~', c: C.saffron },
  na: { t: '—', c: C.muted },
} as const;

export function CompareTable({ columns, rows }: { columns: string[]; rows: { label: string; values: (keyof typeof MARK)[] }[] }) {
  const { isMobile } = useBreakpoint();
  const last = columns.length - 1;
  const cell = { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, paddingVertical: isMobile ? 12 : 16 };
  return (
    <View style={{ borderRadius: 18, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, overflow: 'hidden' }}>
      {/* NexPay column highlight */}
      <View style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: `${(1 / (columns.length + (isMobile ? 1.2 : 1.6))) * 100}%`, backgroundColor: 'rgba(34,211,238,0.07)', borderLeftWidth: 1, borderColor: C.lineWarm }} />
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: C.line }}>
        <View style={{ flex: isMobile ? 1.2 : 1.6, padding: isMobile ? 12 : 16 }} />
        {columns.map((c, i) => (
          <View key={c} style={cell}>
            <Mono size={isMobile ? 9 : 11} bold color={i === last ? C.cyan : C.muted} style={{ textAlign: 'center', width: '100%', paddingHorizontal: 2, lineHeight: isMobile ? 13 : 16 }}>
              {c.toUpperCase()}
            </Mono>
          </View>
        ))}
      </View>
      {rows.map((r, ri) => (
        <View key={r.label} style={{ flexDirection: 'row', borderBottomWidth: ri === rows.length - 1 ? 0 : 1, borderColor: C.line }}>
          <View style={{ flex: isMobile ? 1.2 : 1.6, paddingVertical: isMobile ? 12 : 16, paddingHorizontal: isMobile ? 12 : 20, justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: isMobile ? 13 : 15, lineHeight: isMobile ? 18 : 21, color: C.text }}>{r.label}</Text>
          </View>
          {r.values.map((v, i) => (
            <View key={i} style={cell}>
              <Text style={{ fontFamily: MONO_B, fontSize: i === last ? 18 : 16, color: MARK[v].c }}>{MARK[v].t}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Adoption chart (log scale so the year-one target is visible next to 5 lakh)
// ---------------------------------------------------------------------------
