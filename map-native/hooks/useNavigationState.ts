import { useCallback, useMemo, useState } from "react";
import {
  Coords,
  NavigationState,
  NavigationStatus,
} from "../navigation/NavigationTypes";

export function useNavigationState() {
  const [navigation, setNavigation] = useState<NavigationState>({
    status: "IDLE",
    destination: null,
    routeGeometry: null,
    remainingDistance: null,
    remainingDuration: null,
    bearing: 0,
    userCoords: null,
  });

  const setNavigationStatus = useCallback((status: NavigationStatus) => {
    setNavigation((prev) => ({ ...prev, status }));
  }, []);

  const setDestination = useCallback((destination: Coords | null) => {
    setNavigation((prev) => ({ ...prev, destination }));
  }, []);

  const setRouteGeometry = useCallback((routeGeometry: any) => {
    setNavigation((prev) => ({ ...prev, routeGeometry }));
  }, []);

  const updateNavigationMetrics = useCallback(
    (distance: number, duration: number) => {
      setNavigation((prev) => ({
        ...prev,
        remainingDistance: distance,
        remainingDuration: duration,
      }));
    },
    [],
  );

  const setBearing = useCallback((bearing: number) => {
    setNavigation((prev) => ({ ...prev, bearing }));
  }, []);

  const setUserCoords = useCallback((coords: Coords | null) => {
    setNavigation((prev) => ({ ...prev, userCoords: coords }));
  }, []);

  const previewDestination = useCallback((dest: Coords) => {
    setNavigation((prev) => ({
      ...prev,
      status: "PREVIEW",
      destination: dest,
      routeGeometry: null,
    }));
  }, []);

  const clearNavigation = useCallback(() => {
    setNavigation((prev) => ({
      ...prev,
      status: "IDLE",
      destination: null,
      routeGeometry: null,
      remainingDistance: null,
      remainingDuration: null,
    }));
  }, []);

  const startNavigation = useCallback(() => {
    setNavigation((prev) => ({ ...prev, status: "NAVIGATING" }));
  }, []);

  const stopNavigation = clearNavigation;

  // Memoize actions to prevent unnecessary re-renders
  const actions = useMemo(
    () => ({
      setNavigationStatus,
      setDestination,
      setRouteGeometry,
      updateNavigationMetrics,
      setBearing,
      setUserCoords,
      previewDestination,
      clearNavigation,
      startNavigation,
      stopNavigation,
    }),
    [
      setNavigationStatus,
      setDestination,
      setRouteGeometry,
      updateNavigationMetrics,
      setBearing,
      setUserCoords,
      previewDestination,
      clearNavigation,
      startNavigation,
      stopNavigation,
    ],
  );

  return {
    navigation,
    setNavigationStatus,
    setDestination,
    setRouteGeometry,
    updateNavigationMetrics,
    setBearing,
    setUserCoords,
    previewDestination,
    clearNavigation,
    startNavigation,
    stopNavigation,
    actions,
  };
}
