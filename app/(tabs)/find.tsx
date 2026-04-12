import { BALANCE_PILL_DEFAULT_WIDTH, BalancePillShimmer } from '@/components/BalancePillShimmer';
import { useAuth } from '@/context/AuthContext';
import { useMap } from '@/map-native/MapProvider';
import { MapView, type ReservationRouteContext } from '@/map-native/MapView';
import { ParkingLocation, parkingService } from '@/services/parkingService';
import { walletService } from '@/services/walletService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, ArrowRight, ChevronDown, MapPin, RefreshCw, Search, Target, Wallet } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { boundsFromLineString } from '@/map-native/lib/routeBounds';
import { ActivityIndicator, Image, Platform, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function FindScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#059669';
  const router = useRouter();
  const params = useLocalSearchParams<{
    destLat?: string;
    destLng?: string;
    destName?: string;
    locationId?: string;
  }>();
  const { user } = useAuth();
  const { actions, navigation, locateUser, cameraRef } = useMap();

  const [reservationRouteContext, setReservationRouteContext] = useState<ReservationRouteContext>(null);

  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [balance, setBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  
  const [selectedDistance, setSelectedDistance] = useState("All");
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);

  const distanceOptions = [
    { label: "All", m: 1000 },
    { label: "200m", m: 200 },
    { label: "400m", m: 400 },
    { label: "600m", m: 600 },
  ];

  const hideTopControls = useMemo(
    () =>
      selectedLocation != null ||
      navigation.status === 'PREVIEW' ||
      navigation.status === 'NAVIGATING' ||
      navigation.status === 'ARRIVED',
    [selectedLocation, navigation.status]
  );

  const hideBalancePill = hideTopControls;

  const hideSearchBar = navigation.status === 'NAVIGATING' || navigation.status === 'ARRIVED';

  // Round coordinates to 2 decimal places (approx 1.1km grid) to prevent continuous re-fetching on minor GPS drift
  const userGridLat = navigation.userCoords ? Math.round(navigation.userCoords.lat * 100) / 100 : null;
  const userGridLng = navigation.userCoords ? Math.round(navigation.userCoords.lng * 100) / 100 : null;

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
      const title = params.destName ? String(params.destName) : 'Parking';
      setReservationRouteContext({ title, address: '' });
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
          const details = await parkingService.getLocationDetails(String(params.locationId));
          if (cancelled) return;
          const parsed = JSON.parse(details.location.geom);
          if (Array.isArray(parsed) && parsed.length >= 2) {
            const destLng = Number(parsed[0]);
            const destLat = Number(parsed[1]);
            if (!Number.isFinite(destLat) || !Number.isFinite(destLng)) return;
            setReservationRouteContext({
              title: details.location.name,
              address: details.location.address || '',
            });
            timeoutId = setTimeout(() => {
              if (!cancelled) actions.previewDestination({ lat: destLat, lng: destLng });
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
  }, [params.destLat, params.destLng, params.destName, params.locationId, actions]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const radiusMeters = distanceOptions.find(o => o.label === selectedDistance)?.m || 1000;
      
      // Use REAL user coordinates if available, fallback to default center
      const searchLat = navigation.userCoords?.lat || 9.03584; 
      const searchLng = navigation.userCoords?.lng || 38.75242;

      const [locs, wallet] = await Promise.all([
        parkingService.getLocations(searchLat, searchLng, radiusMeters),
        walletService.getWallet()
      ]);
      setLocations(Array.isArray(locs) ? locs : []);
      setBalance(wallet.balance);
      // Removed auto-select to prevent map "fighting" and infinite loops
      // if (Array.isArray(locs) && locs.length > 0) setSelectedLocation(locs[0]);
    } catch (err) {
      console.error('Failed to fetch find data', err);
      setError('Could not load parking data');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const safeLocations = Array.isArray(locations) ? locations : [];

  const geoJsonFeatures = useMemo(() => {
    return safeLocations.map(loc => {
      let coordinates: [number, number] = [38.763611, 9.005401];
      try {
        const parsed = JSON.parse(loc.geom);
        if (Array.isArray(parsed) && parsed.length === 2) {
          coordinates = [parsed[0], parsed[1]];
        }
      } catch (e) {
        console.warn(`Failed to parse geometry for location ${loc.id}:`, loc.geom);
      }

      return {
        type: 'Feature',
        id: loc.id,
        properties: {
          id: loc.id,
          name: loc.name,
          address: loc.address,
        },
        geometry: {
          type: 'Point',
          coordinates: coordinates
        }
      };
    });
  }, [safeLocations]);

  const handleMapLocationClick = (id: string | null) => {
    if (!id) {
      setSelectedLocation(null);
      return;
    }
    const loc = safeLocations.find(l => l.id === id);
    if (loc) setSelectedLocation(loc);
  };

  return (
    <View className="flex-1">
      <View className="flex-1 relative bg-slate-300">
        <MapView
          displayedLocations={geoJsonFeatures}
          onLocationClick={handleMapLocationClick}
          selectedLocation={geoJsonFeatures.find(f => f.id === selectedLocation?.id)}
          reservationRouteContext={reservationRouteContext}
          onDismissReservationRoute={handleDismissReservationRoute}
        />

        {/* Top Navigation Overlay */}
        <View className={`absolute left-6 right-6 z-50 ${Platform.OS === 'ios' ? 'top-[68px]' : 'top-[48px]'}`}>
          <View className="flex-row justify-between items-start">
            {!hideTopControls ? (
              <View className="flex-col gap-2">
                <TouchableOpacity 
                  onPress={() => router.back()} 
                  className={`w-12 h-12 rounded-full border items-center justify-center shadow-md ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
                >
                  <ArrowLeft size={24} color={isDark ? '#34d399' : '#064e3b'} />
                </TouchableOpacity>

                {!hideSearchBar ? (
                  <TouchableOpacity 
                    className={`w-12 h-12 rounded-full border items-center justify-center shadow-md ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
                  >
                    <Search size={24} color={isDark ? '#34d399' : '#064e3b'} />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : <View />}

            {!hideBalancePill && loading ? (
              <BalancePillShimmer isDark={isDark} />
            ) : !hideBalancePill ? (
              <TouchableOpacity 
                onPress={() => router.push('/wallet')}
                style={{ width: BALANCE_PILL_DEFAULT_WIDTH }}
                className={`flex-row items-center pl-4 pr-1.5 py-2.5 min-h-[52px] rounded-full border border-[#064e3b] gap-3 ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}
              >
                <View style={{ flex: 1, minWidth: 0 }} className="justify-center">
                  <Text className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">BALANCE</Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className={`text-base font-bold tracking-tight ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}
                  >
                    ETB {balance}
                  </Text>
                </View>
                <View className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}>
                  <Wallet size={20} color={isDark ? '#064e3b' : 'white'} />
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
          style={Platform.OS === 'android' ? { elevation: 14 } : undefined}
          pointerEvents="box-none"
        >
            {navigation.status === "IDLE" && (
            <View className="relative h-14 justify-end">
              {showDistanceDropdown && (
                <View className={`absolute bottom-16 left-0 w-36 rounded-2xl p-2 shadow-2xl ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}>
                  {distanceOptions.map((opt) => (
                    <TouchableOpacity 
                      key={opt.label} 
                      className={`p-3 rounded-lg ${selectedDistance === opt.label ? (isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]') : ''}`}
                      onPress={() => { setSelectedDistance(opt.label); setShowDistanceDropdown(false); }}
                    >
                      <Text className={`text-sm font-semibold ${selectedDistance === opt.label ? (isDark ? 'text-[#064e3b]' : 'text-white') : (isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]')}`}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setShowDistanceDropdown(!showDistanceDropdown)} 
                className={`flex-row items-center gap-2 px-4 h-12 rounded-full shadow-lg ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}
              >
                <Text className={`text-sm font-bold ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>{selectedDistance}</Text>
                <ChevronDown size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            )}

            <View className="flex-row gap-3" pointerEvents="box-none">
              <TouchableOpacity 
                activeOpacity={0.8}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={() => {
                  if (navigation.status !== 'IDLE') {
                    if (navigation.routeGeometry?.type === 'LineString' && cameraRef?.current?.fitBounds) {
                      try {
                        const user = navigation.userCoords;
                        const extra = user ? [[user.lng, user.lat] as [number, number]] : [];
                        const bounds = boundsFromLineString(navigation.routeGeometry as any, extra);
                        cameraRef.current.fitBounds(bounds.ne, bounds.sw, [240, 44, 220, 44], 900);
                      } catch { /* ignore */ }
                    } else if (navigation.destination && cameraRef?.current?.setCamera) {
                      cameraRef.current.setCamera({
                        centerCoordinate: [navigation.destination.lng, navigation.destination.lat],
                        zoomLevel: 15.5,
                        animationDuration: 1000,
                        animationMode: 'flyTo',
                        pitch: 0,
                        heading: 0
                      });
                    }
                  } else {
                    setSelectedLocation(null);
                    void locateUser();
                  }
                }}
                className={`w-12 h-12 rounded-full items-center justify-center shadow-lg border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-white'}`}
              >
                <Target size={22} color={isDark ? '#34d399' : primary} />
              </TouchableOpacity>
            </View>
          </View>

        {/* Parking Cards Carousel */}
        {navigation.status === 'IDLE' && (
          <View className="absolute bottom-[115px] left-0 right-0 z-40">
            {loading ? (
              <View className={`mx-6 h-24 rounded-[18px] flex-row items-center px-4 gap-3 ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}>
                <ActivityIndicator size="small" color={primary} />
                <Text className={`text-sm font-semibold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Finding spots...</Text>
              </View>
            ) : error ? (
              <View className={`mx-6 h-24 rounded-[18px] flex-row items-center px-4 gap-3 ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}>
                <AlertCircle size={24} color="#ef4444" />
                <Text className="flex-1 text-red-500 text-sm font-bold" numberOfLines={1}>{error}</Text>
                <TouchableOpacity onPress={fetchData} className="px-4 py-2 rounded-lg bg-[#064e3b]/10">
                  <Text className="text-[#064e3b] font-bold">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {safeLocations.length === 0 ? (
                  <View className={`flex-row w-[300px] h-24 rounded-[18px] p-4 items-center gap-3 border border-[#064e3b]/20 ${isDark ? 'bg-[#1e293b] border-[#34d399]/20' : 'bg-white'}`}>
                    <MapPin size={24} color="#94a3b8" />
                    <View className="flex-1">
                      <Text className={`text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>No spots found</Text>
                      <Text className="text-[10px] text-[#64748b]">Try increasing distance</Text>
                    </View>
                    <TouchableOpacity className="w-9 h-9 border border-[#064e3b] rounded-full items-center justify-center" onPress={fetchData}>
                      <RefreshCw size={18} color={primary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  safeLocations.map((loc) => (
                    <TouchableOpacity 
                      key={loc.id} 
                      activeOpacity={0.9}
                      onPress={() => router.push({ pathname: '/reserve', params: { id: loc.id } } as any)}
                      className={`flex-row w-[300px] h-24 rounded-[18px] overflow-hidden border ${selectedLocation?.id === loc.id ? 'border-[#064e3b] border-2' : 'border-[#064e3b]/20'} ${isDark ? 'bg-[#1e293b] border-[#34d399]/20' : 'bg-white'}`}
                    >
                      <Image source={{ uri: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200&h=200&fit=crop' }} className="w-24 h-full" />
                      <View className="flex-1 p-3 justify-between">
                        <View className="flex-row justify-between items-start">
                          <Text className={`text-sm font-bold flex-1 mr-2 ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`} numberOfLines={1}>{loc.name}</Text>
                          <Text className="text-sm font-black text-[#064e3b]">25<Text className="text-[10px] font-normal text-[#64748b]">/h</Text></Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <View className="flex-row items-center gap-1.5">
                            <View className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                            <Text className="text-[10px] font-bold text-[#059669]">12 Slots Left</Text>
                          </View>
                          <ArrowRight size={16} color="#94a3b8" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
