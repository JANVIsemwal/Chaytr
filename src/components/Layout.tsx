import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { Reveal } from '@/components/Reveal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors, MAX_WIDTH } from '@/theme';

/** Centres content and applies the responsive side gutter. */
export function Container({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { gutter } = useBreakpoint();
  return (
    <View style={[{ width: '100%', maxWidth: MAX_WIDTH + gutter * 2, alignSelf: 'center', paddingHorizontal: gutter }, style]}>
      {children}
    </View>
  );
}

type SectionProps = {
  children: ReactNode;
  tone?: 'paper' | 'surface' | 'dark';
  /** Draw a hairline above the section. */
  divider?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Section({ children, tone = 'paper', divider, compact, style }: SectionProps) {
  const { sectionY } = useBreakpoint();
  const bg = tone === 'dark' ? colors.ink : tone === 'surface' ? colors.surface : colors.paper;
  const py = compact ? Math.round(sectionY * 0.6) : sectionY;
  return (
    <View
      style={[
        { backgroundColor: bg, paddingVertical: py },
        divider && { borderTopWidth: 1, borderTopColor: tone === 'dark' ? colors.lineOnDark : colors.line },
        style,
      ]}
    >
      <Container>
        <Reveal>{children}</Reveal>
      </Container>
    </View>
  );
}

/**
 * Simple responsive grid. Children are laid out in `columns` columns with `gap` spacing.
 * Pass `bordered` for the hairline-cell look used on cards.
 */
export function Grid({
  children,
  columns,
  gap = 24,
  stagger = true,
}: {
  children: ReactNode[];
  columns: number;
  gap?: number;
  /** Fade cards in one after another as they scroll into view. */
  stagger?: boolean;
}) {
  const items = children.filter(Boolean);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));

  return (
    <View style={{ gap }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap }}>
          {row.map((child, c) =>
            stagger ? (
              <Reveal key={c} delay={(r * columns + c) * 90} style={{ flex: 1, minWidth: 0 }}>
                {child}
              </Reveal>
            ) : (
              <View key={c} style={{ flex: 1, minWidth: 0 }}>
                {child}
              </View>
            ),
          )}
          {/* keep the last row aligned to the grid */}
          {Array.from({ length: columns - row.length }).map((_, i) => (
            <View key={`pad-${i}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );
}
