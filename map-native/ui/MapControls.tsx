import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Crosshair, Layers, Map as MapIcon } from 'lucide-react-native';
import { useMap } from '../MapProvider';

export function MapControls() {
  const { locateUser, navigation } = useMap();

  // Hide common controls during active navigation to reduce clutter
  if (navigation.status === "NAVIGATING") return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => locateUser()}
      >
        <Crosshair size={22} color="#475569" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Layers size={22} color="#475569" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <MapIcon size={22} color="#475569" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    top: '35%',
    gap: 12,
  },
  button: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
