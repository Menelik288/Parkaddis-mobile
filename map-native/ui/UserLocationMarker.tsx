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
  const { navigation } = useMap();
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

  return (
    <View style={styles.wrap} pointerEvents="none">
      {isNavigating ? (
        <View
          style={[
            styles.headingShell,
            {
              top: -42,
              borderColor: accent,
              backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : '#ffffff',
            },
          ]}
        >
          <ArrowBigUp size={18} color={accent} strokeWidth={2.5} />
        </View>
      ) : null}

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
  headingShell: {
    position: 'absolute',
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
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
