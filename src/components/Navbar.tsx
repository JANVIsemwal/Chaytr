import { Link, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { web } from '@/components/fx';
import { CloseIcon, MenuIcon } from '@/components/Icons';
import { Container } from '@/components/Layout';
import { Logo } from '@/components/Logo';
import { navLinks } from '@/config/site';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors, fonts, NAV_HEIGHT } from '@/theme';

/** Navigation link with an underline when active. */
function NavLink({ index, label, href, active }: { index: number; label: string; href: string; active: boolean }) {
  return (
    <Link href={href as never} asChild>
      <Pressable>
        {(state) => {
          const hovered = (state as { hovered?: boolean }).hovered;
          return (
            <View style={{ paddingVertical: 6 }}>
              <Text style={[{ fontFamily: fonts.mono, fontSize: 14, color: active || hovered ? colors.text : colors.muted }, web({ transitionDuration: '150ms' })]}>
                {label.toLowerCase()}
              </Text>
              <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1.5, backgroundColor: active ? colors.accent : 'transparent' }} />
            </View>
          );
        }}
      </Pressable>
    </Link>
  );
}

export function Navbar() {
  const { width, isTablet } = useBreakpoint();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const collapsed = width < 980;

  // The mobile menu only exists while the nav is collapsed.
  const menuOpen = collapsed && open;
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <View style={[{ zIndex: 50, backgroundColor: 'rgba(7,8,20,0.92)', borderBottomWidth: 1, borderBottomColor: colors.line }, web({ backdropFilter: 'blur(10px)' })]}>
      <Container style={{ height: NAV_HEIGHT, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo tone="dark" width={130} onPress={() => setOpen(false)} />

        {!collapsed && (
          <View accessibilityRole="menubar" style={{ flexDirection: 'row', gap: isTablet ? 22 : 32 }}>
            {navLinks.map((l, i) => (
              <NavLink key={l.href} index={i} label={l.label} href={l.href} active={isActive(l.href)} />
            ))}
          </View>
        )}

        {!collapsed ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <View>
              <Button label="Get in touch" href="/contact" size="sm" arrow={false} />
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityLabel={menuOpen ? 'Close menu' : 'Open menu'} style={{ padding: 8, marginRight: -8 }}>
              {menuOpen ? <CloseIcon color={colors.text} /> : <MenuIcon color={colors.text} />}
            </Pressable>
          </View>
        )}
      </Container>

      {menuOpen && (
        <View style={{ position: 'absolute', top: NAV_HEIGHT, left: 0, right: 0, height: 10000, backgroundColor: colors.ink }}>
          <Container style={{ paddingTop: 16 }}>
            {navLinks.map((l, i) => (
              <Link key={l.href} href={l.href} asChild>
                <Pressable
                  onPress={() => setOpen(false)}
                  style={{ paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'baseline', gap: 16 }}
                >
                  <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.8, color: isActive(l.href) ? colors.accent : colors.text }}>{l.label}</Text>
                </Pressable>
              </Link>
            ))}
            <View style={{ marginTop: 32, gap: 12 }}>
              <Button label="Get in touch" href="/contact" onPress={() => setOpen(false)} fullWidth />
            </View>
          </Container>
        </View>
      )}
    </View>
  );
}
