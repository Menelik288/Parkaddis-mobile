import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export function PageHeader({ showBack = true, title }: { showBack?: boolean; title?: string }) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`px-6 flex-row items-center justify-between ${Platform.OS === 'ios' ? 'pt-[68px]' : 'pt-[48px]'} pb-4 z-10`}>
      <View className="w-10 z-20 items-start justify-center -ml-2">
        {showBack && (
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
          </TouchableOpacity>
        )}
      </View>
      <View className="flex-1 items-center justify-center">
        {title && <Text className={`text-[19px] font-black tracking-tight ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`}>{title}</Text>}
      </View>
      <View className="w-10 z-20" />
    </View>
  );
}
