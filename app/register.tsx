import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, Eye, EyeOff, Car, Warehouse, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'driver' | 'owner'>('driver');
  const [showPassword, setShowPassword] = useState(false);

  const primary = '#064e3b';
  const secondary = '#34d399';

  const handleContinue = () => {
    if (!fullName || !email || !password) return;
    router.push({
      pathname: '/register-step2',
      params: { fullName, email, password, role }
    });
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
                  <View className="w-12 h-1 rounded-full bg-white/20" />
                </View>
                <Text className="text-white text-2xl font-extrabold">Create Account</Text>
                <Text className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">Step 1 of 2 • Personal Identity</Text>
              </View>
              
              <View className="p-8 gap-6">
                <View className="gap-2">
                  <Text className={`text-sm font-semibold px-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Full Name</Text>
                  <View className="relative flex-row items-center">
                    <View className="absolute left-4 z-10">
                      <User size={20} color="#94a3b8" />
                    </View>
                    <TextInput 
                      placeholder="Enter your full name"
                      placeholderTextColor="#94a3b8"
                      value={fullName}
                      onChangeText={setFullName}
                      className={`flex-1 h-14 rounded-2xl border pl-12 pr-4 text-[15px] font-semibold ${isDark ? 'bg-[#0f172a] border-[#334155] text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                    />
                  </View>
                </View>

                <View className="gap-2">
                  <Text className={`text-sm font-semibold px-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Email Address</Text>
                  <View className="relative flex-row items-center">
                    <View className="absolute left-4 z-10">
                      <Mail size={20} color="#94a3b8" />
                    </View>
                    <TextInput 
                      placeholder="name@example.com"
                      placeholderTextColor="#94a3b8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      className={`flex-1 h-14 rounded-2xl border pl-12 pr-4 text-[15px] font-semibold ${isDark ? 'bg-[#0f172a] border-[#334155] text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                    />
                  </View>
                </View>

                <View className="gap-2">
                  <Text className={`text-sm font-semibold px-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Password</Text>
                  <View className="relative flex-row items-center">
                    <View className="absolute left-4 z-10">
                      <Lock size={20} color="#94a3b8" />
                    </View>
                    <TextInput 
                      secureTextEntry={!showPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={setPassword}
                      className={`flex-1 h-14 rounded-2xl border pl-12 pr-12 text-[15px] font-semibold ${isDark ? 'bg-[#0f172a] border-[#334155] text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 p-1"
                    >
                      {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="gap-2">
                  <Text className={`text-sm font-semibold px-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Identify As</Text>
                  <View className="flex-row gap-4 px-1">
                    <TouchableOpacity 
                      onPress={() => setRole('driver')}
                      className="items-center gap-1"
                    >
                      <View className={`w-12 h-12 rounded-xl items-center justify-center shadow-sm ${role === 'driver' ? 'bg-[#064e3b]' : (isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]')}`}>
                        <Car size={24} color={role === 'driver' ? 'white' : '#94a3b8'} />
                      </View>
                      <Text className={`text-[10px] font-extrabold tracking-widest ${role === 'driver' ? 'text-[#064e3b]' : 'text-[#64748b]'}`}>DRIVER</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => setRole('owner')}
                      className="items-center gap-1"
                    >
                      <View className={`w-12 h-12 rounded-xl items-center justify-center shadow-sm ${role === 'owner' ? 'bg-[#064e3b]' : (isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]')}`}>
                        <Warehouse size={24} color={role === 'owner' ? 'white' : '#94a3b8'} />
                      </View>
                      <Text className={`text-[10px] font-extrabold tracking-widest ${role === 'owner' ? 'text-[#064e3b]' : 'text-[#64748b]'}`}>OWNER</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={handleContinue}
                  className="w-full h-14 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg"
                  style={{ backgroundColor: primary }}
                >
                  <Text className="text-white font-extrabold text-base">Continue</Text>
                  <ArrowRight size={18} color="white" />
                </TouchableOpacity>

                <View className="flex-row justify-center items-center gap-1 mb-4">
                  <Text className="text-sm text-[#64748b]">Already have an account?</Text>
                  <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text className={`text-sm font-bold ${isDark ? 'text-[#34d399]' : ''}`} style={{ color: isDark ? '' : primary }}>Log In</Text>
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
