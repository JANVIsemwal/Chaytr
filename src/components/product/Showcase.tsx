/**
 * Product-page blocks in the style of agnikul.in/product and skyroot.in/mission-prarambh: one idea
 * per screen, big type, big numbers, and details tucked into an accordion until someone asks.
 */
import { ReactNode, useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { web } from '@/components/fx';
import { C, Dawn, Mono, MONO, MONO_B, useInView, useWrap } from '@/components/fusion/kit';
import { Reveal } from '@/components/Reveal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { fonts } from '@/theme';

const useNativeDriver = Platform.OS !== 'web';

/** Full-width section shell. */
function Screen({ children, alt, pad = true }: { children: ReactNode; alt?: boolean; pad?: boolean }) {
  const { isMobile } = useBreakpoint();
  const wrap = useWrap();
  return (
    <View style={{ backgroundColor: alt ? C.bgAlt : C.bg, borderTopWidth: 1, borderColor: C.line, overflow: 'hidden' }}>
      <View style={[wrap, pad && { paddingVertical: isMobile ? 72 : 120 }]}>
        <Reveal>{children}</Reveal>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Statement: one huge sentence, optionally over a full-bleed photo.
// ---------------------------------------------------------------------------

export function Statement({ kicker, big, text, note, image, media }: { kicker?: string; big: string; text: string; note?: string; image?: ReactNode; media?: ReactNode }) {
  const { isMobile, isTablet, width } = useBreakpoint();
  const wrap = useWrap();

  const copy = (
    <View style={{ gap: 18, maxWidth: 760 }}>
      {kicker ? (
        <Mono color={C.cyan} bold size={13}>
          {kicker}
        </Mono>
      ) : null}
      <Text style={{ fontFamily: fonts.displayBold, fontSize: isMobile ? 40 : isTablet ? 56 : 76, lineHeight: isMobile ? 44 : isTablet ? 60 : 80, color: C.text, letterSpacing: -2 }}>{big}</Text>
      <Text style={{ fontFamily: fonts.body, fontSize: isMobile ? 17 : 20, lineHeight: isMobile ? 27 : 31, color: '#C9D3EA', maxWidth: 620 }}>{text}</Text>
      {note ? <Mono size={11}>{note}</Mono> : null}
    </View>
  );

  if (image) {
    // Photo fills the screen; copy sits bottom-left over a dark fade.
    return (
      <View style={{ height: Math.max(isMobile ? 560 : 620, Math.min(820, width * 0.62)), backgroundColor: '#000', overflow: 'hidden', justifyContent: 'flex-end' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{image}</View>
        <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, web({ backgroundImage: 'linear-gradient(90deg, rgba(7,8,20,0.94) 0%, rgba(7,8,20,0.72) 45%, rgba(7,8,20,0.1) 100%), linear-gradient(0deg, rgba(7,8,20,0.9) 0%, rgba(7,8,20,0) 45%)' })]} />
        <View style={[wrap, { paddingBottom: isMobile ? 48 : 88 }]}>
          <Reveal>{copy}</Reveal>
        </View>
      </View>
    );
  }

  return (
    <Screen>
      {copy}
      {media ? <View style={{ marginTop: isMobile ? 36 : 56 }}>{media}</View> : null}
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Parameters: Skyroot-style "mission parameters" — small label, huge value.
// ---------------------------------------------------------------------------

export function Parameters({ tag, title, items, visual, alt }: { tag: string; title: string; items: { label: string; value: string }[]; visual?: ReactNode; alt?: boolean }) {
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <Screen alt={alt}>
      <View style={{ flexDirection: isTablet ? 'column' : 'row', gap: isTablet ? 36 : 72, alignItems: isTablet ? 'stretch' : 'center' }}>
        <View style={{ flex: isTablet ? undefined : 1, gap: 18 }}>
          <Mono color={C.cyan} bold size={13}>
            {tag}
          </Mono>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: isMobile ? 34 : 52, lineHeight: isMobile ? 40 : 58, color: C.text, letterSpacing: -1.5 }}>{title}</Text>
          {visual ? <View style={{ marginTop: 18 }}>{visual}</View> : null}
        </View>
        <View style={{ flex: isTablet ? undefined : 1 }}>
          {items.map((it, i) => (
            <View key={it.label} style={{ paddingVertical: isMobile ? 18 : 24, borderTopWidth: i === 0 ? 0 : 1, borderColor: C.line, gap: 6 }}>
              <Mono size={12} color={C.muted}>
                {it.label.toUpperCase()}
              </Mono>
              <Text style={{ fontFamily: MONO_B, fontSize: isMobile ? 34 : 50, lineHeight: isMobile ? 40 : 58, color: C.text, letterSpacing: -1.5 }}>{it.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Step explorer: pick a step (or let it play); one big panel shows it.
// ---------------------------------------------------------------------------

type IconName = 'plane' | 'wallet' | 'qr' | 'cashout' | 'sweep' | 'sense' | 'alert';

function StepIcon({ name, size = 120 }: { name: IconName; size?: number }) {
  const s = { stroke: C.cyan, strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const a = { stroke: C.saffron, strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {name === 'plane' && (
        <>
          <Path d="M32 6 C34 6 35 9 35 12 V26 L56 38 V43 L35 36 V50 L42 55 V59 L32 56 L22 59 V55 L29 50 V36 L8 43 V38 L29 26 V12 C29 9 30 6 32 6 Z" transform="rotate(45 32 32)" {...s} />
          <Path d="M6 60 H26" {...a} />
        </>
      )}
      {name === 'wallet' && (
        <>
          <Rect x={8} y={18} width={46} height={32} rx={6} {...s} />
          <Path d="M40 30 H56 V40 H40 a5 5 0 0 1 0 -10 Z" {...s} />
          <Path d="M14 12 L44 12" {...a} />
        </>
      )}
      {name === 'qr' && (
        <>
          <Rect x={8} y={8} width={18} height={18} rx={2} {...s} />
          <Rect x={38} y={8} width={18} height={18} rx={2} {...s} />
          <Rect x={8} y={38} width={18} height={18} rx={2} {...s} />
          <Path d="M38 38 H46 V46 M56 38 V56 H46 M38 52 V56" {...a} />
        </>
      )}
      {name === 'cashout' && (
        <>
          <Rect x={8} y={24} width={48} height={28} rx={4} {...s} />
          <Circle cx={32} cy={38} r={6} {...s} />
          <Path d="M32 18 V4 M25 11 L32 4 L39 11" {...a} />
        </>
      )}
      {name === 'sweep' && (
        <>
          <Path d="M32 56 L12 16 A40 40 0 0 1 52 16 Z" {...s} />
          <Path d="M32 56 L40 14" {...a} />
        </>
      )}
      {name === 'sense' && (
        <>
          <Path d="M6 32 H18 L22 20 L28 44 L32 32 H40" {...s} />
          <Path d="M40 32 C44 22 48 22 52 32 S58 42 60 32" {...a} />
        </>
      )}
      {name === 'alert' && (
        <>
          <Rect x={24} y={20} width={16} height={34} rx={6} {...s} />
          <Path d="M14 26 C10 32 10 38 14 44 M50 26 C54 32 54 38 50 44 M8 22 C2 32 2 40 8 48 M56 22 C62 32 62 40 56 48" {...a} />
        </>
      )}
    </Svg>
  );
}

export function StepExplorer({ tag, title, steps, interval = 4200 }: { tag: string; title: string; steps: { title: string; text: string; icon: IconName }[]; interval?: number }) {
  const { isMobile, isTablet } = useBreakpoint();
  const { ref, seen } = useInView<View>();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!seen || paused) return;
    progress.setValue(0);
    const anim = Animated.timing(progress, { toValue: 1, duration: interval, easing: Easing.linear, useNativeDriver: false });
    anim.start(({ finished }) => finished && setActive((a) => (a + 1) % steps.length));
    return () => anim.stop();
  }, [seen, paused, active, interval, steps.length, progress]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver }).start();
  }, [active, fade]);

  const st = steps[active];
  return (
    <Screen alt>
      <View ref={ref} style={{ gap: isMobile ? 28 : 44 }}>
        <View style={{ gap: 14 }}>
          <Mono color={C.cyan} bold size={13}>
            {tag}
          </Mono>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: isMobile ? 34 : 52, lineHeight: isMobile ? 40 : 58, color: C.text, letterSpacing: -1.5 }}>{title}</Text>
        </View>
        <View style={{ flexDirection: isTablet ? 'column' : 'row', gap: isTablet ? 20 : 40 }}>
          {/* step list */}
          <View style={{ flex: isTablet ? undefined : 0.9, flexDirection: isTablet ? 'row' : 'column', flexWrap: isTablet ? 'wrap' : 'nowrap', gap: isTablet ? 8 : 0 }}>
            {steps.map((s, i) => {
              const on = i === active;
              return (
                <Pressable
                  key={s.title}
                  onPress={() => {
                    setActive(i);
                    setPaused(true);
                  }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  style={isTablet ? { flexGrow: 1 } : undefined}
                >
                  {(state) => (
                    <View style={[{ paddingVertical: isTablet ? 12 : 22, paddingHorizontal: isTablet ? 14 : 4, borderBottomWidth: isTablet ? 0 : 1, borderWidth: isTablet ? 1 : 0, borderRadius: isTablet ? 12 : 0, borderColor: isTablet && on ? C.cyan : C.line, flexDirection: 'row', alignItems: 'center', gap: 16, opacity: on || (state as { hovered?: boolean }).hovered ? 1 : 0.55 }, web({ transitionDuration: '250ms' })]}>
                      <Text style={{ fontFamily: fonts.displayBold, fontSize: isTablet ? 16 : 24, color: C.text }}>{s.title}</Text>
                      {!isTablet && on && (
                        <View style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, backgroundColor: C.line, overflow: 'hidden' }}>
                          <Animated.View style={{ height: 2, backgroundColor: C.cyan, width: paused ? '100%' : progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
                        </View>
                      )}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
          {/* big panel */}
          <View style={{ flex: isTablet ? undefined : 1.3, minHeight: isMobile ? 300 : 380, borderRadius: 24, padding: 1.5, overflow: 'hidden' }}>
            <Dawn id="step-panel" opacity={0.6} />
            <View style={{ flex: 1, borderRadius: 23, backgroundColor: C.panel, padding: isMobile ? 26 : 44, justifyContent: 'space-between', gap: 24, overflow: 'hidden' }}>
              <Animated.View style={{ opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
                <StepIcon name={st.icon} size={isMobile ? 84 : 120} />
              </Animated.View>
              <Animated.View style={{ gap: 12, opacity: fade }}>
                <Text style={{ fontFamily: fonts.displayBold, fontSize: isMobile ? 28 : 40, lineHeight: isMobile ? 34 : 46, color: C.text, letterSpacing: -1 }}>{st.title}</Text>
                <Text style={{ fontFamily: fonts.body, fontSize: isMobile ? 16 : 19, lineHeight: isMobile ? 25 : 29, color: C.muted, maxWidth: 520 }}>{st.text}</Text>
              </Animated.View>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Accordion: questions people actually ask; answers open on demand.
// ---------------------------------------------------------------------------

function AccordionRow({ index, q, a, open, onToggle }: { index: number; q: string; a: ReactNode; open: boolean; onToggle: () => void }) {
  const { isMobile } = useBreakpoint();
  const [v] = useState(() => new Animated.Value(open ? 1 : 0));
  useEffect(() => {
    Animated.timing(v, { toValue: open ? 1 : 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver }).start();
  }, [open, v]);
  return (
    <View style={{ borderTopWidth: 1, borderColor: C.line }}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        {(state) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMobile ? 14 : 24, paddingVertical: isMobile ? 20 : 28 }}>
            <Text style={[{ flex: 1, fontFamily: fonts.displayBold, fontSize: isMobile ? 19 : 26, lineHeight: isMobile ? 25 : 32, color: open || (state as { hovered?: boolean }).hovered ? C.text : '#C9D3EA' }, web({ transitionDuration: '200ms' })]}>{q}</Text>
            <Animated.Text style={{ fontFamily: MONO, fontSize: 28, color: open ? C.cyan : C.muted, transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }] }}>+</Animated.Text>
          </View>
        )}
      </Pressable>
      {open && (
        <Animated.View style={{ opacity: v, paddingLeft: 0, paddingRight: isMobile ? 0 : 56, paddingBottom: isMobile ? 24 : 34 }}>
          {typeof a === 'string' ? <Text style={{ fontFamily: fonts.body, fontSize: isMobile ? 16 : 18, lineHeight: isMobile ? 26 : 29, color: C.muted, maxWidth: 760 }}>{a}</Text> : a}
        </Animated.View>
      )}
    </View>
  );
}
export function Accordion({ tag, title, items }: { tag: string; title: string; items: { q: string; a: ReactNode }[] }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Screen>
      <View style={{ flexDirection: isTablet ? 'column' : 'row', gap: isTablet ? 28 : 72 }}>
        <View style={{ width: isTablet ? undefined : 340, gap: 14 }}>
          <Mono color={C.cyan} bold size={13}>
            {tag}
          </Mono>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: isMobile ? 34 : 46, lineHeight: isMobile ? 40 : 52, color: C.text, letterSpacing: -1.2 }}>{title}</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: C.muted }}>Open only what matters to you.</Text>
        </View>
        <View style={{ flex: isTablet ? undefined : 1, borderBottomWidth: 1, borderColor: C.line }}>
          {items.map((it, i) => (
            <AccordionRow key={it.q} index={i} q={it.q} a={it.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

/** Three short beats in a row (e.g. Sweep · Sense · Alert) under a visual. */
export function Beats({ tag, title, visual, beats }: { tag: string; title: string; visual?: ReactNode; beats: { title: string; text: string; icon: IconName }[] }) {
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <Screen alt>
      <View style={{ gap: 14, marginBottom: isMobile ? 28 : 44 }}>
        <Mono color={C.cyan} bold size={13}>
          {tag}
        </Mono>
        <Text style={{ fontFamily: fonts.displayBold, fontSize: isMobile ? 34 : 52, lineHeight: isMobile ? 40 : 58, color: C.text, letterSpacing: -1.5, maxWidth: 900 }}>{title}</Text>
      </View>
      {visual}
      <View style={{ flexDirection: isTablet ? 'column' : 'row', gap: isTablet ? 28 : 48, marginTop: isMobile ? 32 : 48 }}>
        {beats.map((b) => (
          <View key={b.title} style={{ flex: isTablet ? undefined : 1, flexDirection: 'row', gap: 18 }}>
            <StepIcon name={b.icon} size={52} />
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 24, color: C.text }}>{b.title}</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: C.muted }}>{b.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

export type { IconName };
