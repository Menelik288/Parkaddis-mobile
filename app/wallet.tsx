import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Wallet as WalletIcon, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  CreditCard, 
  ChevronRight,
  CheckCircle2,
  X,
  ArrowRight,
  RefreshCw,
} from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/PageHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { walletService, Wallet, Transaction } from '@/services/walletService';

const SHIMMER_BAND = 140;

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
          width: 268,
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
  
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'Chapa' | 'Telebirr'>('Chapa');
  const [lastTopUpTxRef, setLastTopUpTxRef] = useState('');
  const slideAnim = useRef(new Animated.Value(800)).current;

  const primary = '#064e3b';
  const secondary = '#34d399';

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
    }
  };

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
    if (!Number.isFinite(amt) || amt < 10) {
      Alert.alert('Invalid amount', 'Enter at least ETB 10 to top up.');
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
        await fetchWalletData();
        setIsSuccess(true);
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

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {/* Wallet Card */}
        <View className="mt-4 p-8 rounded-[40px] shadow-2xl relative overflow-hidden bg-[#064e3b]">
          <View className="relative z-10">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-white text-[11px] font-bold uppercase tracking-widest">PARK ADDIS WALLET</Text>
              <WalletIcon size={36} color="rgba(255,255,255,0.2)" />
            </View>
            
            {loading ? (
              <WalletBalanceShimmer />
            ) : (
              <View className="flex-row items-baseline gap-2 mb-12">
                <Text className="text-[40px] font-bold text-white tracking-tight">
                  ETB {wallet ? parseFloat(wallet.balance).toFixed(2) : '—'}
                </Text>
              </View>
            )}
            
            <View className="border-t border-dashed border-white/20 mb-8 w-full" />
            
            <View className="flex-row items-center justify-between">
              <Text className="text-[#d1fae5] text-lg font-medium opacity-80">Active Balance</Text>
              <TouchableOpacity 
                onPress={openTopUp}
                className="flex-row items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#2d5a4c] shadow-lg"
              >
                <Plus size={18} color="white" />
                <Text className="text-white font-bold text-sm">Top Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-4 mt-8">
          <View className={`flex-1 p-4 rounded-2xl border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}>
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 rounded-lg bg-[#ecfdf5] items-center justify-center">
                <ArrowDownLeft size={16} color="#34d399" />
              </View>
              <Text className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Income</Text>
            </View>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>ETB 1,250</Text>
          </View>
          <View className={`flex-1 p-4 rounded-2xl border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}>
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 rounded-lg bg-red-500/10 items-center justify-center">
                <ArrowUpRight size={16} color="#ef4444" />
              </View>
              <Text className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Spent</Text>
            </View>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>ETB 800</Text>
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
              <ActivityIndicator color={isDark ? secondary : primary} className="my-8" />
            ) : history.length > 0 ? (
              history.map((tx) => (
                <View 
                  key={tx.id}
                  className={`flex-row items-center justify-between p-4 rounded-2xl border shadow-sm ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
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

      {/* EXACT STITCH TOP UP MODAL (Using Absolute View for consistency) */}
      {showTopUp && (
        <View className="absolute inset-0 z-[100] justify-end">
          
          {/* Dark Overlay for Top-Up */}
          {!isSuccess && (
             <TouchableWithoutFeedback onPress={() => !isSuccess && closeTopUp()}>
               <View className="absolute inset-0 bg-black/40" />
             </TouchableWithoutFeedback>
          )}

          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              paddingBottom: Math.max(insets.bottom, 20),
            }}
            className={`rounded-t-[40px] pt-4 px-6 relative ${
              isSuccess
                ? `flex-1 min-h-[65%] ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`
                : `${isDark ? 'bg-[#0f172a]' : 'bg-white'} min-h-[55%]`
            }`}
          >
            {!isSuccess && (
              <>
                <View className="w-full items-center mb-4">
                  <View className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-[#334155]' : 'bg-slate-200'}`} />
                </View>
                <TouchableOpacity
                  onPress={closeTopUp}
                  className={`absolute top-6 right-6 w-10 h-10 items-center justify-center rounded-full z-20 ${
                    isDark ? 'bg-[#1e293b]' : 'bg-slate-100'
                  }`}
                  hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                >
                  <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
              </>
            )}

            {!isSuccess ? (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View className="px-2 pb-10 pt-6 space-y-8">
                  <View>
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-4 ml-1">
                      Top up amount
                    </Text>
                    <View
                      className={`flex-row items-center justify-between p-4 rounded-2xl border min-h-[88px] ${
                        isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-slate-50 border-slate-200/50'
                      }`}
                    >
                      <Text className={`text-xl font-bold ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>ETB</Text>
                      <TextInput
                        keyboardType="decimal-pad"
                        value={topUpAmount}
                        onChangeText={text => setTopUpAmount(text.replace(/[^0-9.]/g, ''))}
                        placeholder="0.00"
                        placeholderTextColor={isDark ? '#475569' : '#cbd5e1'}
                        className={`flex-1 text-right text-4xl font-bold p-0 m-0 ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}
                      />
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="-mx-2 px-2 mt-4"
                      contentContainerStyle={{ gap: 12, paddingRight: 24 }}
                    >
                      {['100', '250', '500', '1000'].map(amt => {
                        const isSelected = topUpAmount === amt;
                        return (
                          <TouchableOpacity
                            key={amt}
                            onPress={() => setTopUpAmount(amt)}
                            className={`min-h-[52px] px-6 py-3 rounded-2xl items-center justify-center border ${
                              isSelected
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
                                isSelected
                                  ? isDark
                                    ? 'text-[#0f172a]'
                                    : 'text-white'
                                  : isDark
                                    ? 'text-[#f8fafc]'
                                    : 'text-[#0f172a]'
                              }`}
                            >
                              +{amt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  <View className="py-4 relative justify-center">
                    <View className={`w-full border-t-[2px] border-dashed ${isDark ? 'border-[#334155]' : 'border-slate-200'}`} />
                    <View className={`absolute -left-10 w-8 h-8 rounded-full ${isDark ? 'bg-black/20' : 'bg-black/5'}`} />
                    <View className={`absolute -right-10 w-8 h-8 rounded-full ${isDark ? 'bg-black/20' : 'bg-black/5'}`} />
                  </View>

                  <View>
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-2 ml-1">
                      Payment method
                    </Text>
                    <Text className={`text-xs font-medium mb-4 ml-1 ${isDark ? 'text-[#64748b]' : 'text-slate-500'}`}>
                      {`You'll finish ${
                        selectedMethod === 'Chapa' ? 'card or bank' : 'Telebirr or other local'
                      } payment on the secure Chapa page.`}
                    </Text>
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => setSelectedMethod('Chapa')}
                        className={`flex-1 min-h-[120px] rounded-2xl border p-4 justify-between ${
                          selectedMethod === 'Chapa'
                            ? isDark
                              ? 'bg-[#34d399]/15 border-[#064e3b]'
                              : 'bg-[#ecfdf5] border-[#064e3b]'
                            : isDark
                              ? 'bg-[#1e293b] border-[#064e3b]/45'
                              : 'bg-slate-50 border-[#064e3b]/50'
                        }`}
                      >
                        <View className="w-12 h-12 rounded-xl bg-[#059669] items-center justify-center">
                          <Text className="text-white font-black italic text-sm tracking-tighter">chapa</Text>
                        </View>
                        <View>
                          <Text className={`text-sm font-black mb-0.5 ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>
                            Chapa
                          </Text>
                          <Text className={`text-[10px] font-medium ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                            Cards & banks
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setSelectedMethod('Telebirr')}
                        className={`flex-1 min-h-[120px] rounded-2xl border p-4 justify-between ${
                          selectedMethod === 'Telebirr'
                            ? isDark
                              ? 'bg-[#34d399]/15 border-[#064e3b]'
                              : 'bg-[#ecfdf5] border-[#064e3b]'
                            : isDark
                              ? 'bg-[#1e293b] border-[#064e3b]/45'
                              : 'bg-slate-50 border-[#064e3b]/50'
                        }`}
                      >
                        <View className="w-12 h-12 rounded-xl bg-[#0ea5e9] items-center justify-center">
                          <Text className="text-white font-black text-[10px]">TELE</Text>
                        </View>
                        <View>
                          <Text className={`text-sm font-black mb-0.5 ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>
                            Telebirr
                          </Text>
                          <Text className={`text-[10px] font-medium ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                            Local wallets
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleTopUp}
                    disabled={!topUpAmount || topUpLoading}
                    className={`w-full py-5 rounded-2xl flex-row items-center justify-center gap-2 shadow-xl ${
                      !topUpAmount || topUpLoading ? 'opacity-50' : ''
                    } ${isDark ? 'bg-[#34d399] shadow-[#34d399]/10' : 'bg-[#064e3b] shadow-[#064e3b]/20'}`}
                  >
                    {topUpLoading ? (
                      <ActivityIndicator color={isDark ? '#0f172a' : '#ffffff'} />
                    ) : (
                      <>
                        <Text className={`text-lg font-bold ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>
                          Proceed to payment
                        </Text>
                        <ArrowRight size={20} color={isDark ? '#0f172a' : 'white'} />
                      </>
                    )}
                  </TouchableOpacity>
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-center text-[#94a3b8]">
                    Secure checkout via Chapa
                  </Text>
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
                  <View className="w-[100px] h-[100px] rounded-full bg-[#064e3b] items-center justify-center mb-6 shadow-xl shadow-[#064e3b]/30">
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
                    className={`w-full rounded-[32px] border relative p-8 ${
                      isDark ? 'bg-[#1e293b] border-[#334155] shadow-none' : 'bg-white border-slate-100 shadow-sm shadow-slate-200'
                    }`}
                  >
                    <View className={`absolute top-[55%] -left-4 w-8 h-8 rounded-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} />
                    <View className={`absolute top-[55%] -right-4 w-8 h-8 rounded-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} />
                    <View className="w-full absolute top-[55%] mt-4 border-t border-dashed border-[#94a3b8]/30 left-8 right-8 z-10" />
                    <View className="flex-row justify-between items-center mb-8">
                      <View className="flex-1 mr-2">
                        <Text className="text-[10px] font-black uppercase text-[#34d399] tracking-[1px] mb-1">
                          REFERENCE
                        </Text>
                        <Text
                          className={`text-base font-medium ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}
                          numberOfLines={2}
                        >
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
                        <Text className="text-[10px] font-black uppercase text-[#94a3b8] tracking-[1px] mb-1">
                          AMOUNT
                        </Text>
                        <Text className={`text-2xl font-medium ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>
                          ETB {parseFloat(topUpAmount || '0').toFixed(2)}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-[10px] font-black uppercase text-[#94a3b8] tracking-[1px] mb-1">
                          WALLET BALANCE
                        </Text>
                        <Text className={`text-2xl font-medium ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>
                          ETB {wallet ? parseFloat(wallet.balance).toFixed(2) : '0.00'}
                        </Text>
                      </View>
                    </View>

                    <View className="h-[40px]" />

                    <View className="flex-row justify-between">
                      <View className="flex-row gap-3 items-center flex-1">
                        <View className={`w-12 h-12 rounded-xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
                          <Text className={`font-black ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>C</Text>
                        </View>
                        <View>
                          <Text className="text-[10px] font-black uppercase text-[#94a3b8] tracking-[1px] mb-0.5">
                            METHOD
                          </Text>
                          <Text className={`text-[15px] font-medium ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>
                            {selectedMethod} · Chapa
                          </Text>
                        </View>
                      </View>
                      <View className="items-end justify-center">
                        <Text className="text-[10px] font-black uppercase text-[#94a3b8] tracking-[1px] mb-0.5">DATE</Text>
                        <Text className={`text-[15px] font-medium ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>
                          {new Date().toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="px-4 gap-3 pb-8">
                  <TouchableOpacity
                    onPress={() => {
                      closeTopUp();
                      fetchWalletData();
                    }}
                    className={`h-14 rounded-2xl items-center justify-center ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
                  >
                    <Text className={`font-bold text-lg ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Done</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      closeTopUp();
                      setTimeout(() => router.push('/(tabs)/find' as any), 300);
                    }}
                    className={`flex-row items-center p-4 rounded-2xl border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-[#f8fafc] border-slate-200'}`}
                  >
                    <View className="w-14 h-14 rounded-2xl bg-black overflow-hidden mr-4">
                      <Image
                        source={{
                          uri: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200&h=200&fit=crop',
                        }}
                        className="w-full h-full"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-bold text-[#e18b45] tracking-[1px] uppercase mb-1">
                        FIND PARKING
                      </Text>
                      <Text className={`text-[13px] font-medium leading-5 pr-2 ${isDark ? 'text-[#e2e8f0]' : 'text-[#0f172a]'}`}>
                        Browse spots near you.
                      </Text>
                    </View>
                    <Text className={`font-black ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      )}

    </SafeAreaView>
  );
}
