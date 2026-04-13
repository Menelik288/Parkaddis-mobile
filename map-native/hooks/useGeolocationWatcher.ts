import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { useMap } from "../MapProvider";
import { getDistance, calculateBearing } from "@/lib/navigation-utils";

export function useGeolocationWatcher() {
  const { navigation, actions } = useMap();
  const lastCoords = useRef<{ lat: number; lng: number } | null>(null);

  // 1. Passive Watcher: Always active to show the blue dot and handle simulator GPS
  useEffect(() => {
    let passiveSub: Location.LocationSubscription | null = null;

    const startPassiveWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        passiveSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (position) => {
            // Only update global state if we are NOT in navigation 
            // (navigation has its own high-speed watcher below)
            if (navigation.status !== "NAVIGATING") {
              const { latitude: lat, longitude: lng, accuracy } = position.coords;
              actions.setUserCoords({ lat, lng, accuracy: accuracy || undefined });
            }
          }
        );
      } catch (e) {
        console.warn("Passive location watcher failed", e);
      }
    };

    startPassiveWatching();
    return () => {
      if (passiveSub) passiveSub.remove();
    };
  }, [navigation.status, actions]);

  // 2. Active Watcher: High-precision Magnetometer and GPS for Navigation
  useEffect(() => {
    if (navigation.status !== "NAVIGATING") return;

    let magnetometerSub: any = null;
    let locationSub: Location.LocationSubscription | null = null;

    const setupNavigationSensors = async () => {
      // High-precision GPS tracking
      try {
        locationSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 500,
            distanceInterval: 1,
          },
          (position) => {
            const { latitude: lat, longitude: lng, accuracy, speed } = position.coords;

            if (lastCoords.current) {
              const distance = getDistance(
                lastCoords.current.lat,
                lastCoords.current.lng,
                lat,
                lng
              );

              if (distance > 2 && speed && speed > 1.5) {
                const gpsBearing = calculateBearing(
                  lastCoords.current.lat,
                  lastCoords.current.lng,
                  lat,
                  lng
                );
                actions.setBearing(gpsBearing);
              }
            }

            lastCoords.current = { lat, lng };
            actions.setUserCoords({ lat, lng, accuracy: accuracy || undefined });
          }
        );
      } catch (e) {
        console.warn("Navigation location watcher failed", e);
      }

      // Orientation handling using Magnetometer
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();
        if (isAvailable) {
          magnetometerSub = Magnetometer.addListener((data) => {
            let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            
            if (!lastCoords.current || (navigation.remainingDistance || 0) < 10) {
              actions.setBearing(angle);
            }
          });
          Magnetometer.setUpdateInterval(100);
        }
      } catch (e) {
        console.warn("Magnetometer failed", e);
      }
    };

    setupNavigationSensors();

    return () => {
      if (magnetometerSub) magnetometerSub.remove();
      if (locationSub) locationSub.remove();
    };
  }, [navigation.status, actions, navigation.remainingDistance]);

  return null;
}
