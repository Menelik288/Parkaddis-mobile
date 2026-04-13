import React, { useState } from 'react';
import { View, Text, Switch, useColorScheme } from 'react-native';
import { Bell, Mail, MessageSquare, Megaphone } from 'lucide-react-native';
import { PageHeader } from '@/components/PageHeader';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#34d399';

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [promoEnabled, setPromoEnabled] = useState(false);

  const toggleColor = isDark ? secondary : primary;

  const items = [
    {
      key: 'push',
      Icon: Bell,
      title: 'Push Notifications',
      subtitle: 'General alerts & safety',
      value: pushEnabled,
      onChange: setPushEnabled,
    },
    {
      key: 'email',
      Icon: Mail,
      title: 'Email Alerts',
      subtitle: 'Receipts and bookings',
      value: emailEnabled,
      onChange: setEmailEnabled,
    },
    {
      key: 'sms',
      Icon: MessageSquare,
      title: 'SMS Updates',
      subtitle: 'Expiration warnings',
      value: smsEnabled,
      onChange: setSmsEnabled,
    },
    {
      key: 'promo',
      Icon: Megaphone,
      title: 'Promotions',
      subtitle: 'Offers and news',
      value: promoEnabled,
      onChange: setPromoEnabled,
    },
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      <PageHeader title="Notifications" />

      <View className="px-6 mt-2">
        <Text className="text-[10px] font-black uppercase tracking-[2px] text-[#94a3b8] px-1 mb-3">Notification Preferences</Text>
        <View className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-100'}`}>
          {items.map((item, index) => {
            const Icon = item.Icon;
            return (
              <View
                key={item.key}
                className={`flex-row items-center px-5 py-4 gap-4 ${index < items.length - 1 ? `border-b ${isDark ? 'border-[#334155]' : 'border-slate-50'}` : ''}`}
              >
                <View className={`w-9 h-9 rounded-xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
                  <Icon size={17} color={isDark ? secondary : primary} />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{item.title}</Text>
                  <Text className="text-[11px] text-[#64748b]">{item.subtitle}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onChange}
                  trackColor={{ false: '#334155', true: toggleColor }}
                  thumbColor="white"
                />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
