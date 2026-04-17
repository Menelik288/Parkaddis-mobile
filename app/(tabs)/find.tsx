import {
  BALANCE_PILL_DEFAULT_WIDTH,
  BalancePillShimmer,
} from "@/components/BalancePillShimmer";
import { useAuth } from "@/context/AuthContext";
import { getDistance } from "@/lib/navigation-utils";
import { boundsFromLineString } from "@/map-native/lib/routeBounds";
import { useMap } from "@/map-native/MapProvider";
import { MapView, type ReservationRouteContext } from "@/map-native/MapView";
import { ParkingLocation, parkingService } from "@/services/parkingService";
import { walletService } from "@/services/walletService";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Clock,
  MapPin,
  Navigation as NavigationIcon,
  Search,
  Target,
  Wallet,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Loader from "@/components/Loader";

const NEIGHBORHOODS = [
  { name: "Bole", lat: 8.9958, lng: 38.7891 },
  { name: "Kazanchis", lat: 9.0205, lng: 38.7656 },
  { name: "Piazza", lat: 9.0358, lng: 38.7512 },
  { name: "Piassa", lat: 9.0358, lng: 38.7512 },
  { name: "4 Kilo", lat: 9.0375, lng: 38.7619 },
  { name: "Sarbet", lat: 8.995, lng: 38.7369 },
  { name: "22 Mazoria", lat: 9.0145, lng: 38.7825 },
  { name: "Megenagna", lat: 9.0182, lng: 38.8021 },
  { name: "Lebu", lat: 8.9554, lng: 38.7107 },
  { name: "Jemo", lat: 8.9667, lng: 38.6833 },
];

const RADIUS_ZOOM_MAP: Record<string, number> = {
  Nearby: 17.5,
  "500m": 16.2,
  "1km": 15.2,
  "3km": 14.2,
  Popular: 12.5,
};

const FEATURED_LANDMARKS: ParkingLocation[] = [
  {
    id: "l-medhane-alem",
    name: "Bole Medhane Alem",
    address: "Bole, Addis Ababa",
    geom: JSON.stringify([38.7899, 8.9958]),
  },
  {
    id: "l-bora-park",
    name: "Bora Amusement Park",
    address: "Off Bole Road",
    geom: JSON.stringify([38.7956, 8.9906]),
  },
  {
    id: "l-century-mall",
    name: "Century Mall",
    address: "Gurd Shola",
    geom: JSON.stringify([38.8139, 9.0203]),
  },
  {
    id: "l-edna-mall",
    name: "Edna Mall",
    address: "Bole, Addis Ababa",
    geom: JSON.stringify([38.7876, 8.9984]),
  },
  {
    id: "l-kazanchis",
    name: "Kazanchis Central",
    address: "Kazanchis Area",
    geom: JSON.stringify([38.7656, 9.0205]),
  },
];

