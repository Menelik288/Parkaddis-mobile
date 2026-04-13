import { View, StyleSheet } from 'react-native';
import { useMap } from './MapProvider';
import React, { useCallback, useEffect } from 'react';
import MapLibreGL from "@maplibre/maplibre-react-native";

interface MapRootProps {
  children?: React.ReactNode;
}

// Fixed Addis Ababa center [LNG, LAT]
const DEFAULT_CENTER: [number, number] = [38.75242, 9.03584];

const MapRoot = ({ children }: MapRootProps) => {
  const { cameraRef, mapViewHasLoadedRef, navigation, idleRegionRef } = useMap();

  const onRegionDidChange = useCallback(
    (feature: { properties?: { visibleBounds?: [number[], number[]] } }) => {
      if (navigation.status !== 'IDLE') return;
      const vb = feature.properties?.visibleBounds;
      if (!vb || vb.length < 2) return;
      const [ne, sw] = vb;
      idleRegionRef.current = {
        ne: [ne[0], ne[1]] as [number, number],
        sw: [sw[0], sw[1]] as [number, number],
      };
    },
    [navigation.status, idleRegionRef]
  );

  useEffect(() => {
    mapViewHasLoadedRef.current = false;
    return () => {
      mapViewHasLoadedRef.current = false;
    };
  }, [mapViewHasLoadedRef]);

  return (
    <View style={styles.container}>
      {/* STABLE v11 MapView - using standard 'styleURL' / 'mapStyle' */}
      <MapLibreGL.MapView
        style={styles.map}
        styleURL="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        logoEnabled={false}
        attributionEnabled={false}
        onRegionDidChange={onRegionDidChange}
        onDidFinishLoadingMap={() => {
          mapViewHasLoadedRef.current = true;
        }}
      >
        {/* STABLE Camera - standard v11 implementation */}
        <MapLibreGL.Camera 
          ref={cameraRef}
          centerCoordinate={DEFAULT_CENTER}
          zoomLevel={14.5}
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
