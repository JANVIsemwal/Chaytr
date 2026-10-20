import { Animated, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import { useLoop } from '@/components/Reveal';
import { colors } from '@/theme';

// Scanner sits at the bottom centre; 1 metre = 6 units, so 50 m = 300.
const CX = 240;
const CY = 336;
const M = 6;
const HALF = 35; // half-angle of the scan cone, degrees

const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)] as const;
};
const arc = (r: number) => {
  const [x1, y1] = pt(r, -HALF);
  const [x2, y2] = pt(r, HALF);
  return `M${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}`;
};

// Trees and rocks the filter ignores.
const CLUTTER: [number, number][] = [
  [12, -18],
  [17, 22],
  [22, -28],
  [26, 8],
  [33, -12],
  [44, 26],
];
const TARGET: [number, number] = [38, 9];

/**
 * Top-down view of a Bhedak scan: the directional cone, range rings,
 * the 30–50 m range gate, filtered clutter and a confirmed target.
 */
export function RadarGraphic({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const fg = tone === 'dark' ? colors.onDark : colors.text;
  const dim = tone === 'dark' ? 0.22 : 0.3;
  const [tx, ty] = pt(TARGET[0] * M, TARGET[1]);
  const gate = (() => {
    const [a1, b1] = pt(30 * M, -HALF);
    const [a2, b2] = pt(50 * M, -HALF);
    const [a3, b3] = pt(50 * M, HALF);
    const [a4, b4] = pt(30 * M, HALF);
    return `M${a1} ${b1}L${a2} ${b2}A${50 * M} ${50 * M} 0 0 1 ${a3} ${b3}L${a4} ${b4}A${30 * M} ${30 * M} 0 0 0 ${a1} ${b1}Z`;
  })();
  const [ex1, ey1] = pt(52 * M, -HALF);
  const [ex2, ey2] = pt(52 * M, HALF);
  const sweep = useLoop(2600, { reverse: true });
  const ping = useLoop(1800);
  const pct = (v: number, of: number) => `${(v / of) * 100}%` as const;
  const R = 52 * M; // sweep radius
  const PR = 16; // ping radius

  return (
    <View style={{ width: '100%', aspectRatio: 480 / 360, overflow: 'hidden' }} accessibilityLabel="Illustration of a Bhedak radar scan detecting a target at 38 metres">
      <Svg width="100%" height="100%" viewBox="0 0 480 360">

        {/* cone edges */}
        <Line x1={CX} y1={CY} x2={ex1} y2={ey1} stroke={fg} strokeOpacity={dim} />
        <Line x1={CX} y1={CY} x2={ex2} y2={ey2} stroke={fg} strokeOpacity={dim} />

        {/* range gate */}
        <Path d={gate} fill={colors.accent} fillOpacity={0.1} stroke={colors.accent} strokeOpacity={0.5} strokeDasharray="4 4" />

        {/* range rings */}
        {[10, 20, 30, 40, 50].map((m) => {
          const [lx, ly] = pt(m * M, HALF);
          return (
            <G key={m}>
              <Path d={arc(m * M)} stroke={fg} strokeOpacity={dim} fill="none" />
              <SvgText x={lx + 8} y={ly + 4} fontSize={10} fill={fg} fillOpacity={0.5} letterSpacing={0.5}>
                {m} m
              </SvgText>
            </G>
          );
        })}


        {/* filtered clutter */}
        {CLUTTER.map(([m, d]) => {
          const [x, y] = pt(m * M, d);
          return (
            <G key={`${m}-${d}`}>
              <Circle cx={x} cy={y} r={5} fill="none" stroke={fg} strokeOpacity={0.35} />
              <Path d={`M${x - 3} ${y - 3}l6 6M${x + 3} ${y - 3}l-6 6`} stroke={fg} strokeOpacity={0.35} />
            </G>
          );
        })}

        {/* confirmed target */}
        <Circle cx={tx} cy={ty} r={22} fill="none" stroke={colors.accent} strokeOpacity={0.3} />
        <Circle cx={tx} cy={ty} r={13} fill="none" stroke={colors.accent} strokeOpacity={0.6} />
        <Circle cx={tx} cy={ty} r={5} fill={colors.accent} />
        {/* label sits beyond the 50 m ring, where the cone is empty */}
        <Path d={`M${tx + 16} ${ty - 16}L${tx + 40} ${32}h4`} stroke={colors.accent} fill="none" />
        <SvgText x={tx + 48} y={24} fontSize={11} fill={fg} letterSpacing={0.6}>
          TARGET · 38 m
        </SvgText>
        <SvgText x={tx + 48} y={38} fontSize={10} fill={colors.accent} letterSpacing={0.6}>
          METAL + VITAL SIGN
        </SvgText>

        {/* labels */}
        <SvgText x={16} y={24} fontSize={10} fill={fg} fillOpacity={0.55} letterSpacing={1}>
          RANGE GATE 30–50 m
        </SvgText>
        <SvgText x={16} y={40} fontSize={10} fill={fg} fillOpacity={0.35} letterSpacing={1}>
          ⊗ CLUTTER FILTERED
        </SvgText>

        {/* scanner */}
        <Circle cx={CX} cy={CY} r={7} fill={fg} />
        <Circle cx={CX} cy={CY} r={14} fill="none" stroke={fg} strokeOpacity={0.4} />
      </Svg>

      {/* sweeping beam: a square layer centred on the scanner, rotated back and forth */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: pct(CX - R, 480),
          top: pct(CY - R, 360),
          width: pct(R * 2, 480),
          height: pct(R * 2, 360),
          transform: [{ rotate: sweep.interpolate({ inputRange: [0, 1], outputRange: [`-${HALF - 4}deg`, `${HALF - 4}deg`] }) }],
        }}
      >
        <Svg width="100%" height="100%" viewBox={`0 0 ${R * 2} ${R * 2}`}>
          <Defs>
            <LinearGradient id="sweep" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={colors.accent} stopOpacity={0.55} />
              <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={`M${R} ${R}L${R - 26} 0H${R + 26}Z`} fill="url(#sweep)" />
          <Line x1={R} y1={R} x2={R} y2={0} stroke={colors.accent} strokeOpacity={0.7} />
        </Svg>
      </Animated.View>

      {/* target ping */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: pct(tx - PR, 480),
          top: pct(ty - PR, 360),
          width: pct(PR * 2, 480),
          height: pct(PR * 2, 360),
          borderRadius: 999,
          borderWidth: 1.5,
          borderColor: colors.accent,
          opacity: ping.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
          transform: [{ scale: ping.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.4] }) }],
        }}
      />
    </View>
  );
}
