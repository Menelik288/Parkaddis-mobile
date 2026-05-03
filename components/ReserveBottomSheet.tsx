import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetView, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { TextInput, View, Text, TouchableOpacity, ScrollView, Alert, useColorScheme, Image, Modal, TouchableWithoutFeedback, Animated, Platform } from 'react-native';
import Reanimated, { interpolate, useAnimatedStyle, Extrapolation } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Loader from '@/components/Loader';
import { ReserveShimmer } from '@/components/ReserveShimmer';

import { MapPin, Calendar, Clock, Edit2, Car, ArrowRight, Menu, Zap, Trash2, Plus, Minus, LogIn, LogOut, Info, X, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Wallet, CreditCard } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { parkingService, LocationDetails } from '@/services/parkingService';
import { vehicleService, Vehicle } from '@/services/vehicleService';
import { reservationService } from '@/services/reservationService';
import { useAuth } from '@/context/AuthContext';
import { walletService } from '@/services/walletService';
import { paymentService } from '@/services/paymentService';

// Custom animated blur backdrop for inner sheets
const BlurBackdrop = ({ animatedIndex, style }: BottomSheetBackdropProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [-1, 0],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Reanimated.View
      style={[
        style,
        animatedStyle,
        { overflow: 'hidden' },
      ]}
    >
      <BlurView
        intensity={30}
        tint="dark"
        style={{ flex: 1 }}
      />
    </Reanimated.View>
  );
};

export interface ReserveBottomSheetRef {
  present: () => void;
  close: () => void;
}

