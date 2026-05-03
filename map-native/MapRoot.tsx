import MapLibreGL from "@maplibre/maplibre-react-native";
import React, { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useMap } from "./MapProvider";

interface MapRootProps {
  children?: React.ReactNode;
}

// Fixed Addis Ababa center [LNG, LAT]
const DEFAULT_CENTER: [number, number] = [38.75242, 9.03584];

const MapRoot = ({ children }: MapRootProps) => {
  const {
    cameraRef,
    mapViewHasLoadedRef,
    navigation,
    idleRegionRef,
    currentCenterRef,
  } = useMap();

  const onRegionDidChange = useCallback(
    (region: any) => {
      const isUser = region.properties?.isUserInteraction;
      // Update idle region only when idle AND user moved it manually.
      // This prevents "zoom creep" when system restores camera with padding.
      if (navigation.status === "IDLE" && isUser) {
        const vb = region.properties?.visibleBounds;
        if (vb && vb.length >= 2) {
          const [ne, sw] = vb;
          idleRegionRef.current = {
            ne: [ne[0], ne[1]] as [number, number],
            sw: [sw[0], sw[1]] as [number, number],
          };
        }
      }
    },
    [navigation.status, idleRegionRef],
  );

  useEffect(() => {
    mapViewHasLoadedRef.current = false;
    return () => {
      mapViewHasLoadedRef.current = false;
    };
  }, [mapViewHasLoadedRef]);

  return (
    <View style={styles.container}>
      {/* STABLE Maps - using mapStyle */}
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        logoEnabled={false}
        attributionEnabled={false}
        onRegionDidChange={onRegionDidChange}
        onDidFinishLoadingMap={() => {
          mapViewHasLoadedRef.current = true;
        }}
      >
        {/* STABLE Camera */}
        <MapLibreGL.Camera
          ref={cameraRef}
          centerCoordinate={DEFAULT_CENTER}
          zoomLevel={14.5}
          onCameraChanged={(camera) => {
            currentCenterRef.current = {
              lng: camera.centerCoordinate[0],
              lat: camera.centerCoordinate[1],
            };
          }}
        />

        {children}
      </MapLibreGL.MapView>

      {/* Antique / Vintage Tint Overlay (Restored original brownish color) */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(139, 69, 19, 0.12)", zIndex: 10 },
        ]}
      />
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
    backgroundColor: "#f8fafc",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default MapRoot;
