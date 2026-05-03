import { getDistance } from "@/lib/navigation-utils";
import { fetchOSRMRoute } from "@/lib/osrm";
import { useCallback, useEffect, useRef } from "react";
import { useMap } from "../MapProvider";

export function RouteManager() {
  const { coords, navigation, actions } = useMap();
  const lastDestination = useRef<string | null>(null);
  const lastOrigin = useRef<{ lng: number; lat: number } | null>(null);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const shouldFetchRoute = useCallback(() => {
    // Only fetch while previewing or actively navigating
    const shouldFetch =
      (navigation.status === "PREVIEW" || navigation.status === "NAVIGATING") &&
      navigation.destination;
    
    if (!shouldFetch) return false;

    // Use userCoords as primary, fallback to initial coords
    const origin = navigation.userCoords || coords;
    if (!origin) return false;

    const dest = navigation.destination;
    const destKey = `${dest.lng},${dest.lat}`;

    const destinationChanged = lastDestination.current !== destKey;
    const hasRoute = Boolean(navigation.routeGeometry);

    if (destinationChanged) {
      return destKey;
    }

    // Origin movement threshold - 30 meters to avoid jitter
    const originMoved =
      !lastOrigin.current ||
      getDistance(lastOrigin.current.lat, lastOrigin.current.lng, origin.lat, origin.lng) > 30;

    return hasRoute && !originMoved ? false : destKey;
  }, [coords, navigation.userCoords, navigation.destination, navigation.status, navigation.routeGeometry]);

  const fetchRoute = useCallback(
    async (destKey: string) => {
      if (isFetchingRef.current) return;

      const origin = navigation.userCoords || coords;
      if (!origin) return;
      const { lng, lat } = origin;
      const dest = navigation.destination!;

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      isFetchingRef.current = true;

      try {
        const response = await fetchOSRMRoute([lng, lat], [dest.lng, dest.lat]);

        // Check if request was cancelled
        if (abortControllerRef.current?.signal.aborted) return;

        if (response.code === "Ok" && response.routes.length > 0) {
          const route = response.routes[0];
          actions.setRouteGeometry(route.geometry as any);
          actions.updateNavigationMetrics(route.distance, route.duration);
          lastDestination.current = destKey;
          lastOrigin.current = { lng, lat };
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("RouteManager: Fetch failed", error);
      } finally {
        isFetchingRef.current = false;
        abortControllerRef.current = null;
      }
    },
    [coords, navigation.userCoords, navigation.destination, actions],
  );

  useEffect(() => {
    const destKey = shouldFetchRoute();
    if (destKey) {
      fetchRoute(destKey);
    }
  }, [shouldFetchRoute, fetchRoute]);

  // Clear route when destination is removed
  useEffect(() => {
    if (!navigation.destination) {
      if (navigation.routeGeometry) {
        actions.setRouteGeometry(null);
      }
      lastDestination.current = null;
      lastOrigin.current = null;

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      isFetchingRef.current = false;
    }
  }, [navigation.destination, navigation.routeGeometry, actions]);

  return null;
}
