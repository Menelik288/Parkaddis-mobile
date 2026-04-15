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
    if (!navigation.destination || !coords) return false;

    const { lng, lat } = navigation.userCoords || coords;
    const dest = navigation.destination;
    const destKey = `${dest.lng},${dest.lat}`;

    // Only fetch while previewing or actively navigating
    const shouldFetch =
      (navigation.status === "PREVIEW" || navigation.status === "NAVIGATING") &&
      navigation.destination;
    if (!shouldFetch) return false;

    const originMoved =
      !lastOrigin.current ||
      getDistance(lastOrigin.current.lat, lastOrigin.current.lng, lat, lng) >
        15;
    const destinationChanged = lastDestination.current !== destKey;
    const hasRoute = Boolean(navigation.routeGeometry);

    return !destinationChanged && hasRoute && !originMoved ? false : destKey;
  }, [coords, navigation]);

  const fetchRoute = useCallback(
    async (destKey: string) => {
      if (isFetchingRef.current) return;

      const { lng, lat } = navigation.userCoords || coords!;
      const dest = navigation.destination!;

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      isFetchingRef.current = true;

      try {
        console.log("RouteManager (Mobile): Fetching OSRM route...");
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
          console.log("RouteManager: Request cancelled");
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
}
