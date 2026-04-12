/**
 * OSRM Routing Service
 * Fetches routing geometry and metrics from the open-source OSRM API.
 */

export async function fetchOSRMRoute(start: [number, number], end: [number, number]) {
  const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM fetch failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("fetchOSRMRoute error:", error);
    throw error;
  }
}
