import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHIMMER_BAND = 150;

export function TicketShimmer({ type = 'history' }: { type?: 'active' | 'history' | 'completed' | 'expired' }) {
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

  const HistoryTicketItem = () => (
    <View style={{ 
      borderRadius: 28, 
      backgroundColor: isDark ? '#1e293b' : '#ffffff', 
      padding: 20,
      marginBottom: 16, 
      borderWidth: 1, 
      borderColor: isDark ? '#334155' : '#f1f5f9',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
        <ShimmerBlock width={48} height={48} borderRadius={16} />
        <View style={{ gap: 8, flex: 1 }}>
          <ShimmerBlock width="80%" height={16} borderRadius={6} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <ShimmerBlock width={60} height={12} borderRadius={4} />
            <ShimmerBlock width={80} height={12} borderRadius={4} />
          </View>
        </View>
      </View>
      
      <View style={{ alignItems: 'flex-end', marginLeft: 16, gap: 4 }}>
        <ShimmerBlock width={40} height={10} borderRadius={3} />
        <ShimmerBlock width={70} height={20} borderRadius={8} />
      </View>
    </View>
  );

  const ActiveTicketItem = () => (
    <View style={{ 
      borderRadius: 40, 
      backgroundColor: isDark ? '#1e293b' : '#ffffff', 
      padding: 24, 
      marginBottom: 24, 
      borderWidth: 1, 
      borderColor: isDark ? '#334155' : '#e2e8f0',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
        <ShimmerBlock width="60%" height={24} borderRadius={8} />
        <ShimmerBlock width={70} height={22} borderRadius={11} />
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
        <View style={{ gap: 8 }}>
          <ShimmerBlock width={100} height={14} borderRadius={4} />
          <ShimmerBlock width={140} height={24} borderRadius={8} />
        </View>
        <View style={{ gap: 8, alignItems: 'flex-end' }}>
          <ShimmerBlock width={80} height={14} borderRadius={4} />
          <ShimmerBlock width={120} height={24} borderRadius={8} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
         <ShimmerBlock width="48%" height={52} borderRadius={16} />
         <ShimmerBlock width="48%" height={52} borderRadius={16} />
      </View>
    </View>
  );

  return (
    <View style={{ width: '100%', marginTop: 8 }}>
      {type === 'active' ? (
        <ActiveTicketItem />
      ) : (
        <>
          <HistoryTicketItem />
          <HistoryTicketItem />
          <HistoryTicketItem />
          <HistoryTicketItem />
        </>
      )}
    </View>
  );
}
