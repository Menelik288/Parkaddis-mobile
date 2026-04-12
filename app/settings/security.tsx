import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, useColorScheme } from 'react-native';
import { ChevronRight, Lock, Fingerprint, FileText } from 'lucide-react-native';
import { PageHeader } from '@/components/PageHeader';

export default function SecurityScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#34d399';
  const toggleColor = isDark ? secondary : primary;

  const [locationHistory, setLocationHistory] = useState(true);
  const [usageAnalytics, setUsageAnalytics] = useState(false);
  const [thirdParty, setThirdParty] = useState(false);
  const [biometric, setBiometric] = useState(true);

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      <PageHeader title="Security & Privacy" />

      <View className="px-6 mt-2 gap-6">
        {/* Authentication */}
        <View>
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-[#94a3b8] px-1 mb-3">Authentication</Text>
          <View className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100'}`}>
            <TouchableOpacity
              className={`flex-row items-center px-5 py-4 gap-4 border-b ${isDark ? 'border-[#334155]' : 'border-slate-50'}`}
              activeOpacity={0.7}
            >
              <View className={`w-9 h-9 rounded-xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
                <Lock size={17} color={isDark ? secondary : primary} />
              </View>
              <Text className={`flex-1 text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Change Password</Text>
              <ChevronRight size={18} color="#94a3b8" />
            </TouchableOpacity>
            <View className={`flex-row items-center px-5 py-4 gap-4`}>
              <View className={`w-9 h-9 rounded-xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
                <Fingerprint size={17} color={isDark ? secondary : primary} />
              </View>
              <View className="flex-1">
                <Text className={`text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Biometric Login</Text>
                <Text className="text-[11px] text-[#64748b]">Use FaceID or Fingerprint</Text>
              </View>
              <Switch
                value={biometric}
                onValueChange={setBiometric}
                trackColor={{ false: '#334155', true: toggleColor }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Privacy Settings */}
        <View>
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-[#94a3b8] px-1 mb-3">Privacy Settings</Text>
          <View className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100'}`}>
            {[
              { key: 'location', title: 'Location History', subtitle: 'Allow app to save your frequent parking spots for better suggestions.', value: locationHistory, onChange: setLocationHistory },
              { key: 'analytics', title: 'Usage Analytics', subtitle: 'Share anonymous app usage data to help us improve the experience.', value: usageAnalytics, onChange: setUsageAnalytics },
              { key: 'third', title: 'Third-Party Marketing', subtitle: 'Receive personalized offers from our parking partners.', value: thirdParty, onChange: setThirdParty },
            ].map((item, index, arr) => (
              <View key={item.key} className={`px-5 py-4 ${index < arr.length - 1 ? `border-b ${isDark ? 'border-[#334155]' : 'border-slate-50'}` : ''}`}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className={`text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{item.title}</Text>
                  <Switch value={item.value} onValueChange={item.onChange} trackColor={{ false: '#334155', true: toggleColor }} thumbColor="white" />
                </View>
                <Text className="text-[11px] text-[#64748b] leading-4 pr-16">{item.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Legal */}
        <TouchableOpacity className={`flex-row items-center px-5 py-4 rounded-3xl border gap-4 ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100'}`} activeOpacity={0.7}>
          <View className={`w-9 h-9 rounded-xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
            <FileText size={17} color={isDark ? secondary : primary} />
          </View>
          <Text className={`flex-1 text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>View Full Privacy Policy</Text>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
