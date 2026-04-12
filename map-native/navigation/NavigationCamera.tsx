import React, { useEffect, useRef } from "react";
import { useMap } from "../MapProvider";
import { useBearingSmoothing } from "../hooks/useBearingSmoothing";

export function NavigationCamera() {
  const { navigation, cameraRef } = useMap();
  const { smoothedBearing, updateBearing } = useBearingSmoothing();
  const lastTarget = useRef<string | null>(null);
  const didCenterOnUserAtLoad = useRef(false);

  // 0. Initial map load: center on user when idle (no pin / route) — reliable vs MapView mount timing
  useEffect(() => {
    if (didCenterOnUserAtLoad.current) return;
    if (!cameraRef.current || typeof cameraRef.current.setCamera !== 'function') return;
    if (navigation.destination || navigation.status === 'NAVIGATING' || navigation.status === 'PREVIEW') return;
    if (!navigation.userCoords) return;

    didCenterOnUserAtLoad.current = true;
    const { lng, lat } = navigation.userCoords;
    cameraRef.current.setCamera({
      centerCoordinate: [lng, lat],
      zoomLevel: 15.5,
      pitch: 0,
      heading: 0,
      animationMode: 'flyTo',
      animationDuration: 1200,
    });
  }, [
    navigation.userCoords?.lng,
    navigation.userCoords?.lat,
    navigation.destination,
    navigation.status,
    cameraRef,
  ]);

  // 1. Sync bearing for navigation mode
  useEffect(() => {
    if (navigation.status === "NAVIGATING") {
      updateBearing(navigation.bearing);
    }
  }, [navigation.bearing, navigation.status, updateBearing]);

  // 2. IMPERATIVE CONTROLLER (Master Camera Driver)
  useEffect(() => {
    if (!cameraRef.current) return;

    let targetCoords: [number, number] | null = null;
    let targetZoom = 15;
    let targetPitch = 0;
    let targetHeading = 0;
    let animMode: 'flyTo' | 'easeTo' | 'moveTo' = 'easeTo';

    // A. NAVIGATING: High zoom, tilted, following user
    if (navigation.status === "NAVIGATING" && navigation.userCoords) {
      targetCoords = [navigation.userCoords.lng, navigation.userCoords.lat];
      targetZoom = 18.5;
      targetPitch = 70;
      targetHeading = smoothedBearing;
      animMode = 'moveTo';
    } 
    // B. DESTINATION: Fly to parking spot
    else if (navigation.destination) {
      targetCoords = [navigation.destination.lng, navigation.destination.lat];
      targetZoom = 16.5;
      animMode = 'flyTo';
    } 

    if (!targetCoords) return;

    const stateKey = `${navigation.status}-${targetCoords[0].toFixed(5)},${targetCoords[1].toFixed(5)}`;
    
    // Move the MASTER CAMERA in MapRoot
    if (lastTarget.current !== stateKey || navigation.status === "NAVIGATING") {
      if (typeof cameraRef.current.setCamera === 'function') {
        cameraRef.current.setCamera({
          centerCoordinate: targetCoords,
          zoomLevel: targetZoom,
          pitch: targetPitch,
          heading: targetHeading,
          animationMode: animMode,
          animationDuration: navigation.status === "NAVIGATING" ? 1000 : 2000,
        });
        lastTarget.current = stateKey;
      }
    }
  }, [
    navigation.status, 
    navigation.destination?.lng, 
    navigation.destination?.lat, 
    navigation.userCoords?.lng, 
    navigation.userCoords?.lat,
    smoothedBearing,
    cameraRef
  ]);

  return null; // Headless
}
