import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleProp, View, ViewStyle } from 'react-native';

const useNativeDriver = Platform.OS !== 'web';

/**
 * Fades and lifts its children into place the first time they scroll into view.
 * On native (no IntersectionObserver) it simply animates on mount.
 */
export function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const ref = useRef<View>(null);
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const run = () =>
      Animated.timing(progress, {
        toValue: 1,
        duration: 750,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }).start();

    if (Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined' || !ref.current) {
      run();
      return;
    }
    const node = ref.current as unknown as Element;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [delay, progress]);

  return (
    <Animated.View
      ref={ref}
      style={[
        style,
        {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Looping value between 0 and 1, for pulses and sweeps. */
export function useLoop(duration: number, { reverse = false, delay = 0 } = {}) {
  const [value] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const forward = Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver });
    const back = Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver });
    const seq = reverse
      ? Animated.sequence([Animated.delay(delay), forward, back])
      : Animated.sequence([Animated.delay(delay), Animated.timing(value, { toValue: 1, duration, easing: Easing.out(Easing.quad), useNativeDriver }), Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver })]);
    const loop = Animated.loop(seq);
    loop.start();
    return () => loop.stop();
  }, [value, duration, reverse, delay]);
  return value;
}
