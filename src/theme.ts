/**
 * Design tokens: "Fusion" — Deep Tech's cyan + violet on deep navy, with Chaitra's saffron
 * as the warm highlight. The whole site is dark. Change these values and every page follows.
 */
export const colors = {
  // darkest navy (heroes, navbar, footer)
  ink: '#070814',
  inkSoft: '#0D1020',
  inkRaised: '#151A30',
  // page sections and cards
  paper: '#0A0C1A',
  surface: '#0F1325',
  text: '#EEF4FF',
  muted: '#93A0BE',
  faint: '#6B7894',
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.2)',
  // aliases kept for components written for dark bands
  onDark: '#EEF4FF',
  mutedOnDark: '#93A0BE',
  lineOnDark: 'rgba(255,255,255,0.08)',
  lineStrongOnDark: 'rgba(255,255,255,0.22)',
  // frosted glass
  glass: 'rgba(255,255,255,0.04)',
  glassStrong: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(34,211,238,0.22)',
  // cyan (primary), violet, saffron (warm highlight)
  accent: '#22D3EE',
  accentHover: '#67E8F9',
  accentSoft: 'rgba(34,211,238,0.12)',
  /** Cyan for small text and links. */
  accentInk: '#67E8F9',
  /** Highlighted words in headlines. */
  highlight: '#22D3EE',
  violet: '#8B5CF6',
  saffron: '#FF9933',
  pink: '#F472B6',
  glow: '#8B5CF6',
  glowPink: '#FF9933',
  /** Text on a solid cyan background. */
  onAccent: '#03141A',
  onAccentMuted: '#0E4F5C',
  success: '#34D399',
  danger: '#F87171',
};

/** The signature gradient: cyan → violet → saffron. */
export const GRADIENT = ['#22D3EE', '#8B5CF6', '#FF9933'] as const;

export const fonts = {
  display: 'SpaceGrotesk_500Medium',
  displayBold: 'SpaceGrotesk_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_600SemiBold',
};

export const MAX_WIDTH = 1200;
export const NAV_HEIGHT = 92;
