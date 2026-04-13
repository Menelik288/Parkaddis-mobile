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
import { ActivityIndicator, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { getDistance } from '@/lib/navigation-utils';

const NEIGHBORHOODS = [
  { name: 'Bole', lat: 8.9958, lng: 38.7891 },
  { name: 'Kazanchis', lat: 9.0205, lng: 38.7656 },
  { name: 'Piazza', lat: 9.0358, lng: 38.7512 },
  { name: 'Piassa', lat: 9.0358, lng: 38.7512 },
  { name: '4 Kilo', lat: 9.0375, lng: 38.7619 },
  { name: 'Sarbet', lat: 8.9950, lng: 38.7369 },
  { name: '22 Mazoria', lat: 9.0145, lng: 38.7825 },
  { name: 'Megenagna', lat: 9.0182, lng: 38.8021 },
  { name: 'Lebu', lat: 8.9554, lng: 38.7107 },
  { name: 'Jemo', lat: 8.9667, lng: 38.6833 },
];

const RADIUS_ZOOM_MAP: Record<string, number> = {
  'Nearby': 17.5,
  '500m': 16.2,
  '1km': 15.2,
  '3km': 14.2,
  'Popular': 12.5,
};

const FEATURED_LANDMARKS: ParkingLocation[] = [
  {
    id: 'l-medhane-alem',
    name: 'Bole Medhane Alem',
    address: 'Bole, Addis Ababa',
    geom: JSON.stringify([38.7899, 8.9958]),
  },
  {
    id: 'l-bora-park',
    name: 'Bora Amusement Park',
    address: 'Off Bole Road',
    geom: JSON.stringify([38.7956, 8.9906]),
  },
  {
    id: 'l-century-mall',
    name: 'Century Mall',
    address: 'Gurd Shola',
    geom: JSON.stringify([38.8139, 9.0203]),
  },
  {
    id: 'l-edna-mall',
    name: 'Edna Mall',
    address: 'Bole, Addis Ababa',
    geom: JSON.stringify([38.7876, 8.9984]),
  },
  {
    id: 'l-kazanchis',
    name: 'Kazanchis Central',
    address: 'Kazanchis Area',
    geom: JSON.stringify([38.7656, 9.0205]),
  },
];

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
  
  const [selectedDistance, setSelectedDistance] = useState("Nearby");
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(NEIGHBORHOODS);

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
      
      const apiLocs = Array.isArray(locs) ? locs : [];
      
      // Calculate distances for featured landmarks and filter them
      const filteredLandmarks = FEATURED_LANDMARKS.map(land => {
        const coords = JSON.parse(land.geom);
        const dist = getDistance(searchLat, searchLng, coords[1], coords[0]);
        return { ...land, distance: dist };
      }).filter(land => land.distance <= radiusMeters);

      // Combine and deduplicate
      const combined = [...filteredLandmarks];
      apiLocs.forEach(loc => {
        if (!combined.find(c => c.id === loc.id)) {
          combined.push(loc);
        }
      });

      // Sort by distance
      combined.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setLocations(combined);
      setBalance(wallet.balance);

      // Trigger map animation
      const targetZoom = RADIUS_ZOOM_MAP[selectedDistance] || 15.2;
      cameraRef.current?.setCamera({
        centerCoordinate: [searchLng, searchLat],
        zoomLevel: targetZoom,
        animationDuration: 1200,
        animationMode: 'flyTo',
      });
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

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults(NEIGHBORHOODS);
      return;
    }
    const filtered = NEIGHBORHOODS.filter(n => 
      n.name.toLowerCase().includes(q.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const selectNeighborhood = async (n: { lat: number; lng: number; name: string }) => {
    setShowSearch(false);
    setSearchQuery(n.name);
    
    // Animate to location
    cameraRef.current?.setCamera({
      centerCoordinate: [n.lng, n.lat],
      zoomLevel: 15.2,
      animationDuration: 1500,
      animationMode: 'flyTo',
    });

    // Fetch data at new location
    setLoading(true);
    try {
      const radiusMeters = distanceOptions.find(o => o.label === selectedDistance)?.m || 1000;
      const [locs] = await Promise.all([
        parkingService.getLocations(n.lat, n.lng, radiusMeters)
      ]);
      const apiLocs = Array.isArray(locs) ? locs : [];
      
      const filteredLandmarks = FEATURED_LANDMARKS.map(land => {
        const coords = JSON.parse(land.geom);
        const dist = getDistance(n.lat, n.lng, coords[1], coords[0]);
        return { ...land, distance: dist };
      }).filter(land => land.distance <= radiusMeters);

      const combined = [...filteredLandmarks];
      apiLocs.forEach(loc => {
        if (!combined.find(c => c.id === loc.id)) {
          combined.push(loc);
        }
      });
      combined.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setLocations(combined);
    } catch (err) {
      setError('Could not update area results');
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
                  <View className="flex-col gap-2">
                    <TouchableOpacity 
                      onPress={() => setShowSearch(!showSearch)}
                      className={`w-12 h-12 rounded-full border items-center justify-center shadow-md ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
                    >
                      <Search size={24} color={isDark ? '#34d399' : '#064e3b'} />
                    </TouchableOpacity>

                    {showSearch && (
                      <View 
                        className={`absolute left-0 top-14 w-[280px] rounded-3xl shadow-2xl overflow-hidden border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100'}`}
                      >
                        <View className="p-4 border-b border-slate-100 dark:border-slate-800">
                          <TextInput
                            autoFocus
                            placeholder="Search area (e.g. Bole)"
                            placeholderTextColor="#94a3b8"
                            className={`h-10 px-4 rounded-xl font-semibold ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-900'}`}
                            value={searchQuery}
                            onChangeText={handleSearch}
                          />
                        </View>
                        <ScrollView className="max-h-[240px]">
                          {searchResults.map((n) => (
                            <TouchableOpacity 
                              key={n.name}
                              onPress={() => selectNeighborhood(n)}
                              className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 flex-row items-center gap-3"
                            >
                              <MapPin size={18} color="#94a3b8" />
                              <Text className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{n.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                ) : null}
              </View>
            ) : <View />}

            {!hideBalancePill && loading ? (
              <BalancePillShimmer isDark={isDark} />
            ) : !hideBalancePill ? (
              <TouchableOpacity 
                onPress={() => router.push('/wallet' as any)}
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
                className={`w-14 h-14 rounded-full items-center justify-center shadow-lg border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-white'}`}
              >
                <Target size={26} color={isDark ? '#34d399' : primary} />
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
                      className={`flex-row w-[240px] h-20 rounded-2xl overflow-hidden border ${selectedLocation?.id === loc.id ? 'border-[#064e3b] border-2' : 'border-[#064e3b]/15'} ${isDark ? 'bg-[#1e293b] border-[#34d399]/20' : 'bg-white'}`}
                    >
                      <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200&h=200&fit=crop' }} 
                        className="w-20 h-full" 
                      />
                      <View className="flex-1 p-2.5 justify-between">
                        <View className="flex-row justify-between items-start">
                          <Text 
                            className={`text-[13px] font-bold flex-1 mr-1 ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`} 
                            numberOfLines={1}
                          >
                            {loc.name}
                          </Text>
                          <Text className="text-[12px] font-black text-[#064e3b]">25<Text className="text-[9px] font-normal text-[#64748b]">/h</Text></Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <View className="flex-row items-center gap-1">
                            <View className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                            <Text className="text-[9px] font-bold text-[#059669]">Available</Text>
                          </View>
                          <ArrowRight size={14} color="#94a3b8" />
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
