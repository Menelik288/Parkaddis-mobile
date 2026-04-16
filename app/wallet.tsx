import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert,
  Easing,
  StyleSheet,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Wallet as WalletIcon, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  CheckCircle2,
  X,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/PageHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { walletService, Wallet, Transaction } from '@/services/walletService';
import { useAuth } from '@/context/AuthContext';

const SHIMMER_BAND = 140;
const CARD_ACCENT = '#34d399';

function formatAccountNo(walletId: string): string {
  const digits = walletId.replace(/[^0-9]/g, '');
  const p1 = digits.slice(0, 4).padStart(4, '0');
  const p2 = digits.slice(4, 8).padStart(4, '0');
  return `PA-${p1}-${p2}`;
}

function DotGrid() {
  const dots: React.ReactElement[] = [];
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 32; c++) {
      dots.push(
        <View
          key={`${r}-${c}`}
          style={{ width: 1.5, height: 1.5, borderRadius: 0.75, backgroundColor: 'rgba(255,255,255,0.12)', margin: 5 }}
        />
      );
    }
  }
  return (
    <View style={[StyleSheet.absoluteFillObject, { flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden' }]} pointerEvents="none">
      {dots}
    </View>
  );
}

function WalletBalanceShimmer() {
  const translateX = useRef(new Animated.Value(-SHIMMER_BAND)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 360,
          duration: 1300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -SHIMMER_BAND,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  return (
    <View className="flex-row items-center mb-12" style={{ alignSelf: 'flex-start' }}>
      <View
        style={{
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.14)',
          width: 130,
          height: 46,
          borderRadius: 12,
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: SHIMMER_BAND * 2,
            transform: [{ translateX }],
          }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.55)', 'transparent']}
            locations={[0.15, 0.5, 0.85]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1, width: '100%', height: '100%' }}
          />
        </Animated.View>
      </View>
    </View>
  );
}

export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'Chapa' | 'Telebirr'>('Chapa');
  const [lastTopUpTxRef, setLastTopUpTxRef] = useState('');
  const slideAnim = useRef(new Animated.Value(800)).current;

  const primary = '#064e3b';

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const walletData = await walletService.getWallet();
      setWallet(walletData);
      
      if (walletData?.id) {
        const txHistory = await walletService.getTransactionHistory(walletData.id);
        setHistory(Array.isArray(txHistory) ? txHistory : []);
      }
    } catch (err) {
      console.error('Failed to fetch wallet data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchWalletData();
  }, []);

  const openTopUp = () => {
    setIsSuccess(false);
    setLastTopUpTxRef('');
    setShowTopUp(true);
    slideAnim.setValue(800);
    requestAnimationFrame(() => {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }).start();
    });
  };

  const closeTopUp = () => {
    Animated.timing(slideAnim, {
      toValue: 800,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowTopUp(false);
      setTopUpAmount('');
      setIsSuccess(false);
      setLastTopUpTxRef('');
    });
  };

  const handleTopUp = async () => {
    const amt = parseFloat(topUpAmount);
    if (!Number.isFinite(amt) || amt < 1) {
      Alert.alert('Invalid amount', 'Enter at least ETB 1 to top up.');
      return;
    }
    setTopUpLoading(true);
    setLastTopUpTxRef('');
    try {
      const preferred = selectedMethod === 'Telebirr' ? 'telebirr' : 'chapa';
      const response = await walletService.topUp(amt, { preferredChannel: preferred });
      setLastTopUpTxRef(response.tx_ref || '');
      if (response.checkout_url) {
        await WebBrowser.openBrowserAsync(response.checkout_url);
        
        // After browser closes, verify the actual status from the backend
        if (wallet?.id && response.tx_ref) {
          const isConfirmed = await walletService.verifyPayment(wallet.id, response.tx_ref);
          if (isConfirmed) {
            await fetchWalletData();
            setIsSuccess(true);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not start top-up';
      Alert.alert('Payment could not start', msg);
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} edges={['bottom', 'left', 'right']}>
      <PageHeader title="Wallet" />
      <ScrollView 
        className="px-6" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? CARD_ACCENT : primary}
            colors={[CARD_ACCENT]}
          />
        }
      >
        {/* === WALLET CARD === */}
        <View
          style={{
            marginTop: 16,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: isDark ? '#0a6648' : '#064e3b',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.5 : 0.18,
            shadowRadius: 24,
            elevation: 12,
          }}
        >
          <DotGrid />
          {/* Wallet icon — absolutely placed relative to the card itself */}
          <View style={{ position: 'absolute', top: 24, right: 24, width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <WalletIcon size={24} color="white" />
          </View>
          <View style={{ padding: 28, paddingBottom: 24 }}>

            {/* Label */}
            <Text style={{ color: CARD_ACCENT, fontSize: 11, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
              PARKADDIS WALLET
            </Text>

            {/* Balance — right below the label */}
            {loading ? (
              <WalletBalanceShimmer />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 40 }}>
                <Text style={{ color: CARD_ACCENT, fontSize: 16, fontWeight: '800', marginBottom: 4 }}>ETB</Text>
                <Text style={{ color: 'white', fontSize: 38, fontWeight: '800', lineHeight: 44, letterSpacing: -1 }}>
                  {wallet ? parseFloat(wallet.balance).toFixed(2) : '—'}
                </Text>
              </View>
            )}

            {/* Footer: card holder + top-up */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View>
                <Text style={{ color: CARD_ACCENT, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                  CARD HOLDER
                </Text>
                <Text style={{ color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {user?.fullName?.toUpperCase() ?? '—'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={openTopUp}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  paddingHorizontal: 20, paddingVertical: 12,
                  borderRadius: 16,
                  backgroundColor: '#2d5a4c',
                }}
              >
                <Plus size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Top Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Minimalist Compact Parking Spend Card */}
        <View 
          className="mt-5"
          style={{
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {/* Header & Month Row */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <View className={`w-6 h-6 rounded-lg items-center justify-center ${isDark ? 'bg-[#34d399]/10' : 'bg-[#ecfdf5]'}`}>
                <ArrowUpRight size={12} color={isDark ? '#34d399' : '#064e3b'} />
              </View>
              <Text className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest">Parking Spend</Text>
            </View>
            <View className={`px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <Text className={`text-[8px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {dayjs().format('MMMM')}
              </Text>
            </View>
          </View>

          {/* Amount & Trend Row (Horizontal) */}
          <View className="flex-row justify-between items-center">
            <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
              ETB 450.00
            </Text>
            
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center px-1.5 py-0.5 rounded-md bg-red-500/10 gap-1">
                <TrendingUp size={10} color="#ef4444" />
                <Text className="text-[9px] font-bold text-red-500">+12%</Text>
              </View>
              <Text className="text-[9px] font-medium text-[#94a3b8]">vs last month</Text>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View className="mt-10 mb-10">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-2">
              <History size={20} color="#94a3b8" />
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Recent Activity</Text>
            </View>
            <TouchableOpacity>
              <Text className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            {loading ? (
              <ActivityIndicator color={isDark ? CARD_ACCENT : primary} className="my-8" />
            ) : history.length > 0 ? (
              history.map((tx) => (
                <View 
                  key={tx.id}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 5,
                    elevation: 2,
                  }}
                  className={`flex-row items-center justify-between p-4 rounded-2xl border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
                >
                  <View className="flex-row items-center gap-4">
                    <View className={`w-12 h-12 rounded-xl items-center justify-center ${tx.type === 'CREDIT' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      {tx.type === 'CREDIT' ? (
                        <ArrowDownLeft size={20} color="#10b981" />
                      ) : (
                        <ArrowUpRight size={20} color="#ef4444" />
                      )}
                    </View>
                    <View>
                      <Text className={`text-sm font-bold mb-0.5 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                        {tx.description || (tx.type === 'CREDIT' ? 'Wallet Top-up' : 'Parking Payment')}
                      </Text>
                      <Text className="text-[11px] text-[#475569] font-medium">{new Date(tx.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className={`text-sm font-bold ${tx.type === 'CREDIT' ? 'text-emerald-500' : (isDark ? 'text-white' : 'text-[#0f172a]')}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'} ETB {parseFloat(tx.amount).toFixed(2)}
                    </Text>
                    <Text className="text-[9px] font-bold uppercase text-[#94a3b8]">SUCCESS</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-center text-[#94a3b8] py-8 font-bold">No recent activity</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* NEW MINIMALIST TOP UP MODAL (Matching Reference Image) */}
      {showTopUp && (
        <View className="absolute inset-0 z-[100] justify-end">
          <TouchableWithoutFeedback onPress={() => !isSuccess && closeTopUp()}>
            <View className="absolute inset-0 bg-black/50" />
          </TouchableWithoutFeedback>

          <View className="flex-1 justify-end">
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
                maxHeight: Dimensions.get('window').height * 0.8,
                paddingBottom: Math.max(insets.bottom, 20),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 20,
              }}
              className={`rounded-t-[40px] pt-8 px-8 ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}
            >
              {!isSuccess && (
                <TouchableOpacity
                  onPress={closeTopUp}
                  className={`absolute top-6 right-8 w-10 h-10 items-center justify-center rounded-full z-20 ${isDark ? 'bg-[#1e293b]' : 'bg-slate-50'}`}
                >
                  <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
              )}

              {!isSuccess ? (
                <ScrollView 
                   showsVerticalScrollIndicator={false} 
                   keyboardShouldPersistTaps="handled"
                   contentContainerStyle={{ paddingBottom: 60 }}
                   bounces={false}
                >
                  {/* Header Icon */}
                  <View className="items-center mb-4">
                    <View 
                      style={{ backgroundColor: isDark ? '#1e293b' : '#f0fdf4', padding: 2, borderRadius: 100 }}
                    >
                       <View className="w-12 h-12 rounded-full bg-[#064e3b] items-center justify-center">
                         <WalletIcon size={24} color="white" />
                       </View>
                    </View>
                  </View>

                  {/* Title */}
                  <View className="items-center mb-6">
                    <Text className={`text-xl font-black mb-1 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Top Up Wallet</Text>
                    <Text className="text-xs text-[#64748b] font-medium">Add credits to your account</Text>
                  </View>

                  {/* Amount Section */}
                  <View className="items-center mb-6">
                    <Text className="text-[11px] font-black text-[#94a3b8] uppercase tracking-[3px] mb-8">
                      ENTER AMOUNT (ETB)
                    </Text>
                    
                    <View className="flex-row items-center justify-center gap-4">
                      <Text className="text-2xl font-black text-[#064e3b] mt-2">ETB</Text>
                      <TextInput
                        keyboardType="decimal-pad"
                        value={topUpAmount}
                        onChangeText={text => setTopUpAmount(text.replace(/[^0-9.]/g, ''))}
                        placeholder="100"
                        placeholderTextColor={isDark ? '#334155' : '#e2e8f0'}
                        className={`text-7xl font-black ${isDark ? 'text-white' : 'text-[#0f172a]'}`}
                        style={{ height: 100, paddingTop: 10, paddingBottom: 10 }}
                        autoFocus={false}
                      />
                    </View>
                  </View>

                  {/* Quick Select Buttons */}
                  <View className="flex-row justify-center gap-3 mb-10">
                    {['100', '250', '500'].map(amt => {
                      const isSelected = topUpAmount === amt;
                      return (
                        <TouchableOpacity
                          key={amt}
                          onPress={() => setTopUpAmount(amt)}
                          className={`px-8 py-3 rounded-full border ${isSelected ? 'bg-[#064e3b] border-[#064e3b]' : 'bg-slate-50 border-transparent'}`}
                        >
                          <Text className={`text-sm font-black ${isSelected ? 'text-white' : 'text-[#64748b]'}`}>
                            +{amt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Separator */}
                  <View className="flex-row items-center mb-8">
                    <View className="flex-1 h-px bg-slate-100 border-t border-dashed border-slate-300" />
                    <Text className="text-[9px] font-black text-[#94a3b8] tracking-[2px] mx-4 uppercase">SELECT PAYMENT METHOD</Text>
                    <View className="flex-1 h-px bg-slate-100 border-t border-dashed border-slate-300" />
                  </View>

                  {/* Payment Options */}
                  <View className="flex-row gap-4 mb-8">
                    <TouchableOpacity
                      onPress={() => setSelectedMethod('Chapa')}
                      className={`flex-1 min-h-[110px] rounded-3xl border p-6 items-center justify-center gap-2 ${
                        selectedMethod === 'Chapa' ? 'bg-white border-[#064e3b]' : 'bg-slate-50 border-transparent'
                      }`}
                      style={selectedMethod === 'Chapa' ? { elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } } : {}}
                    >
                      <Text className={`text-base font-black tracking-tight ${selectedMethod === 'Chapa' ? 'text-[#0f172a]' : 'text-slate-400'}`}>CHAPA</Text>
                      <Text className="text-[10px] font-bold text-[#64748b]">Faster Processing</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled
                      className={`flex-1 min-h-[110px] rounded-3xl border p-6 items-center justify-center gap-2 bg-slate-50 border-transparent opacity-60`}
                    >
                      <Text className="text-base font-black tracking-tight text-slate-300">telebirr</Text>
                      <Text className="text-[10px] font-bold text-slate-300 italic">Coming Soon</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    onPress={handleTopUp}
                    disabled={!topUpAmount || topUpLoading}
                    style={!topUpAmount || topUpLoading ? {} : {
                      shadowColor: '#064e3b',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 8,
                    }}
                    className={`w-full h-16 rounded-2xl flex-row items-center justify-center gap-2 ${
                      !topUpAmount || topUpLoading ? 'bg-slate-200' : 'bg-[#064e3b]'
                    }`}
                  >
                    {topUpLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text className="text-base font-black text-white">
                          Pay ETB {parseFloat(topUpAmount || '0').toFixed(2)}
                        </Text>
                        <ArrowRight size={20} color="white" />
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Final Footer */}
                  <View className="flex-row items-center justify-center gap-2 mt-6 opacity-30 pb-4">
                    <View className="w-4 h-4 rounded-full border border-slate-500 items-center justify-center">
                       <Text style={{ fontSize: 8 }}>✓</Text>
                    </View>
                    <Text className="text-[9px] font-black uppercase tracking-[2px] text-slate-600">SECURE ENCRYPTED TRANSACTION</Text>
                  </View>
                </ScrollView>
              ) : (
                <View className="w-full flex-1">
                  <View className="w-full flex-row justify-end px-2 pt-2">
                    <TouchableOpacity
                      onPress={closeTopUp}
                      className={`w-10 h-10 items-center justify-center rounded-full ${isDark ? 'bg-[#1e293b]' : 'bg-slate-100'}`}
                    >
                      <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                    </TouchableOpacity>
                  </View>

                  <View className="items-center mt-2 mb-8 px-2">
                    <View 
                      style={{
                        shadowColor: '#064e3b',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.3,
                        shadowRadius: 15,
                        elevation: 10,
                        backgroundColor: '#064e3b'
                      }}
                      className="w-[100px] h-[100px] rounded-full items-center justify-center mb-6"
                    >
                      <CheckCircle2 size={50} color="white" />
                    </View>
                    <Text className={`text-[32px] font-black tracking-tight mb-3 ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>
                      Wallet topped up
                    </Text>
                    <Text className={`text-[15px] font-medium text-center max-w-[280px] leading-6 ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                      If you completed payment in the browser, your balance updates automatically. You can always pull to refresh
                      on the wallet screen.
                    </Text>
                  </View>

                  <View className="w-full px-4 mb-6">
                    <View
                      style={isDark ? {} : {
                        shadowColor: '#e2e8f0',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                        elevation: 3, 
                      }}
                      className={`w-full rounded-[32px] border relative p-8 ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100'}`}
                    >
                      <View className={`absolute top-[55%] -left-4 w-8 h-8 rounded-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} />
                      <View className={`absolute top-[55%] -right-4 w-8 h-8 rounded-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} />
                      <View className="w-full absolute top-[55%] mt-4 border-t border-dashed border-[#94a3b8]/30 left-8 right-8 z-10" />
                      <View className="flex-row justify-between items-center mb-8">
                        <View className="flex-1 mr-2">
                          <Text className="text-[10px] font-black uppercase text-[#34d399] tracking-[1px] mb-1">REFERENCE</Text>
                          <Text className={`text-base font-medium ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`} numberOfLines={2}>
                            {lastTopUpTxRef || '—'}
                          </Text>
                        </View>
                        <View className="px-3 py-1.5 rounded-full bg-[#ecfdf5] flex-row items-center gap-1.5">
                          <View className="w-2 h-2 rounded-full bg-[#34d399]" />
                          <Text className="text-[10px] font-black text-[#064e3b] tracking-[1px]">INITIATED</Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between mb-10">
                        <View>
                          <Text className="text-[10px] font-black uppercase text-[#94a3b8] tracking-[1px] mb-1">AMOUNT</Text>
                          <Text className={`text-2xl font-medium ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>
                            ETB {parseFloat(topUpAmount || '0').toFixed(2)}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-[10px] font-black uppercase text-[#94a3b8] tracking-[1px] mb-1">WALLET BALANCE</Text>
                          <Text className={`text-2xl font-medium ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>
                            ETB {wallet ? parseFloat(wallet.balance).toFixed(2) : '0.00'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => { closeTopUp(); fetchWalletData(); }}
                    className={`mx-4 h-14 rounded-2xl items-center justify-center ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
                  >
                    <Text className={`font-bold text-lg ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}
