import {
  getDashboardSessionPriceEt,
  getReservationLocationLabel,
  getReservationPlateLabel,
  getReservationQrToken,
  Reservation,
} from '@/services/reservationService';
import { X } from 'lucide-react-native';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const PRIMARY = '#064e3b';

type Props = {
  visible: boolean;
  reservation: Reservation | null;
  onClose: () => void;
};

export function TicketQrModal({ visible, reservation, onClose }: Props) {
  if (!reservation) return null;

  const qrPayload = getReservationQrToken(reservation);
  const location = getReservationLocationLabel(reservation, 'Parking');
  const plate = getReservationPlateLabel(reservation);
  const costEt = getDashboardSessionPriceEt(reservation);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center px-5 py-10">
        <TouchableOpacity
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="bg-white rounded-[28px] max-w-[400px] w-full self-center shadow-2xl">
          <View className="px-6 pt-6 pb-2 flex-row items-start justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View
                className="w-11 h-11 rounded-xl items-center justify-center"
                style={{ backgroundColor: PRIMARY }}
              >
                <Text className="text-white text-xl font-black">P</Text>
              </View>
              <Text className="text-[#0f172a] text-xl font-extrabold">ParkAddis</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-[#f1f5f9] items-center justify-center"
              hitSlop={12}
            >
              <X size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="max-h-[85%]"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 pt-2 pb-6">
              <View className="bg-[#f1f5f9] rounded-2xl p-6 items-center justify-center min-h-[200px]">
                {qrPayload ? (
                  <QRCode
                    value={qrPayload}
                    size={200}
                    color={PRIMARY}
                    backgroundColor="#f1f5f9"
                    quietZone={8}
                  />
                ) : (
                  <Text className="text-center text-[#64748b] text-sm font-medium px-4">
                    No QR token on this reservation yet. Pull to refresh or reopen after booking syncs.
                  </Text>
                )}
              </View>
              <Text className="text-center text-[10px] font-bold uppercase tracking-widest text-[#94a3b8] mt-3">
                {String(reservation.status ?? '').toUpperCase() === 'RESERVED'
                  ? 'Scan at entrance'
                  : 'Scan to exit'}
              </Text>

              <View className="relative my-6 mx-1">
                <View className="border-t border-dashed border-[#e2e8f0]" />
                <View className="absolute -left-1.5 top-1/2 w-5 h-5 rounded-full bg-white border border-[#e2e8f0] -mt-2.5" />
                <View className="absolute -right-1.5 top-1/2 w-5 h-5 rounded-full bg-white border border-[#e2e8f0] -mt-2.5" />
              </View>

              <View className="flex-row gap-4 mb-5">
                <View className="flex-1">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1">
                    Location
                  </Text>
                  <Text className="text-[#0f172a] text-base font-extrabold" numberOfLines={2}>
                    {location}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1">
                    Plate
                  </Text>
                  <Text className="text-[#0f172a] text-base font-extrabold" numberOfLines={1}>
                    {plate}
                  </Text>
                </View>
              </View>

              <View className="bg-[#f1f5f9] rounded-2xl px-4 py-4 flex-row items-center justify-between mb-6">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Cost so far
                </Text>
                <Text className="text-[#0f172a] text-xl font-black">ETB {costEt}</Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                className="rounded-full py-4 items-center justify-center"
                style={{ backgroundColor: PRIMARY }}
              >
                <Text className="text-white font-extrabold text-base">Close Ticket</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
