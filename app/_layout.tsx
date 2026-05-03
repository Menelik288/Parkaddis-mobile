import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import '../global.css';

import { BrandedSplash } from '@/components/BrandedSplash';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MapProvider } from '@/map-native/MapProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Reduced delay for faster transition while still showing branding
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
        // Keep the JS overlay for the duration of the animation
        setTimeout(() => setShowSplash(false), 800);
      }
    }
    prepare();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <MapProvider>
              <RootContent 
                appIsReady={appIsReady} 
                showSplash={showSplash} 
                colorScheme={colorScheme}
              />
            </MapProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

function RootContent({ appIsReady, showSplash, colorScheme }: { appIsReady: boolean, showSplash: boolean, colorScheme: any }) {
  const { isLoading, user } = useAuth();
  const isDark = colorScheme === 'dark';
  const primary = '#064e3b';
  const secondary = '#34d399';

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="register-step2" />
          <Stack.Screen name="reserve" />
          <Stack.Screen name="bookings" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="wallet" />
          <Stack.Screen name="saved" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="confirmation" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
        </Stack>
        
        {(!appIsReady || isLoading || showSplash) && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <BrandedSplash />
          </View>
        )}
        
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </View>
    </ThemeProvider>
  );
}
