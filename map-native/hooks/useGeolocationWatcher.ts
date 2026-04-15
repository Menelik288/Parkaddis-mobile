import { calculateBearing, getDistance } from "@/lib/navigation-utils";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { useCallback, useEffect, useRef } from "react";
import { useMap } from "../MapProvider";

export function useGeolocationWatcher() {
  const { navigation, actions } = useMap();
  const lastCoords = useRef<{ lat: number; lng: number } | null>(null);
  const passiveSubRef = useRef<Location.LocationSubscription | null>(null);
  const activeSubRef = useRef<Location.LocationSubscription | null>(null);
  const magnetometerSubRef = useRef<any>(null);
  const isNavigatingRef = useRef(false);

  // Update navigation status ref
  useEffect(() => {
    isNavigatingRef.current = navigation.status === "NAVIGATING";
  }, [navigation.status]);

  // Unified location update handler
  const handleLocationUpdate = useCallback(
    (position: Location.LocationObject, isHighPrecision = false) => {
      const {
        latitude: lat,
        longitude: lng,
        accuracy,
        speed,
      } = position.coords;

      // Skip updates if navigating and this is from passive watcher
      if (isNavigatingRef.current && !isHighPrecision) return;

      // Update bearing from GPS movement if moving fast enough
      if (lastCoords.current && isHighPrecision) {
        const distance = getDistance(
          lastCoords.current.lat,
          lastCoords.current.lng,
          lat,
          lng,
        );

        if (distance > 2 && speed && speed > 1.5) {
          const gpsBearing = calculateBearing(
            lastCoords.current.lat,
            lastCoords.current.lng,
            lat,
            lng,
          );
          actions.setBearing(gpsBearing);
        }
      }

      lastCoords.current = { lat, lng };
      actions.setUserCoords({ lat, lng, accuracy: accuracy || undefined });
    },
    [actions],
  );

  // Passive watcher for general location updates
  useEffect(() => {
    const startPassiveWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        // Clean up existing subscription
        if (passiveSubRef.current) {
          passiveSubRef.current.remove();
        }

        passiveSubRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (position) => handleLocationUpdate(position, false),
        );
      } catch (e) {
        console.warn("Passive location watcher failed", e);
      }
    };

    startPassiveWatching();

    return () => {
      if (passiveSubRef.current) {
        passiveSubRef.current.remove();
        passiveSubRef.current = null;
      }
    };
  }, [handleLocationUpdate]);

  // Active navigation watcher with high precision
  useEffect(() => {
    if (navigation.status !== "NAVIGATING") {
      // Clean up active subscriptions when not navigating
      if (activeSubRef.current) {
        activeSubRef.current.remove();
        activeSubRef.current = null;
      }
      if (magnetometerSubRef.current) {
        magnetometerSubRef.current.remove();
        magnetometerSubRef.current = null;
      }
      return;
    }

    const setupNavigationSensors = async () => {
      try {
        // High-precision GPS tracking
        if (activeSubRef.current) {
          activeSubRef.current.remove();
        }

        activeSubRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 500,
            distanceInterval: 1,
          },
          (position) => handleLocationUpdate(position, true),
        );
      } catch (e) {
        console.warn("Navigation location watcher failed", e);
      }

      try {
        // Magnetometer for device orientation
        const isAvailable = await Magnetometer.isAvailableAsync();
        if (isAvailable) {
          if (magnetometerSubRef.current) {
            magnetometerSubRef.current.remove();
          }

          magnetometerSubRef.current = Magnetometer.addListener((data) => {
            let angle = Math.atan2(data.x, data.y) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            actions.setBearing(angle);
          });
          Magnetometer.setUpdateInterval(100);
        }
      } catch (e) {
        console.warn("Magnetometer failed", e);
      }
    };

    setupNavigationSensors();

    return () => {
      if (activeSubRef.current) {
        activeSubRef.current.remove();
        activeSubRef.current = null;
      }
      if (magnetometerSubRef.current) {
        magnetometerSubRef.current.remove();
        magnetometerSubRef.current = null;
      }
    };
  }, [navigation.status, handleLocationUpdate, actions]);

  return null;
}
