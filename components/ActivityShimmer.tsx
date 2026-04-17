import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHIMMER_BAND = 150;

export function ActivityShimmer() {
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

  const ActivityItem = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#ffffff', marginBottom: 12, borderWidth: 1, borderColor: isDark ? '#334155' : '#f1f5f9' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <ShimmerBlock width={48} height={48} borderRadius={12} />
        <View style={{ gap: 8 }}>
          <ShimmerBlock width={140} height={14} borderRadius={4} />
          <ShimmerBlock width={80} height={10} borderRadius={3} />
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <ShimmerBlock width={60} height={16} borderRadius={4} />
        <ShimmerBlock width={40} height={10} borderRadius={3} />
      </View>
    </View>
  );

  return (
    <View style={{ width: '100%' }}>
      <ActivityItem />
      <ActivityItem />
      <ActivityItem />
    </View>
  );
}
