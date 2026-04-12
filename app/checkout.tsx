import { PageHeader } from '@/components/PageHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { paymentService } from '@/services/paymentService';
import {
  getReservationDisplayPriceEt,
  getReservationLocationLabel,
  Reservation,
  reservationService,
} from '@/services/reservationService';
import { walletService } from '@/services/walletService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ArrowRight, CreditCard, MapPin, Wallet } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const reservationId = params.reservationId as string;
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [userWallet, setUserWallet] = useState<{ balance: string } | null>(null);

  const primary = '#064e3b';
  const secondary = '#34d399';

  const amountDue = useMemo(() => {
    if (!reservation) return 0;
    return parseFloat(getReservationDisplayPriceEt(reservation));
  }, [reservation]);

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  useEffect(() => {
    fetchData();
  }, [reservationId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sessions = await reservationService.getAllUserSessions();
      const list = Array.isArray(sessions) ? sessions : [];
      const res = list.find(r => r.id === reservationId) ?? null;
      setReservation(res);

      const wallet = await walletService.getWallet();
      setUserWallet(wallet);
    } catch (err) {
      console.error('Checkout fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletPay = async () => {
    if (!reservation) return;
    if (!Number.isFinite(amountDue) || amountDue <= 0) {
      Alert.alert('Invalid amount', 'Could not determine how much to charge.');
      return;
    }

    const balance = parseFloat(userWallet?.balance ?? '0');
    if (balance < amountDue) {
      Alert.alert(
        'Insufficient balance',
        `You need ETB ${amountDue.toFixed(2)}. Your balance is ETB ${balance.toFixed(2)}. Top up your wallet or pay with Chapa.`
      );
      return;
    }

    setPayLoading(true);
    try {
      await walletService.payForReservation(reservation.id, amountDue);
      router.replace({
        pathname: '/confirmation',
        params: { status: 'paid', id: reservation.id },
      } as any);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction could not be completed';
      Alert.alert('Payment failed', msg);
    } finally {
      setPayLoading(false);
    }
  };

  const handleChapaPay = async () => {
    if (!reservation?.qrToken) {
      Alert.alert('Missing ticket', 'This reservation has no QR token yet. Try again in a moment.');
      return;
    }
    setPayLoading(true);
    try {
      const response = await paymentService.createDirectPayment(reservation.qrToken);
      if (response.checkout_url) {
        await WebBrowser.openBrowserAsync(response.checkout_url);
        Alert.alert(
          'Returned from payment',
          'If you completed checkout, your session will update shortly. You can open Tickets to verify.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/tickets' as any) }]
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to open payment';
      Alert.alert('Payment error', msg);
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
        <ActivityIndicator color={isDark ? secondary : primary} />
      </View>
    );
  }

  if (!reservation) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center p-6 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
        <Text className="text-slate-400 font-bold mb-4">Reservation not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="font-bold" style={{ color: primary }}>
            Go back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const locationLabel = getReservationLocationLabel(reservation, 'Parking location');
  const balanceNum = parseFloat(userWallet?.balance ?? '0');

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} edges={['bottom', 'left', 'right']}>
      <PageHeader title="Checkout" />

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-6 mb-8">
          <View className="w-16 h-16 rounded-full bg-amber-500/10 items-center justify-center mb-4">
            <CreditCard size={32} color="#f59e0b" />
          </View>
          <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Complete payment</Text>
          <Text className="text-slate-400 font-medium mt-1">
            Session #{reservation.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>

        <View
          className={`w-full rounded-[40px] shadow-2xl relative overflow-hidden mb-10 ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}
        >
          <View className="p-8">
            <View className="flex-row justify-between items-center mb-8">
              <View className="flex-1 pr-3">
                <Text className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[2px] mb-1">
                  PARKING LOCATION
                </Text>
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`} numberOfLines={2}>
                  {locationLabel}
                </Text>
              </View>
              <View className="w-12 h-12 rounded-xl items-center justify-center bg-emerald-500/10">
                <MapPin size={24} color="#10b981" />
              </View>
            </View>

            <View className="w-full h-px border-t border-dashed border-slate-200 mb-8 opacity-60" />

            <View className="items-center">
              <Text className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[3px] mb-2">AMOUNT DUE</Text>
              <Text className={`text-[48px] font-black ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>
                {amountDue.toFixed(2)} ETB
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">
          Choose payment method
        </Text>

        <View className="gap-4 mb-10">
          <TouchableOpacity
            onPress={handleWalletPay}
            disabled={payLoading}
            className={`flex-row items-center justify-between p-6 rounded-3xl border ${
              isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <View className="w-14 h-14 rounded-2xl bg-emerald-500/10 items-center justify-center">
                <Wallet size={28} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-bold mb-0.5 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                  ParkAddis wallet
                </Text>
                <Text className="text-xs text-slate-400">
                  Balance: ETB {balanceNum.toFixed(2)}
                  {balanceNum < amountDue ? ' · insufficient' : ''}
                </Text>
              </View>
            </View>
            <ArrowRight size={20} color={isDark ? '#334155' : '#cbd5e1'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleChapaPay}
            disabled={payLoading}
            className={`flex-row items-center justify-between p-6 rounded-3xl border ${
              isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <View className="w-14 h-14 rounded-2xl bg-emerald-600 items-center justify-center">
                <Text className="text-white font-black italic text-lg tracking-tighter">chapa</Text>
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-bold mb-0.5 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                  Chapa checkout
                </Text>
                <Text className="text-xs text-slate-400">Card, Telebirr, and other methods on the Chapa page</Text>
              </View>
            </View>
            <ArrowRight size={20} color={isDark ? '#334155' : '#cbd5e1'} />
          </TouchableOpacity>
        </View>

        {payLoading && <ActivityIndicator size="large" color={primary} className="mb-10" />}
      </ScrollView>
    </SafeAreaView>
  );
}
