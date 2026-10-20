import { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Backdrop } from '@/components/Backdrop';
import { Container } from '@/components/Layout';
import { Reveal } from '@/components/Reveal';
import { T } from '@/components/Typography';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors } from '@/theme';

/**
 * Dark title band used at the top of inner pages.
 * `highlight` is a phrase inside `title` to colour with the accent.
 */
export function PageHeader({
  title,
  highlight,
  subtext,
  children,
  extraBottom = 0,
}: {
  title: string;
  highlight?: string;
  subtext?: string;
  children?: ReactNode;
  /** Extra bottom padding, for content that overlaps the band. */
  extraBottom?: number;
}) {
  const { isMobile, sectionY } = useBreakpoint();
  const parts = highlight && title.includes(highlight) ? title.split(highlight) : null;

  return (
    <View style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
      <Backdrop />
      <Container style={{ paddingTop: isMobile ? 56 : 104, paddingBottom: Math.round(sectionY * 0.75) + extraBottom }}>
        <Reveal style={{ gap: isMobile ? 20 : 28 }}>
          <T variant="display" color={colors.onDark} style={{ maxWidth: 1000 }} accessibilityRole="header" aria-level={1}>
            {parts ? (
              <>
                {parts[0]}
                <Text style={{ color: colors.highlight }}>{highlight}</Text>
                {parts[1]}
              </>
            ) : (
              title
            )}
          </T>
          {subtext ? (
            <T variant="lead" color={colors.mutedOnDark} style={{ maxWidth: 620 }}>
              {subtext}
            </T>
          ) : null}
          {children}
        </Reveal>
      </Container>
    </View>
  );
}
