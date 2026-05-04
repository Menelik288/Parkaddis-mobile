import { useRecentSearches } from '@/hooks/useRecentSearches';
import {
  BALANCE_PILL_DEFAULT_WIDTH,
  BalancePillShimmer,
} from "@/components/BalancePillShimmer";
import { BalancePill } from "@/components/BalancePill";
import { ReserveBottomSheet, ReserveBottomSheetRef } from "@/components/ReserveBottomSheet";
import { useAuth } from "@/context/AuthContext";
import { getDistance } from "@/lib/navigation-utils";
import { boundsFromLineString } from "@/map-native/lib/routeBounds";
import { useMap } from "@/map-native/MapProvider";
import { MapView, type ReservationRouteContext } from "@/map-native/MapView";
import { RouteManager } from "@/map-native/navigation/RouteManager";
import { NavigationCamera } from "@/map-native/navigation/NavigationCamera";
import { ParkingLocation, parkingService } from "@/services/parkingService";
import { reservationService, getReservationLocationLabel, type Reservation } from "@/services/reservationService";
import { walletService } from "@/services/walletService";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
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

// Neighborhoods and Featured Landmarks removed to rely on DB locations
const RADIUS_ZOOM_MAP: Record<string, number> = {
  Nearby: 16.2,
  "1km": 15.2,
  "3km": 14.2,
  Popular: 12.5,
};

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
  const reserveSheetRef = React.useRef<ReserveBottomSheetRef>(null);

  const [reservationRouteContext, setReservationRouteContext] =
    useState<ReservationRouteContext>(null);

  const navigationStatusRef = React.useRef(navigation.status);
  useEffect(() => {
    navigationStatusRef.current = navigation.status;
  }, [navigation.status]);

  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [balance, setBalance] = useState<string>("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<ParkingLocation | null>(null);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);

  const [selectedDistance, setSelectedDistance] = useState("Nearby");
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  const [allLocations, setAllLocations] = useState<ParkingLocation[]>([]);

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
  const { recentSearches, saveSearch: saveToRecentSearches } = useRecentSearches();

  const slideAnim = React.useRef(new Animated.Value(800)).current;

  const distanceOptions = [
    { label: "Nearby", m: 500 },
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

  useEffect(() => {
    // Lock in user location on mount so routing is ready
    locateUser();
  }, [locateUser]);

  const handleDismissReservationRoute = useCallback(() => {
    setSelectedLocation(null);
    setReservationRouteContext(null);
    setActiveReservation(null);
    actions.clearNavigation();
    clearReservationNavParams();

    // Use the unified locateUser logic to reset camera consistently
    const targetZoom = RADIUS_ZOOM_MAP[selectedDistance] || 15.2;
    void locateUser(targetZoom);
  }, [actions, clearReservationNavParams, locateUser, selectedDistance]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const lat = params.destLat ? parseFloat(String(params.destLat)) : NaN;
    const lng = params.destLng ? parseFloat(String(params.destLng)) : NaN;

    // IMPORTANT: If we are already navigating or arrived, do NOT let URL params
    // trigger a preview transition.
    if (navigation.status === "NAVIGATING" || navigation.status === "ARRIVED") {
      return undefined;
    }

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const title = params.destName ? String(params.destName) : "Parking";
      const mockLoc: ParkingLocation = {
        id: "search-result",
        name: title,
        address: "",
        geom: JSON.stringify([lng, lat]),
      };
      setSelectedLocation(mockLoc);
      setReservationRouteContext({ title, address: "Selected from search" });
      
      actions.previewDestination({ lat, lng });
      reserveSheetRef.current?.present();

      return () => {
        cancelled = true;
      };
    }

    if (params.locationId) {
      (async () => {
        try {
          const details = await parkingService.getLocationDetails(
            String(params.locationId),
          );
          if (cancelled) return;
          
          const geomRaw = details.location.geom;
          let parsed: any = null;
          if (typeof geomRaw === "string") {
            if (geomRaw.startsWith("[") || geomRaw.startsWith("{")) {
              parsed = JSON.parse(geomRaw);
            } else if (geomRaw.length > 40 && /^[0-9A-F]+$/i.test(geomRaw)) {
              try {
                const lngHex = geomRaw.substring(18, 34);
                const latHex = geomRaw.substring(34, 50);
                const hexToDouble = (h: string) => {
                  const bytes = new Uint8Array(h.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
                  return new DataView(bytes.buffer).getFloat64(0, true);
                };
                parsed = [hexToDouble(lngHex), hexToDouble(latHex)];
              } catch {}
            }
          } else {
            parsed = geomRaw;
          }
          
          if (Array.isArray(parsed) && parsed.length >= 2) {
            const destLng = Number(parsed[0]);
            const destLat = Number(parsed[1]);
            if (!Number.isFinite(destLat) || !Number.isFinite(destLng)) return;
            
            const mockLoc: ParkingLocation = {
              id: details.location.id,
              name: details.location.name,
              address: details.location.address || "",
              geom: JSON.stringify(parsed),
            };
            setSelectedLocation(mockLoc);
            setReservationRouteContext({
              title: details.location.name,
              address: details.location.address || "",
            });
            
            timeoutId = setTimeout(() => {
              if (!cancelled) {
                actions.previewDestination({ lat: destLat, lng: destLng });
                reserveSheetRef.current?.present();
              }
            }, 150);
          }
        } catch (err) {
          console.error(`[find.tsx] Error loading location details:`, err);
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
    navigation.status,
  ]);

  // Handle active/reserved session on mount or focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const checkActiveSession = async () => {
      try {
        const res = await reservationService.getActiveReservation();
        if (res && (res.status === "RESERVED" || res.status === "ACTIVE")) {
          setActiveReservation(res);

          const locName = getReservationLocationLabel(res);
          let geomStr =
            res.spot?.location?.geom || res.spot?.geom || res.geom;

          // If geometry wasn't included in the reservation payload, fetch it directly
          if (!geomStr) {
            const locId = res.spot?.locationId || res.locationId || res.spot?.id;
            if (locId) {
              try {
                const details = await parkingService.getLocationDetails(locId);
                geomStr = details?.location?.geom;
              } catch (e) {
                console.error("[find.tsx] Failed to fetch missing geometry", e);
              }
            }
          }

          if (geomStr) {
            try {
              const parsed = JSON.parse(geomStr);
              const lng = parsed[0];
              const lat = parsed[1];

              if (!Number.isFinite(lng) || !Number.isFinite(lat) || lng === 0 || lat === 0) {
                console.warn("[find.tsx] Skipping active session with invalid coords", { lng, lat });
                return;
              }

              const reservedLoc: ParkingLocation = {
                id: res.spot?.locationId || res.locationId || res.id,
                name: locName,
                address: res.spot?.location?.name || res.locationName || "",
                geom: geomStr,
              };

              setSelectedLocation(reservedLoc);
              setReservationRouteContext({ title: locName, address: res.spot?.location?.name || res.locationName || "" });

              console.log("[find.tsx] Triggering previewDestination immediately with coords:", { lat, lng });
              actions.previewDestination({ lat, lng });

              // Delay the actual navigation mode slightly to allow preview bounds to fit
              setTimeout(() => {
                if (isActive) {
                  console.log("[find.tsx] Triggering startNavigation for active reservation");
                  actions.startNavigation();
                }
              }, 800);
            } catch (e) {
              console.error("[find.tsx] Failed to parse active reservation geom", e);
            }
          }
        }
      } catch (err) {
        console.error("Failed to check active session", err);
      }
    };
    if (isActive) checkActiveSession();
    
    return () => {
      isActive = false;
    };
  }, []));

  // Close reservation sheet when navigation starts to focus on the map
  useEffect(() => {
    if (navigation.status === "NAVIGATING") {
      reserveSheetRef.current?.close?.();
    }
  }, [navigation.status]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const radiusMeters =
        distanceOptions.find((o) => o.label === selectedDistance)?.m || 1000;

      // Use REAL user coordinates if available, fallback to default center
      const searchLat = navigation.userCoords?.lat || 9.03584;
      const searchLng = navigation.userCoords?.lng || 38.75242;

      const [locs, wallet, allLocs] = await Promise.all([
        parkingService.getLocations(searchLat, searchLng, radiusMeters),
        walletService.getWallet(),
        allLocations.length === 0 ? parkingService.getLocations() : Promise.resolve(null)
      ]);

      if (allLocs) setAllLocations(allLocs);

      const apiLocs = (Array.isArray(locs) ? locs : []).filter((l) => {
        try {
          const p = JSON.parse(l.geom);
          return (
            Array.isArray(p) &&
            p.length >= 2 &&
            Number.isFinite(p[0]) &&
            Number.isFinite(p[1]) &&
            p[0] !== 0 &&
            p[1] !== 0
          );
        } catch {
          return false;
        }
      });

      setLocations(apiLocs);
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

    // 1. Instant Client-Side Filter (Proposed in BACKEND_UPDATES.md)
    const normalizedQuery = q.toLowerCase();
    const clientResults = allLocations
      .filter(
        (l) =>
          l.name.toLowerCase().includes(normalizedQuery) ||
          (l.address || "").toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 5)
      .map((l) => {
        try {
          const p = JSON.parse(l.geom);
          return {
            id: l.id,
            name: l.name,
            address: l.address,
            lat: p[1],
            lng: p[0],
          };
        } catch (e) {
          return null;
        }
      })
      .filter((r) => r !== null) as any[];

    setSearchResults(clientResults);

    // 2. Async Backend Fallback (New Endpoint)
    if (q.length > 2) {
      setSearchLoading(true);
      try {
        const backendResults = (await parkingService.searchLocations(
          q,
          navigation.userCoords?.lat,
          navigation.userCoords?.lng,
        )) || [];

        const mapped = (Array.isArray(backendResults) ? backendResults : []).slice(0, 8).map((l: any) => {
          try {
            const p = JSON.parse(l.geom);
            return {
              id: l.id,
              name: l.name,
              address: l.address,
              lat: p[1],
              lng: p[0],
            };
          } catch (e) {
            return null;
          }
        }).filter(r => r !== null) as any[];

        // Merge results, avoiding duplicates
        setSearchResults((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNew = mapped.filter((m) => !existingIds.has(m.id));
          return [...prev, ...uniqueNew].slice(0, 12);
        });
      } catch (err) {
        console.error("Backend search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const navigateToLocation = (loc: {
    id: string;
    name: string;
    address?: string;
    lat: number;
    lng: number;
  }) => {
    closeSearch();
    
    // 1. Mock a Location object for the sheet (since it might not be in the 'Nearby' list)
    const mockLoc: ParkingLocation = {
      id: loc.id,
      name: loc.name,
      address: loc.address || "",
      geom: JSON.stringify([loc.lng, loc.lat]),
    };

    // 2. Trigger selection and sheet presentation
    setSelectedLocation(mockLoc);
    setReservationRouteContext({ title: loc.name, address: loc.address || "" });
    
    // 3. Trigger route calculation immediately
    actions.previewDestination({ lat: loc.lat, lng: loc.lng });

    // 4. Save to recent searches
    saveToRecentSearches(loc);

    setTimeout(() => {
      reserveSheetRef.current?.present();
    }, 100);
  };

  const safeLocations = useMemo(() => {
    let list = Array.isArray(locations) ? [...locations] : [];

    // 1. Ensure selectedLocation is always included (even if from search/far away)
    if (selectedLocation && !list.find((l) => l.id === selectedLocation.id)) {
      list.push(selectedLocation);
    }

    // 2. Hide other pins if we are in navigation, have an active session, or just selected a search result
    const isNavigating =
      navigation.status === "NAVIGATING" || navigation.status === "ARRIVED";
    const hasSearchSelection = !!selectedLocation && !!reservationRouteContext;

    if (isNavigating || activeReservation || hasSearchSelection) {
      const targetId =
        selectedLocation?.id ||
        activeReservation?.spot?.locationId ||
        activeReservation?.locationId;

      if (targetId) {
        list = list.filter((l) => l.id === targetId);
      }
    }

    // 3. Final safety filter: remove any locations with invalid or zero coordinates
    return list.filter((l) => {
      try {
        const p = JSON.parse(l.geom);
        return (
          Array.isArray(p) &&
          p.length >= 2 &&
          Number.isFinite(p[0]) &&
          Number.isFinite(p[1]) &&
          p[0] !== 0 &&
          p[1] !== 0
        );
      } catch {
        return false;
      }
    });
  }, [
    locations,
    activeReservation,
    navigation.status,
    selectedLocation,
    reservationRouteContext,
  ]);

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
      setReservationRouteContext(null);
      actions.clearNavigation();
      return;
    }
    const loc = safeLocations.find((l) => l.id === id);
    if (loc) {
      setSelectedLocation(loc);
      // Clear context when clicking a map pin so it doesn't auto-start navigation route
      setReservationRouteContext(null);
      actions.clearNavigation();
    }
  };

  return (
    <View className="flex-1">
      <View className="flex-1 relative bg-slate-300">
        <RouteManager />
        <NavigationCamera />
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
          className={`absolute left-6 right-6 z-10 ${Platform.OS === "ios" ? "top-[68px]" : "top-[48px]"}`}
          pointerEvents="box-none"
        >
          <View className="flex-row justify-between items-start">
            {!hideTopControls ? (
              <View className="flex-col gap-2">
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  className={`w-12 h-12 rounded-full border items-center justify-center ${isDark ? "bg-[#1e293b]/90 border-[#334155]" : "bg-white/90 border-[#f1f5f9]"}`}
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
              <BalancePill balance={balance} isDark={isDark} />
            ) : null}
          </View>
        </View>

        {/* Balanced Controls Row */}
        <View
          className="absolute bottom-[225px] left-6 right-6 flex-row items-end justify-between z-10"
          style={Platform.OS === "android" ? { elevation: 14 } : undefined}
          pointerEvents="box-none"
        >
          {navigation.status === "IDLE" ? (
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
          ) : null}

          <View className="flex-row gap-3 ml-auto" pointerEvents="box-none">
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
                        [120, 44, 480, 44],
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
                  const targetZoom = RADIUS_ZOOM_MAP[selectedDistance] || 15.2;
                  void locateUser(targetZoom);
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
                      onPress={() => {
                        let lat = 0, lng = 0;
                        try {
                          const p = JSON.parse(loc.geom);
                          lng = p[0];
                          lat = p[1];
                        } catch(e) {}
                        
                        if (lat && lng) {
                          setSelectedLocation(loc);
                          setReservationRouteContext({ title: loc.name, address: loc.address });
                          actions.previewDestination({ lat, lng });
                          saveToRecentSearches({ id: loc.id, name: loc.name, address: loc.address ?? '', lat, lng });
                          reserveSheetRef.current?.present();
                        }
                      }}
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
        
        <View className="absolute inset-0 z-50" pointerEvents="box-none">
          <ReserveBottomSheet 
            ref={reserveSheetRef} 
            locationId={selectedLocation?.id ?? null} 
            onClose={() => {
              // Only clear navigation if we are NOT in active navigation mode.
              // This allows the sheet to auto-close when starting a trip without killing the route.
              if (
                navigationStatusRef.current !== "NAVIGATING" &&
                navigationStatusRef.current !== "ARRIVED"
              ) {
                handleDismissReservationRoute();
              }
            }}
          />
        </View>
      </View>
    </View>
  );
}
