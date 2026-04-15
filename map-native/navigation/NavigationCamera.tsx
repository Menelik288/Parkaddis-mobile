import { useCallback, useEffect, useRef } from "react";
import type { MapRegionSnapshot } from "../MapProvider";
import { useMap } from "../MapProvider";
import { boundsFromLineString } from "../lib/routeBounds";

const PREVIEW_FIT_PADDING: [number, number, number, number] = [
  240, 44, 220, 44,
];

export function NavigationCamera() {
  const {
    navigation,
    cameraRef,
    smoothedBearing,
    updateSmoothedBearing,
    idleRegionRef,
  } = useMap();
  const lastTarget = useRef<string | null>(null);
  const didCenterOnUserAtLoad = useRef(false);
  const lastPreviewFitKey = useRef<string | null>(null);
  const previewRouteBoundsRef = useRef<MapRegionSnapshot | null>(null);

  // Debounced camera operation to prevent rapid successive calls
  const pendingCameraOpRef = useRef<{ id: string; fn: () => void } | null>(
    null,
  );

  const executeCameraOperation = useCallback(
    (id: string, operation: () => void) => {
      // Cancel any pending operation
      if (pendingCameraOpRef.current && pendingCameraOpRef.current.id !== id) {
        clearTimeout(pendingCameraOpRef.current.timeoutId);
      }

      // Execute immediately if no camera operation is pending
      if (!pendingCameraOpRef.current) {
        operation();
        return;
      }

      // Debounce if same operation type
      if (pendingCameraOpRef.current.id === id) {
        clearTimeout(pendingCameraOpRef.current.timeoutId);
      }

      const timeoutId = setTimeout(() => {
        operation();
        pendingCameraOpRef.current = null;
      }, 100);

      pendingCameraOpRef.current = { id, fn: operation, timeoutId };
    },
    [],
  );

  // Initial map load: center on user when idle
  useEffect(() => {
    if (didCenterOnUserAtLoad.current) return;
    if (!cameraRef.current || typeof cameraRef.current.setCamera !== "function")
      return;
    if (
      navigation.destination ||
      navigation.status === "NAVIGATING" ||
      navigation.status === "PREVIEW"
    )
      return;
    if (!navigation.userCoords) return;

    didCenterOnUserAtLoad.current = true;
    const { lng, lat } = navigation.userCoords;

    executeCameraOperation("initial-center", () => {
      cameraRef.current?.setCamera({
        centerCoordinate: [lng, lat],
        zoomLevel: 16.5,
        pitch: 0,
        heading: 0,
        animationMode: "flyTo",
        animationDuration: 0,
      });
    });
  }, [
    navigation.userCoords?.lng,
    navigation.userCoords?.lat,
    navigation.destination,
    navigation.status,
    cameraRef,
    executeCameraOperation,
  ]);

  // Update smoothed bearing during navigation
  useEffect(() => {
    if (navigation.status === "NAVIGATING") {
      updateSmoothedBearing(navigation.bearing);
    }
  }, [navigation.bearing, navigation.status, updateSmoothedBearing]);

  // NAVIGATING: follow user with tilt
  useEffect(() => {
    if (!cameraRef.current) return;
    if (navigation.status !== "NAVIGATING" || !navigation.userCoords) return;

    const targetCoords: [number, number] = [
      navigation.userCoords.lng,
      navigation.userCoords.lat,
    ];
    const stateKey = `NAV-${targetCoords[0].toFixed(5)},${targetCoords[1].toFixed(5)}-${smoothedBearing.toFixed(0)}`;

    if (lastTarget.current !== stateKey) {
      const isFirstFrameNavigating =
        lastTarget.current === null || lastTarget.current.startsWith("PREVIEW");

      executeCameraOperation("navigation-follow", () => {
        if (cameraRef.current?.setCamera) {
          cameraRef.current.setCamera({
            centerCoordinate: targetCoords,
            zoomLevel: 18.5,
            pitch: 0,
            heading: 0,
            animationMode: isFirstFrameNavigating ? "flyTo" : "moveTo",
            animationDuration: isFirstFrameNavigating ? 2500 : 1000,
          });
          lastTarget.current = stateKey;
        }
      });
    }
  }, [
    navigation.status,
    navigation.userCoords?.lng,
    navigation.userCoords?.lat,
    smoothedBearing,
    cameraRef,
    executeCameraOperation,
  ]);

  // PREVIEW: fit route to screen
  useEffect(() => {
    if (!cameraRef.current?.fitBounds) return;
    if (navigation.status !== "PREVIEW") return;
    if (
      !navigation.routeGeometry ||
      navigation.routeGeometry.type !== "LineString"
    )
      return;
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

    executeCameraOperation("preview-fit", () => {
      cameraRef.current?.fitBounds(ne, sw, PREVIEW_FIT_PADDING, 900);
      lastTarget.current = `PREVIEW-FIT-${fitKey}`;
    });
  }, [
    navigation.status,
    navigation.routeGeometry,
    navigation.destination?.lng,
    navigation.destination?.lat,
    navigation.userCoords?.lng,
    navigation.userCoords?.lat,
    cameraRef,
    executeCameraOperation,
  ]);

  // Restore camera when leaving PREVIEW or NAVIGATING
  useEffect(() => {
    const prevStatus = lastTarget.current?.split("-")[0] || null;
    const currentStatus = navigation.status;

    console.log(
      "NavigationCamera: status change",
      prevStatus,
      "->",
      currentStatus,
    );

    if (prevStatus === currentStatus) return;

    if (!cameraRef.current) return;

    if (prevStatus === "PREVIEW" && currentStatus === "IDLE") {
      lastPreviewFitKey.current = null;
      const idle = idleRegionRef.current;
      if (idle && typeof cameraRef.current.fitBounds === "function") {
        executeCameraOperation("restore-idle", () => {
          cameraRef.current?.fitBounds(idle.ne, idle.sw, 48, 700);
          lastTarget.current = null;
        });
      } else if (
        navigation.userCoords &&
        typeof cameraRef.current.setCamera === "function"
      ) {
        executeCameraOperation("restore-user", () => {
          const { lng, lat } = navigation.userCoords!;
          cameraRef.current?.setCamera({
            centerCoordinate: [lng, lat],
            zoomLevel: 15.5,
            pitch: 0,
            heading: 0,
            animationMode: "easeTo",
            animationDuration: 700,
          });
          lastTarget.current = null;
        });
      }
      return;
    }

    if (
      (prevStatus === "NAVIGATING" || prevStatus === "ARRIVED") &&
      currentStatus === "IDLE"
    ) {
      console.log("NavigationCamera: restoring from navigation to idle");
      if (
        navigation.userCoords &&
        typeof cameraRef.current.setCamera === "function"
      ) {
        executeCameraOperation("restore-navigation", () => {
          console.log("NavigationCamera: executing restore-navigation");
          const { lng, lat } = navigation.userCoords!;
          cameraRef.current?.setCamera({
            centerCoordinate: [lng, lat],
            zoomLevel: 16.5,
            pitch: 0,
            heading: 0,
            animationMode: "flyTo",
            animationDuration: 1200,
          });
          lastTarget.current = null;
        });
      }
    }
  }, [
    navigation.status,
    navigation.userCoords,
    cameraRef,
    idleRegionRef,
    executeCameraOperation,
  ]);

  return null;
}
