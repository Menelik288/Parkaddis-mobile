import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { X } from 'lucide-react-native';
import MapRoot from './MapRoot';
import { useMap } from './MapProvider';
import { ParkingLayer } from './layers/ParkingLayer';
import { UserLayer } from './layers/UserLayer';
import { RouteLayer } from './layers/RouteLayer';
import { NavigationCamera } from './navigation/NavigationCamera';
import { RouteManager } from './navigation/RouteManager';
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
  selectedLocation: any;
  /** When set, clearing pin selection will not wipe a reservation-driven route. */
  reservationRouteContext?: ReservationRouteContext;
  onDismissReservationRoute?: () => void;
}

export function MapView({
  displayedLocations,
  onLocationClick,
  selectedLocation,
  reservationRouteContext,
  onDismissReservationRoute,
}: MapViewProps) {
  const { actions, navigation } = useMap();
  const isDark = useColorScheme() === 'dark';

  useGeolocationWatcher();
  useRouteProgress();

  useEffect(() => {
    // If we are already navigating or arrived, don't let selection changes clear our path
    if (navigation.status === 'NAVIGATING' || navigation.status === 'ARRIVED') return;

    if (selectedLocation && reservationRouteContext) {
      actions.previewDestination({
        lng: selectedLocation.geometry.coordinates[0],
        lat: selectedLocation.geometry.coordinates[1],
      });
    } else if (!selectedLocation && !reservationRouteContext) {
      actions.clearNavigation();
    }
  }, [selectedLocation, actions, reservationRouteContext, navigation.status]);

  const previewTitle =
    selectedLocation?.properties?.name ||
    reservationRouteContext?.title ||
    'Parking location';
  const previewAddress =
    selectedLocation?.properties?.address || reservationRouteContext?.address || '';

  const selectedLocationId =
    selectedLocation?.id ?? selectedLocation?.properties?.id ?? null;

  const showPreviewCard = navigation.status === 'PREVIEW' && navigation.destination;

  const showNavigatingCard =
    navigation.status === 'NAVIGATING' && navigation.destination;

  const showArrivedCard = navigation.status === 'ARRIVED' && navigation.destination;

  return (
    <View style={styles.container}>
      <MapRoot>
        <UserLayer />
        <ParkingLayer
          locations={displayedLocations}
          onLocationClick={onLocationClick}
          selectedLocationId={selectedLocationId != null ? String(selectedLocationId) : null}
        />
        <RouteLayer />
        <RouteManager />
        <NavigationCamera />
      </MapRoot>

      {showPreviewCard && (
        <View style={styles.topLeftOverlay} pointerEvents="box-none">
          <ActiveReservationCard
            title={previewTitle}
            address={previewAddress}
            status="ACTIVE SESSION"
            distance={navigation.remainingDistance}
            duration={navigation.remainingDuration}
            mode="preview"
            onDirectionsClick={() => actions.startNavigation()}
            onDismissPreview={onDismissReservationRoute}
          />
        </View>
      )}

      {(showNavigatingCard || showArrivedCard) && (
        <View style={styles.topLeftOverlayNav} pointerEvents="box-none">
          <ActiveReservationCard
            title={previewTitle}
            address={previewAddress}
            status={showArrivedCard ? 'ARRIVED' : 'NAVIGATING'}
            distance={navigation.remainingDistance}
            duration={navigation.remainingDuration}
            mode="navigating"
            onCloseNavigation={() => {
              actions.clearNavigation();
              if (onDismissReservationRoute) {
                onDismissReservationRoute();
              }
            }}
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
  topLeftOverlay: {
    position: 'absolute',
    top: 68,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  /** Slightly lower while navigating so the distance bar clears the header chrome. */
  topLeftOverlayNav: {
    position: 'absolute',
    top: 68,
    left: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  minimalX: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
