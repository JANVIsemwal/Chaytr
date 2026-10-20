import Svg, { G, Path, Polygon } from 'react-native-svg';

import { NEXPAY_LOGO } from '@/components/product/nexpayLogoData';

/**
 * The NexPay logo (green ▼ + NEXPAY + red ▲), optionally with the "NEXT WAY TO PAY" tagline.
 * `tone="dark"` gives white letters for dark backgrounds.
 */
export function NexPayLogo({ width = 240, tone = 'dark', tagline = false }: { width?: number; tone?: 'dark' | 'light'; tagline?: boolean }) {
  const box = tagline ? NEXPAY_LOGO.full : NEXPAY_LOGO.word;
  const fg = tone === 'dark' ? '#FFFFFF' : '#000000';
  return (
    <Svg width={width} height={(width * box.h) / box.w} viewBox={`0 0 ${box.w} ${box.h}`} accessibilityLabel={tagline ? 'NexPay: next way to pay' : 'NexPay'}>
      <G fill={fg}>
        {NEXPAY_LOGO.letters.map((d, i) => (
          <Path key={i} d={d} />
        ))}
        {tagline && NEXPAY_LOGO.tagline.map((d, i) => <Path key={`t${i}`} d={d} />)}
      </G>
      <Polygon points={NEXPAY_LOGO.green} fill="#00BF63" />
      <Polygon points={NEXPAY_LOGO.red} fill="#FF3131" />
    </Svg>
  );
}
