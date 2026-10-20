import { Image } from 'react-native';

import { NexPayLogo } from '@/components/product/NexPayLogo';

const BHEDAK = {
  dark: require('../../../assets/brand/bhedak-logo-white.png'),
  light: require('../../../assets/brand/bhedak-logo-black.png'),
  aspect: 811 / 616,
};

/** The भेदक (Bhedak) calligraphic logo. `tone="dark"` is the white version for dark backgrounds. */
export function BhedakLogo({ width = 200, tone = 'dark' }: { width?: number; tone?: 'dark' | 'light' }) {
  return <Image source={BHEDAK[tone]} accessibilityLabel="Bhedak" resizeMode="contain" style={{ width, height: width / BHEDAK.aspect }} />;
}

/**
 * A product's logo at roughly the same visual weight for both products (the Bhedak mark is
 * taller, so it is drawn narrower). Returns null for products without a logo.
 */
export function ProductLogo({ slug, width, tone = 'dark' }: { slug: string; width: number; tone?: 'dark' | 'light' }) {
  if (slug === 'nexpay') return <NexPayLogo width={width} tone={tone} />;
  if (slug === 'bhedak') return <BhedakLogo width={Math.round(width * 0.62)} tone={tone} />;
  return null;
}
