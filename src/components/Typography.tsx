import { Text, TextProps, TextStyle } from 'react-native';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors, fonts } from '@/theme';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'lead' | 'body' | 'small' | 'eyebrow';

type Scale = { size: [number, number, number]; line: number; font: string; tracking?: number };

// size = [mobile, tablet, desktop]; line = line-height multiplier
const scale: Record<Variant, Scale> = {
  display: { size: [40, 56, 68], line: 1.04, font: fonts.display, tracking: -0.035 },
  h1: { size: [36, 48, 60], line: 1.06, font: fonts.display, tracking: -0.03 },
  h2: { size: [30, 38, 46], line: 1.1, font: fonts.display, tracking: -0.025 },
  h3: { size: [20, 21, 22], line: 1.3, font: fonts.display, tracking: -0.01 },
  lead: { size: [17, 18, 20], line: 1.55, font: fonts.body },
  body: { size: [15, 16, 16], line: 1.6, font: fonts.body },
  small: { size: [13, 14, 14], line: 1.5, font: fonts.body },
  eyebrow: { size: [12, 12, 13], line: 1.4, font: fonts.monoBold, tracking: 0.08 },
};

export type TProps = TextProps & {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
  weight?: 'regular' | 'medium' | 'semibold';
};

export function T({ variant = 'body', color, align, weight, style, ...rest }: TProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const s = scale[variant];
  const size = isMobile ? s.size[0] : isTablet ? s.size[1] : s.size[2];
  const isBody = variant === 'lead' || variant === 'body' || variant === 'small';
  const fontFamily =
    isBody && weight === 'medium'
      ? fonts.bodyMedium
      : isBody && weight === 'semibold'
        ? fonts.bodySemibold
        : s.font;

  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily,
          fontSize: size,
          lineHeight: Math.round(size * s.line),
          letterSpacing: s.tracking ? size * s.tracking : 0,
          color: color ?? (isBody ? colors.muted : colors.text),
          textAlign: align,
          textTransform: variant === 'eyebrow' ? 'uppercase' : undefined,
        },
        style,
      ]}
    />
  );
}

/** Section label in the coding font, e.g. "WHAT WE DO". Cyan by default. */
export function Eyebrow({ children, color }: { children: string; color?: string; tick?: string }) {
  return (
    <T variant="eyebrow" color={color ?? colors.accent}>
      {children}
    </T>
  );
}
