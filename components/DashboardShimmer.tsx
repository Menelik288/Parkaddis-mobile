import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, useColorScheme } from 'react-native';

export function DashboardShimmer() {
  const isDark = useColorScheme() === 'dark';
  const animValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animValue]);

  const baseColor = isDark ? '#1e293b' : '#f1f5f9';

  const ShimmerBlock = ({ width, height, borderRadius = 8, style }: any) => (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: baseColor, opacity: animValue },
        style
      ]}
    />
  );

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 32 }}>
      {/* Welcome Section */}
      <View style={{ marginBottom: 32 }}>
        <ShimmerBlock width={100} height={12} borderRadius={4} style={{ marginBottom: 8 }} />
        <ShimmerBlock width={200} height={32} borderRadius={8} />
      </View>

      {/* Main Card (Search or Active Session) */}
      <View style={{ marginBottom: 32 }}>
        <ShimmerBlock width="100%" height={160} borderRadius={40} />
      </View>

      {/* Recent Activity Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <ShimmerBlock width={140} height={28} borderRadius={6} />
        <ShimmerBlock width={60} height={20} borderRadius={4} />
      </View>

      {/* List Items */}
      <View style={{ gap: 16 }}>
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
              alignItems: 'center'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <ShimmerBlock width={48} height={48} borderRadius={16} />
              <View style={{ flex: 1, gap: 8 }}>
                <ShimmerBlock width="80%" height={16} borderRadius={4} />
                <ShimmerBlock width="50%" height={12} borderRadius={4} />
              </View>
            </View>
            <ShimmerBlock width={50} height={20} borderRadius={4} style={{ marginLeft: 16 }} />
          </View>
        ))}
      </View>
    </View>
  );
}
