import { parkingService } from '@/services/parkingService';
import type { Reservation } from '@/services/reservationService';

function parseGeomString(raw: unknown): { lng: number; lat: number } | null {
  if (typeof raw !== 'string' || !raw.length) return null;
  try {
    const p = JSON.parse(raw);
    return parseCoordPair(p);
  } catch {
    return null;
  }
}

function parseCoordPair(p: unknown): { lng: number; lat: number } | null {
  if (!Array.isArray(p) || p.length < 2) return null;
  const lng = Number(p[0]);
  const lat = Number(p[1]);
  if (Number.isFinite(lng) && Number.isFinite(lat)) return { lng, lat };
  return null;
}

function parseGeomFlexible(raw: unknown): { lng: number; lat: number } | null {
  if (raw == null) return null;
  if (typeof raw === 'string') return parseGeomString(raw);
  if (typeof raw === 'object' && raw !== null && 'coordinates' in raw) {
    const c = (raw as { coordinates?: unknown }).coordinates;
    return parseCoordPair(c);
  }
  return null;
}

function readLatLng(o: Record<string, unknown>): { lng: number; lat: number } | null {
  const pairs: [string, string][] = [
    ['lng', 'lat'],
    ['longitude', 'latitude'],
    ['lon', 'lat'],
    ['destinationLng', 'destinationLat'],
    ['destination_lng', 'destination_lat'],
  ];
  for (const [lk, la] of pairs) {
    const lng = o[lk];
    const lat = o[la];
    if (typeof lng === 'number' && typeof lat === 'number' && Number.isFinite(lng) && Number.isFinite(lat)) {
      return { lng, lat };
    }
    if (typeof lng === 'string' && typeof lat === 'string') {
      const ln = parseFloat(lng);
      const lt = parseFloat(lat);
      if (Number.isFinite(ln) && Number.isFinite(lt)) return { lng: ln, lat: lt };
    }
  }
  return null;
}

function collectLocationIds(r: Reservation): string[] {
  const o = r as unknown as Record<string, unknown>;
  const out: string[] = [];
  const push = (v: unknown) => {
    if (typeof v === 'string' && v.length > 0) out.push(v);
  };

  const spot = o.spot as Record<string, unknown> | undefined;
  if (spot) {
    push(spot.locationId);
    const loc = spot.location as { id?: string } | undefined;
    push(loc?.id);
    push(spot.parkingLocationId);
  }
  push(o.locationId);
  push(o.parkingLocationId);
  push(o.parkingLocation_id);

  return [...new Set(out)];
}

/** Try to read [lng, lat] from common API shapes on a reservation. */
export function getReservationDestinationCoords(r: Reservation): { lng: number; lat: number } | null {
  const o = r as unknown as Record<string, unknown>;

  const directPair = readLatLng(o);
  if (directPair) return directPair;

  const trySpot = o.spot as { location?: { geom?: unknown }; geom?: unknown } | undefined;
  const fromSpotLoc = trySpot?.location?.geom != null ? parseGeomFlexible(trySpot.location.geom) : null;
  if (fromSpotLoc) return fromSpotLoc;

  const fromSpot = trySpot?.geom != null ? parseGeomFlexible(trySpot.geom) : null;
  if (fromSpot) return fromSpot;

  const loc = o.location as { geom?: unknown } | undefined;
  if (loc?.geom != null) {
    const p = parseGeomFlexible(loc.geom);
    if (p) return p;
  }

  if (o.geom != null) {
    const p = parseGeomFlexible(o.geom);
    if (p) return p;
  }

  return null;
}

/**
 * Resolve parking coordinates: embedded geom / latlng first, then try each location id with `GET /parking/location`.
 * Also tries `spotId` when API uses it as the parking location document id.
 */
export async function resolveReservationDestination(
  r: Reservation
): Promise<{ lng: number; lat: number } | null> {
  const direct = getReservationDestinationCoords(r);
  if (direct) return direct;

  const o = r as unknown as Record<string, unknown>;
  const ids = collectLocationIds(r);
  const spotId = typeof o.spotId === 'string' ? o.spotId : undefined;
  if (spotId && !ids.includes(spotId)) {
    ids.push(spotId);
  }

  for (const id of ids) {
    try {
      const details = await parkingService.getLocationDetails(id);
      const g = details?.location?.geom;
      const c = typeof g === 'string' ? parseGeomString(g) : parseGeomFlexible(g);
      if (c) return c;
    } catch {
      /* try next id */
    }
  }

  return null;
}
