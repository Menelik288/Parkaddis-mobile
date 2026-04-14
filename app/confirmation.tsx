import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Platform, ScrollView } from 'react-native';
import { CheckCircle, QrCode, Calendar, Clock, Share2, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/PageHeader';

export default function ConfirmationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#34d399';
  const router = useRouter();

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      <PageHeader title="Confirmation" />

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <View className="items-center py-10 px-6">
          <View 
            style={{
              shadowColor: isDark ? secondary : primary,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 10,
            }}
            className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${isDark ? 'bg-[#34d399]/10' : 'bg-[#ecfdf5]'}`}
          >
            <CheckCircle size={48} color={isDark ? secondary : primary} />
          </View>
          <Text className={`text-3xl font-black tracking-tighter mb-2 text-center ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Confirmed!</Text>
          <Text className="text-sm font-medium text-[#475569] text-center">Your spot is waiting for you</Text>
        </View>

        {/* Ticket Card */}
        <View className="px-6 mb-8">
          <View 
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 15 },
              shadowOpacity: 0.15,
              shadowRadius: 25,
              elevation: 12,
            }}
            className={`rounded-[32px] border overflow-hidden ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
          >
            
            <View className="items-center p-8 gap-4">
              <View className={`w-[200px] h-[200px] rounded-3xl border border-dashed items-center justify-center relative overflow-hidden ${isDark ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#f8fafc] border-[#f1f5f9]'}`}>
                <QrCode size={140} color={isDark ? '#34d399' : primary} strokeWidth={1.5} />
                <View className={`absolute inset-0 bg-black/5 opacity-5`} />
              </View>
              <Text className="text-[10px] font-black uppercase tracking-[3px] text-[#94a3b8]">SCAN AT ENTRY GATE</Text>
            </View>

            {/* Ticket Separator */}
            <View className="flex-row items-center relative h-6">
              <View className={`absolute -left-3 w-6 h-6 rounded-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} />
              <View className="flex-1 h-px border-t border-dashed border-[#94a3b8]/30 mx-6" />
              <View className={`absolute -right-3 w-6 h-6 rounded-full ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`} />
            </View>

            <View className="p-8 gap-6">
              <View className="gap-1">
                <Text className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Parking Spot #42</Text>
                <Text className="text-xs font-bold text-[#64748b]">Bole Medhanealem Mall</Text>
              </View>

              <View className="flex-row gap-6">
                <View className="flex-1 gap-2">
                  <Text className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest">DATE</Text>
                  <View className="flex-row items-center gap-2">
                    <Calendar size={14} color="#94a3b8" />
                    <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Sept 20, 2023</Text>
                  </View>
                </View>
                <View className="flex-1 gap-2">
                  <Text className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest">TIME</Text>
                  <View className="flex-row items-center gap-2">
                    <Clock size={14} color="#94a3b8" />
                    <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>10:00 AM - 6:00 PM</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Receipt Summary */}
        <View className="px-8 gap-4 mb-20">
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-bold text-[#94a3b8]">Reservation ID</Text>
            <Text className={`text-xs font-black italic ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>#PK-88291</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-bold text-[#94a3b8]">Location</Text>
            <Text className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Cameroon St, Bole</Text>
          </View>
          <View className={`flex-row justify-between items-center pt-5 mt-2 border-t border-dashed ${isDark ? 'border-[#334155]' : 'border-[#f1f5f9]'}`}>
            <Text className={`text-base font-black ${isDark ? 'text-slate-300' : 'text-[#475569]'}`}>Total Paid</Text>
            <Text className={`text-2xl font-black ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>ETB 75.00</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View className={`absolute bottom-0 left-0 right-0 p-6 pb-10 gap-4 ${isDark ? 'bg-[#0f172a]/95' : 'bg-[#f8fafc]/95'}`}>
        <TouchableOpacity 
          style={{
            shadowColor: isDark ? '#34d399' : '#064e3b',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 15,
            elevation: 10,
          }}
          className={`h-16 rounded-2xl flex-row items-center justify-center gap-2 ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}
          onPress={() => router.replace('/tickets' as any)}
          activeOpacity={0.8}
        >
          <Text className={`text-base font-black ${isDark ? 'text-[#064e3b]' : 'text-white'}`}>View Tickets</Text>
          <ArrowRight size={20} color={isDark ? '#064e3b' : 'white'} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
            elevation: 2,
          }}
          className={`h-16 rounded-2xl flex-row items-center justify-center gap-3 ${isDark ? 'bg-[#1e293b]' : 'bg-white border border-[#f1f5f9]'}`}
          activeOpacity={0.8}
        >
          <Share2 size={18} color={isDark ? secondary : primary} />
          <Text className={`text-base font-black ${isDark ? 'text-[#34d399]' : (isDark ? secondary : primary)}`}>Share Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
