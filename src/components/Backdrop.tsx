import { useId, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Line, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { CanvasLayer, networkScene } from '@/components/fx';
import { colors } from '@/theme';

type Glow = { x: string; y: string; r: string; color?: string; opacity?: number };

/** Default lighting: violet top-right, cyan bottom-left, a warm touch of saffron. */
export const NIGHT_GLOWS: Glow[] = [
  { x: '82%', y: '0%', r: '70%', color: colors.violet, opacity: 0.38 },
  { x: '0%', y: '100%', r: '55%', color: colors.accent, opacity: 0.16 },
  { x: '100%', y: '85%', r: '40%', color: colors.saffron, opacity: 0.14 },
];

/**
 * Background for dark bands: soft radial glows plus the live network animation
 * (nodes drift, link up, carry pulses and lean towards the mouse). Fills its parent,
 * which should be `overflow: 'hidden'`.
 */
export function Backdrop({
  glows = NIGHT_GLOWS,
  stars = true,
  grid = false,
  gridOpacity = 0.5,
  density = 0.8,
}: {
  glows?: Glow[];
  /** Show the live network (kept as `stars` for older call sites). */
  stars?: boolean;
  grid?: number | false;
  gridOpacity?: number;
  density?: number;
}) {
  // SVG ids must be unique per instance and safe inside url(#...)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const scene = useMemo(() => networkScene(density), [density]);
  return (
    <>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          {grid ? (
            <Pattern id={`grid${uid}`} width={grid} height={grid} patternUnits="userSpaceOnUse">
              <Line x1={0} y1={0} x2={grid} y2={0} stroke="#FFFFFF" strokeOpacity={0.06} strokeWidth={1} />
              <Line x1={0} y1={0} x2={0} y2={grid} stroke="#FFFFFF" strokeOpacity={0.06} strokeWidth={1} />
            </Pattern>
          ) : null}
          {glows.map((g, i) => (
            <RadialGradient key={i} id={`glow${uid}${i}`} cx={g.x} cy={g.y} r={g.r} fx={g.x} fy={g.y} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={g.color ?? colors.glow} stopOpacity={g.opacity ?? 0.35} />
              <Stop offset="0.5" stopColor={g.color ?? colors.glow} stopOpacity={(g.opacity ?? 0.35) * 0.3} />
              <Stop offset="1" stopColor={g.color ?? colors.glow} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {glows.map((_, i) => (
          <Rect key={i} width="100%" height="100%" fill={`url(#glow${uid}${i})`} />
        ))}
        {grid ? <Rect width="100%" height="100%" fill={`url(#grid${uid})`} opacity={gridOpacity} /> : null}
      </Svg>
      {stars ? <CanvasLayer setup={scene} /> : null}
    </>
  );
}
