import { Link } from 'expo-router';
import { Linking, Pressable, Text, View } from 'react-native';

import { Container } from '@/components/Layout';
import { Logo } from '@/components/Logo';
import { T } from '@/components/Typography';
import { COMPANY_NAME, contact, domains, navLinks, TAGLINE } from '@/config/site';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors, fonts } from '@/theme';

function FooterLink({ label, href, onPress }: { label: string; href?: string; onPress?: () => void }) {
  const inner = (
    <Pressable onPress={onPress}>
      {(state) => (
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 14,
            lineHeight: 22,
            color: (state as { hovered?: boolean }).hovered ? colors.accent : colors.muted,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
  return href ? (
    <Link href={href as never} asChild>
      {inner}
    </Link>
  ) : (
    inner
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 14, minWidth: 140 }}>
      <T variant="eyebrow" color={colors.faint}>
        {title}
      </T>
      {children}
    </View>
  );
}

export function Footer() {
  const { isMobile, isTablet } = useBreakpoint();

  return (
    <View style={{ backgroundColor: colors.ink, borderTopWidth: 1, borderTopColor: colors.lineOnDark }}>
      <Container style={{ paddingTop: isMobile ? 56 : 80, paddingBottom: 32 }}>
        <View style={{ flexDirection: isTablet ? 'column' : 'row', justifyContent: 'space-between', gap: 48 }}>
          <View style={{ gap: 16, maxWidth: 360 }}>
            <Logo tone="dark" width={160} />
            <T variant="body" color={colors.mutedOnDark}>
              {COMPANY_NAME}. {TAGLINE}
            </T>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: isMobile ? 40 : 72 }}>
            <Column title="Company">
              {navLinks.map((l) => (
                <FooterLink key={l.href} label={l.label} href={l.href} />
              ))}
            </Column>
            <Column title="Contact">
              <FooterLink label={contact.email} onPress={() => Linking.openURL(`mailto:${contact.email}`)} />
              <FooterLink label={contact.phone} onPress={() => Linking.openURL(`tel:${contact.phoneTel}`)} />
            </Column>
            <Column title="Legal">
              <FooterLink label="Privacy Policy" href="/privacy" />
              <FooterLink label="Terms of Use" href="/terms" />
            </Column>
          </View>
        </View>

        <View
          style={{
            marginTop: isMobile ? 56 : 96,
            paddingTop: 24,
            borderTopWidth: 1,
            borderTopColor: colors.lineOnDark,
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.faint }}>
            © {new Date().getFullYear()} {COMPANY_NAME.toUpperCase()} · named after चैत्र, the month the Indian year begins
          </Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.faint }}>
            {domains.map((d) => d.tab).join(' · ')} · <Text style={{ color: colors.success }}>all systems nominal</Text>
          </Text>
        </View>
      </Container>
    </View>
  );
}
