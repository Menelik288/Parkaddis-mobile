import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Platform, ScrollView, Dimensions } from 'react-native';
import Loader from '@/components/Loader';

import { CheckCircle2, QrCode, Calendar, Clock, Share2, ArrowRight, MapPin, X, Car, Wallet, Download } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  reservationService, 
  Reservation, 
  getReservationQrToken, 
  getReservationLocationLabel,
  getReservationPlateLabel
} from '@/services/reservationService';
import dayjs from 'dayjs';
import QRCode from 'react-native-qrcode-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ConfirmationScreen() {
  const params = useLocalSearchParams();
  const resId = params.id as string;
  const statusParam = params.status as string;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#34d399';
  const router = useRouter();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resId) {
      fetchData();
    }
  }, [resId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const all = await reservationService.getAllUserSessions();
      const found = all.find(r => r.id === resId);
      setReservation(found || null);
    } catch (err) {
      console.error('Failed to fetch confirmation details', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
        <Loader size="md" color={isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'} />

      </View>
    );
  }

  if (!reservation) {
    return (
      <View className={`flex-1 items-center justify-center p-6 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
        <Text className="text-slate-400 font-bold mb-4">Reservation not found</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)}>
          <Text style={{ color: primary }} className="font-bold">Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const qrToken = getReservationQrToken(reservation);
  const locationLabel = getReservationLocationLabel(reservation);
  const plate = getReservationPlateLabel(reservation);
  const startTime = dayjs(reservation.startTime);
  const endTime = dayjs(reservation.endTime);

  const getStatusColor = () => {
    return '#f59e0b'; // amber-500 for Reserved
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center justify-center px-6 pt-12 pb-6">
           <View 
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.15,
              shadowRadius: 30,
              elevation: 15,
              width: SCREEN_WIDTH - 48,
            }}
            className={`${isDark ? 'bg-[#1e293b]' : 'bg-white'} rounded-[40px] overflow-hidden`}
          >
            {/* Watermark */}
            <View 
              style={{ paddingTop: 130 }}
              className={`absolute inset-0 items-center justify-start ${isDark ? 'opacity-[0.18]' : 'opacity-[0.10]'} z-0`}
            >
              <Text 
                style={{ 
                  fontSize: 55, 
                  color: getStatusColor(),
                  transform: [{ rotate: '-15deg' }]
                }} 
                className="font-black"
              >
                RESERVED
              </Text>
            </View>

            {/* Header */}
            <View className="pt-8 pb-4 px-8 items-center relative z-10">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-8 h-8 rounded-lg bg-[#064e3b] items-center justify-center">
                  <Text className="text-white text-base font-black">P</Text>
                </View>
                <Text className={`${isDark ? 'text-white' : 'text-[#0f172a]'} text-xl font-black tracking-tighter`}>ParkAddis</Text>
              </View>

              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-6">
                RESERVATION TICKET
              </Text>

              {/* QR Code Section */}
              <View className={`p-6 rounded-[32px] mb-6 ${isDark ? 'bg-white' : 'bg-slate-50 border border-slate-100'}`}>
                {qrToken ? (
                  <QRCode
                    value={qrToken}
                    size={160}
                    color="black"
                    backgroundColor="white"
                  />
                ) : (
                  <QrCode size={160} color="#94a3b8" strokeWidth={1} />
                )}
              </View>
              
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] mb-8">
                SCAN THIS AT THE ENTRY GATE
              </Text>
            </View>

            {/* Perforated Divider */}
            <View className="flex-row items-center relative z-10">
              <View className={`w-8 h-8 rounded-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'} -ml-4`} />
              <View className="flex-1 border-t border-dashed border-slate-200 mx-2" />
              <View className={`w-8 h-8 rounded-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'} -mr-4`} />
            </View>

            {/* Info Section */}
            <View className="p-8 pt-6 gap-6 relative z-10">
               <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-4 gap-0.5">
                  <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">LOCATION</Text>
                  <Text 
                    numberOfLines={2}
                    className={`text-base font-black ${isDark ? 'text-white' : 'text-[#0f172a]'}`}
                  >
                    {locationLabel}
                  </Text>
                </View>
                <View className="items-end gap-0.5">
                  <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">PLATE</Text>
                  <Text className={`text-base font-black ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>{plate}</Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="gap-0.5">
                  <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ARRIVAL</Text>
                  <Text className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-[#475569]'}`}>{startTime.format('MMM D, h:mm A')}</Text>
                </View>
                <View className="items-end gap-0.5">
                  <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">DEPARTURE</Text>
                  <Text className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-[#475569]'}`}>{endTime.format('MMM D, h:mm A')}</Text>
                </View>
              </View>

              <View className={`p-5 rounded-3xl ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'} border ${isDark ? 'border-[#334155]' : 'border-slate-100'} flex-row justify-between items-center`}>
                <View>
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider">TOTAL PAID</Text>
                  <Text className="text-[8px] font-bold text-amber-500 mt-0.5">RESERVATION + SERVICE</Text>
                </View>
                <Text className={`text-2xl font-black ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>ETB 7.00</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Support note */}
        <View className="px-10 items-center">
            <Text className="text-[11px] text-slate-400 text-center leading-5">
              Please arrive within 15 minutes of your scheduled time. Your reservation fee is refundable if cancelled within 15 minutes of booking.
            </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View className={`absolute bottom-0 left-0 right-0 p-6 pb-10 ${isDark ? 'bg-[#0f172a]/90' : 'bg-[#f8fafc]/90'}`}>
        <TouchableOpacity 
          style={{
            shadowColor: isDark ? '#34d399' : '#064e3b',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 15,
            elevation: 10,
          }}
          className={`h-16 rounded-2xl flex-row items-center justify-center gap-2 ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
          onPress={() => {
            router.dismissAll();
            setTimeout(() => {
              router.push('/(tabs)/tickets' as any);
            }, 100);
          }}
          activeOpacity={0.8}
        >
          <Text className={`text-base font-black ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Done</Text>
          <ArrowRight size={20} color={isDark ? '#0f172a' : 'white'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
