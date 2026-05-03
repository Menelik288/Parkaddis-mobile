import { ADDIS_ABABA_CENTER } from "@/lib/location";
import * as Location from "expo-location";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useBearingSmoothing } from "./hooks/useBearingSmoothing";
import { useNavigationState } from "./hooks/useNavigationState";
import {
  Coords,
  NavigationActions,
  NavigationState,
} from "./navigation/NavigationTypes";

/** Last visible map bounds while status is IDLE (for restoring after pin / preview dismiss). */
export type MapRegionSnapshot = {
  ne: [number, number];
  sw: [number, number];
};

interface MapContextType {
  coords: Coords | null;
  locateUser: (zoom?: number) => Promise<void>;
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
  /** Current camera center coordinates */
  currentCenterRef: React.MutableRefObject<Coords | null>;
}

export const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { navigation, actions } = useNavigationState();

  const { smoothedBearing, updateBearing: updateSmoothedBearing } =
    useBearingSmoothing();

  const cameraRef = React.useRef<any>(null);
  const mapViewHasLoadedRef = React.useRef(false);
  const idleRegionRef = React.useRef<MapRegionSnapshot | null>(null);
  const currentCenterRef = React.useRef<Coords | null>(null);

  const scheduleFlyToCoords = useCallback(
    (
      lng: number,
      lat: number,
      options?: {
        zoom?: number;
        duration?: number;
        mode?: "flyTo" | "easeTo" | "moveTo";
      },
    ) => {
      const { zoom = 15.5, duration = 1000, mode = "easeTo" } = options || {};

      const run = () => {
        if (!mapViewHasLoadedRef.current) {
          return;
        }
        if (!cameraRef.current?.setCamera) {
          return;
        }
        cameraRef.current.setCamera({
          centerCoordinate: [lng, lat],
          zoomLevel: zoom,
          animationDuration: duration,
          animationMode: mode,
          pitch: 0,
          heading: 0,
        });
      };

      // Schedule camera movement with animation frame for consistency
      requestAnimationFrame(run);
    },
    [],
  );

  const locateUser = useCallback(async (customZoom?: number) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
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

      // Update coordinates
      setCoords(newCoords);

      // Only fly if not already centered on user location
      const currentCenter = currentCenterRef.current;
      const shouldFly =
        !currentCenter ||
        Math.abs(currentCenter.lng - newCoords.lng) > 0.0001 ||
        Math.abs(currentCenter.lat - newCoords.lat) > 0.0001;

      if (shouldFly) {
        scheduleFlyToCoords(newCoords.lng, newCoords.lat, { zoom: customZoom });
      }
    } catch (err) {
      console.error("Location error:", err);
      const defaultCoords = {
        lng: ADDIS_ABABA_CENTER.lng,
        lat: ADDIS_ABABA_CENTER.lat,
      };
      setCoords(defaultCoords);
      scheduleFlyToCoords(defaultCoords.lng, defaultCoords.lat, { zoom: customZoom });
    } finally {
      setIsLoading(false);
    }
  }, [scheduleFlyToCoords]);

  useEffect(() => {
    locateUser();
  }, [locateUser]);

  const contextValue = useMemo(
    () => ({
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
      currentCenterRef,
    }),
    [
      coords,
      locateUser,
      isLoading,
      navigation,
      actions,
      smoothedBearing,
      updateSmoothedBearing,
    ],
  );

  return (
    <MapContext.Provider value={contextValue}>{children}</MapContext.Provider>
  );
}

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
};
