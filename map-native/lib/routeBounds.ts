import type { LineString, Position } from 'geojson';

/** Expand bounds to include all line vertices plus optional extra points (e.g. user location). */
export function boundsFromLineString(
  line: LineString,
  extra: Position[] = []
): { ne: [number, number]; sw: [number, number] } {
  const coords = [...(line.coordinates || []), ...extra];
  if (coords.length === 0) {
    throw new Error('boundsFromLineString: no coordinates');
  }
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const c of coords) {
    const [lng, lat] = c;
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  const pad = 0.0012;
  return {
    sw: [minLng - pad, minLat - pad],
    ne: [maxLng + pad, maxLat + pad],
  };
}
