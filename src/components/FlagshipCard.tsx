import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Backdrop } from '@/components/Backdrop';
import { ArrowRight } from '@/components/Icons';
import { ProductLogo } from '@/components/product/ProductLogo';
import { RadarGraphic } from '@/components/RadarGraphic';
import { T } from '@/components/Typography';
import { WalletMock } from '@/components/WalletMock';
import type { Flagship } from '@/config/site';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors } from '@/theme';

/** The product visual for a flagship, cropped into a fixed-height panel. */
export function FlagshipVisual({ slug, height }: { slug: Flagship['slug']; height: number }) {
  return (
    <View style={{ height, overflow: 'hidden', alignItems: 'center', justifyContent: slug === 'nexpay' ? 'flex-start' : 'center' }}>
      <Backdrop density={0.6} glows={[{ x: '50%', y: '0%', r: '85%', color: colors.violet, opacity: 0.38 }, { x: '0%', y: '100%', r: '50%', color: colors.accent, opacity: 0.16 }]} />
      {slug === 'nexpay' ? (
        <View style={{ marginTop: 36 }}>
          <WalletMock width={280} />
        </View>
      ) : (
        <View style={{ width: '100%', maxWidth: Math.round(((height - 24) * 4) / 3), paddingHorizontal: 12 }}>
          <RadarGraphic />
        </View>
      )}
    </View>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.lineOnDark, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: status === 'Live' ? colors.success : colors.accent }} />
      <T variant="small" weight="medium" color={colors.onDark} style={{ fontSize: 13 }}>
        {status}
      </T>
    </View>
  );
}

/**
 * Large dark card for a flagship product.
 * `stacked` puts the visual on top (used in two-column grids); otherwise text and visual sit side by side.
 */
export function FlagshipCard({ project, stacked }: { project: Flagship; stacked?: boolean }) {
  const { isMobile, isTablet } = useBreakpoint();
  const vertical = stacked || isTablet;

  return (
    <Link href={`/projects/${project.slug}`} asChild>
      <Pressable style={{ flex: 1 }}>
        {(state) => {
          const hovered = (state as { hovered?: boolean }).hovered;
          return (
            <View
              style={{
                flex: 1,
                backgroundColor: colors.ink,
                borderRadius: 24,
                overflow: 'hidden',
                flexDirection: vertical ? 'column' : 'row-reverse',
                borderWidth: 1,
                borderColor: hovered ? colors.accent : colors.ink,
              }}
            >
              <View style={{ flex: vertical ? undefined : 1, backgroundColor: colors.inkSoft, borderBottomWidth: vertical ? 1 : 0, borderColor: colors.lineOnDark }}>
                <FlagshipVisual slug={project.slug} height={isMobile ? 260 : vertical ? 320 : 420} />
              </View>
              <View style={{ flex: 1, padding: isMobile ? 24 : 40, gap: 18, justifyContent: 'space-between' }}>
                <View style={{ gap: 18 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <T variant="eyebrow" color={colors.mutedOnDark}>
                      {project.industry}
                    </T>
                    <StatusBadge status={project.status} />
                  </View>
                  <View accessibilityRole="header" aria-level={2} accessibilityLabel={project.name} style={{ paddingVertical: 4 }}>
                    <ProductLogo slug={project.slug} width={isMobile ? 200 : 260} />
                  </View>
                  <T variant="h3" color={colors.onDark}>
                    {project.headline}
                  </T>
                  <T variant="body" color={colors.mutedOnDark}>
                    {project.summary}
                  </T>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <T variant="body" weight="medium" color={colors.onDark}>
                    Explore {project.name}
                  </T>
                  <View style={{ transform: [{ translateX: hovered ? 4 : 0 }] }}>
                    <ArrowRight size={14} color={colors.accent} />
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      </Pressable>
    </Link>
  );
}
