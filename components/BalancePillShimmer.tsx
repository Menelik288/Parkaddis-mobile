import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet } from 'lucide-react-native';

/** Default pill width (Find / Tickets). Override with `width` or `style`. */
export const BALANCE_PILL_DEFAULT_WIDTH = 158;

const BAND = 100;

type BalancePillShimmerProps = {
  isDark: boolean;
  /**
   * Outer width in px. If omitted, uses `BALANCE_PILL_DEFAULT_WIDTH` unless
   * `style` already sets `width`, `flex`, `flexGrow`, or `alignSelf: 'stretch'`.
   */
  width?: number;
  style?: StyleProp<ViewStyle>;
};

export function AmountLineShimmer({ isDark, style }: { isDark: boolean; style?: StyleProp<ViewStyle> }) {
  const translateX = useRef(new Animated.Value(-BAND)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 360,
          duration: 1300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -BAND,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  const track = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)';
  const hi = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(15,23,42,0.12)';

  return (
    <View
      style={[
        {
          marginTop: 4,
          height: 20,
          alignSelf: 'stretch',
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: track,
        },
        style
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: BAND * 2,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={['transparent', hi, 'transparent']}
          locations={[0.15, 0.5, 0.85]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1, width: '100%', height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

function resolveOuterWidth(
  widthProp: number | undefined,
  style: StyleProp<ViewStyle>,
): ViewStyle {
  const flat = style ? StyleSheet.flatten(style) : {};
  const hasFlexibleLayout =
    flat.width != null ||
    flat.flex != null ||
    flat.flexGrow != null ||
    flat.alignSelf === 'stretch';

  if (hasFlexibleLayout) {
    return {};
  }
  if (typeof widthProp === 'number') {
    return { width: widthProp };
  }
  return { width: BALANCE_PILL_DEFAULT_WIDTH };
}

export function BalancePillShimmer({ isDark, width, style }: BalancePillShimmerProps) {
  return (
    <View
      className="flex-row items-center pl-4 pr-1.5 py-2.5 min-h-[52px] rounded-full border border-[#064e3b] gap-3"
      style={[
        {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          ...resolveOuterWidth(width, style),
        },
        style,
      ]}
    >
      <View style={{ flex: 1, minWidth: 0 }} className="justify-center">
        <Text className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">BALANCE</Text>
        <AmountLineShimmer isDark={isDark} />
      </View>
      <View className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}>
        <Wallet size={20} color={isDark ? '#064e3b' : 'white'} />
      </View>
    </View>
  );
}
