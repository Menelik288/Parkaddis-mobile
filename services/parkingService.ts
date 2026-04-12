import apiClient from '../api/client';

export interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  geom: string; // "[lng, lat]"
  distance?: number;
}

export interface ParkingSpotDetails {
  id: string;
  pricePerHour: string;
  totalSlots: number;
  availableSlots: number;
}

export interface LocationDetails {
  location: ParkingLocation;
  spot: ParkingSpotDetails;
}

export const parkingService = {
  getLocations: async (lat?: number, lng?: number, distance?: number) => {
    const params: any = {};
    if (lat) params.lat = lat;
    if (lng) params.lng = lng;
    if (distance) params.distance = distance;

    const response = await apiClient.get<any>('/parking', { params });
    
    // DIAGNOSTIC LOG (Keeping for one more run but simplified)
    console.log("RAW_PARKING_DATA:", response.data?.locations?.type || typeof response.data);

    // 1. Handle GeoJSON FeatureCollection (The "Sedest Kilo" format)
    if (response.data?.locations?.type === 'FeatureCollection') {
      const features = response.data.locations.features || [];
      return features.map((f: any) => ({
        id: f.properties.id || f.id,
        name: f.properties.name,
        address: f.properties.address,
        // Convert geometry coordinates back to stringified "[lng, lat]" for FindScreen
        geom: f.geometry?.coordinates ? JSON.stringify(f.geometry.coordinates) : "[]",
        ...f.properties, // Spread remaining props like distance, eta
      }));
    }

    // 2. Handle direct array responses
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // 3. Handle simple wrapped object { locations: [] }
    if (response.data?.locations && Array.isArray(response.data.locations)) {
      return response.data.locations;
    }

    return [];
  },

  getLocationDetails: async (id: string) => {
    const response = await apiClient.post<LocationDetails>('/parking/location', { id });
    return response.data;
  },
};

export default parkingService;
