import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useColorScheme } from 'react-native';
import { ArrowBigUp } from 'lucide-react-native';
import { useMap } from '../MapProvider';
import { MAP_PIN_SECONDARY } from './mapPinTokens';

const PRIMARY_LIGHT = '#064e3b';
const PRIMARY_DARK = '#34d399';

/**
 * User puck; in navigation mode shows a heading arrow above the dot.
 * Map uses heading-up (NavigationCamera), so the arrow points screen-up = direction of travel,
 * kept in sync with smoothed GPS bearing via shared map rotation.
 */
export function UserLocationMarker() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { navigation, smoothedBearing } = useMap();
  const isNavigating = navigation.status === 'NAVIGATING';

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
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseOpacity, pulseScale]);

  const accent = isDark ? PRIMARY_DARK : PRIMARY_LIGHT;

  if (isNavigating) {
    return (
      <View 
        style={[
          styles.arrowWrap,
          { transform: [{ rotate: `${smoothedBearing}deg` }] }
        ]} 
        pointerEvents="none"
      >
        <View style={[styles.arrowBody, { borderBottomColor: accent }]}>
          <View style={styles.arrowInner} />
        </View>
        <View style={[styles.arrowBase, { backgroundColor: accent }]} />
      </View>
    );
  }

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
  arrowWrap: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBody: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderBottomWidth: 32,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: PRIMARY_LIGHT,
    transform: [{ translateY: -4 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  arrowInner: {
    position: 'absolute',
    left: -10,
    top: 6,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    opacity: 0.9,
  },
  arrowBase: {
    position: 'absolute',
    bottom: 22,
    width: 14,
    height: 6,
    borderRadius: 2,
    backgroundColor: PRIMARY_LIGHT,
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