export default function FindScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const primary = "#064e3b";
  const secondary = "#059669";
  const router = useRouter();
  const params = useLocalSearchParams<{
    destLat?: string;
    destLng?: string;
    destName?: string;
    locationId?: string;
  }>();
  const { user } = useAuth();
  const { actions, navigation, locateUser, cameraRef } = useMap();

  const [reservationRouteContext, setReservationRouteContext] =
    useState<ReservationRouteContext>(null);

  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [balance, setBalance] = useState<string>("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<ParkingLocation | null>(null);

  const [selectedDistance, setSelectedDistance] = useState("Nearby");
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      address: string;
      lat: number;
      lng: number;
    }>
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches] = useState([
    {
      id: "s1",
      name: "Bole Medhane Alem",
      address: "Bole, Addis Ababa",
      lat: 8.9958,
      lng: 38.7899,
    },
    {
      id: "s2",
      name: "Edna Mall",
      address: "Bole, Addis Ababa",
      lat: 8.9984,
      lng: 38.7876,
    },
    {
      id: "s3",
      name: "Century Mall",
      address: "Gurd Shola",
      lat: 9.0203,
      lng: 38.8139,
    },
  ]);
  const slideAnim = React.useRef(new Animated.Value(800)).current;

  const distanceOptions = [
    { label: "Nearby", m: 200 },
    { label: "500m", m: 500 },
    { label: "1km", m: 1000 },
    { label: "3km", m: 3000 },
    { label: "Popular", m: 10000 },
  ];

  const hideTopControls = useMemo(
    () =>
      selectedLocation != null ||
      navigation.status === "PREVIEW" ||
      navigation.status === "NAVIGATING" ||
      navigation.status === "ARRIVED",
    [selectedLocation, navigation.status],
  );

  const hideBalancePill = hideTopControls;

  const hideSearchBar =
    navigation.status === "NAVIGATING" || navigation.status === "ARRIVED";

  // Round coordinates to 2 decimal places (approx 1.1km grid) to prevent continuous re-fetching on minor GPS drift
  const userGridLat = navigation.userCoords
    ? Math.round(navigation.userCoords.lat * 100) / 100
    : null;
  const userGridLng = navigation.userCoords
    ? Math.round(navigation.userCoords.lng * 100) / 100
    : null;

  useEffect(() => {
    fetchData();
  }, [selectedDistance, userGridLat, userGridLng]);

  const clearReservationNavParams = useCallback(() => {
    router.setParams({
      destLat: undefined,
      destLng: undefined,
      destName: undefined,
      locationId: undefined,
    } as any);
  }, [router]);

  const handleDismissReservationRoute = useCallback(() => {
    setSelectedLocation(null);
    setReservationRouteContext(null);
    actions.clearNavigation();
    clearReservationNavParams();
  }, [actions, clearReservationNavParams]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const lat = params.destLat ? parseFloat(String(params.destLat)) : NaN;
    const lng = params.destLng ? parseFloat(String(params.destLng)) : NaN;

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const title = params.destName ? String(params.destName) : "Parking";
      setReservationRouteContext({ title, address: "" });
      timeoutId = setTimeout(() => {
        if (!cancelled) actions.previewDestination({ lat, lng });
      }, 450);
      return () => {
        cancelled = true;
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    if (params.locationId) {
      (async () => {
        try {
          const details = await parkingService.getLocationDetails(
            String(params.locationId),
          );
          if (cancelled) return;
          const parsed = JSON.parse(details.location.geom);
          if (Array.isArray(parsed) && parsed.length >= 2) {
            const destLng = Number(parsed[0]);
            const destLat = Number(parsed[1]);
            if (!Number.isFinite(destLat) || !Number.isFinite(destLng)) return;
            setReservationRouteContext({
              title: details.location.name,
              address: details.location.address || "",
            });
            timeoutId = setTimeout(() => {
              if (!cancelled)
                actions.previewDestination({ lat: destLat, lng: destLng });
            }, 450);
          }
        } catch {
          /* ignore */
        }
      })();
      return () => {
        cancelled = true;
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    return undefined;
  }, [
    params.destLat,
    params.destLng,
    params.destName,
    params.locationId,
    actions,
  ]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const radiusMeters =
        distanceOptions.find((o) => o.label === selectedDistance)?.m || 1000;

      // Use REAL user coordinates if available, fallback to default center
      const searchLat = navigation.userCoords?.lat || 9.03584;
      const searchLng = navigation.userCoords?.lng || 38.75242;

      const [locs, wallet] = await Promise.all([
        parkingService.getLocations(searchLat, searchLng, radiusMeters),
        walletService.getWallet(),
      ]);

      const apiLocs = Array.isArray(locs) ? locs : [];

      // Calculate distances for featured landmarks and filter them
      const filteredLandmarks = FEATURED_LANDMARKS.map((land) => {
        const coords = JSON.parse(land.geom);
        const dist = getDistance(searchLat, searchLng, coords[1], coords[0]);
        return { ...land, distance: dist };
      }).filter((land) => land.distance <= radiusMeters);

      // Combine and deduplicate
      const combined = [...filteredLandmarks];
      apiLocs.forEach((loc) => {
        if (!combined.find((c) => c.id === loc.id)) {
          combined.push(loc);
        }
      });

      // Sort by distance
      combined.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setLocations(combined);
      setBalance(wallet.balance);

      // Trigger map animation only if we have real user coordinates
      if (navigation.userCoords) {
        const targetZoom = RADIUS_ZOOM_MAP[selectedDistance] || 15.2;
        cameraRef.current?.setCamera({
          centerCoordinate: [searchLng, searchLat],
          zoomLevel: targetZoom,
          animationDuration: 1200,
          animationMode: "flyTo",
        });
      }
      // Removed auto-select to prevent map "fighting" and infinite loops
      // if (Array.isArray(locs) && locs.length > 0) setSelectedLocation(locs[0]);
    } catch (err) {
      console.error("Failed to fetch find data", err);
      setError("Could not load parking data");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const openSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(true);
    slideAnim.setValue(800);
    requestAnimationFrame(() => {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }).start();
    });
  };

  const closeSearch = () => {
    Animated.timing(slideAnim, {
      toValue: 800,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
    });
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const resp = await parkingService.getLocations(9.03584, 38.75242, 5000); // broad search
      const list = Array.isArray(resp) ? resp : [];
      const filtered = list
        .filter(
          (l) =>
            l.name.toLowerCase().includes(q.toLowerCase()) ||
            (l.address || "").toLowerCase().includes(q.toLowerCase()),
        )
        .slice(0, 8)
        .map((l) => {
          const coords = (() => {
            try {
              const p = JSON.parse(l.geom);
              return Array.isArray(p) ? { lng: p[0], lat: p[1] } : null;
            } catch {
              return null;
            }
          })();
          return {
            id: l.id,
            name: l.name,
            address: l.address ?? "",
            lat: coords?.lat ?? 9.0052,
            lng: coords?.lng ?? 38.7636,
          };
        });
      setSearchResults(filtered);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const navigateToLocation = (loc: {
    id?: string;
    name: string;
    lat: number;
    lng: number;
  }) => {
    closeSearch();
    setTimeout(() => {
      if (loc.id) {
        router.setParams({ locationId: loc.id, destName: loc.name });
      } else {
        router.setParams({
          destLat: String(loc.lat),
          destLng: String(loc.lng),
          destName: loc.name,
        });
      }
    }, 320);
  };

  const safeLocations = Array.isArray(locations) ? locations : [];

  const geoJsonFeatures = useMemo(() => {
    return safeLocations.map((loc) => {
      let coordinates: [number, number] = [38.763611, 9.005401];
      try {
        const parsed = JSON.parse(loc.geom);
        if (Array.isArray(parsed) && parsed.length === 2) {
          coordinates = [parsed[0], parsed[1]];
        }
      } catch (e) {
        console.warn(
          `Failed to parse geometry for location ${loc.id}:`,
          loc.geom,
        );
      }

      return {
        type: "Feature",
        id: loc.id,
        properties: {
          id: loc.id,
          name: loc.name,
          address: loc.address,
        },
        geometry: {
          type: "Point",
          coordinates: coordinates,
        },
      };
    });
  }, [safeLocations]);

  const handleMapLocationClick = (id: string | null) => {
    if (!id) {
      setSelectedLocation(null);
      return;
    }
    const loc = safeLocations.find((l) => l.id === id);
    if (loc) setSelectedLocation(loc);
  };

  return (
    <View className="flex-1">
      <View className="flex-1 relative bg-slate-300">
        <MapView
          displayedLocations={geoJsonFeatures}
          onLocationClick={handleMapLocationClick}
          selectedLocation={geoJsonFeatures.find(
            (f: { id: any }) => f.id === selectedLocation?.id,
          )}
          reservationRouteContext={reservationRouteContext}
          onDismissReservationRoute={handleDismissReservationRoute}
        />

        {/* Top Navigation Overlay */}
        <View
          className={`absolute left-6 right-6 z-50 ${Platform.OS === "ios" ? "top-[68px]" : "top-[48px]"}`}
        >
          <View className="flex-row justify-between items-start">
            {!hideTopControls ? (
              <View className="flex-col gap-2">
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 5,
                  }}
                  className={`w-12 h-12 rounded-full border items-center justify-center ${isDark ? "bg-[#1e293b] border-[#334155]" : "bg-white border-[#f1f5f9]"}`}
                >
                  <ArrowLeft size={24} color={isDark ? "#34d399" : "#064e3b"} />
                </TouchableOpacity>

                {!hideSearchBar ? (
                  <View className="flex-col gap-2">
                    <TouchableOpacity
                      onPress={openSearch}
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 6,
                        elevation: 5,
                      }}
                      className={`w-12 h-12 rounded-full border items-center justify-center ${isDark ? "bg-[#1e293b] border-[#334155]" : "bg-white border-[#f1f5f9]"}`}
                    >
                      <Search
                        size={24}
                        color={isDark ? "#34d399" : "#064e3b"}
                      />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : (
              <View />
            )}

            {!hideBalancePill && loading ? (
              <BalancePillShimmer isDark={isDark} />
            ) : !hideBalancePill ? (
              <TouchableOpacity
                onPress={() => router.push("/wallet" as any)}
                style={{ width: BALANCE_PILL_DEFAULT_WIDTH }}
                className={`flex-row items-center pl-3 pr-1 py-1.5 min-h-[44px] rounded-full border border-[#064e3b] gap-2.5 ${isDark ? "bg-[#1e293b]" : "bg-white"}`}
              >
                <View
                  style={{ flex: 1, minWidth: 0 }}
                  className="justify-center"
                >
                  <Text className="text-[9px] font-bold text-[#475569] uppercase tracking-wider">
                    BALANCE
                  </Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className={`text-[15px] font-bold tracking-tight ${isDark ? "text-[#34d399]" : "text-[#064e3b]"}`}
                  >
                    ETB {balance}
                  </Text>
                </View>
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? "bg-[#34d399]" : "bg-[#064e3b]"}`}
                >
                  <Wallet size={16} color={isDark ? "#064e3b" : "white"} />
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Balanced Controls Row */}
        <View
          className={`absolute bottom-[225px] left-6 right-6 flex-row items-end z-[60] ${
            navigation.status === "IDLE" ? "justify-between" : "justify-end"
          }`}
          style={Platform.OS === "android" ? { elevation: 14 } : undefined}
          pointerEvents="box-none"
        >
          {navigation.status === "IDLE" && (
            <View className="relative h-14 justify-end">
              {showDistanceDropdown && (
                <View
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.2,
                    shadowRadius: 20,
                    elevation: 12,
                  }}
                  className={`absolute bottom-16 left-0 w-36 rounded-2xl p-2 ${isDark ? "bg-[#1e293b]" : "bg-white"}`}
                >
                  {distanceOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.label}
                      className={`p-3 rounded-lg ${selectedDistance === opt.label ? (isDark ? "bg-[#34d399]" : "bg-[#064e3b]") : ""}`}
                      onPress={() => {
                        setSelectedDistance(opt.label);
                        setShowDistanceDropdown(false);
                      }}
                    >
                      <Text
                        className={`text-sm font-semibold ${selectedDistance === opt.label ? (isDark ? "text-[#064e3b]" : "text-white") : isDark ? "text-[#f8fafc]" : "text-[#0f172a]"}`}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowDistanceDropdown(!showDistanceDropdown)}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                  elevation: 6,
                }}
                className={`flex-row items-center gap-2 px-4 h-12 rounded-full ${isDark ? "bg-[#1e293b]" : "bg-white"}`}
              >
                <Text
                  className={`text-sm font-bold ${isDark ? "text-[#34d399]" : "text-[#064e3b]"}`}
                >
                  {selectedDistance}
                </Text>
                <ChevronDown size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row gap-3" pointerEvents="box-none">
            <TouchableOpacity
              activeOpacity={0.8}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={() => {
                if (navigation.status !== "IDLE") {
                  if (
                    navigation.routeGeometry?.type === "LineString" &&
                    cameraRef?.current?.fitBounds
                  ) {
                    try {
                      const user = navigation.userCoords;
                      const extra = user
                        ? [[user.lng, user.lat] as [number, number]]
                        : [];
                      const bounds = boundsFromLineString(
                        navigation.routeGeometry as any,
                        extra,
                      );
                      cameraRef.current.fitBounds(
                        bounds.ne,
                        bounds.sw,
                        [240, 44, 220, 44],
                        900,
                      );
                    } catch {
                      /* ignore */
                    }
                  } else if (
                    navigation.destination &&
                    cameraRef?.current?.setCamera
                  ) {
                    cameraRef.current.setCamera({
                      centerCoordinate: [
                        navigation.destination.lng,
                        navigation.destination.lat,
                      ],
                      zoomLevel: 15.5,
                      animationDuration: 1000,
                      animationMode: "flyTo",
                      pitch: 0,
                      heading: 0,
                    });
                  }
                } else {
                  setSelectedLocation(null);
                  actions.clearNavigation();
                  void locateUser();
                }
              }}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 8,
              }}
              className={`w-14 h-14 rounded-full items-center justify-center border ${isDark ? "bg-[#1e293b] border-[#334155]" : "bg-white border-white"}`}
            >
              <Target size={26} color={isDark ? "#34d399" : primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Parking Cards Carousel */}
        {navigation.status === "IDLE" && (
          <View className="absolute bottom-[115px] left-0 right-0 z-40">
            {loading ? (
              <View
                className={`mx-6 h-24 rounded-[22px] flex-row items-center px-6 gap-4 ${isDark ? "bg-[#111827]" : "bg-white"}`}
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                <Loader
                  size="sm"
                  color={isDark ? "bg-[#34d399]" : "bg-[#064e3b]"}
                />
                <Text
                  className={`text-[15px] font-semibold ${isDark ? "text-[#f8fafc]" : "text-[#0f172a]"}`}
                >
                  Finding spots...
                </Text>
              </View>
            ) : error ? (
              <View
                className={`mx-6 h-24 rounded-[22px] flex-row items-center px-6 gap-4 border border-red-500/10 ${isDark ? "bg-[#111827]" : "bg-white"}`}
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center">
                  <AlertCircle size={20} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-red-500 text-[13px] font-bold"
                    numberOfLines={1}
                  >
                    {error}
                  </Text>
                  <TouchableOpacity onPress={fetchData}>
                    <Text className="text-[#94a3b8] text-[11px] font-bold mt-0.5">
                      TAP TO RETRY
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              >
                {safeLocations.length === 0 ? (
                  <View
                    className={`flex-row w-[285px] h-24 rounded-[22px] p-5 items-center gap-4 border border-[#064e3b]/10 ${isDark ? "bg-[#111827]" : "bg-white"}`}
                    style={{
                      shadowColor: "#000",
                      shadowOpacity: 0.05,
                      shadowRadius: 10,
                      elevation: 4,
                    }}
                  >
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-50"}`}
                    >
                      <MapPin size={22} color="#94a3b8" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-[14px] font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                      >
                        No spots found
                      </Text>
                      <Text className="text-[11px] text-[#94a3b8] mt-0.5">
                        Try a larger distance
                      </Text>
                    </View>
                  </View>
                ) : (
                  safeLocations.map((loc) => (
                    <TouchableOpacity
                      key={loc.id}
                      activeOpacity={0.9}
                      onPress={() =>
                        router.push({
                          pathname: "/reserve",
                          params: { id: loc.id },
                        } as any)
                      }
                      className={`flex-row w-[285px] h-24 rounded-[22px] overflow-hidden border ${selectedLocation?.id === loc.id ? "border-[#064e3b] border-2" : "border-[#064e3b]/10"} ${isDark ? "bg-[#111827]" : "bg-white"}`}
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity:
                          selectedLocation?.id === loc.id ? 0.2 : 0.1,
                        shadowRadius: 10,
                        elevation: 4,
                      }}
                    >
                      <View className="p-2">
                        <Image
                          source={{
                            uri: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200&h=200&fit=crop",
                          }}
                          className="w-20 h-full rounded-[14px]"
                        />
                      </View>
                      <View className="flex-1 py-3 pr-4 justify-between">
                        <View>
                          <Text
                            className={`text-[15px] font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                            numberOfLines={1}
                          >
                            {loc.name}
                          </Text>
                          <Text className="text-[11px] text-[#94a3b8]">
                            Open 24/7 • Secure
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <View className="flex-row items-center gap-1.5">
                            <View className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                            <Text className="text-[10px] font-extrabold text-[#10b981] uppercase tracking-wider">
                              Available
                            </Text>
                          </View>
                          <Text
                            className={`text-[13px] font-black ${isDark ? "text-[#34d399]" : "text-[#064e3b]"}`}
                          >
                            ETB 25
                            <Text className="text-[10px] font-normal text-[#94a3b8]">
                              /hr
                            </Text>
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        )}
        {/* Search Slide-Up Modal */}
        {showSearch && (
          <View
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 200,
              justifyContent: "flex-end",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={closeSearch}
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.45)",
              }}
            />
            <Animated.View
              style={[
                {
                  transform: [{ translateY: slideAnim }],
                  borderTopLeftRadius: 32,
                  borderTopRightRadius: 32,
                  backgroundColor: isDark ? "#0f172a" : "#ffffff",
                  paddingBottom: 40,
                  height: "80%",
                },
              ]}
            >
              {/* Handle & Close button */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: 4,
                }}
              >
                <View style={{ width: 40 }} />
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: isDark ? "#334155" : "#e2e8f0",
                  }}
                />
                <TouchableOpacity
                  onPress={closeSearch}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={20} color={isDark ? "#94a3b8" : "#475569"} />
                </TouchableOpacity>
              </View>

              {/* Search input */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginHorizontal: 20,
                  marginVertical: 12,
                  paddingHorizontal: 20,
                  height: 64,
                  borderRadius: 28,
                  borderWidth: 1,
                  gap: 10,
                  backgroundColor: isDark ? "#1e293b" : "#f8fafc",
                  borderColor: isDark ? "#334155" : "#e2e8f0",
                }}
              >
                <Search size={18} color={isDark ? "#34d399" : "#064e3b"} />
                <TextInput
                  autoFocus
                  placeholder="Search parking..."
                  placeholderTextColor="#94a3b8"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontWeight: "600",
                    color: isDark ? "#f8fafc" : "#0f172a",
                  }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                  >
                    <X size={16} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Recent or live results */}
                {searchQuery.length === 0 ? (
                  <View style={{ paddingHorizontal: 20 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "800",
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        color: "#94a3b8",
                        marginBottom: 12,
                      }}
                    >
                      Recent Searches
                    </Text>
                    {recentSearches.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        onPress={() => navigateToLocation(s)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          paddingVertical: 14,
                          borderBottomWidth: 1,
                          borderBottomColor: isDark ? "#1e293b" : "#f1f5f9",
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: isDark ? "#1e293b" : "#f8fafc",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Clock size={16} color="#94a3b8" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: "600",
                              color: isDark ? "#f8fafc" : "#0f172a",
                            }}
                          >
                            {s.name}
                          </Text>
                          <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                            {s.address}
                          </Text>
                        </View>
                        <NavigationIcon size={14} color="#94a3b8" />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={{ paddingHorizontal: 20 }}>
                    {searchLoading ? (
                      <View
                        style={{ paddingVertical: 20, alignItems: "center" }}
                      >
                        <Loader
                          size="sm"
                          color={isDark ? "bg-[#34d399]" : "bg-[#064e3b]"}
                        />
                      </View>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <TouchableOpacity
                          key={result.id}
                          onPress={() => navigateToLocation(result)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            paddingVertical: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: isDark ? "#1e293b" : "#f1f5f9",
                          }}
                        >
                          <View
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 18,
                              backgroundColor: isDark
                                ? "rgba(52, 211, 153, 0.1)"
                                : "rgba(6, 78, 59, 0.05)",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <MapPin
                              size={18}
                              color={isDark ? "#34d399" : "#064e3b"}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 15,
                                fontWeight: "600",
                                color: isDark ? "#f8fafc" : "#0f172a",
                              }}
                            >
                              {result.name}
                            </Text>
                            <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                              {result.address}
                            </Text>
                          </View>
                          <ArrowRight size={14} color="#94a3b8" />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View
                        style={{ paddingVertical: 40, alignItems: "center" }}
                      >
                        <Text style={{ color: "#94a3b8", fontSize: 14 }}>
                          No locations found for "{searchQuery}"
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  );
}
