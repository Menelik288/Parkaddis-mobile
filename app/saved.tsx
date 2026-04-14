import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, Platform, Image, TextInput } from 'react-native';
import { Bookmark, MapPin, Search, ChevronRight, Wallet } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/PageHeader';

export default function SavedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#34d399';
  const router = useRouter();

  const savedLocations = [
    {
      id: 1,
      title: 'Bole Medhanealem Mall',
      subtitle: 'Cameroon St, Bole, Addis Ababa',
      status: 'Active',
      statusColor: '#34d399',
      availability: '12 slots available',
      rate: '25 ETB',
      image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      title: 'Edna Mall Parking',
      subtitle: 'Bole Road, Addis Ababa',
      status: 'Limited',
      statusColor: '#f59e0b',
      availability: '4 slots available',
      rate: '20 ETB',
      image: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      title: 'Century Mall Lot',
      subtitle: 'Gurd Shola, Addis Ababa',
      status: 'Active',
      statusColor: '#34d399',
      availability: '45 slots available',
      rate: '15 ETB',
      image: 'https://images.unsplash.com/photo-1590674406263-d096be20f0f4?w=400&h=400&fit=crop'
    }
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      <PageHeader title="Saved Spots" />

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View 
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
            elevation: 2,
          }}
          className={`flex-row items-center border rounded-2xl px-4 h-14 mb-8 ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
        >
          <Search size={18} color="#94a3b8" />
          <TextInput 
            className={`flex-1 ml-3 text-sm font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}
            placeholder="Filter locations..."
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Saved Locations List */}
        <View className="gap-6 pb-12">
          {savedLocations.length > 0 ? (
            savedLocations.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.1,
                  shadowRadius: 20,
                  elevation: 5,
                }}
                className={`rounded-[32px] overflow-hidden border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: '/reserve', params: { id: item.id } } as any)}
              >
                <View className="h-44 w-full relative">
                  <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                  <TouchableOpacity 
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center"
                  >
                    <Bookmark size={20} color="#064e3b" fill="#064e3b" />
                  </TouchableOpacity>
                </View>

                <View className="p-6">
                  <View className="mb-4">
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className={`text-2xl font-bold tracking-tight flex-1 mr-3 ${isDark ? 'text-[#f8fafc]' : 'text-[#064e3b]'}`} numberOfLines={1}>{item.title}</Text>
                      <View className={`flex-row items-center px-2 py-1 rounded-lg gap-1.5 ${isDark ? 'bg-[#34d399]/10' : (item.status === 'Active' ? 'bg-[#ecfdf5]' : 'bg-amber-500/10')}`}>
                        <View className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#34d399]' : (item.status === 'Active' ? 'bg-[#064e3b]' : 'bg-amber-500')}`} />
                        <Text className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-[#34d399]' : (item.status === 'Active' ? 'text-[#064e3b]' : 'text-amber-500')}`}>{item.status}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <MapPin size={14} color="#64748b" />
                      <Text className="text-xs text-[#64748b] font-medium flex-1" numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center pt-4 border-t border-dashed border-[#94a3b8]/30">
                    <View>
                      <Text className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">AVAILABILITY</Text>
                      <Text className={`text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{item.availability}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">RATE</Text>
                      <View className="flex-row items-baseline">
                        <Text className={`text-xl font-black ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>{item.rate}</Text>
                        <Text className="text-[11px] font-medium text-[#64748b] ml-1">/hr</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center justify-center py-20 gap-4">
              <View className={`w-20 h-20 rounded-full items-center justify-center ${isDark ? 'bg-[#1e293b]' : 'bg-slate-100'}`}>
                <Bookmark size={48} color="#94a3b8" />
              </View>
              <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No saved spots yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
