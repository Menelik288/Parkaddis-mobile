import { getDistance } from "@/lib/navigation-utils";
import { useEffect, useRef } from "react";
import { useMap } from "../MapProvider";

export function useRouteProgress() {
  const { navigation, actions } = useMap();
  const lastDistanceRef = useRef<number | null>(null);
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (
      navigation.status !== "NAVIGATING" ||
      !navigation.userCoords ||
      !navigation.destination
    ) {
      lastDistanceRef.current = null;
      lastCoordsRef.current = null;
      return;
    }

    const currentCoords = {
      lat: navigation.userCoords.lat,
      lng: navigation.userCoords.lng,
    };

    // Skip if coordinates haven't changed significantly
    if (lastCoordsRef.current) {
      const distanceMoved = getDistance(
        lastCoordsRef.current.lat,
        lastCoordsRef.current.lng,
        currentCoords.lat,
        currentCoords.lng,
      );

      if (distanceMoved < 5) return; // Only update if moved more than 5 meters
    }

    const distToDest = getDistance(
      navigation.userCoords.lat,
      navigation.userCoords.lng,
      navigation.destination.lat,
      navigation.destination.lng,
    );

    // Only update if distance changed significantly
    if (
      lastDistanceRef.current === null ||
      Math.abs(lastDistanceRef.current - distToDest) > 10
    ) {
      const speedMs = 30 / 3.6; // 30 km/h in m/s
      const durationS = Math.max(30, distToDest / speedMs);
      actions.updateNavigationMetrics(distToDest, durationS);
      lastDistanceRef.current = distToDest;
    }

    lastCoordsRef.current = currentCoords;

    if (distToDest < 15) {
      actions.setNavigationStatus("ARRIVED");
    }
  }, [
    navigation.userCoords?.lat,
    navigation.userCoords?.lng,
    navigation.destination?.lat,
    navigation.destination?.lng,
    navigation.status,
    actions,
  ]);

  return null;
}
