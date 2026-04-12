import React, { useEffect, useState } from 'react';
import { TextInput, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, useColorScheme, Image, Modal, TouchableWithoutFeedback, Animated, Platform } from 'react-native';
import { MapPin, Calendar, Clock, Edit2, Car, ArrowRight, Menu, Zap, Trash2, Plus, Minus, LogIn, LogOut, Info, X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { parkingService, LocationDetails } from '@/services/parkingService';
import { vehicleService, Vehicle } from '@/services/vehicleService';
import { reservationService } from '@/services/reservationService';
import { useAuth } from '@/context/AuthContext';

export default function ReserveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const locationId = params.id as string;
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

  const openSheet = (mode: 'schedule' | 'vehicle') => {
    setSheetMode(mode);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 60
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 800,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSheetMode(null);
      // Sync text input with state when closing if we modified it
      setDurationText(durationMins.toString());
    });
  };

  useEffect(() => {
    if (locationId) fetchData();
  }, [locationId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resDetails, resVehicles] = await Promise.all([
        parkingService.getLocationDetails(locationId),
        vehicleService.getUserVehicles()
      ]);
      setDetails(resDetails);
      const vehicleList = Array.isArray(resVehicles) ? resVehicles : [];
      setVehicles(vehicleList);
      if (vehicleList.length > 0) {
        setSelectedVehicle(vehicleList.find(v => v.isPrimary) || vehicleList[0]);
      }
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
    setBooking(true);
    try {
      await reservationService.createReservation({
        spotId: details.spot.id,
        vehicleId: selectedVehicle.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });
      router.push('/confirmation' as any);
    } catch (err: any) {
      Alert.alert('Booking Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center gap-4 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
        <ActivityIndicator size="large" color={isDark ? secondary : primary} />
        <Text className={`text-base font-semibold ${isDark ? 'text-[#94a3b8]' : 'text-[#475569]'}`}>Fetching spot details...</Text>
      </View>
    );
  }

  if (error || !details) {
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
  const pricePerHour = parseFloat(details.spot.pricePerHour) || 20;
  const hrs = durationMins / 60;
  const parkingFee = hrs * pricePerHour;
  const resFee = 5.00;
  const srvFee = 2.00;
  const totalPaid = parkingFee + resFee + srvFee;

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
              className={`w-[64px] h-[80px] rounded-2xl border-2 border-dashed items-center justify-center ${isDark ? 'bg-[#0f172a] border-[#334155]' : 'bg-white border-slate-200'}`}
            >
              <Calendar size={20} color={isDark ? '#475569' : '#94a3b8'} className="mb-1" />
              <Text className={`text-[9px] font-bold uppercase ${isDark ? 'text-[#475569]' : 'text-slate-400'}`}>Custom</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View className="flex-row gap-4 mb-4">
          <TouchableOpacity 
            onPress={() => {
              setActiveTimeType('entry');
              setShowTimePicker(true);
            }}
            className={`flex-1 p-5 rounded-3xl overflow-hidden relative border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-slate-50 border-transparent'}`}
          >
            <Text className={`text-[10px] font-bold uppercase tracking-wider mb-1 z-10 relative ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>ENTRY</Text>
            <View className="flex-row items-baseline gap-1 z-10 relative">
              <Text className={`text-2xl font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{formatTime(startTime).split(' ')[0]}</Text>
              <Text className={`text-xs font-bold ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>{formatTime(startTime).split(' ')[1]}</Text>
            </View>
            <View className="absolute bottom-3 right-3 opacity-20"><Edit2 size={12} color={primary} /></View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              setActiveTimeType('exit');
              setShowTimePicker(true);
            }}
            className={`flex-1 p-5 rounded-3xl overflow-hidden relative border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-slate-50 border-transparent'}`}
          >
            <Text className={`text-[10px] font-bold uppercase tracking-wider mb-1 z-10 relative ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>EXIT</Text>
            <View className="flex-row items-baseline gap-1 z-10 relative">
              <Text className={`text-2xl font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{formatTime(endTime).split(' ')[0]}</Text>
              <Text className={`text-xs font-bold ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>{formatTime(endTime).split(' ')[1]}</Text>
            </View>
            <View className="absolute bottom-3 right-3 opacity-20"><Edit2 size={12} color={primary} /></View>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-4 ml-1">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">CHOSEN DURATION</Text>
          </View>
          <View className={`flex-row items-center justify-between p-4 rounded-2xl border relative ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-slate-50 border-slate-200/50'}`}>
            <TouchableOpacity 
              onPress={() => {
                const newDur = Math.max(15, durationMins - 15);
                setDurationMins(newDur);
                setDurationText(newDur.toString());
              }}
              className={`w-12 h-12 rounded-xl items-center justify-center shadow-sm ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}
              activeOpacity={0.7}
            >
              <Minus size={20} color={isDark ? '#f8fafc' : '#0f172a'} />
            </TouchableOpacity>
            <View className="items-center flex-row gap-2 absolute top-0 bottom-0 left-0 right-0 justify-center">
              <TextInput 
                keyboardType="numeric"
                value={durationText}
                onChangeText={(text) => {
                  setDurationText(text);
                  const parsed = parseInt(text, 10);
                  if (!isNaN(parsed)) {
                    setDurationMins(parsed);
                  }
                }}
                className={`text-4xl font-bold ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}
                placeholder="30"
                placeholderTextColor={isDark ? '#334155' : '#cbd5e1'}
              />
              <Text className={`text-sm font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-[#64748b]' : 'text-slate-500'}`} pointerEvents="none">MINUTES</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                const newDur = durationMins + 15;
                setDurationMins(newDur);
                setDurationText(newDur.toString());
              }}
              className={`w-12 h-12 rounded-xl items-center justify-center shadow-lg z-10 ${isDark ? 'bg-[#34d399] shadow-[#34d399]/20' : 'bg-[#064e3b] shadow-[#064e3b]/30'}`}
              activeOpacity={0.7}
            >
              <Plus size={20} color={isDark ? '#0f172a' : '#ffffff'} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="py-4 relative justify-center">
          <View className={`w-full border-t-[2px] border-dashed ${isDark ? 'border-[#334155]' : 'border-slate-200'}`} />
          <View className={`absolute -left-10 w-8 h-8 rounded-full ${isDark ? 'bg-black/20' : 'bg-black/5'}`} />
          <View className={`absolute -right-10 w-8 h-8 rounded-full ${isDark ? 'bg-black/20' : 'bg-black/5'}`} />
        </View>

        <View className={`flex-row justify-between items-center p-4 rounded-2xl mb-4 border ${isDark ? 'bg-[#34d399]/10 border-[#34d399]/20' : 'bg-[#ecfdf5] border-[#d1fae5]/30'}`}>
           <View>
             <Text className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-[#34d399]' : 'text-[#059669]'}`}>EST. COST</Text>
             <Text className={`text-xs font-bold my-0.5 ${isDark ? 'text-[#64748b]' : 'text-slate-600'}`}>Total rate calculated below</Text>
           </View>
           <Text className={`text-xl font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>ETB {(hrs * pricePerHour).toFixed(2)}</Text>
        </View>

        <TouchableOpacity 
          onPress={closeSheet} 
          className={`w-full py-5 rounded-2xl flex-row items-center justify-center gap-2 shadow-xl ${isDark ? 'bg-[#34d399] shadow-[#34d399]/10' : 'bg-[#064e3b] shadow-[#064e3b]/20'}`}
        >
           <Text className={`text-lg font-bold ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Update Schedule</Text>
           <ArrowRight size={20} color={isDark ? '#0f172a' : 'white'} />
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
                    className={`rounded-3xl border text-left p-5 flex-row items-center justify-between ${
                      isActive 
                        ? (isDark ? 'bg-[#1e293b] border-[#34d399] shadow-lg' : 'bg-white border-[#064e3b] shadow-xl shadow-[#064e3b]/5') 
                        : (isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100 shadow-sm')
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
          className={`w-full py-5 rounded-2xl flex-row items-center justify-center gap-3 mt-4 shadow-xl ${isDark ? 'bg-[#34d399] shadow-[#34d399]/10' : 'bg-[#064e3b] shadow-[#064e3b]/20'}`}
        >
           <Plus size={20} color={isDark ? '#0f172a' : 'white'} />
           <Text className={`text-lg font-bold ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Save Selection</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      {/* Top App Bar - Dashboard Matched */}
      <View className={`w-full z-10 px-6 ${Platform.OS === 'ios' ? 'pt-[68px]' : 'pt-[48px]'} pb-4 flex-row justify-between items-center ${isDark ? 'bg-[#0f172a]/90' : 'bg-[#f8fafc]/90'}`}>
        <View className="flex-row items-center gap-5">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <ChevronLeft size={28} color={isDark ? secondary : primary} />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className="text-2xl font-black tracking-tighter" style={{ color: isDark ? secondary : primary }}>PARK</Text>
            <Text className="text-2xl font-black tracking-tighter text-[#94a3b8]">ADDIS</Text>
          </View>
        </View>
        <TouchableOpacity className={`w-10 h-10 rounded-full border-2 overflow-hidden bg-[#d1fae5] ${isDark ? 'border-[#34d399]' : 'border-[#064e3b]'}`}>
          <Image className="w-full h-full" source={{uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop'}} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 }}>
        {/* Hero Image */}
        <View className={`w-full h-[180px] rounded-[32px] overflow-hidden mb-8 relative border ${isDark ? 'border-[#334155]' : 'border-[#f8fafc] shadow-sm'}`}>
          <Image className={`w-full h-full ${isDark ? 'bg-[#1e293b]' : 'bg-slate-200'}`} source={{uri: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=600&fit=crop'}} />
          <View className={`absolute top-4 right-4 px-4 py-2 rounded-full flex-row items-center gap-2 shadow-sm ${isDark ? 'bg-[#0f172a]/95 border border-[#334155]' : 'bg-white/95 border border-white'}`}>
            <View className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#34d399]' : 'bg-[#10b981]'}`} />
            <Text className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>Available</Text>
          </View>
        </View>

        {/* Welcome Style Subheader */}
        <View className="mb-8">
          <Text className={`text-[24px] font-extrabold tracking-tighter leading-tight ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`} numberOfLines={1}>
            {details.location.name}
          </Text>
        </View>

        <Text className={`text-2xl font-bold tracking-tight mb-6 ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>Your Schedule</Text>

        {/* Ticket Style Schedule Card */}
        <View className={`border rounded-[32px] mb-10 relative overflow-hidden ${isDark ? 'bg-[#1e293b] border-[#34d399]/30' : 'bg-white border-[#34d399]/20 shadow-sm'}`}>
          <View className={`absolute -top-4 left-1/2 -ml-4 w-8 h-8 rounded-full z-10 border ${isDark ? 'bg-[#0f172a] border-[#34d399]/30' : 'bg-[#f8fafc] border-[#34d399]/20'}`} />
          <View className={`absolute -bottom-4 left-1/2 -ml-4 w-8 h-8 rounded-full z-10 border ${isDark ? 'bg-[#0f172a] border-[#34d399]/30' : 'bg-[#f8fafc] border-[#34d399]/20'}`} />

          <View className="flex-row">
            {/* Arrival Section */}
            <View className="py-8 px-6 flex-col flex-1 relative justify-center">
              <Text className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>ARRIVAL</Text>
              <View className="flex-row items-center gap-3">
                <View className={`w-10 h-10 rounded-xl border items-center justify-center ${isDark ? 'bg-[#0f172a] border-[#334155]' : 'bg-slate-50 border-slate-100'}`}>
                  <Calendar size={20} color={isDark ? '#34d399' : '#064e3b'} />
                </View>
                <View>
                  <Text className={`font-bold text-sm ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{formatDateLabel(startTime)}</Text>
                  <Text className={`text-[10px] font-bold uppercase tracking-tight mt-0.5 ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>{startTime.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                </View>
              </View>
            </View>

            {/* Dash Boundary */}
            <View className={`h-[80px] w-px border-r-[2px] border-dashed self-center ${isDark ? 'border-[#334155]' : 'border-slate-200'}`} />

            {/* Time Slot Section */}
            <View className="py-8 px-4 flex-col flex-1 relative justify-center">
               <TouchableOpacity 
                 onPress={() => openSheet('schedule')} 
                 className="absolute top-3 right-3 p-2"
                 hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
               >
                 <Edit2 size={18} color={primary} fill={primary} />
               </TouchableOpacity>

              <Text className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>TIME SLOT</Text>
              <View className="flex-row items-center gap-3">
                <View className={`w-10 h-10 rounded-xl border items-center justify-center ${isDark ? 'bg-[#0f172a] border-[#334155]' : 'bg-slate-50 border-slate-100'}`}>
                  <Clock size={20} color={isDark ? '#34d399' : '#064e3b'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-bold text-[11px] ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`} numberOfLines={1} ellipsizeMode="tail">
                    {formatTime(startTime)} – {formatTime(endTime)}
                  </Text>
                  <Text className={`text-[9px] font-bold uppercase tracking-tight mt-0.5 ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>{durationMins} MIN DURATION</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Text className={`text-2xl font-bold tracking-tight mb-6 ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>Selected Vehicle</Text>

        {/* Active Vehicle Card */}
        <View className={`rounded-[32px] p-8 mb-10 shadow-xl ${isDark ? 'bg-[#34d399]/10 border border-[#34d399]/20' : 'bg-[#064e3b] shadow-[#064e3b]/20'}`}>
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
        <View className={`rounded-[32px] p-8 mb-12 relative overflow-hidden border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-[#f4fdf8] border-transparent'}`}>
          <View className="space-y-8 relative z-10">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className={`text-[12px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-[#94a3b8]' : 'text-[#7fb0a2]'}`}>PARKING ({hDisplay}H {mDisplay}M)</Text>
                <Text className={`text-[14px] font-medium ${isDark ? 'text-[#64748b]' : 'text-[#94a3b8]'}`}>{hrs.toFixed(2)} hrs × ETB {pricePerHour.toFixed(2)}/hr</Text>
              </View>
              <Text className={`text-[16px] font-medium ${isDark ? 'text-[#f8fafc]' : 'text-[#475569]'}`}>ETB {parkingFee.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between items-center top-1 relative">
              <Text className={`text-[12px] font-bold uppercase tracking-wider ${isDark ? 'text-[#94a3b8]' : 'text-[#7fb0a2]'}`}>RESERVATION FEE</Text>
              <Text className={`text-[16px] font-medium ${isDark ? 'text-[#f8fafc]' : 'text-[#475569]'}`}>ETB {resFee.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between items-center top-2 relative">
              <Text className={`text-[12px] font-bold uppercase tracking-wider ${isDark ? 'text-[#94a3b8]' : 'text-[#7fb0a2]'}`}>SERVICE FEE</Text>
              <Text className={`text-[16px] font-medium ${isDark ? 'text-[#f8fafc]' : 'text-[#475569]'}`}>ETB {srvFee.toFixed(2)}</Text>
            </View>
          </View>
          <View className={`mt-8 pt-6 border-t flex-row justify-between items-center ${isDark ? 'border-[#334155]' : 'border-[#d1fae5]/50'}`}>
            <Text className={`font-bold text-[13px] uppercase tracking-wider ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>TOTAL</Text>
            <Text className={`font-bold text-[26px] -mt-1 ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>ETB {totalPaid.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Bottom */}
        <View className="pb-8">
          <TouchableOpacity 
            className={`w-full h-[72px] rounded-[24px] flex-row items-center justify-center gap-2 shadow-xl ${isDark ? 'bg-[#34d399] shadow-[#34d399]/20' : 'bg-[#064e3b] shadow-[#064e3b]/30'}`}
            onPress={handleConfirm}
            disabled={booking}
            activeOpacity={0.8}
          >
            {booking ? (
               <ActivityIndicator color={isDark ? '#0f172a' : 'white'} />
            ) : (
               <>
                 <Text className={`font-bold text-xl mr-1 ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Confirm Reservation</Text>
                 <ArrowRight size={24} color={isDark ? '#0f172a' : 'white'} />
               </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Unified Sliding Bottom Sheet Overlay */}
      {sheetMode !== null && (
        <View className="absolute inset-0 z-[100] justify-end">
          <TouchableWithoutFeedback onPress={closeSheet}>
            <View className="absolute inset-0 bg-black/40" />
          </TouchableWithoutFeedback>
          <Animated.View 
            style={{ transform: [{ translateY: slideAnim }] }} 
            className={`rounded-t-[40px] pt-4 px-6 pb-8 min-h-[65%] relative ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}
          >
             <View className="w-full items-center mb-6">
                <View className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-[#334155]' : 'bg-slate-200'}`} />
             </View>

             <TouchableOpacity 
               onPress={closeSheet} 
               className={`absolute top-6 right-6 w-10 h-10 items-center justify-center rounded-full z-20 ${isDark ? 'bg-[#1e293b]' : 'bg-slate-100'}`}
               hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
             >
                <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
             </TouchableOpacity>
             
             {sheetMode === 'schedule' && renderScheduleEditor()}
             {sheetMode === 'vehicle' && renderVehicleEditor()}
          </Animated.View>
        </View>
      )}
       {/* EXACT STITCH CIRCULAR WHEEL TIME PICKER POP-UP */}
       {showTimePicker && activeTimeType && (
         <View className="absolute inset-0 z-[200] items-center justify-center p-6">
            <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
              <View className="absolute inset-0 bg-black/60" />
            </TouchableWithoutFeedback>
            
            <View className={`w-full rounded-[48px] p-8 shadow-2xl ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}>
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
                      if (h >= 1 && h <= 12) updateTime(activeTimeType, 'hour', h);
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
                      if (m >= 0 && m <= 59) updateTime(activeTimeType, 'minute', m);
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
                      updateTime(activeTimeType, 'ampm', ampm);
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
                className={`w-full py-5 rounded-3xl items-center justify-center mt-8 shadow-xl ${isDark ? 'bg-[#34d399] shadow-[#34d399]/20' : 'bg-[#064e3b] shadow-[#064e3b]/30'}`}
              >
                <Text className={`text-lg font-black ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Confirm Time</Text>
              </TouchableOpacity>
            </View>
         </View>
       )}

       {/* CUSTOM DATE PICKER POP-UP */}
       {showDatePicker && (
         <View className="absolute inset-0 z-[200] items-center justify-center p-6">
            <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
              <View className="absolute inset-0 bg-black/60" />
            </TouchableWithoutFeedback>
            
             <View className={`w-full rounded-[48px] p-8 shadow-2xl ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}>
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
                         <View className={`w-12 h-12 rounded-2xl items-center justify-center relative ${isSelected ? 'bg-[#064e3b] shadow-lg shadow-[#064e3b]/30' : ''}`}>
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
                  className={`w-full py-5 rounded-3xl items-center justify-center mt-6 shadow-xl ${isDark ? 'bg-[#34d399] shadow-[#34d399]/20' : 'bg-[#064e3b] shadow-[#064e3b]/30'}`}
                >
                  <Text className={`text-lg font-black ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Confirm Date</Text>
                </TouchableOpacity>
              </View>
            </View>
         </View>
       )}
    </View>
  );
}
