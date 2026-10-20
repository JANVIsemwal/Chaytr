import { Text, View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';

import { colors, fonts } from '@/theme';

const mono = { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.2, color: colors.mutedOnDark };

/** Decorative wallet screen for NexPay. Illustrative only — no real figures. */
export function WalletMock({ width = 300 }: { width?: number }) {
  return (
    <View
      style={{
        width,
        borderRadius: 36,
        borderWidth: 1,
        borderColor: colors.lineStrongOnDark,
        backgroundColor: colors.ink,
        padding: 10,
      }}
      accessibilityLabel="Illustration of the NexPay wallet app"
    >
      <View style={{ borderRadius: 28, backgroundColor: colors.inkSoft, padding: 22, gap: 22, overflow: 'hidden' }}>
        <View style={{ alignSelf: 'center', width: 72, height: 6, borderRadius: 3, backgroundColor: colors.inkRaised }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 18, color: colors.onDark, letterSpacing: -0.4 }}>NexPay</Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: colors.inkRaised }}>
            <Text style={[mono, { fontSize: 10 }]}>VISITOR</Text>
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={mono}>WALLET BALANCE</Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 36, color: colors.onDark, letterSpacing: -1 }}>₹ 4,250.00</Text>
        </View>

        <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.lineStrongOnDark, padding: 14, gap: 4 }}>
          <Text style={mono}>TEMPORARY UPI ID</Text>
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.onDark }}>guest@nexpay</Text>
        </View>

        {/* scan to pay */}
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 6 }}>
          <Svg width={120} height={120} viewBox="0 0 120 120">
            <Path d="M4 28V4h24M92 4h24v24M116 92v24H92M28 116H4V92" stroke={colors.accent} strokeWidth={3} fill="none" />
            {/* stylised QR: three finder squares plus deterministic modules */}
            {[
              [20, 20],
              [76, 20],
              [20, 76],
            ].map(([x, y]) => (
              <G key={`${x}-${y}`}>
                <Rect x={x} y={y} width={24} height={24} stroke={colors.onDark} strokeWidth={3.4} fill="none" />
                <Rect x={x + 7} y={y + 7} width={10} height={10} fill={colors.onDark} />
              </G>
            ))}
            {Array.from({ length: 100 }).map((_, i) => {
              const x = i % 10;
              const y = Math.floor(i / 10);
              const inFinder = (x < 3 && y < 3) || (x > 6 && y < 3) || (x < 3 && y > 6);
              const on = !inFinder && (x * 13 + y * 7 + x * y * 3) % 5 < 2;
              return on ? <Rect key={i} x={20 + x * 8} y={20 + y * 8} width={7} height={7} fill={colors.onDark} opacity={0.9} /> : null;
            })}
          </Svg>
          <Text style={mono}>SCAN ANY UPI QR</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['Add money', 'Pay', 'Withdraw'].map((l, i) => (
            <View
              key={l}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 99,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: i === 1 ? colors.accent : colors.inkRaised,
              }}
            >
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: i === 1 ? colors.onAccent : colors.onDark }}>{l}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
