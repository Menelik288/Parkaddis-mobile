import { PageHeader } from '@/components/PageHeader';
import { getReservationLocationLabel, Reservation, reservationService } from '@/services/reservationService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'expo-router';
import { History } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

dayjs.extend(relativeTime);

export default function BookingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#34d399';
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationService.getAllUserSessions();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
      setError('Could not load your bookings');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const activeBooking = safeReservations.find(r => {
    const status = r.status?.toUpperCase();
    return status === 'ACTIVE' || status === 'RESERVED';
  });
  const pastBookings = safeReservations.filter(r => r.id !== activeBooking?.id);

  const getTimeRemaining = (endTime: string) => {
    const end = dayjs(endTime);
    const now = dayjs();
    const diff = end.diff(now, 'minute');
    if (diff <= 0) return '00:00';
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const renderActiveSection = () => {
    if (!activeBooking) {
      return (
        <View className={`p-8 rounded-[32px] border items-center gap-2 ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e2e8f0]'}`}>
          <Text className={`text-sm font-semibold ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>No active reservations</Text>
          <TouchableOpacity onPress={() => router.push('/find')} className="p-2">
            <Text className="text-sm font-black underline" style={{ color: secondary }}>Find a spot</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const isReserved = activeBooking.status?.toUpperCase() === 'RESERVED';

    return (
      <View className="gap-5">
        <View className="flex-row items-center gap-2 px-1">
          <View 
            style={{
              shadowColor: '#34d399',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 8,
              elevation: 4,
            }}
            className="w-2 h-2 rounded-full bg-[#34d399]" 
          />
          <Text className={`text-[11px] font-black uppercase tracking-[2px] ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>
            {isReserved ? 'Upcoming Reservation' : 'Active Now'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 15 },
            shadowOpacity: 0.2,
            shadowRadius: 25,
            elevation: 12,
            backgroundColor: primary
          }}
          className="rounded-[36px] overflow-hidden"
          onPress={() => router.push('/tickets')}
        >
          <View className="p-7">
            <View className="flex-row justify-between items-start mb-8">
              <View className="flex-1 gap-1">
                <Text className="text-2xl font-black text-white tracking-tight">
                  {getReservationLocationLabel(activeBooking, 'Active Session')}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-bold text-white/60 uppercase tracking-widest">
                    {isReserved ? 'Reserved' : 'In Progress'}
                  </Text>
                </View>
              </View>
              <View className={`px-4 py-2 rounded-2xl border ${isReserved ? 'bg-amber-500/20 border-amber-500/30' : 'bg-white/20 border-white/30'}`}>
                <Text className="text-[10px] font-black text-white tracking-[2px]">{activeBooking.status}</Text>
              </View>
            </View>

            <View className="flex-row items-end justify-between">
              <View className="gap-1.5">
                <Text className="text-[10px] font-black text-white/60 tracking-[2px]">
                  {isReserved ? 'STARTS AT' : 'TIME REMAINING'}
                </Text>
                <View className="flex-row items-baseline gap-1.5">
                  <Text
                    className="text-4xl font-black text-white"
                    style={{
                      fontVariant: ['tabular-nums'],
                      minWidth: isReserved ? 112 : 128,
                      ...(Platform.OS === 'android' ? { fontFamily: 'monospace' } : {}),
                    }}
                  >
                    {isReserved ? dayjs(activeBooking.startTime).format('hh:mm') : getTimeRemaining(activeBooking.endTime)}
                  </Text>
                  <Text className="text-xs font-black text-white/70 uppercase tracking-tighter">
                    {isReserved ? dayjs(activeBooking.startTime).format('A') : 'mins'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
                className="bg-white px-7 py-3.5 rounded-2xl"
                onPress={() => router.push('/tickets')}
              >
                <Text className="text-emerald-900 font-black text-xs">
                  {isReserved ? 'SPOT INFO' : 'VIEW TICKET'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHistorySection = () => {
    return (
      <View className="gap-5 mt-2">
        <View className="flex-row items-center gap-2 px-1">
          <History size={18} color="#94a3b8" />
          <Text className="text-[11px] font-black uppercase tracking-[2px] text-[#94a3b8]">Recent History</Text>
        </View>

        <View className="gap-5">
          {pastBookings.length === 0 ? (
            <Text className="text-center text-[#94a3b8] mt-5 text-sm font-medium">No booking history found</Text>
          ) : (
            pastBookings.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 5,
                  elevation: 1,
                }}
                className={`p-5 rounded-[32px] border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-4">
                  <View className={`w-14 h-14 rounded-2xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
                    <History size={22} color={isDark ? '#94a3b8' : '#475569'} />
                  </View>
                  <View className="flex-1">
                    <Text 
                      numberOfLines={1}
                      className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}
                    >
                      {getReservationLocationLabel(item, 'Parking Station')}
                    </Text>
                    
                    <View className="flex-row items-center gap-2 mt-1">
                      <Text className={`text-xs font-bold ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>
                        {item.totalCost || item.amount || item.total_amount || item.total_price || item.cost || item.price || '0.00'} ETB
                      </Text>
                      <Text className="text-[#94a3b8]"> • </Text>
                      <Text className={`text-[10px] font-black uppercase tracking-widest ${item.status?.toUpperCase() === 'CANCELLED' ? 'text-red-400' : 'text-green-500'}`}>
                        {item.status === 'COMPLETED' ? 'PAID' : item.status?.toUpperCase()}
                      </Text>
                    </View>

                    <Text className="text-[9px] text-[#64748b] font-medium mt-1 uppercase tracking-tighter">
                      {dayjs(item.startTime).format('MMM D, YYYY • HH:mm')}
                    </Text>
                  </View>

                  <View className={`px-4 py-2 rounded-xl border ${isDark ? 'border-[#334155]' : 'border-slate-100'}`}>
                    <Text className={`text-[9px] font-black tracking-widest ${isDark ? 'text-[#94a3b8]' : 'text-slate-400'}`}>DETAILS</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} edges={['bottom', 'left', 'right']}>
      <PageHeader title="Reservations" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={primary} className="mt-10" />
        ) : (
          <View className="gap-8 mt-4">
            {renderActiveSection()}
            {renderHistorySection()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