export const ReserveBottomSheet = forwardRef<ReserveBottomSheetRef, { locationId: string | null; onClose?: () => void }>(({ locationId, onClose }, ref) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetRef.current?.present(),
    close: () => bottomSheetRef.current?.dismiss(),
  }));

  const router = useRouter();
  const { user } = useAuth();
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#34d399';

  const [details, setDetails] = useState<LocationDetails | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userWallet, setUserWallet] = useState<{ balance: string } | null>(null);

  // Bottom Sheet State
  const [sheetMode, setSheetMode] = useState<'schedule' | 'vehicle' | null>(null);
  const [slideAnim] = useState(new Animated.Value(800));

  // Schedule State & Helpers
  const [durationMins, setDurationMins] = useState(30); 
  const [durationText, setDurationText] = useState('30');
  const [startTime, setStartTime] = useState(new Date());
  const [activeTimeType, setActiveTimeType] = useState<'entry' | 'exit' | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const getNextThreeDays = () => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: d
      });
    }
    return days;
  };

  const dates = getNextThreeDays();
  
  // Find which dynamic date is currently selected (match by date number)
  const selectedDateValue = startTime.getDate();
  
  const endTime = new Date(startTime.getTime() + durationMins * 60 * 1000);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const formatDateLabel = (date: Date) => {
    return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;
  };

  const updateTime = (type: 'entry' | 'exit', unit: 'hour' | 'minute' | 'ampm', value: any) => {
    const target = type === 'entry' ? startTime : endTime;
    const newDate = new Date(target);
    
    if (unit === 'hour') {
      const currentAmPm = newDate.getHours() >= 12 ? 'PM' : 'AM';
      let hours = value;
      if (currentAmPm === 'PM' && hours < 12) hours += 12;
      if (currentAmPm === 'AM' && hours === 12) hours = 0;
      newDate.setHours(hours);
    } else if (unit === 'minute') {
      newDate.setMinutes(value);
    } else if (unit === 'ampm') {
      const currentHours = newDate.getHours() % 12;
      newDate.setHours(value === 'PM' ? (currentHours === 0 ? 12 : currentHours + 12) : (currentHours === 12 ? 0 : currentHours));
    }

    if (type === 'entry') {
      setStartTime(newDate);
    } else {
      // If updating exit, we calculate the new duration base on delta
      const deltaMs = newDate.getTime() - startTime.getTime();
      const newMins = Math.max(15, Math.floor(deltaMs / (60 * 1000)));
      setDurationMins(newMins);
    }
  };

  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of current month
    const firstDay = new Date(year, month, 1);
    // Last day of current month
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of week of first day (0-6, but let's align with MON=0 if needed, or keep SUN=0)
    // Screenshot starts with MON
    let firstDayIndex = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Align to MON=0
    
    const days = [];
    
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({
            date: new Date(year, month, i),
            isCurrentMonth: true
        });
    }
    
    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({
            date: new Date(year, month + 1, i),
            isCurrentMonth: false
        });
    }
    
    return days;
  };

  const innerSheetRef = useRef<BottomSheetModal>(null);

  const openSheet = (mode: 'schedule' | 'vehicle') => {
    setSheetMode(mode);
    innerSheetRef.current?.present();
  };

  const closeSheet = () => {
    innerSheetRef.current?.dismiss();
  };

  const handleInnerSheetDismiss = () => {
    setSheetMode(null);
    setDurationText(durationMins.toString());
  };

  useEffect(() => {
    if (locationId) fetchData();
  }, [locationId]);

  const fetchData = async () => {
    if (!locationId) return;
    setLoading(true);
    setError(null);
    try {
      const [resDetails, resVehicles, resWallet] = await Promise.all([
        parkingService.getLocationDetails(locationId),
        vehicleService.getUserVehicles(),
        walletService.getWallet()
      ]);
      setDetails(resDetails);
      const vehicleList = Array.isArray(resVehicles) ? resVehicles : [];
      setVehicles(vehicleList);
      if (vehicleList.length > 0) {
        setSelectedVehicle(vehicleList.find(v => v.isPrimary) || vehicleList[0]);
      }
      setUserWallet(resWallet);
    } catch (err) {
      console.error('Failed to fetch reserve details', err);
      setError('Could not load parking details');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!details || !selectedVehicle) {
      Alert.alert('Selection Required', 'Please ensure a vehicle is selected');
      return;
    }

    // Validation: Start time must be in the future
    const now = new Date();
    if (startTime.getTime() < now.getTime() - 5 * 60 * 1000) { // 5 min grace
      Alert.alert('Invalid Time', 'Arrival time cannot be in the past');
      return;
    }

    // Parking Math - USER ONLY PAYS RESERVATION FEE UPFRONT
    const resFee = 5.00;
    const srvFee = 2.00;
    const totalBookingFee = resFee + srvFee;
    const balance = parseFloat(userWallet?.balance || '0');

    if (balance < totalBookingFee) {
      Alert.alert('Insufficient Balance', `Your wallet balance is not enough to cover the ETB ${totalBookingFee.toFixed(2)} reservation fee.`);
      return;
    }

    setBooking(true);
    try {
      const reservation = await reservationService.createReservation({
        spotId: details?.spot?.id,
        vehicleId: selectedVehicle.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });

      await walletService.payReservationFee(reservation.id, totalBookingFee);
      router.push({
        pathname: '/confirmation',
        params: { status: 'reserved', id: reservation.id }
      } as any);
    } catch (err: any) {
      Alert.alert('Booking Failed', err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setBooking(false);
    }
  };

  if (error || (!details && !loading)) {
    return (
      <View className={`flex-1 items-center justify-center gap-4 p-6 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
        <Info size={48} color="#ef4444" />
        <Text className={`text-sm font-semibold text-center ${isDark ? 'text-[#94a3b8]' : 'text-slate-700'}`}>{error || 'Spot not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} className="p-3">
          <Text className="font-bold" style={{ color: isDark ? secondary : primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Price Calculation Math
  const pricePerHour = parseFloat(details?.spot?.pricePerHour || '20');
  const hrs = durationMins / 60;
  const parkingFee = hrs * pricePerHour;
  const resFee = 5.00;
  const srvFee = 2.00;
  const totalBookingFee = resFee + srvFee;

  // Derive display constants
  const hDisplay = Math.floor(durationMins / 60);
  const mDisplay = durationMins % 60;

  const renderScheduleEditor = () => {
    return (
      <View className="px-2 pb-10 space-y-8">
        <View className="mb-6">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-4 ml-1">SELECT DATE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2 px-2" contentContainerStyle={{ gap: 12, paddingRight: 40}}>
            {dates.map((d) => (
              <TouchableOpacity
                key={d.date}
                onPress={() => {
                  const newStart = new Date(startTime);
                  newStart.setFullYear(d.fullDate.getFullYear());
                  newStart.setMonth(d.fullDate.getMonth());
                  newStart.setDate(d.fullDate.getDate());
                  setStartTime(newStart);
                }}
                className={`w-[64px] h-[80px] rounded-2xl items-center justify-center border ${
                  selectedDateValue === d.date 
                    ? (isDark ? 'bg-[#34d399] border-[#34d399]' : 'bg-[#064e3b] border-[#064e3b]')
                    : (isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-slate-50 border-slate-50')
                }`}
              >
                <Text className={`text-[10px] font-bold uppercase ${selectedDateValue === d.date ? (isDark ? 'text-[#0f172a]/70' : 'text-white/80') : (isDark ? 'text-[#64748b]' : 'text-slate-400')}`}>{d.month}</Text>
                <Text className={`text-xl font-bold ${selectedDateValue === d.date ? (isDark ? 'text-[#0f172a]' : 'text-white') : (isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]')}`}>{d.date}</Text>
                <Text className={`text-[10px] font-bold uppercase ${selectedDateValue === d.date ? (isDark ? 'text-[#0f172a]/70' : 'text-white/80') : (isDark ? 'text-[#64748b]' : 'text-slate-400')}`}>{d.day}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
              className={`w-[64px] h-[80px] rounded-2xl border-2 border-dashed items-center justify-center ${isDark ? 'bg-[#0f172a] border-[#334155]' : 'bg-white border-slate-200'}`}
            >
              <Calendar size={20} color={isDark ? '#475569' : '#94a3b8'} className="mb-1" />
              <Text className={`text-[9px] font-bold uppercase ${isDark ? 'text-[#475569]' : 'text-slate-400'}`}>Custom</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View className="mb-4">
          <TouchableOpacity 
            onPress={() => {
              setActiveTimeType('entry');
              setShowTimePicker(true);
            }}
            className={`w-full p-6 rounded-3xl overflow-hidden relative border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-slate-50 border-transparent'}`}
          >
            <Text className={`text-[11px] font-bold uppercase tracking-[2px] mb-2 z-10 relative ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>ARRIVAL TIME</Text>
            <View className="flex-row items-baseline gap-2 z-10 relative">
              <Text className={`text-4xl font-black ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{formatTime(startTime).split(' ')[0]}</Text>
              <Text className={`text-sm font-black ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>{formatTime(startTime).split(' ')[1]}</Text>
            </View>
            <View className="absolute bottom-4 right-6 opacity-30"><Edit2 size={20} color={primary} /></View>
          </TouchableOpacity>
        </View>



        <View className="py-4 relative justify-center">
          <View className={`w-full border-t-[2px] border-dashed ${isDark ? 'border-[#334155]' : 'border-slate-200'}`} />
          <View className={`absolute -left-10 w-8 h-8 rounded-full ${isDark ? 'bg-black/20' : 'bg-black/5'}`} />
          <View className={`absolute -right-10 w-8 h-8 rounded-full ${isDark ? 'bg-black/20' : 'bg-black/5'}`} />
        </View>

        <View className={`flex-row justify-between items-center p-5 rounded-3xl mb-4 border ${isDark ? 'bg-[#34d399]/10 border-[#34d399]/20' : 'bg-[#f0fdf4] border-[#d1fae5]'}`}>
           <View>
             <Text className={`text-[11px] font-black uppercase tracking-[1px] mb-0.5 ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>ESTIMATED PARKING FEE</Text>
             <Text className={`text-[10px] font-bold ${isDark ? 'text-[#64748b]' : 'text-slate-500'}`}>Rate: ETB {pricePerHour}/hr</Text>
           </View>
           <Text className={`text-2xl font-black ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>ETB {(hrs * pricePerHour).toFixed(2)}</Text>
        </View>

        <TouchableOpacity 
          onPress={closeSheet} 
          style={{
            shadowColor: isDark ? '#34d399' : '#000',
            shadowOffset: { width: 0, height: 15 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 12,
          }}
          className={`w-full py-5 rounded-[24px] flex-row items-center justify-center gap-2 ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
        >
           <Text className={`text-lg font-black tracking-tight ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Update Schedule</Text>
           <CheckCircle2 size={22} color={isDark ? '#0f172a' : 'white'} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderVehicleEditor = () => {
    return (
      <View className="px-2 pb-10 flex-col min-h-[500px]">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mt-4">
          <View className="space-y-4 pt-2">
            {vehicles.map(vehicle => {
              const isActive = selectedVehicle?.id === vehicle.id;
              return (
                <View key={vehicle.id} className="relative group mb-4">
                  <TouchableOpacity 
                    onPress={() => setSelectedVehicle(vehicle)} 
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: isActive ? 10 : 2 },
                      shadowOpacity: isActive ? 0.1 : 0.05,
                      shadowRadius: isActive ? 15 : 8,
                      elevation: isActive ? 10 : 2,
                    }}
                    className={`rounded-3xl border text-left p-5 flex-row items-center justify-between ${
                      isActive 
                        ? (isDark ? 'bg-[#1e293b] border-[#34d399]' : 'bg-white border-[#064e3b]') 
                        : (isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100')
                    }`}
                  >
                    <View className="flex-row items-center gap-4">
                      <View className={`w-14 h-14 rounded-2xl items-center justify-center ${
                        isActive 
                          ? (isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]') 
                          : (isDark ? 'bg-[#0f172a]' : 'bg-slate-100')
                      }`}>
                        {vehicle.carModel?.toLowerCase().includes('electric') ? (
                           <Zap size={28} color={isActive ? (isDark ? '#0f172a' : 'white') : (isDark ? '#475569' : '#064e3b')} />
                        ) : (
                           <Car size={32} color={isActive ? (isDark ? '#0f172a' : 'white') : (isDark ? '#475569' : '#064e3b')} />
                        )}
                      </View>
                      <View>
                        <Text className={`text-lg font-bold mb-0.5 ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{vehicle.carModel || 'Vehicle'}</Text>
                        <Text className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#64748b]' : 'text-[#94a3b8]'}`}>PLATE: {vehicle.plateNumber}</Text>
                      </View>
                    </View>
                    <View className="flex-row gap-1">
                      <TouchableOpacity className="p-2 ml-2">
                        <Edit2 size={20} color={isDark ? '#64748b' : '#94a3b8'} />
                      </TouchableOpacity>
                      <TouchableOpacity className="p-2">
                        <Trash2 size={20} color={isDark ? '#64748b' : '#94a3b8'} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity className={`border-2 border-dashed rounded-3xl p-8 items-center justify-center mt-2 mb-8 ${isDark ? 'bg-[#0f172a]/50 border-[#334155]' : 'bg-white/50 border-[#e2e8f0]'}`}>
              <View className={`w-12 h-12 rounded-full items-center justify-center mb-3 ${isDark ? 'bg-[#1e293b]' : 'bg-slate-50'}`}>
                <Car size={24} color={isDark ? '#475569' : '#cbd5e1'} />
              </View>
              <Text className={`font-bold mb-1 ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>Add another vehicle</Text>
              <Text className={`text-xs text-center px-4 ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>Link up to 5 vehicles to your premium concierge account.</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <TouchableOpacity 
          onPress={closeSheet} 
          style={{
            shadowColor: isDark ? '#34d399' : '#064e3b',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 15,
            elevation: 10,
          }}
          className={`w-full py-5 rounded-2xl flex-row items-center justify-center gap-3 mt-4 ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
        >
           <Plus size={20} color={isDark ? '#0f172a' : 'white'} />
           <Text className={`text-lg font-bold ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Save Selection</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={['50%', '92%']}
      stackBehavior="push"
      enablePanDownToClose
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderTopLeftRadius: 48, borderTopRightRadius: 48 }}
      handleIndicatorStyle={{ backgroundColor: isDark ? '#334155' : '#cbd5e1' }}
    >
      <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 }}>
        {/* Header with close button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: isDark ? '#f8fafc' : '#0f172a' }}>Reserve Parking</Text>
          <TouchableOpacity
            onPress={() => bottomSheetRef.current?.dismiss()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ReserveShimmer />
        ) : (
          <>
            {/* Hero Image */}
        <View 
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
          className={`w-full h-[180px] rounded-[32px] overflow-hidden mb-8 relative border ${isDark ? 'border-[#334155]' : 'border-[#f8fafc]'}`}
        >
          <Image className={`w-full h-full ${isDark ? 'bg-[#1e293b]' : 'bg-slate-200'}`} source={{uri: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=600&fit=crop'}} />
          <View 
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1,
            }}
            className={`absolute top-4 right-4 px-4 py-2 rounded-full flex-row items-center gap-2 ${isDark ? 'bg-[#0f172a]/95 border border-[#334155]' : 'bg-white/95 border border-white'}`}
          >
            <View className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#34d399]' : 'bg-[#10b981]'}`} />
            <Text className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>Available</Text>
          </View>
        </View>

        <View className="mb-8">
          <Text className={`text-[24px] font-extrabold tracking-tighter leading-tight ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`} numberOfLines={1}>
            {details?.location?.name || 'Loading Spot...'}
          </Text>
        </View>

        <Text className={`text-2xl font-bold tracking-tight mb-6 ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>Your Schedule</Text>

        {/* Ticket Style Schedule Card */}
        <View 
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
          className={`border rounded-[32px] mb-10 relative overflow-hidden ${isDark ? 'bg-[#1e293b] border-[#34d399]/30' : 'bg-white border-[#34d399]/20'}`}
        >
          <View className={`absolute -top-4 left-1/2 -ml-4 w-8 h-8 rounded-full z-10 border ${isDark ? 'bg-[#0f172a] border-[#34d399]/30' : 'bg-[#f8fafc] border-[#34d399]/20'}`} />
          <View className={`absolute -bottom-4 left-1/2 -ml-4 w-8 h-8 rounded-full z-10 border ${isDark ? 'bg-[#0f172a] border-[#34d399]/30' : 'bg-[#f8fafc] border-[#34d399]/20'}`} />

          <View className="flex-row">
            {/* Arrival Section */}
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
              className="py-8 px-6 flex-col flex-1 relative justify-center"
            >
              <Text className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>ARRIVAL DATE</Text>
              <View className="flex-row items-center gap-3">
                <View className={`w-10 h-10 rounded-xl border items-center justify-center ${isDark ? 'bg-[#0f172a] border-[#334155]' : 'bg-slate-50 border-slate-100'}`}>
                  <Calendar size={20} color={isDark ? '#34d399' : '#064e3b'} />
                </View>
                <View>
                  <Text className={`font-bold text-sm ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{formatDateLabel(startTime)}</Text>
                  <Text className={`text-[10px] font-bold uppercase tracking-tight mt-0.5 ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>{startTime.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Dash Boundary */}
            <View className={`h-[80px] w-px border-r-[2px] border-dashed self-center ${isDark ? 'border-[#334155]' : 'border-slate-200'}`} />

            {/* Time Slot Section */}
            <TouchableOpacity 
              onPress={() => openSheet('schedule')} 
              activeOpacity={0.7}
              className="py-8 px-4 flex-col flex-1 relative justify-center"
            >
              <Text className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>ARRIVAL TIME</Text>
              <View className="flex-row items-center gap-3">
                <View className={`w-10 h-10 rounded-xl border items-center justify-center ${isDark ? 'bg-[#0f172a] border-[#334155]' : 'bg-slate-50 border-slate-100'}`}>
                  <Clock size={20} color={isDark ? '#34d399' : '#064e3b'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-black text-sm ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`} numberOfLines={1}>
                    {formatTime(startTime)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Text className={`text-2xl font-bold tracking-tight mb-6 ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>Selected Vehicle</Text>

        {/* Active Vehicle Card */}
        <View 
          style={{
            shadowColor: isDark ? '#34d399' : '#064e3b',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}
          className={`rounded-[32px] p-8 mb-10 ${isDark ? 'bg-[#34d399]/10 border border-[#34d399]/20' : 'bg-[#064e3b]'}`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className={`w-12 h-12 rounded-2xl items-center justify-center border ${isDark ? 'bg-[#34d399]/20 border-[#34d399]/30' : 'bg-white/10 border-white/5'}`}>
                <Car size={28} color={isDark ? '#34d399' : '#ffffff'} />
              </View>
              <View>
                <Text className={`font-bold text-lg ${isDark ? 'text-[#f8fafc]' : 'text-white'}`}>{selectedVehicle?.carModel || 'No Vehicle'}</Text>
                <Text className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-[#34d399]/80' : 'text-[#34d399]/80'}`}>
                  {selectedVehicle?.plateNumber || 'TBA'} • ACTIVE
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => openSheet('vehicle')} className={`px-4 py-2 rounded-xl border ${isDark ? 'bg-[#34d399]/10 border-[#34d399]/20' : 'bg-white/10 border-white/20'}`}>
              <Text className={`text-xs font-bold ${isDark ? 'text-[#34d399]' : 'text-white'}`}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className={`text-2xl font-bold tracking-tight mb-6 ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>Price Receipt</Text>

        {/* Price Breakdown */}
        <View 
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
          }}
          className={`rounded-[40px] p-8 mb-12 relative overflow-hidden border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100'}`}
        >
          <View className="space-y-6 relative z-10">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className={`text-[10px] font-black uppercase tracking-[2px] mb-1 ${isDark ? 'text-[#94a3b8]' : 'text-[#94a3b8]'}`}>PARKING DURATION</Text>
                <Text className={`text-base font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{hDisplay}h {mDisplay}m</Text>
              </View>
              <Text className={`text-base font-bold ${isDark ? 'text-[#f8fafc]' : 'text-slate-600'}`}>ETB {parkingFee.toFixed(2)}</Text>
            </View>
            
            <View className={`w-full h-px ${isDark ? 'bg-[#334155]' : 'bg-slate-50'}`} />

            <View className="flex-row justify-between items-center">
              <Text className={`text-[10px] font-black uppercase tracking-[2px] ${isDark ? 'text-[#94a3b8]' : 'text-[#94a3b8]'}`}>RESERVATION FEE</Text>
              <Text className={`text-base font-bold ${isDark ? 'text-[#f8fafc]' : 'text-slate-600'}`}>ETB {resFee.toFixed(2)}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className={`text-[10px] font-black uppercase tracking-[2px] ${isDark ? 'text-[#94a3b8]' : 'text-[#94a3b8]'}`}>SERVICE CHARGE</Text>
              <Text className={`text-base font-bold ${isDark ? 'text-[#f8fafc]' : 'text-slate-600'}`}>ETB {srvFee.toFixed(2)}</Text>
            </View>
            
            <View className={`pt-6 mt-2 border-t-2 border-dashed flex-row justify-between items-center ${isDark ? 'border-[#334155]' : 'border-emerald-100'}`}>
              <View>
                <Text className={`font-black text-xs uppercase tracking-[2px] ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>DUE NOW</Text>
                <Text className={`text-[9px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>RESERVATION + SERVICE</Text>
              </View>
              <Text className={`font-black text-3xl ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>ETB {totalBookingFee.toFixed(2)}</Text>
            </View>
          </View>
          
          {/* Decorative semi-circles for ticket effect */}
          <View className={`absolute top-1/2 -left-4 w-8 h-8 rounded-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} />
          <View className={`absolute top-1/2 -right-4 w-8 h-8 rounded-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} />
        </View>

        <Text className={`text-2xl font-bold tracking-tight mb-6 ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>Payment Method</Text>

        <View className="mb-10">
          <View 
            className={`flex-row items-center justify-between p-6 rounded-[32px] border ${
              isDark ? 'bg-[#34d399]/10 border-[#34d399]' : 'bg-white border-[#064e3b]'
            }`}
          >
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-2xl items-center justify-center bg-[#064e3b]">
                <Wallet size={24} color="white" />
              </View>
              <View>
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>ParkAddis Wallet</Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Balance: ETB {parseFloat(userWallet?.balance || '0').toFixed(2)}
                </Text>
              </View>
            </View>
            <View className="w-6 h-6 rounded-full border-2 items-center justify-center border-[#34d399] bg-[#34d399]">
              <View className="w-2 h-2 rounded-full bg-[#0f172a]" />
            </View>
          </View>

          {parseFloat(userWallet?.balance || '0') < totalBookingFee && (
            <View className={`mt-4 p-4 rounded-2xl flex-row items-center gap-3 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
              <AlertCircle size={20} color="#ef4444" />
              <View className="flex-1">
                <Text className="text-red-500 font-bold text-xs">Insufficient balance for reservation.</Text>
                <TouchableOpacity onPress={() => router.push('/wallet')}>
                  <Text className="text-red-500 font-black text-[10px] uppercase tracking-wider mt-1 underline">Top up wallet</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Action Bottom */}
        <View className="pb-8">
          <TouchableOpacity 
            style={{
              shadowColor: isDark ? '#34d399' : '#064e3b',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 10,
              opacity: (parseFloat(userWallet?.balance || '0') < totalBookingFee) ? 0.5 : 1
            }}
            className={`w-full h-[72px] rounded-[24px] flex-row items-center justify-center gap-2 ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
            onPress={handleConfirm}
            disabled={booking || (parseFloat(userWallet?.balance || '0') < totalBookingFee)}
            activeOpacity={0.8}
          >
            {booking ? (
               <Loader size="sm" color={isDark ? 'bg-[#0f172a]' : 'bg-white'} />

            ) : (
               <>
                 <Text className={`font-bold text-xl mr-1 ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Confirm Reservation</Text>
                 <ArrowRight size={24} color={isDark ? '#0f172a' : 'white'} />
               </>
            )}
          </TouchableOpacity>
        </View>
          </>
        )}
      </BottomSheetScrollView>


       {/* EXACT STITCH CIRCULAR WHEEL TIME PICKER POP-UP */}
       <Modal transparent visible={showTimePicker && !!activeTimeType} animationType="fade">
          <View className="flex-1 items-center justify-center p-6 bg-black/60">
            <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
              <View className="absolute inset-0" />
            </TouchableWithoutFeedback>
            
            <View 
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 15 },
                shadowOpacity: 0.15,
                shadowRadius: 25,
                elevation: 12,
              }}
              className={`w-full rounded-[48px] p-8 ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}
            >
              <View className="items-center mb-8">
                <Text className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Set {activeTimeType === 'entry' ? 'Arrival' : 'Departure'}</Text>
                <View className="h-1 w-12 bg-[#34d399] rounded-full mt-2" />
              </View>
 
              <View className="flex-row justify-center items-center h-[240px] relative">
                {/* Center Highlight Bar */}
                <View className="absolute left-0 right-0 h-16 bg-[#34d399]/10 rounded-2xl z-0" />
                
                {/* Hour Column */}
                <View className="flex-1 h-full">
                  <Text className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[2px] mb-2 text-center">HOUR</Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    snapToInterval={64}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingVertical: 88 }}
                    onMomentumScrollEnd={(e) => {
                      const y = e.nativeEvent.contentOffset.y;
                      const h = Math.round(y / 64) + 1;
                      if (h >= 1 && h <= 12) updateTime(activeTimeType!, 'hour', h);
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => {
                      const currentH = (activeTimeType === 'entry' ? startTime : endTime).getHours() % 12 || 12;
                      const isSelected = currentH === h;
                      return (
                        <View key={h} className="h-16 items-center justify-center">
                          <Text 
                            style={isSelected ? { fontSize: 36, lineHeight: 44 } : { fontSize: 24, lineHeight: 32 }}
                            className={`font-black ${isSelected ? (isDark ? 'text-[#34d399]' : 'text-[#064e3b]') : (isDark ? 'text-slate-600' : 'text-slate-300')}`}
                          >
                            {h}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
 
                {/* Minute Column */}
                <View className="flex-1 h-full">
                  <Text className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[2px] mb-2 text-center">MINUTE</Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    snapToInterval={64}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingVertical: 88 }}
                    onMomentumScrollEnd={(e) => {
                      const y = e.nativeEvent.contentOffset.y;
                      const m = Math.round(y / 64);
                      if (m >= 0 && m <= 59) updateTime(activeTimeType!, 'minute', m);
                    }}
                  >
                    {Array.from({ length: 60 }).map((_, m) => {
                      const currentM = (activeTimeType === 'entry' ? startTime : endTime).getMinutes();
                      const isSelected = currentM === m;
                      return (
                        <View key={m} className="h-16 items-center justify-center">
                          <Text 
                            style={isSelected ? { fontSize: 36, lineHeight: 44 } : { fontSize: 24, lineHeight: 32 }}
                            className={`font-black ${isSelected ? (isDark ? 'text-[#34d399]' : 'text-[#064e3b]') : (isDark ? 'text-slate-600' : 'text-slate-300')}`}
                          >
                            {m}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
 
                {/* AM/PM Column */}
                <View className="flex-1 h-full">
                  <Text className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[2px] mb-2 text-center">PERIOD</Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    snapToInterval={64}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingVertical: 88 }}
                    onMomentumScrollEnd={(e) => {
                      const y = e.nativeEvent.contentOffset.y;
                      const ampm = Math.round(y / 64) === 0 ? 'AM' : 'PM';
                      updateTime(activeTimeType!, 'ampm', ampm);
                    }}
                  >
                    {['AM', 'PM'].map(ampm => {
                      const currentAmPm = (activeTimeType === 'entry' ? startTime : endTime).getHours() >= 12 ? 'PM' : 'AM';
                      const isSelected = currentAmPm === ampm;
                      return (
                        <View key={ampm} className="h-16 items-center justify-center">
                          <Text 
                            style={isSelected ? { fontSize: 36, lineHeight: 44 } : { fontSize: 24, lineHeight: 32 }}
                            className={`font-black ${isSelected ? (isDark ? 'text-[#34d399]' : 'text-[#064e3b]') : (isDark ? 'text-slate-600' : 'text-slate-300')}`}
                          >
                            {ampm}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
 
              <TouchableOpacity 
                onPress={() => setShowTimePicker(false)}
                style={{
                  shadowColor: isDark ? '#34d399' : '#064e3b',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.2,
                  shadowRadius: 20,
                  elevation: 10,
                }}
                className={`w-full py-5 rounded-3xl items-center justify-center mt-8 ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
              >
                <Text className={`text-lg font-black ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Confirm Time</Text>
              </TouchableOpacity>
            </View>
          </View>
       </Modal>

       {/* CUSTOM DATE PICKER POP-UP */}
       <Modal transparent visible={showDatePicker} animationType="fade">
          <View className="flex-1 items-center justify-center p-6 bg-black/60">
            <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
              <View className="absolute inset-0" />
            </TouchableWithoutFeedback>
            
             <View 
               style={{
                 shadowColor: '#000',
                 shadowOffset: { width: 0, height: 20 },
                 shadowOpacity: 0.3,
                 shadowRadius: 30,
                 elevation: 15,
               }}
               className={`w-full rounded-[48px] p-8 ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}
             >
              <View className="flex-row justify-between items-center mb-8">
                <TouchableOpacity 
                   onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                   className={`w-12 h-12 rounded-2xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}`}
                >
                  <ChevronLeft size={24} color={isDark ? '#cbd5e1' : '#94a3b8'} />
                </TouchableOpacity>
                
                <Text className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                  {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
 
                <TouchableOpacity 
                  onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                  className={`w-12 h-12 rounded-2xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}`}
                >
                  <ChevronRight size={24} color={isDark ? '#cbd5e1' : '#94a3b8'} />
                </TouchableOpacity>
              </View>
 
              <View className="gap-4">
                {/* Weekday Row */}
                <View className="flex-row justify-between mb-4 border-b border-slate-50 pb-4">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                    <Text key={day} className="flex-1 text-center text-[10px] font-black text-[#cbd5e1] tracking-widest">{day}</Text>
                  ))}
                </View>
 
                {/* Calendar Grid */}
                <View className="flex-row flex-wrap">
                  {getCalendarDays(viewDate).map((dayObj, i) => {
                    const isSelected = startTime.toDateString() === dayObj.date.toDateString();
                    const isToday = new Date().toDateString() === dayObj.date.toDateString();
                    
                    return (
                      <TouchableOpacity 
                        key={i} 
                        onPress={() => {
                          const newStart = new Date(startTime);
                          newStart.setFullYear(dayObj.date.getFullYear());
                          newStart.setMonth(dayObj.date.getMonth());
                          newStart.setDate(dayObj.date.getDate());
                          setStartTime(newStart);
                        }}
                        className="w-[14.28%] aspect-square items-center justify-center mb-2"
                      >
                          <View 
                            style={isSelected ? {
                              shadowColor: isDark ? '#34d399' : '#064e3b',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.2,
                              shadowRadius: 8,
                              elevation: 5,
                            } : {}}
                            className={`w-12 h-12 rounded-2xl items-center justify-center relative ${isSelected ? 'bg-[#064e3b]' : ''}`}
                          >
                            <Text className={`text-sm font-black ${
                              isSelected ? 'text-white' : 
                              (dayObj.isCurrentMonth ? (isDark ? 'text-white' : 'text-[#0f172a]') : 'text-[#cbd5e1]')
                            }`}>
                              {dayObj.date.getDate()}
                            </Text>
                            {isToday && !isSelected && <View className="absolute bottom-2 w-1 h-1 rounded-full bg-[#34d399]" />}
                         </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
 
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(false)}
                  style={{
                    shadowColor: isDark ? '#34d399' : '#064e3b',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.2,
                    shadowRadius: 20,
                    elevation: 10,
                  }}
                  className={`w-full py-5 rounded-3xl items-center justify-center mt-6 ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
                >
                  <Text className={`text-lg font-black ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Confirm Date</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
       </Modal>
    </BottomSheetModal>

    {/* Unified Sliding Bottom Sheet Overlay */}
    <BottomSheetModal
      ref={innerSheetRef}
      index={0}
      snapPoints={['75%']}
      stackBehavior="push"
      enablePanDownToClose
      backdropComponent={BlurBackdrop}
      onDismiss={handleInnerSheetDismiss}
      backgroundStyle={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderTopLeftRadius: 48, borderTopRightRadius: 48 }}
      handleIndicatorStyle={{ backgroundColor: isDark ? '#334155' : '#cbd5e1' }}
    >
      <BottomSheetScrollView showsVerticalScrollIndicator={false}>
        {/* Sticky header row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: isDark ? '#f8fafc' : '#0f172a' }}>
            {sheetMode === 'schedule' ? 'Your Schedule' : 'Select Vehicle'}
          </Text>
          <TouchableOpacity
            onPress={closeSheet}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
           {sheetMode === 'schedule' && renderScheduleEditor()}
           {sheetMode === 'vehicle' && renderVehicleEditor()}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
    </>
  );
});
