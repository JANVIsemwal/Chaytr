import { Link, type Href } from 'expo-router';
import { useId } from 'react';
import { Pressable, Text, View } from 'react-native';

import { GradientFill, web } from '@/components/fx';
import { ArrowRight } from '@/components/Icons';
import { colors, fonts } from '@/theme';

type Variant = 'primary' | 'outline' | 'link';

type ButtonProps = {
  label: string;
  href?: Href;
  onPress?: () => void;
  /** primary = gradient pill, outline = bordered pill, link = text link. */
  variant?: Variant;
  /** Kept for older call sites; every surface is dark now, so it no longer changes the look. */
  tone?: 'light' | 'dark';
  arrow?: boolean;
  size?: 'md' | 'sm';
  disabled?: boolean;
  fullWidth?: boolean;
};

export function Button({ label, href, onPress, variant = 'primary', arrow = variant !== 'outline', size = 'md', disabled, fullWidth }: ButtonProps) {
  const gid = `btn${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  // Styling lives on the inner View: Link's asChild merges its own `style` into the
  // Pressable, which would drop a style function.
  const pressable = (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole={href ? 'link' : 'button'} style={{ alignSelf: fullWidth ? 'stretch' : 'flex-start' }}>
      {(state) => {
        const active = (state as { hovered?: boolean }).hovered || state.pressed;
        const color = variant === 'link' ? colors.accentInk : '#FFFFFF';
        const content = (
          <>
            <Text style={{ fontFamily: fonts.monoBold, fontSize: size === 'sm' ? 13 : 14, color, letterSpacing: 0.2 }}>{label}</Text>
            {arrow && (
              <View style={{ transform: [{ translateX: active ? 3 : 0 }] }}>
                <ArrowRight size={14} color={color} />
              </View>
            )}
          </>
        );

        if (variant === 'link') {
          return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: active ? 0.75 : 1 }}>{content}</View>;
        }
        return (
          <View
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                height: size === 'sm' ? 40 : 52,
                paddingHorizontal: size === 'sm' ? 18 : 26,
                borderRadius: 999,
                overflow: 'hidden',
                opacity: disabled ? 0.5 : 1,
              },
              variant === 'primary'
                ? { shadowColor: colors.accent, shadowOpacity: active ? 0.6 : 0, shadowRadius: 20 }
                : {
                    borderWidth: 1,
                    borderColor: active ? colors.accent : colors.lineStrong,
                    backgroundColor: active ? colors.accentSoft : 'transparent',
                  },
              web({ transitionDuration: '200ms' }),
            ]}
          >
            {variant === 'primary' && <GradientFill id={gid} opacity={active ? 0.85 : 1} />}
            {/* wrapper keeps the label above the gradient layer on web */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>{content}</View>
          </View>
        );
      }}
    </Pressable>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        {pressable}
      </Link>
    );
  }
  return pressable;
}
