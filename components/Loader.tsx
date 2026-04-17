import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, useColorScheme } from 'react-native';

export interface LoaderProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loader({ color, size = 'md' }: LoaderProps) {
  const isDark = useColorScheme() === 'dark';
  const defaultColor = isDark ? 'bg-white' : 'bg-[#0f172a]';
  const resolvedColor = color || defaultColor;

  const sizeClasses = {
    sm: { circle: 6, gap: 2, translate: -3 },
    md: { circle: 12, gap: 4, translate: -6 },
    lg: { circle: 16, gap: 6, translate: -8 }
  };

  const { circle, gap, translate } = sizeClasses[size];

  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(400) // Small pause at the bottom to match bounce feel
          ])
        )
      ]);
    };

    createAnimation(anim1, 0).start();
    createAnimation(anim2, 100).start();
    createAnimation(anim3, 200).start();
  }, []);

  const getStyle = (anim: Animated.Value) => ({
    width: circle,
    height: circle,
    borderRadius: circle / 2,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, translate]
      })
    }]
  });

  return (
    <View className="flex justify-center items-center">
      <View style={{ flexDirection: 'row', gap }}>
        <Animated.View style={getStyle(anim1)} className={resolvedColor} />
        <Animated.View style={getStyle(anim2)} className={resolvedColor} />
        <Animated.View style={getStyle(anim3)} className={resolvedColor} />
      </View>
    </View>
  );
}
