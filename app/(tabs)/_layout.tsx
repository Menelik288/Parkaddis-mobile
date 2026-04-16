import { BrandedSplash } from "@/components/BrandedSplash";
import { HapticTab } from "@/components/haptic-tab";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import { LayoutGrid, Map, Ticket, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (!user && !isLoading) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: isDark ? "#34d399" : "#064e3b",
          tabBarInactiveTintColor: isDark ? "#475569" : "#94a3b8",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 64 + insets.bottom,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            paddingTop: 12,
            borderTopWidth: 0,
            backgroundColor: "transparent",
            elevation: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
          },
          tabBarBackground: () => (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderTopLeftRadius: 32,
                  borderTopRightRadius: 32,
                  overflow: "hidden",
                },
              ]}
            >
              <BlurView
                tint={isDark ? "dark" : "light"}
                intensity={100}
                style={StyleSheet.absoluteFill}
              />
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: isDark
                      ? "rgba(15,23,42,0.85)"
                      : "rgba(255,255,255,0.8)",
                    borderTopWidth: 0.5,
                    borderColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.03)",
                  },
                ]}
              />
            </View>
          ),
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <LayoutGrid size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="find"
          options={{
            title: "Find",
            tabBarIcon: ({ color }) => <Map size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            title: "Tickets",
            tabBarIcon: ({ color }) => <Ticket size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
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
