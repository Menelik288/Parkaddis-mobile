import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Edit2, Trash2, PlusCircle, Info, CheckCircle, Car, Zap, ChevronRight } from 'lucide-react-native';
import { PageHeader } from '@/components/PageHeader';
import { useRouter } from 'expo-router';

export default function VehiclesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#34d399';

  const vehicles = [
    {
      id: '1',
      model: 'Tesla Model Y',
      description: 'Deep Sea Blue • Long Range',
      plate: 'AA-B23456',
      isDefault: true,
      type: 'electric',
    },
    {
      id: '2',
      model: 'Toyota RAV4',
      description: 'Silver Metallic • Hybrid',
      plate: 'AA-A98765',
      isDefault: false,
      type: 'hybrid',
    },
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      <PageHeader title="Manage Vehicles" />

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Garage Overview Header */}
        <View className="flex-row justify-between items-end mb-4 px-1">
          <View>
            <Text className="text-[10px] font-black uppercase tracking-[2px] text-[#94a3b8]">Garage Overview</Text>
            <Text className={`text-lg font-black mt-1 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Active Fleet</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-[#34d399]/20' : 'bg-[#ecfdf5]'}`}>
            <Text className={`text-[10px] font-black ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>{vehicles.length} Registered</Text>
          </View>
        </View>

        {/* Vehicles List */}
        <View className="gap-4 mb-8">
          {vehicles.map((vehicle) => (
            <View 
              key={vehicle.id}
              className={`rounded-[32px] border p-5 shadow-sm ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center gap-4">
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
                    {vehicle.type === 'electric' ? (
                      <Zap size={22} color={isDark ? secondary : primary} fill={isDark ? secondary : primary} />
                    ) : (
                      <Car size={22} color={isDark ? secondary : primary} />
                    )}
                  </View>
                  <View>
                    <Text className={`text-base font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{vehicle.model}</Text>
                    <Text className="text-[11px] text-[#94a3b8] font-medium">{vehicle.description}</Text>
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-[#334155]' : 'bg-[#f8fafc]'}`}>
                    <Edit2 size={14} color="#94a3b8" />
                  </TouchableOpacity>
                  <TouchableOpacity className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                    <Trash2 size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className={`flex-row justify-between items-center p-4 rounded-2xl ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
                <View>
                  <Text className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest mb-0.5">Plate Number</Text>
                  <Text className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>{vehicle.plate}</Text>
                </View>
                
                {vehicle.isDefault ? (
                  <View className="flex-row items-center gap-1.5 bg-[#064e3b] px-3 py-1.5 rounded-full">
                    <CheckCircle size={12} color="#34d399" />
                    <Text className="text-[10px] font-black text-white uppercase tracking-wider">Default</Text>
                  </View>
                ) : (
                  <TouchableOpacity>
                    <Text className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>Set as Default</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          className={`flex-row items-center justify-center gap-3 h-16 rounded-[24px] mb-8 border-2 border-dashed ${isDark ? 'bg-[#34d399]/5 border-[#34d399]/30' : 'bg-[#ecfdf5] border-[#064e3b]/20'}`}
          activeOpacity={0.7}
        >
          <PlusCircle size={20} color={isDark ? secondary : primary} />
          <Text className={`text-base font-black ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>Register another vehicle</Text>
        </TouchableOpacity>

        {/* Tip Box - Redesigned to match Stitch precisely */}
        <View className="relative overflow-hidden p-7 rounded-[40px] bg-[#064e3b] shadow-2xl mb-4">
          {/* Background Icon - Large and faint */}
          <View className="absolute -right-6 -bottom-10 opacity-10">
            <Info size={160} color="white" />
          </View>
          
          <View className="relative z-10">
            <Text className="text-white text-[22px] font-black tracking-tighter mb-2">Did you know?</Text>
            <Text className="text-[#d1fae5] text-sm leading-6 font-bold pr-8 opacity-90">
              You can set a primary vehicle to skip selection during fast-checkout at ParkAddis locations.
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
