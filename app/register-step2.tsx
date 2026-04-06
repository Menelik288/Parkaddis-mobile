import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, useColorScheme, Platform, KeyboardAvoidingView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function RegisterStep2Screen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const router = useRouter();

  const [selectedColor, setSelectedColor] = useState('#0f172a');
  const colors = ['#0f172a', '#f1f5f9', '#2563eb', '#dc2626', '#047857', '#f59e0b'];

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
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, { backgroundColor: '#6ee7b7' }]} />
                <View style={[styles.stepDot, { backgroundColor: '#6ee7b7' }]} />
              </View>
              
              <Text style={styles.cardHeaderTitle}>Vehicle Details</Text>
              <Text style={styles.cardHeaderSubtitle}>Step 2 of 2 • Finalizing Profile</Text>
            </View>
            
            <View style={styles.cardBody}>
              
              {/* Plate Number Field */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#334155' }]}>Ethiopian Plate Number</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="pin" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' }]}
                    placeholder="AA-2-B4567"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              {/* Car Model Field */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#334155' }]}>Car Model</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="directions-car" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' }]}
                    placeholder="Toyota Corolla 2022"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              {/* Car Color Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#334155' }]}>Vehicle Color</Text>
                <View style={styles.colorSelectorContainer}>
                  {colors.map((c, i) => (
                    <TouchableOpacity 
                      key={i}
                      style={[
                        styles.colorOption,
                        { borderColor: selectedColor === c ? primary : 'transparent', borderWidth: selectedColor === c ? 2 : 0, padding: selectedColor === c ? 2 : 0 }
                      ]}
                      onPress={() => setSelectedColor(c)}
                      activeOpacity={0.8}
                    >
                      <View style={[
                        styles.colorOptionInner, 
                        { backgroundColor: c, borderWidth: c === '#f1f5f9' ? 1 : 0, borderColor: '#cbd5e1' }
                      ]} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Complete Button */}
              <View style={styles.submitWrapper}>
                <TouchableOpacity style={[styles.submitButton, { backgroundColor: primary }]} onPress={() => router.push('/' as any)}>
                  <Text style={styles.submitText}>Complete Registration</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Back Link */}
              <View style={styles.loginWrapper}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={[styles.loginLink, { color: isDark ? '#34d399' : primary }]}>Back to user info</Text>
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
    paddingBottom: 40,
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
  colorSelectorContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionInner: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
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
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
