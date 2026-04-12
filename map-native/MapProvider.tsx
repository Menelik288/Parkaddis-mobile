import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import * as Location from "expo-location";
import { InteractionManager } from "react-native";
import { ADDIS_ABABA_CENTER } from "@/lib/location";
import { NavigationState, NavigationActions, Coords } from "./navigation/NavigationTypes";
import { useNavigationState } from "./hooks/useNavigationState";
import { useBearingSmoothing } from "./hooks/useBearingSmoothing";

/** Last visible map bounds while status is IDLE (for restoring after pin / preview dismiss). */
export type MapRegionSnapshot = {
  ne: [number, number];
  sw: [number, number];
};

interface MapContextType {
  coords: Coords | null;
  locateUser: () => Promise<void>;
  isLoading: boolean;
  navigation: NavigationState;
  actions: NavigationActions;
  cameraRef: React.RefObject<any>;
  /** Native MapView finished loading; Camera.setNativeProps is safe after this. */
  mapViewHasLoadedRef: React.MutableRefObject<boolean>;
  /** Smoothed GPS heading (deg); shared by NavigationCamera + user puck arrow */
  smoothedBearing: number;
  updateSmoothedBearing: (deg: number) => void;
  /** Updated from MapView while IDLE — used to restore the view when clearing route preview. */
  idleRegionRef: React.MutableRefObject<MapRegionSnapshot | null>;
}

export const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
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
  } = useNavigationState();

  const { smoothedBearing, updateBearing: updateSmoothedBearing } = useBearingSmoothing();

  const cameraRef = React.useRef<any>(null);
  const mapViewHasLoadedRef = React.useRef(false);
  const idleRegionRef = React.useRef<MapRegionSnapshot | null>(null);

  const scheduleFlyToCoords = useCallback((lng: number, lat: number) => {
    const run = () => {
      cameraRef.current?.setCamera?.({
        centerCoordinate: [lng, lat],
        zoomLevel: 15.5,
        animationDuration: 2000,
        animationMode: 'flyTo',
        pitch: 0,
        heading: 0,
      });
    };
    const start = () => {
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(run);
      });
    };
    if (mapViewHasLoadedRef.current) {
      start();
      return;
    }
    let ticks = 0;
    const poll = setInterval(() => {
      ticks += 1;
      if (mapViewHasLoadedRef.current || ticks >= 40) {
        clearInterval(poll);
        start();
      }
    }, 50);
  }, []);

  const locateUser = useCallback(async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      setIsLoading(false);
      return;
    }

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const newCoords = {
        lng: position.coords.longitude,
        lat: position.coords.latitude,
        accuracy: position.coords.accuracy || undefined,
      };
      setCoords(newCoords);
      setUserCoords(newCoords);
      clearNavigation();
      scheduleFlyToCoords(newCoords.lng, newCoords.lat);
    } catch (err) {
      console.error("Location error:", err);
      const defaultCoords = {
        lng: ADDIS_ABABA_CENTER.lng,
        lat: ADDIS_ABABA_CENTER.lat,
      };
      setCoords(defaultCoords);
      setUserCoords(defaultCoords);
      scheduleFlyToCoords(defaultCoords.lng, defaultCoords.lat);
    } finally {
      setIsLoading(false);
    }
  }, [setUserCoords, clearNavigation, scheduleFlyToCoords]);

  useEffect(() => {
    locateUser();
  }, [locateUser]);

  const actions = useMemo(() => ({
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
  }), [
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
  ]);

  const contextValue = useMemo(() => ({
    coords,
    locateUser,
    isLoading,
    navigation,
    actions,
    cameraRef,
    mapViewHasLoadedRef,
    smoothedBearing,
    updateSmoothedBearing,
    idleRegionRef,
  }), [coords, locateUser, isLoading, navigation, actions, smoothedBearing, updateSmoothedBearing]);

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
}

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
};
