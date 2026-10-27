/**
 * Root Application Layout
 */
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { colors } from "../src/theme/colors";

export default function RootLayout() {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];

  return (
    <SafeAreaProvider>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="recitation/summary" options={{ presentation: "modal" }} />
        <Stack.Screen name="recitation/mistakes" options={{ presentation: "card" }} />
        <Stack.Screen name="recitation/history" options={{ presentation: "card" }} />
        <Stack.Screen name="settings/index" options={{ presentation: "card" }} />
        <Stack.Screen name="settings/privacy" options={{ presentation: "card" }} />
        <Stack.Screen name="settings/status" options={{ presentation: "card" }} />
        <Stack.Screen name="quran/bookmarks" options={{ presentation: "card" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
