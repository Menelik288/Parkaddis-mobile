import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { ChevronRight, MessageCircle, Phone, Timer, CreditCard, QrCode, MapPin } from 'lucide-react-native';
import { PageHeader } from '@/components/PageHeader';

export default function HelpScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#34d399';

  const topics = [
    { icon: Timer, label: 'How to extend session?', id: 'extend' },
    { icon: CreditCard, label: 'Payment issues', id: 'payment' },
    { icon: QrCode, label: 'Scanning digital ticket', id: 'qr' },
    { icon: MapPin, label: 'Lost my parked vehicle', id: 'lost' },
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      <PageHeader title="Help & Support" />

      <View className="px-6 mt-2 gap-6">
        {/* Contact options */}
        <View>
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-[#94a3b8] px-1 mb-3">Contact Us</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 rounded-3xl border p-5 items-center gap-3 ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100'}`}
              activeOpacity={0.8}
            >
              <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isDark ? 'bg-[#34d399]/20' : 'bg-[#ecfdf5]'}`}>
                <MessageCircle size={22} color={isDark ? secondary : primary} />
              </View>
              <View className="items-center">
                <Text className={`text-sm font-black ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Chat Support</Text>
                <Text className="text-[10px] text-[#64748b]">Instant</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 rounded-3xl border p-5 items-center gap-3 ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100'}`}
              activeOpacity={0.8}
            >
              <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isDark ? 'bg-[#34d399]/20' : 'bg-[#ecfdf5]'}`}>
                <Phone size={22} color={isDark ? secondary : primary} />
              </View>
              <View className="items-center">
                <Text className={`text-sm font-black ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Call Hotline</Text>
                <Text className="text-[10px] text-[#64748b]">Available 24/7</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Common Topics */}
        <View>
          <View className="flex-row items-center justify-between px-1 mb-3">
            <Text className="text-[10px] font-black uppercase tracking-[2px] text-[#94a3b8]">Common Topics</Text>
            <Text className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>VIEW ALL</Text>
          </View>
          <View className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100'}`}>
            {topics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <TouchableOpacity
                  key={topic.id}
                  className={`flex-row items-center px-5 py-4 gap-4 ${index < topics.length - 1 ? `border-b ${isDark ? 'border-[#334155]' : 'border-slate-50'}` : ''}`}
                  activeOpacity={0.7}
                >
                  <View className={`w-9 h-9 rounded-xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
                    <Icon size={17} color={isDark ? secondary : primary} />
                  </View>
                  <Text className={`flex-1 text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{topic.label}</Text>
                  <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* App version */}
        <Text className="text-center text-[10px] font-bold uppercase tracking-[2px] text-[#94a3b8]">PARKADDIS v1.0.0</Text>
      </View>
    </View>
  );
}
