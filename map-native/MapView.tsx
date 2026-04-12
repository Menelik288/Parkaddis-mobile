import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
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

  useGeolocationWatcher();
  useRouteProgress();

  useEffect(() => {
    if (selectedLocation) {
      actions.previewDestination({
        lng: selectedLocation.geometry.coordinates[0],
        lat: selectedLocation.geometry.coordinates[1],
      });
    } else {
      if (!reservationRouteContext) {
        actions.clearNavigation();
      }
    }
  }, [selectedLocation, actions, reservationRouteContext]);

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
            status="ROUTE PREVIEW"
            distance={navigation.remainingDistance}
            duration={navigation.remainingDuration}
            mode="preview"
            onDirectionsClick={() => actions.startNavigation()}
            onDismissPreview={onDismissReservationRoute}
          />
        </View>
      )}

      {(showNavigatingCard || showArrivedCard) && (
        <View style={styles.topLeftOverlay} pointerEvents="box-none">
          <ActiveReservationCard
            title={previewTitle}
            address={previewAddress}
            status={showArrivedCard ? 'ARRIVED' : 'NAVIGATING'}
            distance={navigation.remainingDistance}
            duration={navigation.remainingDuration}
            mode="navigating"
          />
          <TouchableOpacity onPress={() => actions.clearNavigation()} style={styles.closeNavBtn}>
            <X size={16} color="#64748b" />
            <Text style={styles.closeNavText}>Exit navigation</Text>
          </TouchableOpacity>
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
    top: 52,
    left: 16,
    right: 16,
    zIndex: 100,
    alignItems: 'flex-start',
    gap: 10,
  },
  closeNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  closeNavText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
