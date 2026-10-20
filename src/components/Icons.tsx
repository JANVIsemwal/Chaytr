import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import type { DomainKey } from '@/config/site';
import { colors } from '@/theme';

type IconProps = { size?: number; color?: string };

export function ArrowRight({ size = 16, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M2 8h11M9 4l4 4-4 4" stroke={color} strokeWidth={1.5} strokeLinecap="square" />
    </Svg>
  );
}

export function ArrowUpRight({ size = 16, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M4 12l8-8M5 4h7v7" stroke={color} strokeWidth={1.5} strokeLinecap="square" />
    </Svg>
  );
}

export function MenuIcon({ size = 24, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={3} y1={8} x2={21} y2={8} stroke={color} strokeWidth={1.6} />
      <Line x1={3} y1={16} x2={21} y2={16} stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function CloseIcon({ size = 24, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 5l14 14M19 5L5 19" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function ChevronDown({ size = 16, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M3.5 6l4.5 4.5L12.5 6" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M3 8.5l3 3 7-7" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

/** Line icons for the four focus areas. */
export function DomainIcon({
  domain,
  size = 40,
  color = colors.text,
  accent = colors.accent,
  bg = colors.paper,
}: IconProps & { domain: DomainKey; accent?: string; /** fill behind node circles */ bg?: string }) {
  const sw = 1.4;
  switch (domain) {
    case 'ai-ml': {
      const inputs = [9, 20, 31];
      const hidden = [14, 26];
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          {inputs.map((y) => hidden.map((h) => <Path key={`${y}-${h}`} d={`M7 ${y}L20 ${h}`} stroke={color} strokeOpacity={0.55} strokeWidth={1} />))}
          {hidden.map((h) => (
            <Path key={h} d={`M20 ${h}L33 20`} stroke={color} strokeOpacity={0.55} strokeWidth={1} />
          ))}
          {inputs.map((y) => (
            <Circle key={y} cx={7} cy={y} r={2.8} fill={bg} stroke={color} strokeWidth={sw} />
          ))}
          {hidden.map((h) => (
            <Circle key={h} cx={20} cy={h} r={2.8} fill={bg} stroke={color} strokeWidth={sw} />
          ))}
          <Circle cx={33} cy={20} r={4} fill={accent} />
        </Svg>
      );
    }
    case 'embedded':
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <Rect x={5} y={9} width={30} height={22} rx={2} stroke={color} strokeWidth={sw} />
          <Rect x={10} y={14} width={9} height={9} stroke={color} strokeWidth={sw} />
          <Path d="M19 18.5h6v-4h5M25 18.5v6h5" stroke={color} strokeWidth={sw} />
          <Circle cx={30} cy={14.5} r={1.8} fill={accent} />
          <Circle cx={30} cy={24.5} r={1.8} stroke={color} strokeWidth={sw} />
        </Svg>
      );
    case 'robotics':
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <Rect x={8} y={31} width={16} height={4} stroke={color} strokeWidth={sw} />
          <Path d="M16 31v-3M16 28L13 15M13 15l14-5" stroke={color} strokeWidth={sw} />
          <Path d="M27 10l3-4h4M27 10l3 4h4" stroke={color} strokeWidth={sw} />
          <Circle cx={16} cy={28} r={2.6} fill={bg} stroke={color} strokeWidth={sw} />
          <Circle cx={13} cy={15} r={3.2} fill={accent} />
          <Circle cx={27} cy={10} r={2.2} fill={bg} stroke={color} strokeWidth={sw} />
        </Svg>
      );
    case 'fintech':
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <Circle cx={15} cy={20} r={9} stroke={color} strokeWidth={sw} />
          <Circle cx={25} cy={20} r={9} stroke={accent} strokeWidth={sw} />
          <Path d="M3 33h34M3 7h34" stroke={color} strokeWidth={sw} strokeDasharray="2 3" />
        </Svg>
      );
  }
}
