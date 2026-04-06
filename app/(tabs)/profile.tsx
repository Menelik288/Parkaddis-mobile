import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, useColorScheme, Platform, KeyboardAvoidingView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const router = useRouter();

  const [role, setRole] = useState('driver');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView 
        contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          
          {/* Branding Header */}
          <View style={styles.brandingHeader}>
            <View style={styles.logoBoxWrapper}>
              <View style={[styles.logoBox, { backgroundColor: primary }]}>
                <Text style={styles.logoBoxText}>P</Text>
              </View>
              <View style={styles.logoTextWrapper}>
                <Text style={[styles.logoTextPark, { color: primary }]}>PARK</Text>
                <Text style={styles.logoTextAddis}>ADDIS</Text>
              </View>
            </View>
          </View>

          {/* Registration Card */}
          <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : 'rgba(148,163,184,0.3)' }]}>
            
            <View style={[styles.cardHeader, { backgroundColor: isDark ? '#022c22' : primary }]}>
              {/* Notches logic omitted or simplified using border radius */}
              
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, { backgroundColor: '#6ee7b7' }]} />
                <View style={[styles.stepDotInactive, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              </View>
              
              <Text style={styles.cardHeaderTitle}>Create Account</Text>
              <Text style={styles.cardHeaderSubtitle}>Step 1 of 2 • Personal Identity</Text>
            </View>
            
            <View style={styles.cardBody}>
              
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#334155' }]}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="person" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' }]}
                    placeholder="Enter your full name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#334155' }]}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="mail" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' }]}
                    placeholder="name@example.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#334155' }]}>Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' }]}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                    <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Identify As */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#334155' }]}>Identify As</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity 
                    style={styles.roleOption}
                    onPress={() => setRole('driver')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.roleIconBox, { backgroundColor: role === 'driver' ? primary : (isDark ? '#0f172a' : '#f1f5f9') }]}>
                      <MaterialIcons name="directions-car" size={24} color={role === 'driver' ? '#ffffff' : '#94a3b8'} />
                    </View>
                    <Text style={[styles.roleText, { color: role === 'driver' ? primary : '#64748b' }]}>DRIVER</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.roleOption}
                    onPress={() => setRole('owner')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.roleIconBox, { backgroundColor: role === 'owner' ? primary : (isDark ? '#0f172a' : '#f1f5f9') }]}>
                      <MaterialIcons name="garage" size={24} color={role === 'owner' ? '#ffffff' : '#94a3b8'} />
                    </View>
                    <Text style={[styles.roleText, { color: role === 'owner' ? primary : '#64748b' }]}>OWNER</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Continue Button */}
              <View style={styles.submitWrapper}>
                <TouchableOpacity style={[styles.submitButton, { backgroundColor: primary }]} onPress={() => router.push('/register-step2' as any)}>
                  <Text style={styles.submitText}>Continue</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Login Link */}
              <View style={styles.loginWrapper}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login' as any)}>
                  <Text style={[styles.loginLink, { color: isDark ? '#34d399' : primary }]}>Log In</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 120, // keep clear of bottom tabs
  },
  contentWrapper: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  brandingHeader: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#064e3b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoBoxText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },
  logoTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTextPark: {
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  logoTextAddis: {
    fontSize: 24,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  cardHeader: {
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  stepDot: {
    width: 48,
    height: 4,
    borderRadius: 2,
  },
  stepDotInactive: {
    width: 48,
    height: 4,
    borderRadius: 2,
  },
  cardHeaderTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  cardHeaderSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  cardBody: {
    padding: 32,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  roleOption: {
    alignItems: 'center',
    gap: 4,
    marginRight: 16,
  },
  roleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  submitWrapper: {
    paddingTop: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 16,
    shadowColor: '#064e3b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  loginWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#64748b',
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
