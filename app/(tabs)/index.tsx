import { useRecentSearches } from '@/hooks/useRecentSearches';
import { TicketQrModal } from '@/components/TicketQrModal';
import { DashboardShimmer } from '@/components/DashboardShimmer';
import { ActivityShimmer } from '@/components/ActivityShimmer';
import Loader from '@/components/Loader';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  reservationService,
  Reservation,
  getReservationLocationLabel,
  getDashboardSessionPriceEt,
  getReservationEntryInstant,
  getReservationDisplayPriceEt,
} from '@/services/reservationService';
import dayjs from 'dayjs';
import { resolveReservationDestination } from '@/lib/reservationDestination';
import { parkingService } from '@/services/parkingService';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Animated,
  Easing,
  Keyboard,
  Platform,
  useColorScheme,
  Alert,
  RefreshControl,
} from 'react-native';
import { Menu, Bookmark, Settings, MapPin, History, CloudOff, Search, X, LayoutGrid, Wallet, User as UserIcon, Navigation as NavigationIcon, QrCode, CheckCircle, XCircle, Clock } from 'lucide-react-native';


export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  function RecentHistoryItem({ res, isDark, onPress }: {
    res: Reservation;
    isDark: boolean;
    onPress: () => void;
  }) {
    const status = res.status?.toUpperCase() ?? '';
    const isCancelled = status === 'CANCELLED' || status === 'EXPIRED';
    const isPaid = status === 'PAID';
    return (
      <TouchableOpacity
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
        className={`p-5 rounded-[28px] border flex-row justify-between items-center ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View className="flex-row items-center gap-4 flex-1">
          <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
            {isPaid ? (
              <View className={`w-7 h-7 rounded-full items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                <CheckCircle size={16} color="#10b981" />
              </View>
            ) : isCancelled ? (
              <View className={`w-7 h-7 rounded-full items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                <XCircle size={16} color="#ef4444" />
              </View>
            ) : (
              <History size={20} color={isDark ? '#94a3b8' : '#475569'} />
            )}
          </View>
          <View className="flex-1">
            <Text numberOfLines={1} className={`text-base font-black mb-1 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
              {getReservationLocationLabel(res, 'Addis Parking Spot')}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className={`px-2 py-0.5 rounded-lg ${isCancelled ? (isDark ? 'bg-red-500/10' : 'bg-red-50') : isPaid ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-50') : isDark ? 'bg-slate-500/10' : 'bg-slate-50'}`}>
                <Text className={`text-[8px] font-black tracking-widest uppercase ${isCancelled ? 'text-red-500' : isPaid ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {status}
                </Text>
              </View>
              <Text className="text-[9px] font-bold text-[#64748b]">
                {dayjs(res.startTime).format('MMM D, YYYY')}
              </Text>
            </View>
          </View>
        </View>
        <View className="items-end ml-4">
          <Text className={`text-lg font-black ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>
            {getReservationDisplayPriceEt(res)} ETB
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  const [menuVisible, setMenuVisible] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [navLoading, setNavLoading] = useState(false);
  const [ticketQrFor, setTicketQrFor] = useState<Reservation | null>(null);
  const [costMinuteBump, setCostMinuteBump] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{id: string; name: string; address: string; lat: number; lng: number}>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { recentSearches, saveSearch: saveToRecentSearches } = useRecentSearches();

  const slideAnim = useRef(new Animated.Value(800)).current;

  const primary = '#064e3b';
  const secondary = '#34d399';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const sessions = await reservationService.getAllUserSessions();
      clearTimeout(timeoutId);

      const list = Array.isArray(sessions) ? sessions : [];
      setReservations(list);

      const fromList =
        list.find(r => r.status?.toUpperCase() === 'ACTIVE') ||
        list.find(r => r.status?.toUpperCase() === 'RESERVED') ||
        list.find(r => r.status?.toUpperCase() === 'UNPAID') ||
        list.find(r => r.status?.toUpperCase() === 'COMPLETED') ||
        null;

      let active = fromList;
      try {
        const fresh = await reservationService.getActiveReservation();
        if (fresh?.id) {
          const richer = list.find(x => x.id === fresh.id);
          active = richer ? { ...richer, ...fresh } : fresh || fromList;
        } else if (!active) {
          active = fresh;
        }
      } catch {
        if (!active) active = null;
      }

      setActiveReservation(active);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data', err);
      setError(err.message || 'Failed to connect to server');
      setReservations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!activeReservation || activeReservation.status?.toUpperCase() !== 'ACTIVE') {
      setTimeLeft('00:00:00');
      return;
    }

    const updateTimer = () => {
      const now = dayjs();
      const entry = getReservationEntryInstant(activeReservation);
      const elapsedMs = entry ? Math.max(0, now.diff(entry)) : 0;

      const h = Math.floor(elapsedMs / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const s = Math.floor((elapsedMs % (1000 * 60)) / 1000).toString().padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };

    updateTimer(); // Initial call
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [activeReservation?.id, activeReservation?.status]);

  useEffect(() => {
    if (!activeReservation) return;
    const id = setInterval(() => setCostMinuteBump(n => n + 1), 60_000);
    return () => clearInterval(id);
  }, [activeReservation?.id]);

  const liveSessionCostEt = useMemo(() => {
    if (!activeReservation) return '0.00';
    void costMinuteBump;
    return getDashboardSessionPriceEt(activeReservation);
  }, [activeReservation, costMinuteBump]);

  const openFindWithReservationRoute = () => {
    if (!activeReservation) {
      router.push('/find');
      return;
    }
    const geomStr = activeReservation.spot?.location?.geom || activeReservation.spot?.geom || activeReservation.geom;
    if (!geomStr) {
      router.push('/find');
      return;
    }
    try {
      const parsed = JSON.parse(geomStr);
      const lng = parsed[0];
      const lat = parsed[1];
      const locName = getReservationLocationLabel(activeReservation);
      
      router.push({
        pathname: '/(tabs)/find',
        params: {
          destLat: lat,
          destLng: lng,
          destName: locName,
          locationId: activeReservation.spot?.locationId || activeReservation.locationId || activeReservation.id
        }
      });
    } catch (e) {
      router.push('/find');
    }
  };

  const openSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(true);
    slideAnim.setValue(800);
    requestAnimationFrame(() => {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 8, tension: 60 }).start();
    });
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, { toValue: 800, duration: 280, useNativeDriver: true }).start(() => {
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    });
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const locs = await parkingService.getLocations(9.0052, 38.7636, 10000);
      const filtered = (Array.isArray(locs) ? locs : []).filter(l =>
        l.name.toLowerCase().includes(q.toLowerCase()) ||
        (l.address ?? '').toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8).map(l => {
        const coords = (() => { try { const p = JSON.parse(l.geom); return Array.isArray(p) ? { lng: p[0], lat: p[1] } : null; } catch { return null; } })();
        return { id: l.id, name: l.name, address: l.address ?? '', lat: coords?.lat ?? 9.0052, lng: coords?.lng ?? 38.7636 };
      });
      setSearchResults(filtered);
    } catch { setSearchResults([]); }
    finally { setSearchLoading(false); }
  };

  const navigateToLocation = (loc: { id?: string; name: string; address?: string; lat: number; lng: number }) => {
    closeSearch();
    // Save to recent searches
    saveToRecentSearches(loc);
    setTimeout(() => {
      if (loc.id) {
        router.push(`/find?locationId=${loc.id}&destName=${encodeURIComponent(loc.name)}` as any);
      } else {
        router.push(`/find?destLat=${loc.lat}&destLng=${loc.lng}&destName=${encodeURIComponent(loc.name)}` as any);
      }
    }, 320);
  };

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const activeCount = safeReservations.filter(r => {
    const s = String(r.status ?? '').toUpperCase();
    return s === 'ACTIVE' || s === 'RESERVED' || s === 'UNPAID' || s === 'COMPLETED';
  }).length;
  const totalCount = safeReservations.length;
  const recentHistory = safeReservations.slice(0, 3);

  const entryInstant = activeReservation ? getReservationEntryInstant(activeReservation) : null;
  const sessionStatus = activeReservation?.status?.toUpperCase() ?? '';
  const isUpcomingPaid = sessionStatus === 'PAID' && !entryInstant;
  
  const isUnpaidCard = (sessionStatus === 'UNPAID' || sessionStatus === 'COMPLETED') && !isUpcomingPaid;
  const isReservedCard = sessionStatus === 'RESERVED' || isUpcomingPaid;
  const isActiveCard = sessionStatus === 'ACTIVE';

  if (!user) return null;

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      {/* Header */}
      <View className={`flex-row justify-between items-center px-6 ${Platform.OS === 'ios' ? 'pt-[68px]' : 'pt-[48px]'} pb-4 z-10 ${isDark ? 'bg-[#0f172a]/90' : 'bg-[#f8fafc]/90'}`}>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => setMenuVisible(true)} className="p-1">
            <Menu size={24} color={isDark ? secondary : primary} />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className="text-2xl font-black tracking-tighter" style={{ color: isDark ? secondary : primary }}>PARK</Text>
            <Text className="text-2xl font-black tracking-tighter text-[#94a3b8]">ADDIS</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/profile')}
          className="w-10 h-10 rounded-full border-2 border-[#064e3b] overflow-hidden bg-[#d1fae5]"
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop' }}
            className="w-full h-full"
          />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View className="flex-1 bg-black/20">
            <TouchableWithoutFeedback>
              <View 
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  elevation: 10,
                }}
                className={`absolute top-24 left-5 w-52 rounded-2xl border p-2 ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e2e8f0]'}`}
              >
                <TouchableOpacity 
                  className="flex-row items-center p-3 gap-3 rounded-xl"
                  onPress={() => { setMenuVisible(false); router.push('/saved'); }}
                >
                  <Bookmark size={18} color={isDark ? secondary : primary} />
                  <Text className={`font-semibold text-sm ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Saved Spots</Text>
                </TouchableOpacity>
                
                <View className={`h-px w-full my-1 ${isDark ? 'bg-[#334155]' : 'bg-[#f1f5f9]'}`} />

                <TouchableOpacity 
                  className="flex-row items-center p-3 gap-3 rounded-xl"
                  onPress={() => { setMenuVisible(false); router.push('/wallet'); }}
                >
                  <Wallet size={18} color={isDark ? secondary : primary} />
                  <Text className={`font-semibold text-sm ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Wallets</Text>
                </TouchableOpacity>
                
                <View className={`h-px w-full my-1 ${isDark ? 'bg-[#334155]' : 'bg-[#f1f5f9]'}`} />
                
                <TouchableOpacity 
                  className="flex-row items-center p-3 gap-3 rounded-xl"
                  onPress={() => { setMenuVisible(false); router.push('/settings'); }}
                >
                  <Settings size={18} color={isDark ? secondary : primary} />
                  <Text className={`font-semibold text-sm ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Settings</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160 }} 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollEndDrag={(e) => {
          if (e.nativeEvent.contentOffset.y < -80 && !refreshing) {
            onRefresh();
          }
        }}
      >
        {refreshing && (
          <View className="py-6 items-center">
            <Loader size="md" color={isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'} />
          </View>
        )}
        {(loading || refreshing) ? (
          <DashboardShimmer />
        ) : (
          <>
            {/* Welcome */}
            <View className="mt-2 mb-8">
          <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#94a3b8] mb-2">WELCOME BACK</Text>
          <Text className={`text-[28px] font-extrabold tracking-tighter ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>
            {dayjs().hour() < 12 ? 'Good Morning' : dayjs().hour() < 18 ? 'Good Afternoon' : 'Good Evening'}, {user?.fullName.split(' ')[0] || 'Driver'}
          </Text>
        </View>


        {/* Active Session OR Search Bar */}
        <View className="mb-8">
          {activeReservation ? (
            <View
              style={{
                shadowColor: isDark ? '#000' : '#064e3b',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 8,
              }}
              className={`rounded-[40px] border p-6 ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#d1fae5]'}`}
            >
              <View className="flex-row justify-between items-start mb-1">
                <Text
                  numberOfLines={2}
                  className={`text-base font-bold flex-1 mr-2 ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}
                >
                  {getReservationLocationLabel(activeReservation, 'Parking')}
                </Text>
                {isActiveCard && (
                  <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <View className="w-2 h-2 rounded-full bg-emerald-500" />
                    <Text className="text-[10px] font-black text-emerald-500 tracking-wider">ACTIVE</Text>
                  </View>
                )}
                {isReservedCard && (
                  <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <View className="w-2 h-2 rounded-full bg-blue-500" />
                    <Text className="text-[10px] font-black text-blue-500 tracking-wider">UPCOMING</Text>
                  </View>
                )}
                {isUnpaidCard && (
                  <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25">
                    <View className="w-2 h-2 rounded-full bg-amber-500" />
                    <Text className="text-[10px] font-black text-amber-600 tracking-wider">UNPAID</Text>
                  </View>
                )}
              </View>

              {isReservedCard ? (
                <Text className={`text-xs font-medium mb-5 ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                  Arrive by {dayjs(activeReservation.startTime).format('MMM D · hh:mm A')}
                </Text>
              ) : null}

              {isUnpaidCard ? (
                <Text className={`text-xs font-medium mb-5 ${isDark ? 'text-[#fbbf24]/90' : 'text-amber-700'}`}>
                  Complete payment to finish this session. You can pay with wallet or Chapa on the next screen.
                </Text>
              ) : null}

              {isActiveCard ? (
                <View className="items-center mb-5">
                  <Text className={`text-[10px] font-black uppercase tracking-[3px] mb-2 ${isDark ? 'text-[#34d399]' : 'text-[#34d399]'}`}>
                    ELAPSED TIME
                  </Text>
                  <View className="w-full items-center" style={{ minWidth: 280 }}>
                    <Text
                      className={`text-[56px] font-black text-center ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}
                      style={{
                        fontVariant: ['tabular-nums'],
                        letterSpacing: Platform.OS === 'ios' ? -1.5 : 0,
                        ...(Platform.OS === 'android' ? { fontFamily: 'monospace' } : {}),
                      }}
                    >
                      {timeLeft}
                    </Text>
                  </View>
                </View>
              ) : null}



              <View className={`w-full h-px border-t border-dashed mb-5 ${isDark ? 'border-[#334155]' : 'border-[#d1fae5]'}`} />

              <View className="mb-5">
                <Text className="text-[9px] font-bold text-[#94a3b8] mb-1 uppercase tracking-wider">
                  {isReservedCard ? 'ESTIMATED COST' : isUnpaidCard ? 'AMOUNT DUE' : 'CURRENT COST'}
                </Text>
                <Text className={`text-2xl font-black ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>
                  {liveSessionCostEt} ETB
                </Text>
              </View>

              {isUnpaidCard ? (
                <TouchableOpacity
                  className="h-14 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: '#064e3b' }}
                  onPress={() =>
                    router.push({ pathname: '/checkout', params: { reservationId: activeReservation.id } } as any)
                  }
                  accessibilityLabel="Pay now with wallet or Chapa"
                >
                  <Text className="text-white font-black text-base">Pay Now</Text>
                </TouchableOpacity>
              ) : null}

              {isActiveCard && dayjs().isAfter(dayjs(activeReservation.endTime)) ? (
                <TouchableOpacity
                  className="h-12 rounded-2xl bg-amber-500 items-center justify-center mb-4"
                  onPress={() => router.push({ pathname: '/checkout', params: { reservationId: activeReservation.id } } as any)}
                >
                  <Text className="text-white font-black text-sm">Pay Now</Text>
                </TouchableOpacity>
              ) : null}

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 min-h-[52px] rounded-2xl flex-row items-center justify-center gap-2 px-2 ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
                  onPress={() => setTicketQrFor(activeReservation)}
                  accessibilityLabel="Show parking ticket QR code"
                >
                  <QrCode size={22} color={isDark ? '#0f172a' : '#ffffff'} />
                  <Text className={`font-black text-sm ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>QR code</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 min-h-[52px] rounded-2xl flex-row items-center justify-center gap-2 border px-2 ${isDark ? 'border-[#34d399] bg-[#0f172a]' : 'border-[#064e3b] bg-white'}`}
                  onPress={openFindWithReservationRoute}
                  disabled={navLoading}
                  accessibilityLabel="Open directions to parking on map"
                >
                  {navLoading ? (
                    <Loader size="sm" color={isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'} />
                  ) : (
                    <>
                      <NavigationIcon size={22} color={isDark ? secondary : primary} />
                      <Text className={`font-black text-sm ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>Directions</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Ready to Park Card with Integrated Search */            <View 
              key="fallback-parking-view-v4"
              style={{
                borderRadius: 32,
                paddingVertical: 24,
                paddingHorizontal: 16,
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(236, 253, 245, 0.8)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(6, 78, 59, 0.05)',
              }}
            >
              {/* Simplified Search bar interaction */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openSearch}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                className={`w-full h-[64px] rounded-[24px] flex-row items-center px-6 mb-6 ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}
              >
                <Search size={22} color={isDark ? '#34d399' : '#064e3b'} />
                <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: '#94a3b8', marginLeft: 14 }}>Search parking...</Text>
                <MapPin size={20} color="#94a3b8" />
              </TouchableOpacity>

              <View className="items-center">
                <View className={`w-14 h-14 rounded-full items-center justify-center mb-4 ${isDark ? 'bg-[#34d399]/10' : 'bg-[#d1fae5]'}`}>
                  <MapPin size={24} color={isDark ? '#34d399' : '#064e3b'} />
                </View>
                <Text className={`text-lg font-bold mb-6 ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>Ready for parking?</Text>
                
                <TouchableOpacity 
                  className={`w-full max-w-[240px] py-4 rounded-xl items-center justify-center ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
                  style={{
                    shadowColor: isDark ? '#34d399' : '#064e3b',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.2,
                    shadowRadius: 10,
                    elevation: 10,
                  }}
                  onPress={() => router.push('/find')}
                  activeOpacity={0.8}
                >
                  <Text className={`text-sm font-bold ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Find Parking Nearby</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>


        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-5">
            <Text className={`text-2xl font-bold tracking-tight ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/tickets')}>
              <Text className="text-[11px] font-bold uppercase tracking-wider" style={{ color: isDark ? secondary : primary }}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {loading ? (
               <View className="items-center py-4">
                 <Loader size="md" color={isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'} />
               </View>
            ) : error ? (
              <View className={`p-6 rounded-3xl items-center gap-3 ${isDark ? 'bg-red-500/10' : 'bg-red-500/05'}`}>
                <CloudOff size={28} color="#ef4444" />
                <Text className="text-[#ef4444] text-sm font-semibold text-center leading-5">{error}</Text>
                <TouchableOpacity 
                  className={`py-2.5 px-5 rounded-xl mt-2 ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
                  onPress={fetchDashboardData}
                >
                  <Text className={`text-xs font-bold ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : recentHistory.length === 0 ? (
               <Text className="text-center text-[#94a3b8] text-sm my-5 font-medium">No recent activity</Text>
            ) : recentHistory.map((res) => (
              <RecentHistoryItem
                key={res.id}
                res={res}
                isDark={isDark}
                onPress={() => router.push('/tickets')}
              />
            ))}
          </View>
        </View>
        </>
        )}

      </ScrollView>
      {/* Search Slide-Up Modal */}
      {showSearch && (
        <View style={{ position: 'absolute', inset: 0, zIndex: 200, justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback onPress={closeSearch}>
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={[
              {
                transform: [{ translateY: slideAnim }],
                borderTopLeftRadius: 32, borderTopRightRadius: 32,
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                paddingBottom: 40,
                height: '80%',
              }
            ]}
          >
            {/* Handle & Close button */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 40 }} />
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: isDark ? '#334155' : '#e2e8f0' }} />
              <TouchableOpacity 
                onPress={closeSearch}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} color={isDark ? '#94a3b8' : '#475569'} />
              </TouchableOpacity>
            </View>

            {/* Search input */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginVertical: 12, paddingHorizontal: 20, height: 64, borderRadius: 28, borderWidth: 1, gap: 10, backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }}>
              <Search size={18} color={isDark ? '#34d399' : '#064e3b'} />
              <TextInput
                autoFocus
                placeholder="Search parking..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={handleSearch}
                style={{ flex: 1, fontSize: 15, fontWeight: '600', color: isDark ? '#f8fafc' : '#0f172a' }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Recent or live results */}
              {searchQuery.length === 0 ? (
                <View style={{ paddingHorizontal: 20 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 12 }}>Recent Searches</Text>
                  {recentSearches.map(s => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => navigateToLocation(s)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: isDark ? '#1e293b' : '#f1f5f9' }}
                    >
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={16} color={isDark ? '#34d399' : '#064e3b'} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a' }}>{s.name}</Text>
                        <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{s.address}</Text>
                      </View>
                      <MapPin size={14} color="#94a3b8" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : searchLoading ? (
                <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
                   <ActivityShimmer />
                </View>
              ) : searchResults.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 32, fontWeight: '600' }}>No spots found for "{searchQuery}"</Text>
              ) : (
                <View style={{ paddingHorizontal: 20 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 12 }}>Results</Text>
                  {searchResults.map(s => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => navigateToLocation(s)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: isDark ? '#1e293b' : '#f1f5f9' }}
                    >
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? '#064e3b' : '#ecfdf5', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={16} color={isDark ? '#34d399' : '#064e3b'} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a' }}>{s.name}</Text>
                        <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{s.address}</Text>
                      </View>
                      <NavigationIcon size={14} color={isDark ? '#34d399' : '#064e3b'} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      )}


      <TicketQrModal
        visible={!!ticketQrFor}
        reservation={ticketQrFor}
        onClose={() => setTicketQrFor(null)}
      />
    </View>
  );
}
