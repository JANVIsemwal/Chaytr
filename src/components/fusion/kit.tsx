/**
 * Shared "Fusion" building blocks: palette, mono labels, gradient borders, buttons, counters,
 * section titles and framed photos. Used by the home page and the product pages.
 */
import { Link } from 'expo-router';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Image, ImageSourcePropType, Platform, Pressable, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { web, type CanvasDraw } from '@/components/fx';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { fonts } from '@/theme';

/** Deep Tech's cyan + violet lead; Chaitra's saffron is the warm highlight. */
export const C = {
  bg: '#070814',
  bgAlt: '#0A0C1A',
  panel: '#0D1020',
  line: 'rgba(255,255,255,0.08)',
  lineWarm: 'rgba(34,211,238,0.4)',
  text: '#EEF4FF',
  muted: '#93A0BE',
  cyan: '#22D3EE',
  saffron: '#FF9933',
  pink: '#F472B6',
  violet: '#8B5CF6',
  green: '#34D399',
  red: '#F87171',
};
export const MONO = 'JetBrainsMono_400Regular';
export const MONO_B = 'JetBrainsMono_600SemiBold';

/** Soft network for lower sections. */
export const quietNetwork = (w: number, h: number): CanvasDraw => {
  const pts = Array.from({ length: Math.max(20, Math.min(60, Math.floor((w * h) / 22000))) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
  }));
  return (ctx, w, h) => {
    for (const p of pts) {
      p.x = (p.x + p.vx + w) % w;
      p.y = (p.y + p.vy + h) % h;
    }
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 150) {
          ctx.strokeStyle = `rgba(34,211,238,${(1 - d / 150) * 0.18})`;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    ctx.fillStyle = 'rgba(255,153,51,0.6)';
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  };
};

/** Cyan → violet → saffron gradient filling its parent. */
export function Dawn({ id, opacity = 1 }: { id: string; opacity?: number }) {
  return (
    <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} width="100%" height="100%">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={C.cyan} stopOpacity={opacity} />
          <Stop offset="0.5" stopColor={C.violet} stopOpacity={opacity} />
          <Stop offset="1" stopColor={C.saffron} stopOpacity={opacity} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

export function Mono({ children, color = C.muted, size = 12, bold, style }: { children: ReactNode; color?: string; size?: number; bold?: boolean; style?: object }) {
  return (
    <Text
      style={[
        {
          fontFamily: bold ? MONO_B : MONO,
          fontSize: size,
          color,
          letterSpacing: 0.5,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Viewfinder corners. */
export function Brackets({ color = C.lineWarm, size = 14 }: { color?: string; size?: number }) {
  const b = {
    position: 'absolute' as const,
    width: size,
    height: size,
    borderColor: color,
  };
  return (
    <>
      <View style={[b, { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 }]} />
      <View style={[b, { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 }]} />
      <View style={[b, { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 }]} />
      <View style={[b, { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 }]} />
    </>
  );
}

export function CTAButton({ label, href, solid }: { label: string; href: string; solid?: boolean }) {
  return (
    <Link href={href as never} asChild>
      <Pressable>
        {(s) => {
          const hov = (s as { hovered?: boolean }).hovered;
          return (
            <View
              style={[
                {
                  height: 50,
                  paddingHorizontal: 24,
                  borderRadius: 999,
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  borderWidth: solid ? 0 : 1,
                  borderColor: hov ? C.cyan : 'rgba(255,255,255,0.25)',
                  backgroundColor: solid ? undefined : hov ? 'rgba(34,211,238,0.08)' : 'transparent',
                  shadowColor: C.cyan,
                  shadowOpacity: solid && hov ? 0.7 : 0,
                  shadowRadius: 22,
                },
                web({ transitionDuration: '200ms' }),
              ]}
            >
              {solid && <Dawn id={`cta-${label.length}`} />}
              <Text
                style={{
                  fontFamily: MONO_B,
                  fontSize: 14,
                  color: '#FFFFFF',
                  letterSpacing: 0.4,
                }}
              >
                {label}
              </Text>
            </View>
          );
        }}
      </Pressable>
    </Link>
  );
}

/** Counts up from 0 on mount. */
export function Counter({ to, pad = 2, suffix = '' }: { to: number; pad?: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / 1600);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <Text>
      {String(n).padStart(pad, '0')}
      {suffix}
    </Text>
  );
}

/** True once the view has scrolled into sight (always true on native). */
export function useInView<T extends View>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(Platform.OS !== 'web');
  useEffect(() => {
    if (seen || typeof IntersectionObserver === 'undefined' || !ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(ref.current as unknown as Element);
    return () => io.disconnect();
  }, [seen]);
  return { ref, seen };
}

export function SectionTitle({ tag, title, intro }: { tag: string; title: string; intro?: string }) {
  const { isMobile } = useBreakpoint();
  return (
    <View style={{ gap: 14, marginBottom: isMobile ? 32 : 48, maxWidth: 860 }}>
      <Mono color={C.cyan} bold size={13}>
        {tag}
      </Mono>
      <Text
        style={{
          fontFamily: fonts.displayBold,
          fontSize: isMobile ? 30 : 46,
          lineHeight: isMobile ? 36 : 52,
          color: C.text,
          letterSpacing: -1,
        }}
      >
        {title}
      </Text>
      {intro ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 17,
            lineHeight: 27,
            color: C.muted,
            maxWidth: 680,
          }}
        >
          {intro}
        </Text>
      ) : null}
    </View>
  );
}

export function useWrap() {
  const { gutter } = useBreakpoint();
  return {
    width: '100%' as const,
    maxWidth: 1200 + gutter * 2,
    alignSelf: 'center' as const,
    paddingHorizontal: gutter,
  };
}

/** Photo in a rounded frame with a "feed" chip and a caption, like a camera view. */
export function FeedPhoto({ source, aspect, feed, caption, hovered = false }: { source: ImageSourcePropType; aspect: number; feed?: string; caption?: string; hovered?: boolean }) {
  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          width: '100%',
          aspectRatio: aspect,
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: hovered ? C.lineWarm : C.line,
          backgroundColor: '#000',
        }}
      >
        <Image
          source={source}
          accessibilityLabel={caption}
          resizeMode="cover"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            },
            web({
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transitionDuration: '700ms',
            }),
          ]}
        />
        {feed ? (
          <View
            style={[
              {
                position: 'absolute',
                top: 12,
                left: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor: 'rgba(7,8,20,0.72)',
              },
              web({ backdropFilter: 'blur(6px)' }),
            ]}
          >
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: C.saffron,
              }}
            />
            <Mono size={11} color={C.text}>
              {feed.toUpperCase()}
            </Mono>
          </View>
        ) : null}
      </View>
      {caption ? (
        <Mono size={12} style={{ lineHeight: 19 }}>
          {caption}
        </Mono>
      ) : null}
    </View>
  );
}
