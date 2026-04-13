import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Hash, Car, ArrowRight, AlertCircle } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RegisterStep2Screen() {
  const router = useRouter();
  const { register } = useAuth();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [plateNumber, setPlateNumber] = useState('');
  const [carModel, setCarModel] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0f172a');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = [
    { value: '#0f172a', name: 'Dark' },
    { value: '#f1f5f9', name: 'White' },
    { value: '#2563eb', name: 'Blue' },
    { value: '#dc2626', name: 'Red' },
    { value: '#047857', name: 'Green' },
    { value: '#f59e0b', name: 'Yellow' }
  ];

  const primary = '#064e3b';
  const secondary = '#34d399';

  const handleComplete = async () => {
    if (!plateNumber || !carModel) {
      setError('Please fill in vehicle details');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const registrationData = {
        fullName: params.fullName as string,
        email: params.email as string,
        password: params.password as string,
        phoneNumber: "0900000000", // Default placeholder for now
        role: (params.role as string) || 'user',
        car: {
          plateNumber,
          carModel,
          color: colors.find(c => c.value === selectedColor)?.name || 'Black'
        }
      };

      await register(registrationData);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="flex-1 items-center w-full max-w-md mx-auto pt-10 pb-10">
            {/* Branding */}
            <View className="mb-10 items-center w-full">
              <View className="flex-row items-center gap-2">
                <View className="w-12 h-12 rounded-lg items-center justify-center shadow-lg" style={{ backgroundColor: primary }}>
                  <Text className="text-white font-black text-2xl">P</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-xl font-black tracking-tighter" style={{ color: primary }}>PARK</Text>
                  <Text className="text-xl font-black tracking-tighter text-[#94a3b8]">ADDIS</Text>
                </View>
              </View>
            </View>

            {/* Registration Card */}
            <View className={`w-full rounded-3xl border overflow-hidden shadow-xl ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-200/30'}`}>
              <View className={`p-8 items-center border-b border-dashed ${isDark ? 'bg-[#022c22] border-white/30' : 'bg-[#064e3b] border-white/30'}`}>
                <View className="flex-row gap-2 mb-4">
                  <View className="w-12 h-1 rounded-full bg-[#6ee7b7]" />
                  <View className="w-12 h-1 rounded-full bg-[#6ee7b7]" />
                </View>
                <Text className="text-white text-2xl font-extrabold">Vehicle Details</Text>
                <Text className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">Step 2 of 2 • Finalizing Profile</Text>
              </View>
              
              <View className="p-8 gap-6">
                <View className="gap-2">
                  <Text className={`text-sm font-semibold px-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Ethiopian Plate Number</Text>
                  <View className="relative flex-row items-center">
                    <View className="absolute left-4 z-10">
                      <Hash size={20} color="#94a3b8" />
                    </View>
                    <TextInput 
                      placeholder="AA-2-B4567"
                      placeholderTextColor="#94a3b8"
                      value={plateNumber}
                      onChangeText={setPlateNumber}
                      className={`flex-1 h-14 rounded-2xl border pl-12 pr-4 text-[15px] font-semibold ${isDark ? 'bg-[#0f172a] border-[#334155] text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                    />
                  </View>
                </View>

                <View className="gap-2">
                  <Text className={`text-sm font-semibold px-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Car Model</Text>
                  <View className="relative flex-row items-center">
                    <View className="absolute left-4 z-10">
                      <Car size={20} color="#94a3b8" />
                    </View>
                    <TextInput 
                      placeholder="Toyota Corolla 2022"
                      placeholderTextColor="#94a3b8"
                      value={carModel}
                      onChangeText={setCarModel}
                      className={`flex-1 h-14 rounded-2xl border pl-12 pr-4 text-[15px] font-semibold ${isDark ? 'bg-[#0f172a] border-[#334155] text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                    />
                  </View>
                </View>

                <View className="gap-2">
                  <Text className={`text-sm font-semibold px-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Vehicle Color</Text>
                  <View className="flex-row gap-3 px-1">
                    {colors.map((c, i) => (
                      <TouchableOpacity 
                        key={i}
                        onPress={() => setSelectedColor(c.value)}
                        className={`w-9 h-9 rounded-full ${selectedColor === c.value ? 'border-2 border-[#064e3b]' : ''}`}
                        style={{ backgroundColor: c.value, borderWidth: c.value === '#f1f5f9' ? 1 : (selectedColor === c.value ? 2 : 0), borderColor: c.value === '#f1f5f9' ? '#cbd5e1' : '#064e3b' }}
                      />
                    ))}
                  </View>
                </View>

                {error && (
                  <View className="bg-red-500/10 p-4 rounded-xl">
                    <Text className="color-red-500 text-xs font-bold">{error}</Text>
                  </View>
                )}

                <TouchableOpacity 
                  onPress={handleComplete}
                  disabled={loading}
                  className="w-full h-14 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg"
                  style={{ backgroundColor: primary }}
                >
                  <Text className="text-white font-extrabold text-base">{loading ? 'Finalizing...' : 'Complete Registration'}</Text>
                  {!loading && <ArrowRight size={18} color="white" />}
                </TouchableOpacity>

                <View className="flex-row justify-center mb-4">
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text className={`text-sm font-bold ${isDark ? 'text-[#34d399]' : ''}`} style={{ color: isDark ? '' : primary }}>Back to user info</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
