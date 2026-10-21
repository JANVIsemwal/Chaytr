import { useState } from 'react';
import { Image, ImageSourcePropType, Pressable, Text, View } from 'react-native';

import { Backdrop } from '@/components/Backdrop';
import { ClosingBanner } from '@/components/ClosingBanner';
import { C, Mono } from '@/components/fusion/kit';
import { web } from '@/components/fx';
import { DomainIcon } from '@/components/Icons';
import { Container, Grid, Section } from '@/components/Layout';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader';
import { Eyebrow, T } from '@/components/Typography';
import { about, COMPANY_NAME, domains, team } from '@/config/site';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors, fonts, MAX_WIDTH } from '@/theme';

/** Two-column row: label on the left, content on the right (stacks on smaller screens). */
function Split({ label, children }: { label: string; children: React.ReactNode }) {
  const { isTablet } = useBreakpoint();
  return (
    <View style={{ flexDirection: isTablet ? 'column' : 'row', gap: isTablet ? 28 : 48 }}>
      <View style={{ width: isTablet ? undefined : 320 }}>
        <Eyebrow>{label}</Eyebrow>
      </View>
      <View style={{ flex: isTablet ? undefined : 1 }}>{children}</View>
    </View>
  );
}

/** One person: square portrait, name and role. Every card is exactly the same size. */
function TeamCard({ name, role, photo, width }: { name: string; role: string; photo: ImageSourcePropType; width: number }) {
  const { isMobile } = useBreakpoint();
  return (
    <Pressable style={{ width }} accessibilityLabel={`${name}, ${role}`}>
      {(state) => {
        const hovered = (state as { hovered?: boolean }).hovered;
        return (
          <View style={{ gap: 14 }}>
            <View style={[{ width: '100%', aspectRatio: 1, borderRadius: 18, overflow: 'hidden', borderWidth: 1.5, borderColor: hovered ? C.cyan : C.line, backgroundColor: '#000' }, web({ transitionDuration: '300ms' })]}>
              <Image
                source={photo}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
                style={[{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }, web({ transform: hovered ? 'scale(1.04)' : 'scale(1)', transitionDuration: '600ms' })]}
              />
            </View>
            {/* same text space on every card so the cards line up, even when a long name wraps */}
            <View style={{ gap: 6, minHeight: isMobile ? 84 : 56 }}>
              <Text style={{ fontFamily: fonts.displayBold, fontSize: isMobile ? 17 : 19, lineHeight: isMobile ? 22 : 24, color: C.text }}>{name}</Text>
              <Mono size={12} bold color={C.cyan}>
                {role.toUpperCase()}
              </Mono>
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}

/** Wraps the cards in equal columns (5 / 3 / 2); a short last row is centred, never stretched. */
function TeamGrid() {
  const { width, gutter, isMobile } = useBreakpoint();
  // measured width of the row (falls back to an estimate before the first layout)
  const [inner, setInner] = useState(0);
  const avail = inner || Math.min(width - gutter * 2, MAX_WIDTH);
  const cols = avail >= 1000 ? 5 : avail >= 620 ? 3 : 2;
  const gap = isMobile ? 16 : 24;
  const cardW = Math.floor((avail - gap * (cols - 1)) / cols) - 1;
  return (
    <View onLayout={(e) => setInner(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: gap, rowGap: isMobile ? 28 : 40 }}>
      {team.map((m) => (
        <TeamCard key={m.name} name={m.name} role={m.role} photo={m.photo} width={cardW} />
      ))}
    </View>
  );
}

export default function About() {
  const { isMobile, isTablet, sectionY } = useBreakpoint();

  return (
    <Page
      title={`About Us | ${COMPANY_NAME}`}
      description={`${about.mission} Learn about the team and values behind ${COMPANY_NAME}.`}
    >
      <PageHeader title={about.headline} highlight="feel simple." />

      {/* story */}
      <Section>
        <View style={{ flexDirection: isTablet ? 'column' : 'row', gap: isTablet ? 24 : 48 }}>
          <View style={{ width: isTablet ? undefined : 320 }}>
            <Eyebrow>Our story</Eyebrow>
          </View>
          <View style={{ flex: isTablet ? undefined : 1, gap: 20 }}>
            <T variant="h2" style={{ fontSize: isMobile ? 24 : 34, lineHeight: isMobile ? 32 : 44 }}>
              {about.story}
            </T>
          </View>
        </View>
      </Section>

      {/* mission & vision */}
      <View style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
        <Backdrop glows={[{ x: '50%', y: '115%', r: '65%', color: colors.violet, opacity: 0.4 }, { x: '100%', y: '0%', r: '40%', color: colors.saffron, opacity: 0.14 }]} />
        <Container style={{ paddingVertical: sectionY }}>
          <View style={{ flexDirection: isTablet ? 'column' : 'row', gap: isTablet ? 56 : 0 }}>
            {[
              { label: 'Mission', text: about.mission },
              { label: 'Vision', text: about.vision },
            ].map((m, i) => (
              <View
                key={m.label}
                style={{
                  flex: isTablet ? undefined : 1,
                  gap: 24,
                  paddingRight: !isTablet && i === 0 ? 56 : 0,
                  paddingLeft: !isTablet && i === 1 ? 56 : 0,
                  borderLeftWidth: !isTablet && i === 1 ? 1 : 0,
                  borderLeftColor: colors.lineOnDark,
                }}
              >
                <Eyebrow>{m.label}</Eyebrow>
                <T variant="h2" color={colors.onDark}>
                  {m.text}
                </T>
              </View>
            ))}
          </View>
        </Container>
      </View>

      {/* what we work on */}
      <Section>
        <Split label="What we work on">
          <View>
            {about.workOn.map((w, i) => (
              <View
                key={w}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: isMobile ? 16 : 28,
                  paddingVertical: isMobile ? 20 : 26,
                  borderTopWidth: 1,
                  borderTopColor: i === 0 ? colors.text : colors.line,
                  borderBottomWidth: i === about.workOn.length - 1 ? 1 : 0,
                  borderBottomColor: colors.line,
                }}
              >
                <T variant="h2" style={{ flex: 1 }}>
                  {w}
                </T>
                <DomainIcon domain={domains[i].key} size={isMobile ? 32 : 40} />
              </View>
            ))}
          </View>
        </Split>
      </Section>

      {/* what makes us different */}
      <Section tone="surface" divider>
        <Split label="What makes us different">
          <Grid columns={isMobile ? 1 : 3} gap={isMobile ? 32 : 32}>
            {about.different.map((d) => (
              <View key={d.title} style={{ gap: 12, borderTopWidth: 2, borderTopColor: colors.accent, paddingTop: 20 }}>
                <T variant="h3">{d.title}</T>
                <T variant="body">{d.text}</T>
              </View>
            ))}
          </Grid>
        </Split>
      </Section>

      {/* values */}
      <Section divider>
        <View style={{ gap: 20, marginBottom: isMobile ? 40 : 64, maxWidth: 640 }}>
          <Eyebrow>Our values</Eyebrow>
          <T variant="h2">What we hold ourselves to.</T>
        </View>
        <Grid columns={isMobile ? 1 : 2} gap={isMobile ? 12 : 20}>
          {about.values.map((v, i) => (
            <View
              key={v.title}
              style={{
                flex: 1,
                padding: isMobile ? 24 : 36,
                borderRadius: 16,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.line,
                gap: isMobile ? 24 : 48,
              }}
            >
              <View style={{ gap: 8 }}>
                <T variant="h3" style={{ fontSize: isMobile ? 22 : 26, lineHeight: isMobile ? 28 : 32 }}>
                  {v.title}
                </T>
                <T variant="body">{v.text}</T>
              </View>
            </View>
          ))}
        </Grid>
      </Section>

      {/* how we work */}
      <Section divider>
        <View style={{ gap: 20, marginBottom: isMobile ? 40 : 64, maxWidth: 640 }}>
          <Eyebrow>How we work</Eyebrow>
          <T variant="h2">From a real problem to a product people use.</T>
        </View>
        <View style={{ flexDirection: isTablet ? 'column' : 'row' }}>
          {about.process.map((p, i) => {
            const last = i === about.process.length - 1;
            return (
              <View key={p.title} style={{ flex: isTablet ? undefined : 1, flexDirection: isTablet ? 'row' : 'column', gap: isTablet ? 20 : 24 }}>
                {/* step marker + connecting line */}
                <View style={{ flexDirection: isTablet ? 'column' : 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: last ? colors.accent : colors.paper,
                      borderWidth: 1,
                      borderColor: last ? colors.accent : colors.text,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <T variant="small" weight="semibold" color={last ? colors.onAccent : colors.text}>
                      {i + 1}
                    </T>
                  </View>
                  {!last && (
                    <View
                      style={
                        isTablet
                          ? { width: 1, flex: 1, minHeight: 40, backgroundColor: colors.line }
                          : { height: 1, flex: 1, backgroundColor: colors.line }
                      }
                    />
                  )}
                </View>
                <View style={{ gap: 8, paddingRight: isTablet ? 0 : 24, paddingBottom: isTablet && !last ? 32 : 0, flex: isTablet ? 1 : undefined }}>
                  <T variant="h3">{p.title}</T>
                  <T variant="body">{p.text}</T>
                </View>
              </View>
            );
          })}
        </View>
      </Section>

      {/* team: equal cards for everyone */}
      {team.length > 0 && (
        <Section divider>
          <View style={{ gap: 20, marginBottom: isMobile ? 36 : 56 }}>
            <Eyebrow>Team</Eyebrow>
            <T variant="h2">The people behind {COMPANY_NAME}</T>
          </View>
          <TeamGrid />
        </Section>
      )}

      <ClosingBanner />
    </Page>
  );
}
