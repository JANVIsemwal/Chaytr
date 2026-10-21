/**
 * Building blocks for the product pages (NexPay, Bhedak) in the same "Fusion" style as the home page.
 */
import { Link } from 'expo-router';
import { ReactNode } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { CanvasLayer, useScramble } from '@/components/fx';
import { Brackets, C, CTAButton, Dawn, Mono, MONO_B, quietNetwork, useWrap } from '@/components/fusion/kit';
import { useLoop } from '@/components/Reveal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { fonts, NAV_HEIGHT } from '@/theme';

/** Top of a product page: breadcrumb, status, decoding name, headline, intro, CTAs and a live visual. */
export function ProductHero({
  slug,
  name,
  kicker,
  status,
  headline,
  intro,
  cta,
  ctaHref,
  secondary,
  visual,
  logo,
}: {
  slug: string;
  name: string;
  /** Mono line under the name/logo, e.g. the device name. */
  kicker?: string;
  status: string;
  headline: string;
  intro: string;
  cta: string;
  ctaHref: string;
  /** Second button; defaults to a link back to all projects. */
  secondary?: { label: string; href: string };
  visual: ReactNode;
  /** Product logo shown instead of the decoded name (the name stays as the accessible heading). */
  logo?: ReactNode;
}) {
  const { isMobile, isTablet } = useBreakpoint();
  const wrap = useWrap();
  const decoded = useScramble(name, 40);
  const kick = useScramble(kicker ? kicker.toUpperCase() : '', 22);

  return (
    <View style={{ backgroundColor: C.bg, overflow: 'hidden', minHeight: isTablet ? undefined : 680 - NAV_HEIGHT / 2 }}>
      <CanvasLayer setup={quietNetwork} />
      <View style={[wrap, { paddingTop: isMobile ? 36 : 64, paddingBottom: isMobile ? 56 : 88, gap: isMobile ? 36 : 48 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/projects" asChild>
            <Pressable>{(s) => <Mono color={(s as { hovered?: boolean }).hovered ? C.cyan : C.muted}>~/projects</Mono>}</Pressable>
          </Link>
          <Mono color={C.muted}>/</Mono>
          <Mono color={C.text}>{slug}</Mono>
        </View>

        <View style={{ flexDirection: isTablet ? 'column' : 'row', gap: isTablet ? 48 : 56, alignItems: isTablet ? 'stretch' : 'center' }}>
          <View style={{ flex: isTablet ? undefined : 1, gap: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Mono color={C.saffron} bold>{`> ${slug}.status`}</Mono>
              <StatusChip status={status} />
            </View>
            {logo ? (
              <View accessibilityRole="header" aria-level={1} accessibilityLabel={name} style={{ paddingVertical: 6 }}>
                {logo}
              </View>
            ) : (
              <Text accessibilityRole="header" aria-level={1} style={{ fontFamily: MONO_B, fontSize: isMobile ? 52 : 84, lineHeight: isMobile ? 58 : 90, color: C.text, letterSpacing: -3 }}>
                {decoded || ' '}
              </Text>
            )}
            {kicker ? (
              <Mono color={C.cyan} bold size={13}>
                {kick}
              </Mono>
            ) : null}
            <Text style={{ fontFamily: fonts.displayBold, fontSize: isMobile ? 26 : 34, lineHeight: isMobile ? 32 : 40, color: C.saffron, letterSpacing: -0.6 }}>{headline}</Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 17, lineHeight: 28, color: C.muted, maxWidth: 560 }}>{intro}</Text>
            <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 12, marginTop: 6 }}>
              <CTAButton label={`${cta.toLowerCase().replace(/\s+/g, '_')}() →`} href={ctaHref} solid />
              <CTAButton label={secondary?.label ?? 'all_projects'} href={secondary?.href ?? '/projects'} />
            </View>
          </View>
          <View style={{ flex: isTablet ? undefined : 1, alignItems: 'center' }}>{visual}</View>
        </View>
      </View>
    </View>
  );
}

export function StatusChip({ status }: { status: string }) {
  const pulse = useLoop(1600, { reverse: true });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: C.lineWarm, backgroundColor: 'rgba(34,211,238,0.08)' }}>
      <Animated.View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.green, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }} />
      <Mono size={11} color={C.text} bold>
        {status.toUpperCase()}
      </Mono>
    </View>
  );
}

const STATE_COLOR = { done: C.green, current: C.saffron, next: C.cyan, later: C.muted } as const;
const STATE_LABEL = { done: 'done', current: 'in progress', next: 'next', later: 'planned' } as const;

/** Vertical roadmap with a pulsing "current" stage. */
export function Roadmap({ stages }: { stages: { title: string; state: keyof typeof STATE_COLOR }[] }) {
  const pulse = useLoop(1400, { reverse: true });
  return (
    <View>
      {stages.map((s, i) => (
        <View key={s.title} style={{ flexDirection: 'row', gap: 18, minHeight: 64 }}>
          <View style={{ alignItems: 'center', width: 18 }}>
            <View style={{ width: 14, height: 14, borderRadius: 7, marginTop: 4, borderWidth: 2, borderColor: STATE_COLOR[s.state], backgroundColor: s.state === 'done' ? C.green : C.bg }}>
              {s.state === 'current' && (
                <Animated.View style={{ position: 'absolute', top: -7, left: -7, width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: C.saffron, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.9] }) }} />
              )}
            </View>
            {i < stages.length - 1 && <View style={{ flex: 1, width: 2, backgroundColor: s.state === 'done' ? C.green : C.line, marginTop: 4 }} />}
          </View>
          <View style={{ flex: 1, paddingBottom: 22, gap: 4 }}>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 18, color: s.state === 'later' ? C.muted : C.text }}>{s.title}</Text>
            <Mono size={11} color={STATE_COLOR[s.state]} bold>
              {STATE_LABEL[s.state].toUpperCase()}
            </Mono>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Closing band: gradient-framed panel with a call to action, over the live network. */
export function ProductCTA({ title, text, cta, href, secondary }: { title: string; text: string; cta: string; href: string; secondary?: { label: string; href: string } }) {
  const { isMobile } = useBreakpoint();
  const wrap = useWrap();
  return (
    <View style={{ backgroundColor: C.bg, borderTopWidth: 1, borderColor: C.line, overflow: 'hidden' }}>
      <CanvasLayer setup={quietNetwork} />
      <View style={[wrap, { paddingVertical: isMobile ? 72 : 112 }]}>
        <View style={{ borderRadius: 26, padding: 1.5, overflow: 'hidden' }}>
          <Dawn id="product-cta" />
          <View style={{ borderRadius: 25, backgroundColor: 'rgba(7,8,20,0.92)', paddingVertical: isMobile ? 48 : 72, paddingHorizontal: isMobile ? 22 : 48, alignItems: 'center', gap: 20, overflow: 'hidden' }}>
            <Brackets />
            <Mono color={C.cyan} bold size={13}>
              {'> ready_to_build?'}
            </Mono>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: isMobile ? 34 : 54, lineHeight: isMobile ? 40 : 60, color: C.text, textAlign: 'center', letterSpacing: -1.2 }}>{title}</Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 17, lineHeight: 27, color: C.muted, textAlign: 'center', maxWidth: 560 }}>{text}</Text>
            <View style={{ marginTop: 8, flexDirection: isMobile ? 'column' : 'row', gap: 12, alignItems: 'center' }}>
              <CTAButton label={`${cta.toLowerCase().replace(/\s+/g, '_')}() →`} href={href} solid />
              {secondary ? <CTAButton label={secondary.label} href={secondary.href} /> : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
