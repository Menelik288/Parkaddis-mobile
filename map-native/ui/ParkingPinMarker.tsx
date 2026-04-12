import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MAP_PIN_PRIMARY } from './mapPinTokens';

type Props = {
  selected?: boolean;
  onPress?: () => void;
};

const BUBBLE = 44;
/** Total height from top of circle to ground tip (for map anchor = bottom). */
const ANCHOR_HEIGHT = BUBBLE + 18;

/**
 * Parking pin: primary bubble + "P", pointer + tip. Parent should use MarkerView anchor y=1 so tip sits on coordinates.
 */
export function ParkingPinMarker({ selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.root}>
      <View style={[styles.bubble, selected && styles.bubbleSelected]}>
        <Text style={styles.letter}>P</Text>
      </View>
      <View style={styles.pointer} />
      <View style={styles.tipDot} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: 56,
    height: ANCHOR_HEIGHT,
    alignItems: 'center',
  },
  bubble: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    backgroundColor: MAP_PIN_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  bubbleSelected: {
    transform: [{ scale: 1.06 }],
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  letter: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
    marginTop: -2,
  },
  pointer: {
    marginTop: -6,
    width: 12,
    height: 8,
    backgroundColor: MAP_PIN_PRIMARY,
    transform: [{ rotate: '45deg' }],
    borderBottomLeftRadius: 2,
  },
  tipDot: {
    marginTop: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MAP_PIN_PRIMARY,
    borderWidth: 1.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});
