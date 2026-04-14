import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, useColorScheme, Platform, KeyboardAvoidingView, Image, Modal, Pressable, TouchableWithoutFeedback } from 'react-native';
import { User, Mail, Lock, Eye, EyeOff, LogOut, Edit3, ChevronRight, CreditCard, HelpCircle, AlertCircle, ArrowRight, Home, Navigation, Settings, History, Wallet, Menu, CheckCircle, Bookmark } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { user, logout } = useAuth();
  const primary = '#064e3b';
  const secondary = '#34d399';

  const [menuVisible, setMenuVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); 
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    router.push({
      pathname: '/register-step2',
      params: { fullName, email, password, role }
    } as any);
  };

  if (user) {
    // Logged In View
    return (
      <View className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
        {/* Header */}
        <View className={`flex-row justify-between items-center px-6 ${Platform.OS === 'ios' ? 'pt-[68px]' : 'pt-[48px]'} pb-4 z-10 ${isDark ? 'bg-[#0f172a]/90' : 'bg-[#f8fafc]/90'}`}>
          <View className="flex-row items-center gap-5">
            <TouchableOpacity onPress={() => setMenuVisible(true)} className="p-1">
              <Menu size={24} color={isDark ? secondary : primary} />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Text className="text-2xl font-black tracking-tighter" style={{ color: isDark ? secondary : primary }}>PARK</Text>
              <Text className="text-2xl font-black tracking-tighter text-[#94a3b8]">ADDIS</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')} className={`w-10 h-10 items-center justify-center rounded-full ${isDark ? 'bg-[#1e293b]' : 'bg-[#f1f5f9]'}`}>
            <Settings size={20} color={isDark ? secondary : primary} />
          </TouchableOpacity>
        </View>

        {/* Menu Modal - Exactly matching Dashboard */}
        <Modal 
          visible={menuVisible} 
          transparent 
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View className="flex-1 bg-black/20">
              <TouchableWithoutFeedback>
                <View 
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                    elevation: 10,
                  }}
                  className={`absolute top-24 left-5 w-52 rounded-2xl border p-2 ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e2e8f0]'}`}
                >
                  <TouchableOpacity 
                    className="flex-row items-center p-3 gap-3 rounded-xl"
                    onPress={() => { setMenuVisible(false); router.push('/saved'); }}
                  >
                    <Bookmark size={18} color={isDark ? secondary : primary} />
                    <Text className={`font-semibold text-sm ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Saved Spots</Text>
                  </TouchableOpacity>
                  
                  <View className={`h-px w-full my-1 ${isDark ? 'bg-[#334155]' : 'bg-[#f1f5f9]'}`} />

                  <TouchableOpacity 
                    className="flex-row items-center p-3 gap-3 rounded-xl"
                    onPress={() => { setMenuVisible(false); router.push('/wallet'); }}
                  >
                    <Wallet size={18} color={isDark ? secondary : primary} />
                    <Text className={`font-semibold text-sm ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Wallets</Text>
                  </TouchableOpacity>
                  
                  <View className={`h-px w-full my-1 ${isDark ? 'bg-[#334155]' : 'bg-[#f1f5f9]'}`} />
                  
                  <TouchableOpacity 
                    className="flex-row items-center p-3 gap-3 rounded-xl"
                    onPress={() => { setMenuVisible(false); router.push('/settings'); }}
                  >
                    <Settings size={18} color={isDark ? secondary : primary} />
                    <Text className={`font-semibold text-sm ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Settings</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View className="items-center mt-4 mb-8">
            {/* Avatar with green ring */}
            <View className="relative mb-5">
              <View className="w-24 h-24 rounded-full border-4 border-[#34d399] items-center justify-center" style={{ backgroundColor: isDark ? '#1e293b' : '#e2faf1' }}>
                <Text className={`text-4xl font-black ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>{user.fullName.charAt(0)}</Text>
              </View>
              {/* Verified badge */}
              <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#064e3b] border-2 border-white items-center justify-center">
                <CheckCircle size={14} color="#34d399" fill="#064e3b" />
              </View>
            </View>

            {/* Name */}
            <Text className={`text-3xl font-black tracking-tight mb-3 ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>{user.fullName}</Text>

            {/* Role / Status pill */}
            <View className={`px-4 py-1.5 rounded-full ${isDark ? 'bg-[#34d399]/20' : 'bg-[#dcfce7]'}`}>
              <Text className={`text-[10px] font-black tracking-[2px] uppercase ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>{user.role || 'MEMBER'}</Text>
            </View>
          </View>

          {/* Account Overview */}
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-[#94a3b8] mb-4">Account Overview</Text>
          <View className="gap-3 mb-8">

            {/* Personal Information */}
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
              className={`flex-row items-center justify-between p-4 rounded-3xl border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-4">
                <View className={`w-11 h-11 rounded-2xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
                  <User size={20} color={isDark ? secondary : primary} />
                </View>
                <View>
                  <Text className={`text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Personal Information</Text>
                  <Text className="text-[11px] text-[#94a3b8] font-medium">{user.email}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>

            {/* Vehicle Management */}
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
              className={`flex-row items-center justify-between p-4 rounded-3xl border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
              onPress={() => router.push('/settings/vehicles')}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-4">
                <View className={`w-11 h-11 rounded-2xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
                  <Navigation size={20} color={isDark ? secondary : primary} />
                </View>
                <View>
                  <Text className={`text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Vehicle Management</Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[11px] text-[#94a3b8] font-medium">My Vehicle</Text>
                    <View className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-[#334155]' : 'bg-[#ecfdf5]'}`}>
                      <Text className={`text-[9px] font-black tracking-wider ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>PRIMARY</Text>
                    </View>
                  </View>
                </View>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>

            {/* Digital Wallet */}
            <TouchableOpacity
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
              className={`flex-row items-center justify-between p-4 rounded-3xl border ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#f1f5f9]'}`}
              onPress={() => router.push('/wallet')}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-4">
                <View className={`w-11 h-11 rounded-2xl items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
                  <Wallet size={20} color={isDark ? secondary : primary} />
                </View>
                <View>
                  <Text className={`text-sm font-bold ${isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'}`}>Digital Wallet</Text>
                  <Text className="text-[11px] text-[#94a3b8] font-medium">Manage balance & top-ups</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </View>

          {/* Sign Out — centered red */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-4"
            onPress={logout}
            activeOpacity={0.7}
          >
            <LogOut size={18} color="#ef4444" />
            <Text className="text-base font-bold text-red-500">Sign Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    );
  }

  // Registration View (Step 1)
  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView 
        className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 80 : 60, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center w-full max-w-[400px] self-center">
          
          {/* Branding Header */}
          <View className="mb-10 items-center">
            <View className="flex-row items-center gap-2">
              <View 
                style={{
                  shadowColor: isDark ? '#34d399' : '#064e3b',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 5,
                }}
                className={`w-12 h-12 rounded-lg items-center justify-center ${isDark ? 'bg-[#34d399]/20' : 'bg-[#064e3b]'}`}
              >
                <Text className="text-white text-2xl font-black italic tracking-tighter">P</Text>
              </View>
              <View className="flex-row items-center">
                <Text className={`text-2xl font-black tracking-tighter ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>PARK</Text>
                <Text className="text-2xl font-black tracking-tighter text-[#94a3b8]">ADDIS</Text>
              </View>
            </View>
          </View>

          {/* Registration Card */}
          <View 
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}
            className={`w-full rounded-[32px] border overflow-hidden ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-[#e2e8f0]'}`}
          >
            
            <View className={`p-8 items-center border-b border-dashed border-white/30 ${isDark ? 'bg-[#022c22]' : 'bg-[#064e3b]'}`}>
              <View className="flex-row gap-2 mb-4">
                <View className="w-12 h-1 rounded-full bg-emerald-400" />
                <View className="w-12 h-1 rounded-full bg-white/20" />
              </View>
              
              <Text className="text-white text-2xl font-black tracking-tight">Create Account</Text>
              <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Step 1 of 2 • Personal Identity</Text>
            </View>
            
            <View className="p-8 gap-6">
              
              {/* Full Name */}
              <View className="gap-2">
                <Text className={`text-[11px] font-bold uppercase tracking-wider px-1 ${isDark ? 'text-[#94a3b8]' : 'text-[#475569]'}`}>Full Name</Text>
                <View className="relative justify-center">
                  <User size={18} color="#94a3b8" className="absolute left-4 z-10" />
                  <TextInput 
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 1,
                    }}
                    className={`h-14 rounded-2xl border px-12 text-sm font-bold ${isDark ? 'bg-[#0f172a] border-[#334155] text-white' : 'bg-[#f8fafc] border-[#f1f5f9] text-[#0f172a]'}`}
                    placeholder="Enter your full name"
                    placeholderTextColor="#94a3b8"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              {/* Email Address */}
              <View className="gap-2">
                <Text className={`text-[11px] font-bold uppercase tracking-wider px-1 ${isDark ? 'text-[#94a3b8]' : 'text-[#475569]'}`}>Email Address</Text>
                <View className="relative justify-center">
                  <Mail size={18} color="#94a3b8" className="absolute left-4 z-10" />
                  <TextInput 
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 1,
                    }}
                    className={`h-14 rounded-2xl border px-12 text-sm font-bold ${isDark ? 'bg-[#0f172a] border-[#334155] text-white' : 'bg-[#f8fafc] border-[#f1f5f9] text-[#0f172a]'}`}
                    placeholder="name@example.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password */}
              <View className="gap-2">
                <Text className={`text-[11px] font-bold uppercase tracking-wider px-1 ${isDark ? 'text-[#94a3b8]' : 'text-[#475569]'}`}>Password</Text>
                <View className="relative justify-center">
                  <Lock size={18} color="#94a3b8" className="absolute left-4 z-10" />
                  <TextInput 
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 1,
                    }}
                    className={`h-14 rounded-2xl border px-12 text-sm font-bold ${isDark ? 'bg-[#0f172a] border-[#334155] text-white' : 'bg-[#f8fafc] border-[#f1f5f9] text-[#0f172a]'}`}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity 
                    className="absolute right-4 z-10 p-2" 
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#94a3b8" />
                    ) : (
                      <Eye size={18} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Identify As */}
              <View className="gap-2">
                <Text className={`text-[11px] font-bold uppercase tracking-wider px-1 ${isDark ? 'text-[#94a3b8]' : 'text-[#475569]'}`}>Identify As</Text>
                <View className="flex-row gap-4 px-1">
                  <TouchableOpacity 
                    className="items-center gap-2"
                    onPress={() => setRole('user')}
                    activeOpacity={0.8}
                  >
                    <View 
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 6,
                        elevation: 5,
                      }}
                      className={`w-14 h-14 rounded-2xl items-center justify-center ${role === 'user' ? (isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]') : (isDark ? 'bg-[#0f172a] border border-[#334155]' : 'bg-[#f1f5f9]')}`}
                    >
                      <Navigation size={22} color={role === 'user' ? '#ffffff' : '#94a3b8'} />
                    </View>
                    <Text className={`text-[9px] font-black tracking-widest ${role === 'user' ? (isDark ? 'text-[#34d399]' : 'text-[#064e3b]') : 'text-[#94a3b8]'}`}>DRIVER</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="items-center gap-2"
                    onPress={() => setRole('owner')}
                    activeOpacity={0.8}
                  >
                    <View 
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 6,
                        elevation: 5,
                      }}
                      className={`w-14 h-14 rounded-2xl items-center justify-center ${role === 'owner' ? (isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]') : (isDark ? 'bg-[#0f172a] border border-[#334155]' : 'bg-[#f1f5f9]')}`}
                    >
                      <Home size={22} color={role === 'owner' ? '#ffffff' : '#94a3b8'} />
                    </View>
                    <Text className={`text-[9px] font-black tracking-widest ${role === 'owner' ? (isDark ? 'text-[#34d399]' : 'text-[#064e3b]') : 'text-[#94a3b8]'}`}>OWNER</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {error && (
                <View className="flex-row items-center gap-2 bg-red-500/10 p-4 rounded-xl">
                  <AlertCircle size={14} color="#ef4444" />
                  <Text className="text-red-500 text-xs font-bold leading-4">{error}</Text>
                </View>
              )}

              {/* Continue Button */}
              <TouchableOpacity 
                style={{
                  shadowColor: isDark ? '#34d399' : '#064e3b',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 8,
                }}
                className={`h-16 rounded-2xl flex-row items-center justify-center gap-2 mt-2 ${isDark ? 'bg-[#34d399]' : 'bg-[#064e3b]'}`} 
                onPress={handleContinue}
              >
                <Text className={`text-base font-black ${isDark ? 'text-[#064e3b]' : 'text-white'}`}>Continue</Text>
                <ArrowRight size={18} color={isDark ? '#064e3b' : 'white'} />
              </TouchableOpacity>

              {/* Login Link */}
              <View className="flex-row justify-center items-center mt-2">
                <Text className="text-[#64748b] text-sm font-medium">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login' as any)}>
                  <Text className={`text-sm font-black underline ${isDark ? 'text-[#34d399]' : 'text-[#064e3b]'}`}>Log In</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
