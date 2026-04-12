import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { MAP_PIN_SECONDARY } from './mapPinTokens';

/**
 * Custom user puck: 22px circle, white ring, secondary fill, soft pulse ring.
 */
export function UserLocationMarker() {
  const pulseScale = useRef(new Animated.Value(0.6)).current;
  const pulseOpacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.55,
            duration: 1400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.45,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseOpacity, pulseScale]);

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: MAP_PIN_SECONDARY,
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      />
      <View style={styles.outer}>
        <View style={styles.inner} />
      </View>
    </View>
  );
}

const DOT = 22;

const styles = StyleSheet.create({
  wrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: DOT + 20,
    height: DOT + 20,
    borderRadius: 9999,
  },
  outer: {
    position: 'relative',
    width: DOT,
    height: DOT,
    borderRadius: 9999,
    backgroundColor: MAP_PIN_SECONDARY,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  inner: {
    position: 'absolute',
    width: DOT - 8,
    height: DOT - 8,
    borderRadius: 9999,
    backgroundColor: MAP_PIN_SECONDARY,
  },
});
