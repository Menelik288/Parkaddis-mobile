import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

/**
 * BrandedSplash Component
 * 
 * A high-fidelity, code-based splash screen for ParkAddis.
 * features a theme-aware layout that transitions seamlessly from the native splash.
 */
export const BrandedSplash = ({ onFinish }: { onFinish?: () => void }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  // Theme-based colors
  const bgColor = isDark ? '#000000' : '#064e3b';
  const brandPrimary = isDark ? '#34d399' : '#34d399';
  const brandSecondary = isDark ? '#ffffff' : '#ffffff';
  const pBoxColor = isDark ? '#1e293b' : '#ffffff';
  const pTextColor = isDark ? '#34d399' : '#064e3b';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={[styles.pLogoBox, { backgroundColor: pBoxColor }]}>
            <Text style={[styles.pLogoText, { color: pTextColor }]}>P</Text>
          </View>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.brandName, { color: brandSecondary }]}>PARK</Text>
          <Text style={[styles.brandSub, { color: brandPrimary }]}>ADDIS</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  pLogoBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  pLogoText: {
    fontSize: 48,
    fontWeight: '900',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandName: {
    fontSize: 48,
    fontFamily: 'System',
    fontWeight: '900',
    letterSpacing: -2,
  },
  brandSub: {
    fontSize: 48,
    fontFamily: 'System',
    fontWeight: '900',
    letterSpacing: -2,
  },
});
