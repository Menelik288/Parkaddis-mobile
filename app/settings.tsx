import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { Shield, Bell, Globe, HelpCircle, Info, FileText, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/PageHeader';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#34d399';

  const sections = [
    {
      label: 'General',
      items: [
        { icon: Shield, title: 'Security & Privacy', subtitle: 'Password, biometrics, data', path: '/settings/security' },
        { icon: Bell, title: 'Notifications', subtitle: 'Push, email and SMS alerts', path: '/settings/notifications' },
        { icon: Globe, title: 'Language & Region', subtitle: 'English (US), GMT+3', path: '/settings/language' },
      ]
    },
    {
      label: 'Support & About',
      items: [
        { icon: HelpCircle, title: 'Help & Support', subtitle: 'FAQs, contact support', path: '/settings/help' },
        { icon: Info, title: 'About ParkAddis', subtitle: 'Version 1.0.0', path: null },
        { icon: FileText, title: 'Terms of Service', subtitle: 'Usage rules and legal', path: null },
      ]
    }
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      <PageHeader title="Settings" />

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {sections.map((section, sIndex) => (
          <View key={sIndex} className="mb-10">
            <Text className="text-[10px] font-black uppercase tracking-[2px] text-[#94a3b8] px-2 mb-4">{section.label}</Text>
            
            <View className="gap-3">
              {section.items.map((item, iIndex) => (
                <TouchableOpacity 
                  key={iIndex}
                  onPress={() => item.path && router.push(item.path as any)}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 5,
                    elevation: 2,
                  }}
                  className={`flex-row items-center justify-between p-4 rounded-3xl border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
                >
                  <View className="flex-row items-center gap-4">
                    <View className={`w-11 h-11 rounded-2xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
                      <item.icon size={20} color={isDark ? secondary : primary} />
                    </View>
                    <View>
                      <Text className={`text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{item.title}</Text>
                      <Text className="text-[11px] text-[#94a3b8] font-medium">{item.subtitle}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View className="items-center gap-6 mt-4 mb-12">
          <TouchableOpacity>
            <Text className="text-red-500 text-xs font-bold opacity-80 uppercase tracking-widest">Deactivate Account</Text>
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-[10px] font-black text-[#94a3b8] tracking-widest uppercase">PARKADDIS V2.4.0</Text>
            <Text className="text-[9px] text-[#94a3b8] opacity-50 mt-1 font-medium italic">Proudly built for Addis Ababa</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
