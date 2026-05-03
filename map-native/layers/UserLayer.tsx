import MapLibreGL from "@maplibre/maplibre-react-native";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useMap } from "../MapProvider";
import { UserLocationMarker } from "../ui/UserLocationMarker";

/**
 * Custom user location (brand secondary + pulse). Uses merged GPS from navigation context.
 */
export function UserLayer() {
  const { coords, navigation } = useMap();
  const rawTarget = navigation.userCoords || coords;
  const targetPos = (rawTarget && rawTarget.lat !== 0 && rawTarget.lng !== 0) ? rawTarget : null;
  
  const [displayPos, setDisplayPos] = useState(targetPos);
  const currentPosRef = useRef(targetPos);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!targetPos) return;

    if (!currentPosRef.current) {
      currentPosRef.current = targetPos;
      setDisplayPos(targetPos);
      return;
    }

    const initialPos = { ...currentPosRef.current };
    const startTime = Date.now();
    const duration = 1000;

    const animate = () => {
      const now = Date.now();
      let progress = (now - startTime) / duration;
      if (progress > 1) progress = 1;

      const ease = progress; // Linear tracking ensures no jerky overlaps during navigation tracking

      const newPos = {
        lat: initialPos.lat + (targetPos.lat - initialPos.lat) * ease,
        lng: initialPos.lng + (targetPos.lng - initialPos.lng) * ease,
      };

      currentPosRef.current = newPos;
      setDisplayPos(newPos);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetPos?.lat, targetPos?.lng]); // Update smoothly whenever raw GPS values shift

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
