import { View, StyleSheet } from 'react-native';
import { useMap } from './MapProvider';
import React, { useEffect } from 'react';
import MapLibreGL from "@maplibre/maplibre-react-native";

interface MapRootProps {
  children?: React.ReactNode;
}

// Fixed Addis Ababa center [LNG, LAT]
const DEFAULT_CENTER: [number, number] = [38.75242, 9.03584];

const MapRoot = ({ children }: MapRootProps) => {
  const { cameraRef, mapViewHasLoadedRef } = useMap();

  useEffect(() => {
    mapViewHasLoadedRef.current = false;
    return () => {
      mapViewHasLoadedRef.current = false;
    };
  }, [mapViewHasLoadedRef]);

  return (
    <View style={styles.container}>
      {/* STABLE v10 MapView - using standard 'styleURL' */}
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={() => {
          mapViewHasLoadedRef.current = true;
        }}
      >
        {/* STABLE Camera - standard v10 implementation */}
        <MapLibreGL.Camera 
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: DEFAULT_CENTER,
            zoomLevel: 14.5,
          }}
        />
        
        {children}
      </MapLibreGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  fallbackContainer: {
    backgroundColor: '#f8fafc',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MapRoot;
