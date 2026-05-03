import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { ParkingPinMarker } from '../ui/ParkingPinMarker';

interface ParkingLayerProps {
  locations: any;
  onLocationClick: (id: string) => void;
  /** Highlight pin for the selected carousel / sheet location */
  selectedLocationId?: string | null;
}

export function ParkingLayer({ locations, onLocationClick, selectedLocationId }: ParkingLayerProps) {
  const validFeatures = useMemo(() => {
    const list = Array.isArray(locations) ? locations : locations?.features || [];
    if (!Array.isArray(list)) return [];
    
    return list.filter((feature: any) => {
      const id = feature?.id ?? feature?.properties?.id;
      const coords = feature?.geometry?.coordinates;
      if (!id || !Array.isArray(coords) || coords.length < 2) return false;
      const [lng, lat] = coords;
      return Number.isFinite(lng) && Number.isFinite(lat);
    });
  }, [locations]);

  // On iOS, MapLibreMapView doesn't like Fragments as direct children.
  // We return the array of annotations directly.
  return (validFeatures.map((feature: any) => {
    const id = feature?.id ?? feature?.properties?.id;
    const [lng, lat] = feature.geometry.coordinates;
    const selected = selectedLocationId != null && String(selectedLocationId) === String(id);
    
    return (
      <MapLibreGL.PointAnnotation
        key={String(id)}
        id={String(id)}
        coordinate={[lng, lat]}
        anchor={{ x: 0.5, y: 1 }}
        onSelected={() => onLocationClick(String(id))}
      >
        <View collapsable={false}>
          <ParkingPinMarker selected={selected} />
        </View>
      </MapLibreGL.PointAnnotation>
    );
  }) as any);
}
