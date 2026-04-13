import React, { useEffect, useRef } from "react";
import { useMap } from "../MapProvider";
import { fetchOSRMRoute } from "@/lib/osrm";

export function RouteManager() {
  const { coords, navigation, actions } = useMap();
  const lastDestination = useRef<string | null>(null);

  useEffect(() => {
    // If no destination, ensure route is cleared
    if (!navigation.destination) {
      if (navigation.routeGeometry) {
        actions.setRouteGeometry(null);
      }
      lastDestination.current = null;
      return;
    }

    if (!coords) return;

    const { lng, lat } = navigation.userCoords || coords;
    const dest = navigation.destination;
    const destKey = `${dest.lng},${dest.lat}`;

    // Optimization: Only refetch if destination changed OR we don't have a route yet.
    if (lastDestination.current === destKey && navigation.routeGeometry) return;
    
    // Only fetch if we have a destination and we are in PREVIEW or NAVIGATING
    const shouldFetch = (navigation.status === "PREVIEW" || navigation.status === "NAVIGATING") && navigation.destination;
    
    if (shouldFetch) {
      const updateRoute = async () => {
        if (!lng || !lat || !dest) return;

        try {
          console.log("RouteManager (Mobile): Fetching OSRM route...");
          const response = await fetchOSRMRoute([lng, lat], [dest.lng, dest.lat]);
          
          if (response.code === "Ok" && response.routes.length > 0) {
            const route = response.routes[0];
            actions.setRouteGeometry(route.geometry as any);
            actions.updateNavigationMetrics(route.distance, route.duration);
            lastDestination.current = destKey;
          }
        } catch (error) {
          console.error("RouteManager: Fetch failed", error);
        }
      };

      updateRoute();
    }
  }, [coords?.lat, coords?.lng, navigation.destination, navigation.status, navigation.userCoords?.lat, navigation.userCoords?.lng, actions]);

  return null;
}
