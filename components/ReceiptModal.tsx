import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  useColorScheme,
} from 'react-native';
import { X, Download, Car, Wallet, AlertCircle, Clock, MapPin, CheckCircle2 } from 'lucide-react-native';
import dayjs from 'dayjs';
import { 
  Reservation, 
  getReservationLocationLabel, 
  getReservationPlateLabel,
  getReservationDisplayPriceEt,
  getReservationEntryInstant
} from '@/services/reservationService';

interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  reservation: Reservation | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function ReceiptModal({ visible, onClose, reservation }: ReceiptModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!reservation) return null;

  const entry = getReservationEntryInstant(reservation);
  const rawStatus = (reservation.status || '').toUpperCase();
  const isUpcomingPaid = rawStatus === 'PAID' && !entry;

  const statusLabel = isUpcomingPaid ? 'RESERVED' : (rawStatus === 'COMPLETED' ? 'PAID' : rawStatus);
  const isPaid = statusLabel === 'PAID';
  const isCancelled = statusLabel === 'CANCELLED' || statusLabel === 'EXPIRED';
  const isReserved = statusLabel === 'RESERVED';

  const location = getReservationLocationLabel(reservation);
  const plate = getReservationPlateLabel(reservation);
  const totalAmount = getReservationDisplayPriceEt(reservation);
  const dateStr = dayjs(reservation.startTime).format('MMM D, YYYY');
  const timeSlot = `${dayjs(reservation.startTime).format('h:mm A')} - ${dayjs(reservation.endTime).format('h:mm A')}`;
  
  // Breakdown - using some logic to approximate if not provided
  // In a real app, these would come from the reservation object
  // Breakdown - using some logic to approximate if not provided
  // ETB 7.00 is the standard reservation deposit (5.00 res + 2.00 srv)
  const isOnlyReservationFee = isReserved || parseFloat(totalAmount) === 7.00;
  const resFee = isCancelled ? 0 : 5.00;
  const srvFee = isCancelled ? 0 : 2.00;
  const parkingFee = isOnlyReservationFee ? 0 : (parseFloat(totalAmount) > (resFee + srvFee) ? parseFloat(totalAmount) - (resFee + srvFee) : 0);

  const getStatusColor = () => {
    if (isPaid) return '#10b981'; // emerald-500
    if (isCancelled) return '#ef4444'; // red-500
    if (isReserved) return '#3b82f6'; // blue-500
    return '#f59e0b'; // amber-500
  };

  // Using statusLabel for watermark and display text

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center px-6">
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="absolute inset-0 bg-black/60" />
        </TouchableWithoutFeedback>

        <View 
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 15,
            width: SCREEN_WIDTH - 48,
          }}
          className={`${isDark ? 'bg-[#0f172a]' : 'bg-white'} rounded-[40px] overflow-hidden`}
        >
          {/* Static Status Watermark Background */}
          <View 
            style={{ paddingTop: 100 }}
            className={`absolute inset-0 items-center justify-start ${isDark ? 'opacity-[0.18]' : 'opacity-[0.10]'} z-0`}
          >
            <Text 
              style={{ 
                fontSize: statusLabel === 'CANCELLED' ? 55 : 80, 
                color: getStatusColor(),
                transform: [{ rotate: '-15deg' }]
              }} 
              className="font-black"
            >
              {statusLabel}
            </Text>
          </View>

          {/* Header Section */}
          <View className="pt-8 pb-6 px-8 items-center relative">
            <TouchableOpacity 
              onPress={onClose}
              className={`absolute top-6 right-6 w-10 h-10 rounded-full items-center justify-center z-20 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}
            >
              <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>

            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 rounded-xl bg-[#064e3b] items-center justify-center">
                <Text className="text-white text-xl font-black">P</Text>
              </View>
              <Text className={`${isDark ? 'text-white' : 'text-[#0f172a]'} text-2xl font-black tracking-tighter`}>ParkAddis</Text>
            </View>

            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-2">
              PAYMENT RECEIPT
            </Text>
            
            <View className="flex-row items-baseline gap-2">
              <Text className="text-xl font-bold text-slate-400">ETB</Text>
              <Text className={`text-[44px] font-black ${isDark ? 'text-white' : 'text-[#0f172a]'} tracking-tight`}>
                {totalAmount}
              </Text>
            </View>
          </View>

          {/* Perforated Line Divider */}
          <View className="flex-row items-center px-[-16px]">
            <View className={`w-8 h-8 rounded-full ${isDark ? 'bg-[#1e293b]' : 'bg-black/60'} -ml-4`} />
            <View className={`flex-1 border-t border-dashed ${isDark ? 'border-slate-800' : 'border-slate-200'} mx-2`} />
            <View className={`w-8 h-8 rounded-full ${isDark ? 'bg-[#1e293b]' : 'bg-black/60'} -mr-4`} />
          </View>

          <ScrollView 
            className="max-h-[500px]" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 24, paddingBottom: 40 }}
          >
            {/* Info Grid */}
            <View className="flex-row flex-wrap gap-y-6 mb-8 relative z-10">
              <View className="w-1/2">
                <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">RECEIPT NO</Text>
                <Text className={`text-sm font-black ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>#{reservation.id.slice(0, 7).toUpperCase()}</Text>
              </View>
              <View className="w-1/2 items-end">
                <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">DATE</Text>
                <Text className={`text-sm font-black ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>{dateStr}</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">LOCATION</Text>
                <Text className={`text-sm font-black ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`} numberOfLines={1}>{location}</Text>
              </View>
              <View className="w-1/2 items-end">
                <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">TIME SLOT</Text>
                <Text className={`text-[11px] font-black ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>{timeSlot}</Text>
              </View>
            </View>

            {/* Vehicle Card */}
            <View className={`${isDark ? 'bg-[#1e293b] border-slate-800' : 'bg-slate-50 border-slate-100/50'} rounded-3xl p-5 flex-row items-center gap-4 mb-3 border`}>
              <View className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-[#0f172a]' : 'bg-white'} items-center justify-center shadow-sm`}>
                <Car size={24} color={isDark ? '#34d399' : '#064e3b'} />
              </View>
              <View>
                <Text className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>{reservation.vehicle?.carModel || 'My Vehicle'}</Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plate}</Text>
              </View>
            </View>

            {/* Payment Method Card */}
            <View className={`${isDark ? 'bg-[#1e293b] border-slate-800' : 'bg-slate-50 border-slate-100/50'} rounded-3xl p-5 flex-row items-center gap-4 mb-8 border`}>
              <View className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-[#0f172a]' : 'bg-white'} items-center justify-center shadow-sm`}>
                <Wallet size={24} color={isDark ? '#34d399' : '#064e3b'} />
              </View>
              <View>
                <Text className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>ParkAddis Wallet</Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid securely</Text>
              </View>
            </View>

            {/* Breakdown Section */}
            <View className={`rounded-[32px] p-6 mb-8 ${isPaid ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-50') : isCancelled ? (isDark ? 'bg-red-500/10' : 'bg-red-50') : (isDark ? 'bg-amber-500/10' : 'bg-amber-50')}`}>
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className={`text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'text-emerald-500' : isCancelled ? 'text-red-500' : isReserved ? 'text-blue-500' : 'text-amber-500'}`}>
                    PARKING
                  </Text>
                  <Text className={`text-xs font-bold ${isPaid ? (isDark ? 'text-emerald-400' : 'text-emerald-900') : isCancelled ? (isDark ? 'text-red-400' : 'text-red-900') : (isDark ? 'text-amber-400' : 'text-amber-900')}`}>
                    ETB {parkingFee.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className={`text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'text-emerald-500' : isCancelled ? 'text-red-500' : isReserved ? 'text-blue-500' : 'text-amber-500'}`}>
                    RESERVATION FEE
                  </Text>
                  <Text className={`text-xs font-bold ${isPaid ? (isDark ? 'text-emerald-400' : 'text-emerald-900') : isCancelled ? (isDark ? 'text-red-400' : 'text-red-900') : (isDark ? 'text-amber-400' : 'text-amber-900')}`}>
                    ETB {resFee.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between pb-4">
                  <Text className={`text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'text-emerald-500' : isCancelled ? 'text-red-500' : isReserved ? 'text-blue-500' : 'text-amber-500'}`}>
                    SERVICE FEE
                  </Text>
                  <Text className={`text-xs font-bold ${isPaid ? (isDark ? 'text-emerald-400' : 'text-emerald-900') : isCancelled ? (isDark ? 'text-red-400' : 'text-red-900') : (isDark ? 'text-amber-400' : 'text-amber-900')}`}>
                    ETB {srvFee.toFixed(2)}
                  </Text>
                </View>
                
                <View className={`pt-4 border-t border-dashed ${isDark ? 'border-slate-800' : 'border-slate-200'} flex-row justify-between items-center`}>
                  <Text className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-[#0f172a]'}`}>
                    {isOnlyReservationFee ? 'DEPOSIT PAID' : 'TOTAL PAID'}
                  </Text>
                  <Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>ETB {totalAmount}</Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
              onPress={onClose}
              style={{
                shadowColor: '#064e3b',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 15,
                elevation: 8,
              }}
              className={`w-full h-16 rounded-2xl flex-row items-center justify-center gap-3 ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
            >
              <Download size={20} color={isDark ? '#064e3b' : 'white'} />
              <Text className={`${isDark ? 'text-[#064e3b]' : 'text-white'} font-black text-lg`}>Download Receipt</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
