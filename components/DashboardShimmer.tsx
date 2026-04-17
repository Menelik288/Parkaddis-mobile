import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHIMMER_BAND = 140;

export function DashboardShimmer() {
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
    <View style={{ paddingTop: 8 }}>
      {/* Welcome Section */}
      <View style={{ marginBottom: 32 }}>
        <ShimmerBlock width={100} height={11} borderRadius={4} style={{ marginBottom: 12, opacity: 0.6 }} />
        <ShimmerBlock width={220} height={32} borderRadius={12} />
      </View>

      {/* Hero Card (Search or Active) */}
      <View 
        style={{ 
          marginBottom: 32,
          padding: 24,
          borderRadius: 40,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderWidth: 1,
          borderColor: isDark ? '#334155' : '#f1f5f9',
          alignItems: 'center'
        }}
      >
        {/* Mock Search Bar */}
        <ShimmerBlock 
          width="100%" 
          height={64} 
          borderRadius={24} 
          style={{ marginBottom: 24, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }} 
        />
        
        {/* Mock Content */}
        <ShimmerBlock width={56} height={56} borderRadius={28} style={{ marginBottom: 16, opacity: 0.8 }} />
        <ShimmerBlock width={160} height={20} borderRadius={6} style={{ marginBottom: 24 }} />
        <ShimmerBlock width={200} height={52} borderRadius={16} style={{ opacity: 0.9 }} />
      </View>

      {/* Recent Activity Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <ShimmerBlock width={160} height={28} borderRadius={8} />
        <ShimmerBlock width={60} height={14} borderRadius={4} />
      </View>

      {/* List Items (Matching RecentHistoryItem) */}
      <View style={{ gap: 12 }}>
        {[1, 2, 3].map((key) => (
          <View 
            key={key} 
            style={{ 
              padding: 20, 
              borderRadius: 28, 
              borderWidth: 1, 
              borderColor: isDark ? '#334155' : '#f1f5f9',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: isDark ? '#1e293b' : '#ffffff'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <ShimmerBlock width={48} height={48} borderRadius={16} />
              <View style={{ flex: 1, gap: 8 }}>
                <ShimmerBlock width="85%" height={16} borderRadius={4} />
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <ShimmerBlock width={50} height={12} borderRadius={4} />
                  <ShimmerBlock width={70} height={12} borderRadius={4} style={{ opacity: 0.5 }} />
                </View>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', marginLeft: 16 }}>
              <ShimmerBlock width={80} height={24} borderRadius={6} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
