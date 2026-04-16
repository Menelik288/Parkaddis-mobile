import { Navigation } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { useMap } from "../MapProvider";
import { MAP_PIN_SECONDARY } from "./mapPinTokens";

const PRIMARY_LIGHT = "#064e3b";
const PRIMARY_DARK = "#34d399";

/**
 * User puck; in navigation mode shows a heading arrow above the dot.
 * Map stays north-up, arrow shows direction of travel.
 */
export function UserLocationMarker() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { navigation, smoothedBearing } = useMap();
  const isNavigating = navigation.status === "NAVIGATING";

  const pulseScale = useRef(new Animated.Value(0.6)).current;
  const pulseOpacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseScale, {
          toValue: 2.2,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.25,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseOpacity, pulseScale]);

  const accent = isDark ? PRIMARY_DARK : PRIMARY_LIGHT;

  // Position arrow slightly in front of the puck based on bearing
  const offset = 18;
  const rad = (smoothedBearing * Math.PI) / 180;
  const dx = Math.sin(rad) * offset;
  const dy = -Math.cos(rad) * offset;

  return (
    <View style={styles.wrap} pointerEvents="none">
      {/* Pulse Accuracy Indicator */}
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

      {/* Floating Navigation Arrow */}
      {isNavigating && (
        <Animated.View
          style={[
            styles.floatingArrow,
            {
              transform: [
                { translateX: dx },
                { translateY: dy },
                { rotate: `${smoothedBearing}deg` },
              ],
            },
          ]}
        >
          <Navigation size={20} color={accent} fill={accent} />
        </Animated.View>
      )}

      {/* Core Puck */}
      <View style={[styles.outer, { backgroundColor: MAP_PIN_SECONDARY }]}>
        <View style={[styles.inner, { backgroundColor: MAP_PIN_SECONDARY }]} />
      </View>
    </View>
  );
}

const DOT = 22;

const styles = StyleSheet.create({
  wrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingArrow: {
    position: "absolute",
    top: 18,
    left: 18,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pulse: {
    position: "absolute",
    width: DOT,
    height: DOT,
    borderRadius: 9999,
  },
  outer: {
    position: "relative",
    width: DOT,
    height: DOT,
    borderRadius: 9999,
    backgroundColor: MAP_PIN_SECONDARY,
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  inner: {
    position: "absolute",
    width: DOT - 8,
    height: DOT - 8,
    borderRadius: 9999,
    backgroundColor: MAP_PIN_SECONDARY,
  },
});
