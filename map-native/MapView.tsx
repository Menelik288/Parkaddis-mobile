import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMap } from './MapProvider';
import { ParkingPinMarker } from './ui/ParkingPinMarker';
import { UserLocationMarker } from './ui/UserLocationMarker';
import { useGeolocationWatcher } from './hooks/useGeolocationWatcher';
import { useRouteProgress } from './hooks/useRouteProgress';
import { ActiveReservationCard } from './ui/ActiveReservationCard';

export type ReservationRouteContext = {
  title: string;
  address?: string;
} | null;

interface MapViewProps {
  displayedLocations: any[];
  onLocationClick: (id: string | null) => void;
  selectedLocation: any | null;
  reservationRouteContext: ReservationRouteContext;
  onDismissReservationRoute: () => void;
}

export function MapView({
  displayedLocations,
  onLocationClick,
  selectedLocation,
  reservationRouteContext,
  onDismissReservationRoute,
}: MapViewProps) {
  const { actions, navigation, cameraRef, mapViewHasLoadedRef, idleRegionRef, currentCenterRef, coords } = useMap();

  useGeolocationWatcher();
  useRouteProgress();

  // User Layer Logic Flattened
  const rawTarget = navigation.userCoords || coords;
  const targetPos = (rawTarget && rawTarget.lat !== 0 && rawTarget.lng !== 0) ? rawTarget : null;
  const [displayPos, setDisplayPos] = useState(targetPos);
  const currentPosRef = useRef(targetPos);
  const userAnimRef = useRef<number | null>(null);

  useEffect(() => {
    if (!targetPos) return;
    if (!currentPosRef.current) {
      currentPosRef.current = targetPos;
      setDisplayPos(targetPos);
      return;
    }
    const initialPos = { ...currentPosRef.current };
    const startTime = Date.now();
    const duration = 1000;
    const animate = () => {
      const now = Date.now();
      let progress = (now - startTime) / duration;
      if (progress > 1) progress = 1;
      const newPos = {
        lat: initialPos.lat + (targetPos.lat - initialPos.lat) * progress,
        lng: initialPos.lng + (targetPos.lng - initialPos.lng) * progress,
      };
      currentPosRef.current = newPos;
      setDisplayPos(newPos);
      if (progress < 1) {
        userAnimRef.current = requestAnimationFrame(animate);
      }
    };
    if (userAnimRef.current) cancelAnimationFrame(userAnimRef.current);
    userAnimRef.current = requestAnimationFrame(animate);
    return () => {
      if (userAnimRef.current) cancelAnimationFrame(userAnimRef.current);
    };
  }, [targetPos?.lat, targetPos?.lng]);

  // Route Layer Logic Flattened
  const routeActive = MapLibreGL && navigation.routeGeometry && navigation.status !== "IDLE";

  const selectedLocationId = selectedLocation?.id || selectedLocation?.properties?.id;
  
  const validParkingFeatures = useMemo(() => {
    const list = Array.isArray(displayedLocations) ? displayedLocations : displayedLocations?.features || [];
    if (!Array.isArray(list)) return [];
    
    return list.filter((feature: any) => {
      const id = feature?.id ?? feature?.properties?.id;
      const coords = feature?.geometry?.coordinates;
      if (!id || !Array.isArray(coords) || coords.length < 2) return false;
      const [lng, lat] = coords;
      return Number.isFinite(lng) && Number.isFinite(lat);
    });
  }, [displayedLocations]);

  const selectedFeature = useMemo(() => {
    return validParkingFeatures.find(f => String(f.id) === String(selectedLocationId));
  }, [validParkingFeatures, selectedLocationId]);

  const showPreviewCard =
    (navigation.status === 'PREVIEW' || navigation.status === 'NAVIGATING' || navigation.status === 'ARRIVED') &&
    navigation.destination;

  const previewTitle =
    selectedLocation?.properties?.name ||
    reservationRouteContext?.title ||
    'Parking location';
  const previewAddress =
    selectedLocation?.properties?.address || reservationRouteContext?.address || '';

  const onRegionDidChange = (region: any) => {
    const isUser = region.properties?.isUserInteraction;
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
  };

  const DEFAULT_CENTER: [number, number] = [38.75242, 9.03584];

  return (
    <View style={styles.container}>
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

        {/* 1. STABLE USER LOCATION SLOT */}
        <MapLibreGL.PointAnnotation
          id="user-location-slot"
          coordinate={displayPos && Number.isFinite(displayPos.lng) && Number.isFinite(displayPos.lat) ? [displayPos.lng, displayPos.lat] : [0, 0]}
          anchor={{ x: 0.5, y: 0.5 }}
          style={{ opacity: displayPos ? 1 : 0 }}
        >
          <View collapsable={false} style={{ overflow: "visible", opacity: displayPos ? 1 : 0 }}>
            <UserLocationMarker />
          </View>
        </MapLibreGL.PointAnnotation>

        {/* 2. STABLE ROUTE LINE SLOT */}
        <MapLibreGL.ShapeSource
          id="route-line-source"
          shape={routeActive ? {
            type: 'Feature',
            geometry: navigation.routeGeometry!,
            properties: {},
          } : {
            type: 'FeatureCollection',
            features: []
          }}
        >
          <MapLibreGL.LineLayer
            id="route-line-layer"
            style={{
              lineColor: '#10B981',
              lineWidth: 5,
              lineJoin: 'round',
              lineCap: 'round',
              lineOpacity: routeActive ? 0.8 : 0,
            }}
          />
        </MapLibreGL.ShapeSource>

        {/* 3. STABLE BACKGROUND MARKERS SLOT (SymbolLayer for stability) */}
        <MapLibreGL.ShapeSource
          id="parking-background-source"
          shape={{
            type: 'FeatureCollection',
            features: validParkingFeatures.filter(f => String(f.id) !== String(selectedLocationId))
          }}
          onPress={(e) => {
            const feature = e.features[0];
            if (feature) onLocationClick(String(feature.id));
          }}
        >
          <MapLibreGL.CircleLayer
            id="parking-bg-circles"
            style={{
              circleColor: '#064e3b',
              circleRadius: 18,
              circleStrokeWidth: 2,
              circleStrokeColor: '#ffffff',
              circleOpacity: 0.9,
            }}
          />
          <MapLibreGL.SymbolLayer
            id="parking-bg-text"
            style={{
              textField: 'P',
              textColor: '#ffffff',
              textSize: 14,
              textIgnorePlacement: true,
              textAllowOverlap: true,
            }}
          />
        </MapLibreGL.ShapeSource>

        {/* 4. STABLE SELECTED MARKER SLOT (Only one PointAnnotation for the active spot) */}
        <MapLibreGL.PointAnnotation
          key={selectedLocationId ? `selected-${selectedLocationId}` : 'selected-none'}
          id="selected-parking-annotation"
          coordinate={selectedFeature ? selectedFeature.geometry.coordinates : [0, 0]}
          anchor={{ x: 0.5, y: 1 }}
          style={{ opacity: selectedFeature ? 1 : 0 }}
        >
          <View collapsable={false}>
            <ParkingPinMarker selected={true} />
          </View>
        </MapLibreGL.PointAnnotation>

      </MapLibreGL.MapView>

      {showPreviewCard && (
        <View style={styles.topOverlay} pointerEvents="box-none">
          <ActiveReservationCard
            title={previewTitle}
            address={previewAddress}
            status={navigation.status === 'ARRIVED' ? 'ARRIVED' : 'ACTIVE SESSION'}
            distance={navigation.remainingDistance}
            duration={navigation.remainingDuration}
            mode={navigation.status === 'PREVIEW' ? 'preview' : 'navigating'}
            onDirectionsClick={() => actions.startNavigation()}
            onDismissPreview={onDismissReservationRoute}
            onCloseNavigation={onDismissReservationRoute}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 80,
    left: 20,
    zIndex: 10,
    alignItems: 'flex-start',
  },
});
