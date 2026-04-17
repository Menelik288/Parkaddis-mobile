import { TicketQrModal } from '@/components/TicketQrModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getDashboardSessionPriceEt,
  getReservationDisplayPriceEt,
  getReservationEntryInstant,
  getReservationLocationLabel,
  Reservation,
  reservationService,
} from '@/services/reservationService';
import { walletService } from '@/services/walletService';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { BalancePillShimmer, BALANCE_PILL_DEFAULT_WIDTH } from '@/components/BalancePillShimmer';
import { Bookmark, CheckCircle, History, Menu, QrCode, Settings, Wallet, XCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function TicketsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [menuVisible, setMenuVisible] = useState(false);
  const [balance, setBalance] = useState<string>('0.00');
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'expired'>('active');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketFor, setTicketFor] = useState<Reservation | null>(null);
  const [receiptFor, setReceiptFor] = useState<Reservation | null>(null);
  const [liveCostBump, setLiveCostBump] = useState(0);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const hasActive = reservations.some(r => r.status?.toUpperCase() === 'ACTIVE');
    if (!hasActive) return;
    const id = setInterval(() => setLiveCostBump(n => n + 1), 60_000);
    return () => clearInterval(id);
  }, [reservations]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const wallet = await walletService.getWallet();
      setBalance(wallet.balance);
      const data = await reservationService.getAllUserSessions();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch ticket data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleCancel = (item: Reservation) => {
    const startTime = dayjs(item.startTime);
    
    // Calculate minutes elapsed since the reservation's start time
    const diffMins = startTime.isValid() ? dayjs().diff(startTime, 'minute') : 100;
    const isRefundable = diffMins < 15;

    Alert.alert(
      "Cancel Reservation",
      isRefundable 
        ? `If you cancel now, you will receive a full refund of your ETB 7.00 reservation fee automatically to your wallet (15-min grace).`
        : `The 15-minute grace period has passed. The reservation fee (ETB 7.00) will not be refunded. Proceed?`,
      [
        { text: "No, keep it", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            console.log('[Tickets] Attempting to cancel:', item.id);
            setCancelLoading(item.id);
            try {
              await reservationService.cancelReservation(item);
              console.log('[Tickets] Cancellation successful');
              await fetchData();
              if (isRefundable) {
                Alert.alert("Success", "Reservation cancelled and refund processed.");
              } else {
                Alert.alert("Success", "Reservation cancelled.");
              }
            } catch (err: any) {
              console.error('[Tickets] Cancellation failed:', err);
              const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Could not cancel reservation.';
              Alert.alert("Cancellation Failed", errMsg);
            } finally {
              setCancelLoading(null);
            }
          }
        }
      ]
    );
  };

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const filteredReservations = safeReservations.filter(r => {
    const status = (r.status || '').toUpperCase();
    const entry = getReservationEntryInstant(r);
    const isUpcomingPaid = status === 'PAID' && !entry; // Paid fee but not checked in
    
    if (activeTab === 'active') {
      return status === 'ACTIVE' || status === 'RESERVED' || isUpcomingPaid;
    }
    if (activeTab === 'completed') {
      return (status === 'COMPLETED' || status === 'PAID') && !isUpcomingPaid;
    }
    return status === 'CANCELLED' || status === 'EXPIRED';
  });

  const primary = '#064e3b';
  const secondary = '#34d399';

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      {/* Top Bar */}
      <View className={`flex-row justify-between items-center px-6 ${Platform.OS === 'ios' ? 'pt-[68px]' : 'pt-[48px]'} pb-4 z-10 ${isDark ? 'bg-[#0f172a]/90' : 'bg-[#f8fafc]/90'}`}>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            onPress={() => setMenuVisible(!menuVisible)}
            className="p-1"
          >
            <Menu size={24} color={isDark ? secondary : primary} />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className="text-2xl font-black tracking-tighter" style={{ color: isDark ? secondary : primary }}>PARK</Text>
            <Text className="text-2xl font-black tracking-tighter text-[#94a3b8]">ADDIS</Text>
          </View>
        </View>
        {loading ? (
          <BalancePillShimmer isDark={isDark} />
        ) : (
          <TouchableOpacity
            onPress={() => router.push('/wallet')}
            style={{ width: BALANCE_PILL_DEFAULT_WIDTH }}
            className={`flex-row items-center pl-3 pr-1 py-1.5 min-h-[44px] rounded-full border border-[#064e3b] gap-2.5 ${isDark ? 'bg-[#1e293b]' : 'bg-white'}`}
          >
            <View style={{ flex: 1, minWidth: 0 }} className="justify-center">
              <Text className="text-[9px] font-bold uppercase tracking-wider text-[#475569]">BALANCE</Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className={`text-[15px] font-bold tracking-tight ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}
              >
                ETB {balance}
              </Text>
            </View>
            <View className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}>
              <Wallet size={16} color={isDark ? '#064e3b' : 'white'} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Modal - Sync with Dashboard */}
      <Modal 
        visible={menuVisible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
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
        className="flex-1 px-6" 
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? secondary : primary}
            colors={[secondary]}
          />
        }
      >
        {/* Headline */}
        <View className="mb-8 mt-4">
          <Text className={`text-[32px] font-extrabold tracking-tight ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Your Tickets</Text>
        </View>

        {/* Filter Toggle */}
        <View className={`flex-row p-1.5 rounded-2xl mb-8 ${isDark ? 'bg-[#1e293b]' : 'bg-[#f1f5f9]'}`}>
          <TouchableOpacity 
            onPress={() => setActiveTab('active')}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${activeTab === 'active' ? (isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]') : ''}`}
          >
            <Text className={`font-bold text-xs ${activeTab === 'active' ? (isDark ? 'text-[#064e3b]' : 'text-white') : 'text-[#475569]'}`}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${activeTab === 'completed' ? (isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]') : ''}`}
          >
            <Text className={`font-bold text-xs ${activeTab === 'completed' ? (isDark ? 'text-[#064e3b]' : 'text-white') : 'text-[#475569]'}`}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('expired')}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${activeTab === 'expired' ? (isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]') : ''}`}
          >
            <Text className={`font-bold text-xs ${activeTab === 'expired' ? (isDark ? 'text-[#064e3b]' : 'text-white') : 'text-[#475569]'}`}>Expired</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={isDark ? secondary : primary} className="mt-10" />
        ) : filteredReservations.length === 0 ? (
          <View className="items-center py-20">
            <Text className="text-[#94a3b8] font-medium">No {activeTab} tickets found</Text>
          </View>
        ) : (
          <View className="gap-3 mb-10">
            {filteredReservations.map((item) => {
              const rawStatus = (item.status || '').toUpperCase();
              const entry = getReservationEntryInstant(item);
              const isUpcomingPaid = rawStatus === 'PAID' && !entry;
              
              // Force "RESERVED" label for upcoming paid spots
              const displayStatus = isUpcomingPaid ? 'RESERVED' : rawStatus;
              const isTicketStyle = displayStatus === 'ACTIVE' || displayStatus === 'RESERVED';

              if (isTicketStyle) {
                const isActive = item.status?.toUpperCase() === 'ACTIVE';

                return (
                    <TouchableOpacity 
                      key={item.id} 
                      onPress={() => setReceiptFor(item)}
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.1,
                        shadowRadius: 20,
                        elevation: 8,
                      }}
                      className={`rounded-[32px] overflow-hidden border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-200'}`}
                    >
                    <View className={`p-6 flex-row justify-between items-start border-b border-dashed relative ${isDark ? 'border-[#334155]' : 'border-slate-200'}`}>
                      <View className={`absolute -left-3 top-1/2 z-10 w-6 h-6 rounded-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} />
                      <View className={`absolute -right-3 top-1/2 z-10 w-6 h-6 rounded-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} />

                      <View className="flex-1 gap-4">
                        <View className="gap-0.5 pr-20">
                          <Text className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">LOCATION</Text>
                          <Text
                            numberOfLines={1}
                            className={`text-lg font-extrabold ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}
                          >
                            {getReservationLocationLabel(item)}
                          </Text>
                        </View>
                        <View className="flex-row gap-8">
                          <View className="gap-0.5">
                            <Text className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">STATUS</Text>
                            <Text className={`text-sm font-semibold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{displayStatus}</Text>
                          </View>
                          <View className="gap-0.5">
                            <Text className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">DATE</Text>
                            <Text className={`text-sm font-semibold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>
                              {dayjs(item.startTime).format('MMM D, HH:mm')}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        className={`flex-row items-center gap-2 py-3 px-5 rounded-xl ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
                        onPress={() => {
                          if (item.status === 'ACTIVE' && dayjs().isAfter(dayjs(item.endTime))) {
                            router.push({ pathname: '/checkout', params: { reservationId: item.id } });
                          } else {
                            setTicketFor(item);
                          }
                        }}
                      >
                        <QrCode size={16} color={isDark ? '#064e3b' : 'white'} />
                        <Text className={`font-extrabold text-[10px] tracking-widest ${isDark ? 'text-[#064e3b]' : 'text-white'}`}>
                          TICKET
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View className={`flex-row justify-between items-center gap-3 p-6 ${isDark ? 'bg-[#34d399]/10' : 'bg-[#064e3b]'}`}>
                      <View className="flex-1 gap-0.5 min-w-0">
                        <Text className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#34d399]' : 'text-white/70'}`}>
                          {item.status?.toUpperCase() === 'ACTIVE' ? 'CURRENT COST' : 'ESTIMATED COST'}
                        </Text>
                        <Text className={`text-2xl font-black tracking-tight ${isDark ? 'text-[#34d399]' : 'text-white'}`}>
                          {(() => {
                            void liveCostBump;
                            return `${getDashboardSessionPriceEt(item)} ETB`;
                          })()}
                        </Text>
                      </View>

                      {(displayStatus === 'RESERVED') && (
                        <TouchableOpacity
                          onPress={() => handleCancel(item)}
                          disabled={cancelLoading === item.id}
                          className={`py-2.5 px-5 rounded-xl shrink-0 flex-row items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}
                        >
                          {cancelLoading === item.id ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                          ) : (
                            <Text className={`font-extrabold text-[10px] tracking-widest ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                              CANCEL
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }

                const isCancelled = rawStatus === 'CANCELLED' || rawStatus === 'EXPIRED';
                const isPaid = rawStatus === 'PAID' || rawStatus === 'COMPLETED';

                return (
                  <TouchableOpacity 
                    key={item.id}
                    onPress={() => setReceiptFor(item)}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                    className={`p-5 rounded-[28px] border flex-row justify-between items-center 
                      ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
                  >
                    <View className="flex-row items-center gap-4 flex-1">
                      <View className={`w-12 h-12 rounded-2xl items-center justify-center 
                        ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}
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
                          {getReservationLocationLabel(item)}
                        </Text>
                        <View className="flex-row items-center gap-2">
                          <View className={`px-2 py-0.5 rounded-lg ${isCancelled ? (isDark ? 'bg-red-500/10' : 'bg-red-50') : isPaid ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-50') : (isDark ? 'bg-slate-500/10' : 'bg-slate-50')}`}>
                            <Text className={`text-[8px] font-black tracking-widest uppercase ${isCancelled ? 'text-red-500' : isPaid ? 'text-emerald-500' : 'text-slate-500'}`}>
                              {rawStatus === 'COMPLETED' ? 'PAID' : rawStatus}
                            </Text>
                          </View>
                          <Text className="text-[9px] font-bold text-[#64748b]">
                            {dayjs(item.startTime).format('MMM D, YYYY')}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="items-end ml-4">
                      <Text className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>TOTAL</Text>
                      <Text className={`text-lg font-black ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>
                        ETB {getReservationDisplayPriceEt(item)}
                      </Text>
                    </View>
                  </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TicketQrModal visible={!!ticketFor} reservation={ticketFor} onClose={() => setTicketFor(null)} />

      <ReceiptModal 
        visible={!!receiptFor} 
        reservation={receiptFor} 
        onClose={() => setReceiptFor(null)} 
      />
    </View>
  );
}
