import React, { useEffect, useRef } from 'react';
import { useMap } from '../MapProvider';
import type { MapRegionSnapshot } from '../MapProvider';
import { boundsFromLineString } from '../lib/routeBounds';

const PREVIEW_FIT_PADDING: [number, number, number, number] = [240, 44, 220, 44];

export function NavigationCamera() {
  const { navigation, cameraRef, smoothedBearing, updateSmoothedBearing, idleRegionRef } = useMap();
  const lastTarget = useRef<string | null>(null);
  const didCenterOnUserAtLoad = useRef(false);
  const prevStatus = useRef(navigation.status);
  const lastPreviewFitKey = useRef<string | null>(null);
  /** Bounds shown after route preview fit — restore when exiting NAVIGATING. */
  const previewRouteBoundsRef = useRef<MapRegionSnapshot | null>(null);

  // Initial map load: center on user when idle (no pin / route)
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

  useEffect(() => {
    if (navigation.status === 'NAVIGATING') {
      updateSmoothedBearing(navigation.bearing);
    }
  }, [navigation.bearing, navigation.status, updateSmoothedBearing]);

  // NAVIGATING: follow user with tilt
  useEffect(() => {
    if (!cameraRef.current) return;
    if (navigation.status !== 'NAVIGATING' || !navigation.userCoords) return;

    const targetCoords: [number, number] = [navigation.userCoords.lng, navigation.userCoords.lat];
    const stateKey = `NAV-${targetCoords[0].toFixed(5)},${targetCoords[1].toFixed(5)}-${smoothedBearing.toFixed(0)}`;

    if (lastTarget.current !== stateKey) {
      if (typeof cameraRef.current.setCamera === 'function') {
        const isFirstFrameNavigating = lastTarget.current === null || lastTarget.current.startsWith('PREVIEW');
        
        cameraRef.current.setCamera({
          centerCoordinate: targetCoords,
          zoomLevel: 18.5,
          pitch: 70,
          heading: 0,
          animationMode: isFirstFrameNavigating ? 'flyTo' : 'moveTo',
          animationDuration: isFirstFrameNavigating ? 2500 : 1000,
        });
        lastTarget.current = stateKey;
      }
    }
  }, [
    navigation.status,
    navigation.userCoords?.lng,
    navigation.userCoords?.lat,
    smoothedBearing,
    cameraRef,
  ]);

  // PREVIEW: fit route to screen (do not zoom to pin)
  useEffect(() => {
    if (!cameraRef.current?.fitBounds) return;
    if (navigation.status !== 'PREVIEW') return;
    if (!navigation.routeGeometry || navigation.routeGeometry.type !== 'LineString') return;
    if (!navigation.destination) return;

    const user = navigation.userCoords;
    const extra = user ? [[user.lng, user.lat] as [number, number]] : [];
    let ne: [number, number];
    let sw: [number, number];
    try {
      const b = boundsFromLineString(navigation.routeGeometry, extra);
      ne = b.ne;
      sw = b.sw;
    } catch {
      return;
    }

    const fitKey = `${ne[0].toFixed(4)},${ne[1].toFixed(4)}-${sw[0].toFixed(4)},${sw[1].toFixed(4)}`;
    if (lastPreviewFitKey.current === fitKey) return;
    lastPreviewFitKey.current = fitKey;

    previewRouteBoundsRef.current = { ne, sw };
    cameraRef.current.fitBounds(ne, sw, PREVIEW_FIT_PADDING, 900);
    lastTarget.current = `PREVIEW-FIT-${fitKey}`;
  }, [
    navigation.status,
    navigation.routeGeometry,
    navigation.destination?.lng,
    navigation.destination?.lat,
    navigation.userCoords?.lng,
    navigation.userCoords?.lat,
    cameraRef,
  ]);

  // Restore camera when leaving PREVIEW or NAVIGATING
  useEffect(() => {
    const was = prevStatus.current;
    const now = navigation.status;
    prevStatus.current = now;

    if (!cameraRef.current) return;

    if (was === 'PREVIEW' && now === 'IDLE') {
      lastPreviewFitKey.current = null;
      const idle = idleRegionRef.current;
      if (idle && typeof cameraRef.current.fitBounds === 'function') {
        cameraRef.current.fitBounds(idle.ne, idle.sw, 48, 700);
      } else if (navigation.userCoords && typeof cameraRef.current.setCamera === 'function') {
        const { lng, lat } = navigation.userCoords;
        cameraRef.current.setCamera({
          centerCoordinate: [lng, lat],
          zoomLevel: 15.5,
          pitch: 0,
          heading: 0,
          animationMode: 'easeTo',
          animationDuration: 700,
        });
      }
      lastTarget.current = null;
      return;
    }

    if ((was === 'NAVIGATING' || was === 'ARRIVED') && now === 'IDLE') {
      if (navigation.userCoords && typeof cameraRef.current.setCamera === 'function') {
        const { lng, lat } = navigation.userCoords;
        cameraRef.current.setCamera({
          centerCoordinate: [lng, lat],
          zoomLevel: 15.5,
          pitch: 0,
          heading: 0,
          animationMode: 'flyTo',
          animationDuration: 1200,
        });
      }
      lastTarget.current = null;
    }
  }, [navigation.status, navigation.userCoords, cameraRef, idleRegionRef]);

  return null;
}
