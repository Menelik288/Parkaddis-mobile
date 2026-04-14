import { Reservation, getExtensionExtraCostEt, reservationService } from '@/services/reservationService';
import dayjs from 'dayjs';
import { ArrowRight, Clock, Minus, Plus, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#064e3b';

type Preset = '30' | '60' | 'custom';

type Props = {
  visible: boolean;
  reservation: Reservation | null;
  isDark: boolean;
  onClose: () => void;
  onSuccess: (updated: Reservation) => void;
};

function splitTimeLabel(d: dayjs.Dayjs | null): { clock: string; ap: string } {
  if (!d?.isValid()) return { clock: '—', ap: '' };
  const s = d.format('h:mm A');
  const parts = s.split(' ');
  const ap = parts.pop() ?? '';
  return { clock: parts.join(' '), ap };
}

export function ExtendSessionModal({ visible, reservation, isDark, onClose, onSuccess }: Props) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(800)).current;
  const [submitting, setSubmitting] = useState(false);

  const [preset, setPreset] = useState<Preset>('custom');
  const [customMinutes, setCustomMinutes] = useState(30);

  useEffect(() => {
    if (visible && reservation) {
      setPreset('custom');
      setCustomMinutes(30);
      setSubmitting(false);
      slideAnim.setValue(800);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }).start();
    }
  }, [visible, reservation?.id]);

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: 800,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const extraMinutes = useMemo(() => {
    if (preset === '30') return 30;
    if (preset === '60') return 60;
    return Math.max(15, Math.min(480, customMinutes));
  }, [preset, customMinutes]);

  const currentEnd = reservation ? dayjs(reservation.endTime) : null;
  const newEnd = currentEnd?.isValid() ? currentEnd.add(extraMinutes, 'minute') : null;

  const curParts = splitTimeLabel(currentEnd);
  const newParts = splitTimeLabel(newEnd);

  const additionalCost = reservation ? getExtensionExtraCostEt(reservation, extraMinutes) : '0.00';

  const confirm = async () => {
    if (!reservation?.id) return;
    setSubmitting(true);
    try {
      const updated = await reservationService.extendReservation(reservation.id, extraMinutes);
      onSuccess(updated);
      dismiss();
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert('Could not extend', err?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!reservation) return null;

  const sheetBg = isDark ? 'bg-[#0f172a]' : 'bg-white';
  const handleBar = isDark ? 'bg-[#334155]' : 'bg-slate-200';
  const closeBtnBg = isDark ? 'bg-[#1e293b]' : 'bg-slate-100';
  const closeIcon = isDark ? '#94a3b8' : '#64748b';

  const sectionLabel = 'text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-4 ml-1';
  const timeCard = `flex-1 px-3 py-3 rounded-2xl overflow-hidden relative border ${
    isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-slate-50 border-transparent'
  }`;
  const timeCardLabel = `text-[10px] font-bold uppercase tracking-wider mb-0.5 z-10 relative ${
    isDark ? 'text-[#64748b]' : 'text-slate-400'
  }`;
  const timeClock = `text-xl font-bold z-10 relative ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`;
  const timeAp = `text-xs font-bold z-10 relative ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      <View className="flex-1 justify-end">
        <TouchableWithoutFeedback onPress={dismiss}>
          <View style={StyleSheet.absoluteFillObject} className="bg-black/40" />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            paddingBottom: Math.max(insets.bottom, 24),
          }}
          className={`rounded-t-[40px] pt-4 px-6 min-h-[58%] relative ${sheetBg}`}
        >
          <View className="w-full items-center mb-4">
            <View className={`w-12 h-1.5 rounded-full ${handleBar}`} />
          </View>

          <TouchableOpacity
            onPress={dismiss}
            className={`absolute top-6 right-6 w-10 h-10 items-center justify-center rounded-full z-20 ${closeBtnBg}`}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <X size={20} color={closeIcon} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View className="px-2 pb-10 pt-6 space-y-8">
              <View>
                <Text className={sectionLabel}>Session end times</Text>
                <View className="flex-row gap-4">
                  <View className={timeCard}>
                    <Text className={timeCardLabel}>Current end</Text>
                    <View className="flex-row items-baseline gap-1 z-10 relative">
                      <Text className={timeClock}>{curParts.clock}</Text>
                      {!!curParts.ap && <Text className={timeAp}>{curParts.ap}</Text>}
                    </View>
                    <View className="absolute bottom-2 right-2 opacity-20">
                      <Clock size={10} color={PRIMARY} />
                    </View>
                  </View>
                  <View className={timeCard}>
                    <Text className={timeCardLabel}>New end</Text>
                    <View className="flex-row items-baseline gap-1 z-10 relative flex-wrap">
                      <Text className={timeClock}>{newParts.clock}</Text>
                      {!!newParts.ap && <Text className={timeAp}>{newParts.ap}</Text>}
                    </View>
                    <View
                      className={`mt-1 self-start px-1.5 py-0.5 rounded-full z-10 ${
                        isDark ? 'bg-[#34d399]/20' : 'bg-[#064e3b]/10'
                      }`}
                    >
                      <Text className={`text-[9px] font-bold ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>
                        +{extraMinutes}m
                      </Text>
                    </View>
                    <View className="absolute bottom-2 right-2 opacity-20">
                      <Clock size={10} color={PRIMARY} />
                    </View>
                  </View>
                </View>
              </View>

              <View>
                <Text className={sectionLabel}>Add time</Text>
                <View className="flex-row gap-3">
                  {(['30', '60', 'custom'] as const).map(key => {
                    const selected = preset === key;
                    const label = key === '30' ? '30 Min' : key === '60' ? '1 Hr' : 'Custom';
                    return (
                      <TouchableOpacity
                        key={key}
                        onPress={() => setPreset(key)}
                        className={`flex-1 min-h-[56px] py-4 rounded-2xl items-center justify-center border ${
                          selected
                            ? isDark
                              ? 'bg-[#34d399] border-[#064e3b]'
                              : 'bg-[#064e3b] border-[#064e3b]'
                            : isDark
                              ? 'bg-[#1e293b] border-[#064e3b]/45'
                              : 'bg-slate-50 border-[#064e3b]/50'
                        }`}
                      >
                        <Text
                          className={`text-sm font-bold ${
                            selected
                              ? isDark
                                ? 'text-[#0f172a]'
                                : 'text-white'
                              : isDark
                                ? 'text-[#f8fafc]'
                                : 'text-[#0f172a]'
                          }`}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {preset === 'custom' && (
                <View>
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-4 ml-1">
                    Extra minutes
                  </Text>
                  <View
                    className={`flex-row items-center justify-between p-4 rounded-2xl border relative ${
                      isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-slate-50 border-slate-200/50'
                    }`}
                  >
                    <TouchableOpacity
                      onPress={() => setCustomMinutes(m => Math.max(15, m - 15))}
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                      className={`w-12 h-12 rounded-xl items-center justify-center z-10 ${
                        isDark ? 'bg-[#0f172a]' : 'bg-white'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Minus size={20} color={isDark ? '#f8fafc' : '#0f172a'} />
                    </TouchableOpacity>
                    <View className="items-center flex-row gap-2 absolute top-0 bottom-0 left-0 right-0 justify-center pointer-events-none">
                      <Text
                        className={`text-4xl font-bold ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}
                        pointerEvents="none"
                      >
                        {customMinutes}
                      </Text>
                      <Text
                        className={`text-sm font-bold uppercase tracking-widest mt-1 ${
                          isDark ? 'text-[#64748b]' : 'text-slate-500'
                        }`}
                        pointerEvents="none"
                      >
                        minutes
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setCustomMinutes(m => Math.min(480, m + 15))}
                      style={{
                        shadowColor: isDark ? '#34d399' : '#064e3b',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.2,
                        shadowRadius: 15,
                        elevation: 10,
                      }}
                      className={`w-12 h-12 rounded-xl items-center justify-center z-10 ${
                        isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Plus size={20} color={isDark ? '#0f172a' : '#ffffff'} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View className="py-4 relative justify-center">
                <View className={`w-full border-t-[2px] border-dashed ${isDark ? 'border-[#334155]' : 'border-slate-200'}`} />
                <View className={`absolute -left-10 w-8 h-8 rounded-full ${isDark ? 'bg-black/20' : 'bg-black/5'}`} />
                <View className={`absolute -right-10 w-8 h-8 rounded-full ${isDark ? 'bg-black/20' : 'bg-black/5'}`} />
              </View>

              <View
                className={`flex-row justify-between items-center p-4 rounded-2xl border mb-6 ${
                  isDark ? 'bg-[#34d399]/10 border-[#34d399]/20' : 'bg-[#ecfdf5] border-[#d1fae5]/30'
                }`}
              >
                <View>
                  <Text
                    className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                      isDark ? 'text-[#34d399]' : 'text-[#059669]'
                    }`}
                  >
                    Additional cost
                  </Text>
                  <Text className={`text-xs font-bold my-0.5 ${isDark ? 'text-[#64748b]' : 'text-slate-600'}`}>
                    Based on this spot's hourly rate
                  </Text>
                </View>
                <Text className={`text-xl font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>
                  ETB {additionalCost}
                </Text>
              </View>

              <TouchableOpacity
                onPress={confirm}
                disabled={submitting}
                style={{
                  shadowColor: isDark ? '#34d399' : '#064e3b',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.2,
                  shadowRadius: 15,
                  elevation: 10,
                }}
                className={`w-full py-5 rounded-2xl flex-row items-center justify-center gap-2 ${
                  submitting ? 'opacity-70' : ''
                } ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
              >
                {submitting ? (
                  <ActivityIndicator color={isDark ? '#0f172a' : '#ffffff'} />
                ) : (
                  <>
                    <Text className={`text-lg font-bold ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>
                      Confirm extension
                    </Text>
                    <ArrowRight size={20} color={isDark ? '#0f172a' : 'white'} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
