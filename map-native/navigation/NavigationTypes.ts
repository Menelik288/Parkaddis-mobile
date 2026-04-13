import type { LineString } from 'geojson';

export type NavigationStatus = 'IDLE' | 'PREVIEW' | 'NAVIGATING' | 'ARRIVED';

export interface Coords {
  lng: number;
  lat: number;
  accuracy?: number;
}

export interface NavigationState {
  status: NavigationStatus;
  destination: Coords | null;
  routeGeometry: LineString | null;
  bearing: number;
  userCoords: Coords | null;
  remainingDistance: number | null;
  remainingDuration: number | null;
}

export interface NavigationActions {
  setNavigationStatus: (status: NavigationStatus) => void;
  setDestination: (dest: Coords | null) => void;
  setRouteGeometry: (geo: GeoJSON.LineString | null) => void;
  updateNavigationMetrics: (distance: number, duration: number) => void;
  setBearing: (bearing: number) => void;
  setUserCoords: (coords: Coords | null) => void;
  previewDestination: (dest: Coords) => void;
  clearNavigation: () => void;
  startNavigation: () => void;
  stopNavigation: () => void;
}
