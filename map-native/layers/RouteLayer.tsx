import MapLibreGL from "@maplibre/maplibre-react-native";
import { useMap } from '../MapProvider';

export function RouteLayer() {
  const { navigation } = useMap();

  if (!MapLibreGL || !navigation.routeGeometry || navigation.status === "IDLE") {
    return null;
  }

  return (
    <MapLibreGL.ShapeSource
      id="route-line-source"
      shape={{
        type: 'Feature',
        geometry: navigation.routeGeometry,
        properties: {},
      }}
    >
      <MapLibreGL.LineLayer
        id="route-line-layer"
        style={{
          lineColor: '#10B981',
          lineWidth: 5,
          lineJoin: 'round',
          lineCap: 'round',
          lineOpacity: 0.8,
        }}
        layerIndex={150}
      />
    </MapLibreGL.ShapeSource>
  );
}
