import { TicketQrModal } from '@/components/TicketQrModal';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  useColorScheme,
  Alert,
} from 'react-native';
import { Menu, Bookmark, Settings, MapPin, History, CloudOff, LayoutGrid, Wallet, User as UserIcon, Navigation as NavigationIcon, Clock, QrCode, CheckCircle, XCircle } from 'lucide-react-native';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [progress, setProgress] = useState(0);
  const [navLoading, setNavLoading] = useState(false);
  const [ticketQrFor, setTicketQrFor] = useState<Reservation | null>(null);
  const [costMinuteBump, setCostMinuteBump] = useState(0);

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
    }
  };

  useEffect(() => {
    if (!activeReservation || activeReservation.status?.toUpperCase() !== 'ACTIVE') return;

    const timer = setInterval(() => {
      const now = dayjs();
      const end = dayjs(activeReservation.endTime);
      const entry = getReservationEntryInstant(activeReservation) ?? dayjs(activeReservation.startTime);
      const diff = end.diff(now);

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setProgress(1);
        clearInterval(timer);
        return;
      }

      // Calculate timer text
      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);

      // Progress: elapsed since real check-in vs remaining window to scheduled end
      const total = Math.max(1, end.diff(entry));
      const elapsed = now.diff(entry);
      setProgress(Math.min(Math.max(0, elapsed / total), 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeReservation]);

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

  const openFindWithReservationRoute = async () => {
    if (!activeReservation) return;
    setNavLoading(true);
    try {
      const dest = await resolveReservationDestination(activeReservation);
      if (!dest) {
        Alert.alert(
          'Location unavailable',
          'We could not load your parking spot coordinates. Try again after the reservation syncs.'
        );
        return;
      }
      router.push({
        pathname: '/(tabs)/find',
        params: {
          destLat: String(dest.lat),
          destLng: String(dest.lng),
          destName: getReservationLocationLabel(activeReservation, 'Parking'),
        },
      } as any);
    } finally {
      setNavLoading(false);
    }
  };

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const activeCount = safeReservations.filter(r => r.status === 'ACTIVE' || r.status === 'RESERVED').length;
  const totalCount = safeReservations.length;
  const recentHistory = safeReservations.slice(0, 3);

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
              <View className={`absolute top-24 left-5 w-52 rounded-2xl border shadow-xl p-2 ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e2e8f0]'}`}>
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

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View className="mt-2 mb-8">
          <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#94a3b8] mb-2">WELCOME BACK</Text>
          <Text className={`text-[28px] font-extrabold tracking-tighter ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>
            {dayjs().hour() < 12 ? 'Good Morning' : dayjs().hour() < 18 ? 'Good Afternoon' : 'Good Evening'}, {user?.fullName.split(' ')[0] || 'Driver'}
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-4 mb-8">
          <View className={`flex-1 p-5 rounded-3xl border aspect-square justify-between shadow-sm ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f8fafc]'}`}>
            <View className={`w-12 h-12 rounded-xl items-center justify-center ${isDark ? 'bg-[#34d399]/10' : 'bg-[#d1fae5]'}`}>
              <Bookmark size={22} color={isDark ? '#34d399' : '#064e3b'} />
            </View>
            <View>
              <Text className="text-[#475569] text-[10px] font-bold uppercase tracking-wider mb-1">Active Now</Text>
              <Text className={`text-3xl font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{loading ? '--' : activeCount.toString().padStart(2, '0')}</Text>
            </View>
          </View>

          <View className={`flex-1 p-5 rounded-3xl border aspect-square justify-between shadow-sm ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f8fafc]'}`}>
            <View className={`w-12 h-12 rounded-xl items-center justify-center ${isDark ? 'bg-[#334155]' : 'bg-[#e2e8f0]'}`}>
              <History size={22} color={isDark ? '#94a3b8' : '#475569'} />
            </View>
            <View>
              <Text className="text-[#475569] text-[10px] font-bold uppercase tracking-wider mb-1">Total Bookings</Text>
              <Text className={`text-3xl font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{loading ? '--' : totalCount.toString()}</Text>
            </View>
          </View>
        </View>

        {/* Active Session OR Ready to Park */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`text-2xl font-bold tracking-tight ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>
              {activeReservation
                ? activeReservation.status?.toUpperCase() === 'RESERVED'
                  ? 'Upcoming reservation'
                  : 'Active Session'
                : 'Quick Actions'}
            </Text>
            {activeReservation?.status?.toUpperCase() === 'ACTIVE' && (
              <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <View className="w-2 h-2 rounded-full bg-emerald-500" />
                <Text className="text-[10px] font-black text-emerald-500 tracking-wider">LIVE NOW</Text>
              </View>
            )}
          </View>

          {activeReservation ? (
            <View className={`rounded-[40px] border p-8 bg-white border-[#d1fae5] shadow-lg shadow-[#064e3b]/10`}>
              {activeReservation.status?.toUpperCase() === 'ACTIVE' ? (
                <View className="items-center mb-6">
                  <Text numberOfLines={1} className="text-sm font-bold text-[#064e3b] mb-1">
                    {getReservationLocationLabel(activeReservation, 'Active Station')}
                  </Text>
                  <Text className={`text-[10px] font-black uppercase tracking-[3px] mb-2 text-[#34d399]`}>TIME REMAINING</Text>
                  <View className="w-full items-center" style={{ minWidth: 280 }}>
                    <Text
                      className="text-[56px] font-black text-[#064e3b] text-center"
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
              ) : (
                <View className={`items-center mb-6 p-6 rounded-3xl border bg-[#ecfdf5]/50 border-[#d1fae5]`}>
                  <Clock size={32} color="#064e3b" style={{ marginBottom: 12 }} />
                  <Text className={`text-xs font-black uppercase tracking-widest mb-1 text-[#34d399]`}>RESERVED SPOT</Text>
                  <Text className={`text-lg font-bold text-center text-[#064e3b]`}>
                    Awaiting arrival at {dayjs(activeReservation.startTime).format('hh:mm A')}
                  </Text>
                </View>
              )}

              {activeReservation.status?.toUpperCase() === 'ACTIVE' && (
                <View className="mb-6">
                  <View className={`h-2.5 w-full rounded-full overflow-hidden bg-[#ecfdf5]`}>
                    <View
                      style={{ width: `${progress * 100}%` }}
                      className={`h-full bg-[#064e3b]`}
                    />
                  </View>
                  <View className="flex-row justify-between mt-3 px-1">
                    <View>
                      <Text className="text-[9px] font-bold text-[#94a3b8] mb-0.5">STARTED</Text>
                      <Text className={`text-xs font-black text-[#0f172a]`}>
                        {(getReservationEntryInstant(activeReservation) ?? dayjs(activeReservation.startTime)).format('hh:mm A')}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[9px] font-bold text-[#94a3b8] mb-0.5">ENDS</Text>
                      <Text className={`text-xs font-black text-[#0f172a]`}>{dayjs(activeReservation.endTime).format('hh:mm A')}</Text>
                    </View>
                  </View>
                </View>
              )}

              <View className={`w-full h-px border-t border-dashed mb-6 border-[#d1fae5]`} />

              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[9px] font-bold text-[#94a3b8] mb-1 uppercase tracking-wider">
                    {activeReservation.status?.toUpperCase() === 'RESERVED' ? 'ESTIMATED COST' : 'CURRENT COST'}
                  </Text>
                  <Text className={`text-2xl font-black text-[#064e3b]`}>
                    {liveSessionCostEt} ETB
                  </Text>
                </View>

                <View className="flex-row items-center gap-3">
                  {activeReservation.status?.toUpperCase() === 'ACTIVE' ? (
                    <>
                      {dayjs().isAfter(dayjs(activeReservation.endTime)) ? (
                        <TouchableOpacity
                          className="h-14 px-8 rounded-2xl bg-amber-500 items-center justify-center shadow-lg shadow-amber-500/20"
                          onPress={() => router.push({ pathname: '/checkout', params: { reservationId: activeReservation.id } } as any)}
                        >
                          <Text className="text-white font-black text-sm">Pay Now</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          className="h-14 w-14 rounded-2xl items-center justify-center shadow-lg bg-[#064e3b] shadow-[#064e3b]/20"
                          onPress={() => setTicketQrFor(activeReservation)}
                          accessibilityLabel="Show parking ticket QR"
                        >
                          <QrCode size={24} color="#ffffff" />
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <TouchableOpacity
                      className="h-14 w-14 rounded-2xl items-center justify-center shadow-lg bg-[#064e3b] shadow-[#064e3b]/20"
                      onPress={() => setTicketQrFor(activeReservation)}
                      accessibilityLabel="Show parking ticket QR"
                    >
                      <QrCode size={24} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      const s = activeReservation.status?.toUpperCase();
                      if (s === 'RESERVED' || s === 'ACTIVE') openFindWithReservationRoute();
                    }}
                    disabled={navLoading}
                    className={`h-14 w-14 rounded-2xl items-center justify-center border shadow-sm bg-white border-slate-200 ${navLoading ? 'opacity-60' : ''}`}
                  >
                    <NavigationIcon size={22} color="#064e3b" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View 
              key="fallback-parking-view"
              style={{
                borderRadius: 40,
                borderWidth: 1,
                padding: 32,
                alignItems: 'center',
                backgroundColor: isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(236, 253, 245, 0.4)',
                borderColor: isDark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(209, 250, 229, 0.3)',
              }}
            >
              <View className={`w-16 h-16 rounded-full items-center justify-center mb-5 ${isDark ? 'bg-[#34d399]/20' : 'bg-[#d1fae5]/60'}`}>
                <MapPin size={28} color={isDark ? secondary : primary} />
              </View>
              <Text className={`text-2xl font-bold mb-3 ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>Ready to park?</Text>
              <Text className={`text-sm text-center leading-5 mb-6 max-w-[260px] ${isDark ? 'text-[#94a3b8]' : 'text-[#475569]'}`}>
                Find the best premium parking spots in Addis Ababa with real-time availability.
              </Text>
              <TouchableOpacity 
                className={`w-full max-w-[240px] py-4 rounded-xl items-center justify-center shadow-lg ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
                onPress={() => router.push('/find')}
                activeOpacity={0.8}
              >
                <Text className={`text-sm font-bold ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Find Parking Nearby</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent History */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-5">
            <Text className={`text-2xl font-bold tracking-tight ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/tickets')}>
              <Text className="text-[11px] font-bold uppercase tracking-wider" style={{ color: isDark ? secondary : primary }}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {loading ? (
               <ActivityIndicator size="small" color={isDark ? secondary : primary} />
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
            ) : recentHistory.map((res) => {
              const status = res.status?.toUpperCase() ?? '';
              const isCancelled = status === 'CANCELLED' || status === 'EXPIRED';
              const isPaid = status === 'PAID' || status === 'COMPLETED';

              return (
                <TouchableOpacity
                  key={res.id}
                  className={`p-5 rounded-[28px] border flex-row justify-between items-center ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9] shadow-sm'}`}
                  activeOpacity={0.7}
                  onPress={() => router.push('/tickets')}
                >
                  <View className="flex-row items-center gap-4 flex-1">
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}
                    >
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
                      <Text
                        numberOfLines={1}
                        className={`text-base font-black mb-1 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}
                      >
                        {getReservationLocationLabel(res, 'Addis Parking Spot')}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <View
                          className={`px-2 py-0.5 rounded-lg ${isCancelled ? (isDark ? 'bg-red-500/10' : 'bg-red-50') : isPaid ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-50') : isDark ? 'bg-slate-500/10' : 'bg-slate-50'}`}
                        >
                          <Text
                            className={`text-[8px] font-black tracking-widest uppercase ${isCancelled ? 'text-red-500' : isPaid ? 'text-emerald-500' : 'text-slate-500'}`}
                          >
                            {status === 'COMPLETED' ? 'PAID' : status}
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
            })}
          </View>
        </View>
      </ScrollView>

      <TicketQrModal
        visible={!!ticketQrFor}
        reservation={ticketQrFor}
        onClose={() => setTicketQrFor(null)}
      />
    </View>
  );
}
