export const DEFAULT_LAT = 9.03584;
export const DEFAULT_LNG = 38.75242;
export const DEFAULT_RANGE = 1000;

interface Coords {
  lng: number;
  lat: number;
  accuracy?: number;
}

export const ADDIS_ABABA_CENTER: Coords = {
  lat: DEFAULT_LAT,
  lng: DEFAULT_LNG,
};

export const ADDIS_ABABA_BOUNDS = [
  [38.638, 8.832],
  [38.905, 9.098],
];
