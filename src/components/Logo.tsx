import { Link } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

import { COMPANY_NAME } from '@/config/site';

/*
 * Brand artwork (transparent PNGs made from the original logo files):
 *  - logo-mark.png        swirl, for light backgrounds
 *  - logo-mark-dark.png   swirl with solid highlights, for dark backgrounds
 *  - logo-mark-small-dark.png  thicker, brighter swirl with a glow, for small sizes on dark (navbar)
 *  - wordmark-blue.png    "CHAYTR" in brand blue (#4472C4), for light backgrounds
 *  - wordmark-white.png   "CHAYTR" in white, for dark backgrounds
 */
const MARK_LIGHT = require('../../assets/brand/logo-mark.png');
const MARK_DARK = require('../../assets/brand/logo-mark-dark.png');
const MARK_SMALL_DARK = require('../../assets/brand/logo-mark-small-dark.png');
const WORD_BLUE = require('../../assets/brand/wordmark-blue.png');
const WORD_WHITE = require('../../assets/brand/wordmark-white.png');

const WORD_RATIO = 900 / 267; // width / height of the wordmark files
const MARK_RATIO = 720 / 404; // width / height of the swirl files
const SMALL_MARK_RATIO = 360 / 206;

/** Below this wordmark width on dark backgrounds, the thin original swirl gets lost, so use the small-size version. */
const SMALL_BELOW = 200;

type Tone = 'light' | 'dark';

/**
 * The full logo: swirl sitting on top of the wordmark, as in the original artwork.
 * `width` is the width of the wordmark; the swirl and spacing scale with it.
 */
export function LogoArt({ tone = 'dark', width = 120 }: { tone?: Tone; width?: number }) {
  const small = tone === 'dark' && width < SMALL_BELOW;
  const markW = width * (small ? 0.68 : 0.66);
  const markH = markW / (small ? SMALL_MARK_RATIO : MARK_RATIO);
  const wordH = width / WORD_RATIO;
  const overlap = width * (small ? 0.05 : 0.07);
  return (
    <View style={{ width, height: markH + wordH - overlap }} accessibilityRole="image" accessibilityLabel={`${COMPANY_NAME} logo`}>
      <Image
        source={small ? MARK_SMALL_DARK : tone === 'dark' ? MARK_DARK : MARK_LIGHT}
        style={{ position: 'absolute', top: 0, left: width * 0.17, width: markW, height: markH }}
        resizeMode="contain"
      />
      <Image
        source={tone === 'dark' ? WORD_WHITE : WORD_BLUE}
        style={{ position: 'absolute', top: markH - overlap, left: 0, width, height: wordH }}
        resizeMode="contain"
      />
    </View>
  );
}

/** Just the swirl. */
export function LogoMark({ tone = 'dark', width = 80 }: { tone?: Tone; width?: number }) {
  return <Image source={tone === 'dark' ? MARK_DARK : MARK_LIGHT} style={{ width, height: width / MARK_RATIO }} resizeMode="contain" />;
}

/** Logo that links home (navbar, footer, auth pages). */
export function Logo({ tone = 'dark', width = 112, onPress }: { tone?: Tone; width?: number; onPress?: () => void }) {
  return (
    <Link href="/" asChild>
      <Pressable onPress={onPress} accessibilityLabel={`${COMPANY_NAME} home`}>
        <LogoArt tone={tone} width={width} />
      </Pressable>
    </Link>
  );
}
