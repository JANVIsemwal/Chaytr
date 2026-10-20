import { View } from 'react-native';

import { Backdrop } from '@/components/Backdrop';
import { Button } from '@/components/Button';
import { Container } from '@/components/Layout';
import { T } from '@/components/Typography';
import { home } from '@/config/site';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors } from '@/theme';

export function ClosingBanner({
  headline = home.closing.headline,
  text = home.closing.text,
  cta = home.closing.cta,
}: {
  headline?: string;
  text?: string;
  cta?: string;
}) {
  const { isMobile, isTablet, sectionY } = useBreakpoint();
  return (
    <View style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
      <Backdrop glows={[{ x: '85%', y: '100%', r: '70%', color: colors.violet, opacity: 0.45 }, { x: '0%', y: '0%', r: '45%', color: colors.saffron, opacity: 0.14 }, { x: '40%', y: '50%', r: '40%', color: colors.accent, opacity: 0.08 }]} />
      <Container style={{ paddingVertical: sectionY }}>
        <View
          style={{
            flexDirection: isTablet ? 'column' : 'row',
            alignItems: isTablet ? 'flex-start' : 'flex-end',
            justifyContent: 'space-between',
            gap: 32,
          }}
        >
          <View style={{ maxWidth: 760, gap: 16 }}>
            <T variant="h1" color={colors.onDark}>
              {headline}
            </T>
            <T variant="lead" color={colors.mutedOnDark}>
              {text}
            </T>
          </View>
          <View style={{ alignSelf: isMobile ? 'stretch' : undefined }}>
            <Button label={cta} href="/contact" tone="dark" fullWidth={isMobile} />
          </View>
        </View>
      </Container>
    </View>
  );
}
