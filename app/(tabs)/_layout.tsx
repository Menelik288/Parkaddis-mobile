import { Tabs } from 'expo-router';
import React from 'react';
import { LayoutGrid, Map, User, Ticket } from 'lucide-react-native';
import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { BrandedSplash } from '@/components/BrandedSplash';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, isLoading } = useAuth();

  if (!user && !isLoading) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: isDark ? '#34d399' : '#064e3b',
          tabBarInactiveTintColor: isDark ? '#475569' : '#94a3b8',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 95,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingBottom: 10,
            paddingTop: 10,
            borderTopWidth: 0,
            backgroundColor: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.7)',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
          },
          tabBarBackground: () => (
            <View style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' }]}>
              <BlurView 
                tint={isDark ? "dark" : "light"} 
                intensity={80} 
                style={StyleSheet.absoluteFill} 
              />
            </View>
          ),
          tabBarShowLabel: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <LayoutGrid size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="find"
          options={{
            title: 'Find',
            tabBarIcon: ({ color }) => <Map size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            title: 'Tickets',
            tabBarIcon: ({ color }) => <Ticket size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User size={26} color={color} />,
          }}
        />
      </Tabs>
      {isLoading && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <BrandedSplash />
        </View>
      )}
    </>
  );
}
