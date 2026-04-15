import MapLibreGL from "@maplibre/maplibre-react-native";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { useMap } from "../MapProvider";
import { UserLocationMarker } from "../ui/UserLocationMarker";

/**
 * Custom user location (brand secondary + pulse). Uses merged GPS from navigation context.
 */
export function UserLayer() {
  const { coords, navigation } = useMap();
  const pos = navigation.userCoords || coords;
  const lastPos = useRef(pos);

  useEffect(() => {
    if (pos) lastPos.current = pos;
  }, [pos]);

  const displayPos = pos || lastPos.current;
  if (!displayPos) return null;

  return (
    <MapLibreGL.PointAnnotation
      id="user-location"
      coordinate={[displayPos.lng, displayPos.lat]}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View collapsable={false} style={{ overflow: "visible" }}>
        <UserLocationMarker />
      </View>
    </MapLibreGL.PointAnnotation>
  );
}
