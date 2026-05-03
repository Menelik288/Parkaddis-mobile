import MapLibreGL from "@maplibre/maplibre-react-native";
import { useMap } from '../MapProvider';

export function RouteLayer() {
  const { navigation } = useMap();

  // On iOS, MapLibre children must be valid native objects. 
  // We provide an empty ShapeSource when inactive instead of returning null to avoid 'object cannot be nil' crashes.
  const routeActive = MapLibreGL && navigation.routeGeometry && navigation.status !== "IDLE";

  return (
    <MapLibreGL.ShapeSource
      id="route-line-source"
      shape={routeActive ? {
        type: 'Feature',
        geometry: navigation.routeGeometry!,
        properties: {},
      } : {
        type: 'FeatureCollection',
        features: []
      }}
    >
      <MapLibreGL.LineLayer
        id="route-line-layer"
        style={{
          lineColor: '#10B981',
          lineWidth: 5,
          lineJoin: 'round',
          lineCap: 'round',
          lineOpacity: routeActive ? 0.8 : 0,
        }}
      />
    </MapLibreGL.ShapeSource>
  );
}
