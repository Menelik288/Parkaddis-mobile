import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, useColorScheme, Platform, KeyboardAvoidingView, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView 
        contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backBtn}>
             <MaterialIcons name="arrow-back" size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
          </TouchableOpacity>
        </View>

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
            
            <Text style={[styles.welcomeTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>Log in to ParkAddis</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            
            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#cbd5e1' : '#334155' }]}>Email address</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="mail" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' }]}
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#cbd5e1' : '#334155' }]}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' }]}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.forgotPasswordWrapper}>
              <TouchableOpacity>
                <Text style={[styles.forgotPasswordText, { color: primary }]}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <View style={styles.submitWrapper}>
              <TouchableOpacity style={[styles.submitButton, { backgroundColor: primary }]} onPress={() => router.push('/(tabs)')}>
                <Text style={styles.submitText}>Login</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]} />
              <View style={[styles.dividerBadge, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
                <Text style={[styles.dividerText, { color: '#94a3b8' }]}>OR CONTINUE WITH</Text>
              </View>
            </View>

            {/* Social Logins */}
            <View style={styles.socialGroup}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkZZUwndQKtUfjxFZSaQbSiV7sqOGsy0gNBofCW1oIpmybyQi088DJgGo922KUlE34IBzXLW-arTjhal9OPW7CyPr0M6b9svZf6d2qxy_QoZpFIMN004qyDrKoin_FdEzF_4oqh3_4L6ESb_e_u_6M2p9VgR-scGoHkBFJqxdn69AuFyU55R5yGrE_FuxNDk-Iyf7B_cQ8Q3Ct5m_ixGiv1PKEe7d3JPZ1eAj98xmich_is4ENWPTQq5fH_nvPDtzwgK6eNSeQ6Fo' }} style={styles.googleIcon} />
                <Text style={[styles.socialButtonText, { color: isDark ? '#cbd5e1' : '#334155' }]}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                <MaterialIcons name="apple" size={24} color={isDark ? '#cbd5e1' : '#334155'} />
                <Text style={[styles.socialButtonText, { color: isDark ? '#cbd5e1' : '#334155' }]}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Create Account Link */}
            <View style={styles.registerWrapper}>
              <Text style={[styles.registerText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/profile' as any)}>
                <Text style={[styles.registerLink, { color: primary }]}>Create account</Text>
              </TouchableOpacity>
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
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  contentWrapper: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingBottom: 40,
  },
  brandingHeader: {
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  logoBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
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
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  formContainer: {
    width: '100%',
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
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
    paddingRight: 48,
    fontSize: 15,
    fontWeight: '500',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  forgotPasswordWrapper: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitWrapper: {
    paddingTop: 8,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '700',
  },
  dividerContainer: {
    position: 'relative',
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
  },
  dividerBadge: {
    paddingHorizontal: 16,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  socialGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  registerWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
