/**
 * Bottom Tab Navigation Layout
 */
import React from "react";
import { Tabs } from "expo-router";
import { colors } from "../../src/theme/colors";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { Text, Platform } from "react-native";

export default function TabLayout() {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.surfaceBorder,
          height: Platform.select({ ios: 88, default: 68 }),
          paddingBottom: Platform.select({ ios: 28, default: 10 }),
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.gold,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="reader"
        options={{
          title: "Quran",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📖</Text>,
        }}
      />
      <Tabs.Screen
        name="recite"
        options={{
          title: "Recite",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🎙️</Text>,
        }}
      />
      <Tabs.Screen
        name="hifz"
        options={{
          title: "Hifz",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🧠</Text>,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />
    </Tabs>
  );
}
