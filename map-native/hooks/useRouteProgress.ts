import { useEffect } from "react";
import { useMap } from "../MapProvider";
import { getDistance } from "@/lib/navigation-utils";

export function useRouteProgress() {
  const { navigation, actions } = useMap();

  useEffect(() => {
    if (navigation.status !== "NAVIGATING" || !navigation.userCoords || !navigation.destination) return;

    const distToDest = getDistance(
      navigation.userCoords.lat,
      navigation.userCoords.lng,
      navigation.destination.lat,
      navigation.destination.lng
    );

    const speedMs = 30 / 3.6;
    const durationS = Math.max(30, distToDest / speedMs);
    actions.updateNavigationMetrics(distToDest, durationS);

    if (distToDest < 15) {
      actions.setNavigationStatus("ARRIVED");
    }
  }, [navigation.userCoords, navigation.destination, navigation.status, actions]);

  return null;
}
