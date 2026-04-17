import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHIMMER_BAND = 150;

export function ReserveShimmer() {
  const isDark = useColorScheme() === 'dark';
  const translateX = useRef(new Animated.Value(-SHIMMER_BAND)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: SCREEN_WIDTH,
          duration: 1800,
          easing: Easing.out(Easing.poly(3)),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -SHIMMER_BAND,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  const baseColor = isDark ? '#1e293b' : '#f1f5f9';
  const streakColor = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.35)';

  const ShimmerBlock = ({ width, height, borderRadius = 8, style }: any) => {
    return (
      <View
        style={[
          { 
            width, 
            height, 
            borderRadius, 
            backgroundColor: baseColor, 
            overflow: 'hidden' 
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
            width: SHIMMER_BAND * 2.5,
            transform: [{ translateX }],
          }}
        >
          <LinearGradient
            colors={['transparent', streakColor, 'transparent']}
            locations={[0.15, 0.5, 0.85]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1, width: '100%', height: '100%' }}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
      {/* Hero Image */}
      <ShimmerBlock width="100%" height={180} borderRadius={32} style={{ marginBottom: 32 }} />

      {/* Title / Name */}
      <View style={{ marginBottom: 32 }}>
        <ShimmerBlock width="70%" height={28} borderRadius={8} />
      </View>

      {/* Schedule Header */}
      <ShimmerBlock width={140} height={24} borderRadius={6} style={{ marginBottom: 24 }} />

      {/* Schedule Card */}
      <ShimmerBlock width="100%" height={140} borderRadius={32} style={{ marginBottom: 40 }} />

      {/* Vehicle Header */}
      <ShimmerBlock width={180} height={24} borderRadius={6} style={{ marginBottom: 24 }} />

      {/* Vehicle Card */}
      <ShimmerBlock width="100%" height={100} borderRadius={32} style={{ marginBottom: 40 }} />

      {/* Price Header */}
      <ShimmerBlock width={160} height={24} borderRadius={6} style={{ marginBottom: 24 }} />

      {/* Price Breakdown Card */}
      <ShimmerBlock width="100%" height={240} borderRadius={40} style={{ marginBottom: 40 }} />
    </View>
  );
}
