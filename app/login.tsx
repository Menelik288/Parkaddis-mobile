import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primary = '#064e3b';
  const secondary = '#34d399';

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
              <View className="flex-row items-center gap-2 mb-8">
                <View className="w-12 h-12 rounded-lg items-center justify-center shadow-lg" style={{ backgroundColor: primary }}>
                  <Text className="text-white font-black text-2xl">P</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-xl font-black tracking-tighter" style={{ color: primary }}>PARK</Text>
                  <Text className="text-xl font-black tracking-tighter text-[#94a3b8]">ADDIS</Text>
                </View>
              </View>
              <Text className={`text-[28px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                Log in to ParkAddis
              </Text>
            </View>

            {/* Form */}
            <View className="w-full gap-6">
              <View className="gap-2">
                <Text className={`text-sm font-medium px-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email address</Text>
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
                    className={`flex-1 h-14 rounded-2xl border pl-12 pr-4 text-[15px] font-medium ${isDark ? 'bg-[#0f172a] border-[#1e293b] text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                  />
                </View>
              </View>

              <View className="gap-2">
                <Text className={`text-sm font-medium px-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</Text>
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
                    className={`flex-1 h-14 rounded-2xl border pl-12 pr-12 text-[15px] font-medium ${isDark ? 'bg-[#0f172a] border-[#1e293b] text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 p-1"
                  >
                    {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                  </TouchableOpacity>
                </View>
              </View>

              {error && (
                <View className="bg-red-500/10 p-4 rounded-xl">
                  <Text className="color-red-500 text-xs font-bold">{error}</Text>
                </View>
              )}

              <View className="flex-row justify-end -mt-2">
                <TouchableOpacity>
                  <Text className="text-sm font-semibold" style={{ color: primary }}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={handleLogin}
                disabled={loading}
                className="w-full h-14 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg"
                style={{ backgroundColor: primary }}
              >
                <Text className="text-white font-bold text-base">{loading ? 'Signing in...' : 'Sign In'}</Text>
                {!loading && <ArrowRight size={18} color="white" />}
              </TouchableOpacity>

              {/* Divider */}
              <View className="relative flex-row items-center justify-center my-4">
                <View className={`absolute w-full h-px ${isDark ? 'bg-[#1e293b]' : 'bg-slate-200'}`} />
                <View className={`px-4 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
                  <Text className="text-[10px] font-bold tracking-widest text-slate-400">OR CONTINUE WITH</Text>
                </View>
              </View>

              {/* Social */}
              <View className="flex-row gap-4">
                <TouchableOpacity className={`flex-1 flex-row items-center justify-center h-14 rounded-2xl border gap-2 ${isDark ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-white border-slate-200'}`}>
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1573806119002-821bdca0d07b?w=40&h=40&fit=crop' }} className="w-5 h-5 rounded-full" />
                  <Text className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity className={`flex-1 flex-row items-center justify-center h-14 rounded-2xl border gap-2 ${isDark ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-white border-slate-200'}`}>
                  <Text className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Apple</Text>
                </TouchableOpacity>
              </View>

              {/* Register */}
              <View className="flex-row justify-center items-center gap-1 pt-4 mb-20">
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text className="text-sm font-bold" style={{ color: primary }}>Create account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
