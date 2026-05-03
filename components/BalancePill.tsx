import React from 'react';
import { TouchableOpacity, View, Text, Platform } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BALANCE_PILL_DEFAULT_WIDTH } from './BalancePillShimmer';

interface BalancePillProps {
  balance: string;
  isDark: boolean;
}

export function BalancePill({ balance, isDark }: BalancePillProps) {
  const router = useRouter();

  return (
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
          {balance}
          <Text className="text-[10px] ml-0.5"> ETB</Text>
        </Text>
      </View>
      <View className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}>
        <Wallet size={16} color={isDark ? '#064e3b' : 'white'} />
      </View>
    </TouchableOpacity>
  );
}
