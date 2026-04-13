import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Check } from 'lucide-react-native';
import { PageHeader } from '@/components/PageHeader';

const LANGUAGES = [
  { code: 'en', label: 'English', region: 'United States' },
  { code: 'am', label: 'Amharic', region: 'Ethiopia' },
  { code: 'fr', label: 'French', region: 'France' },
  { code: 'ar', label: 'Arabic', region: 'Saudi Arabia' },
  { code: 'zh', label: 'Chinese', region: 'China' },
];

const TIMEZONES = [
  { id: 'eat', label: 'East Africa Time', value: 'GMT+3' },
  { id: 'utc', label: 'UTC', value: 'GMT+0' },
  { id: 'et', label: 'Eastern Time', value: 'GMT-5' },
];

export default function LanguageScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#34d399';
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedTZ, setSelectedTZ] = useState('eat');

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      <PageHeader title="Language & Region" />

      <View className="px-6 mt-2 gap-6">
        {/* Language */}
        <View>
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-[#94a3b8] px-1 mb-3">Display Language</Text>
          <View className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100'}`}>
            {LANGUAGES.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                className={`flex-row items-center px-5 py-4 gap-4 ${index < LANGUAGES.length - 1 ? `border-b ${isDark ? 'border-[#334155]' : 'border-slate-50'}` : ''}`}
                onPress={() => setSelectedLang(lang.code)}
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text className={`text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{lang.label}</Text>
                  <Text className="text-[11px] text-[#64748b]">{lang.region}</Text>
                </View>
                {selectedLang === lang.code && (
                  <View className={`w-6 h-6 rounded-full items-center justify-center ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}>
                    <Check size={13} color={isDark ? '#064e3b' : 'white'} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timezone */}
        <View>
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-[#94a3b8] px-1 mb-3">Time Zone</Text>
          <View className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100'}`}>
            {TIMEZONES.map((tz, index) => (
              <TouchableOpacity
                key={tz.id}
                className={`flex-row items-center px-5 py-4 gap-4 ${index < TIMEZONES.length - 1 ? `border-b ${isDark ? 'border-[#334155]' : 'border-slate-50'}` : ''}`}
                onPress={() => setSelectedTZ(tz.id)}
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text className={`text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{tz.label}</Text>
                  <Text className="text-[11px] text-[#64748b]">{tz.value}</Text>
                </View>
                {selectedTZ === tz.id && (
                  <View className={`w-6 h-6 rounded-full items-center justify-center ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`}>
                    <Check size={13} color={isDark ? '#064e3b' : 'white'} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
