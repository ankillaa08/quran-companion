/**
 * Splash & Welcome Screen
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../src/theme/colors";
import { useSettingsStore } from "../src/store/useSettingsStore";

export default function WelcomeScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Icon & Calligraphy */}
        <View style={styles.heroSection}>
          <View style={[styles.emblemRing, { borderColor: theme.gold, backgroundColor: theme.surface }]}>
            <Text style={[styles.arabicCalligraphy, { color: theme.gold }]}>القرآن</Text>
          </View>

          <Text style={[styles.appTitle, { color: theme.textPrimary }]}>Quran Companion AI</Text>
          <Text style={[styles.appTagline, { color: theme.textSecondary }]}>
            Real-Time AI Recitation, Memorization Assistance & Progress Tracking
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresSection}>
          <View style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <Text style={styles.featureIcon}>🎙️</Text>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureHeading, { color: theme.textPrimary }]}>Live AI Listening</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Listens to your recitation and highlights words in real-time as you recite.
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <Text style={styles.featureIcon}>🔍</Text>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureHeading, { color: theme.textPrimary }]}>Mistake Detection</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Detects omitted, repeated, or substituted words with high-precision text alignment.
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <Text style={styles.featureIcon}>📖</Text>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureHeading, { color: theme.textPrimary }]}>Hifz Memorization Mode</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Masks upcoming words so you can test your memory and reveals them as you recite.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.primaryBtnText}>Start Recitation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: theme.surfaceBorder, backgroundColor: theme.surface }]}
            onPress={() => router.replace("/(tabs)/reader")}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.textPrimary }]}>Browse Quran</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: "center",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 36,
  },
  emblemRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  arabicCalligraphy: {
    fontSize: 32,
    fontWeight: "700",
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  featuresSection: {
    width: "100%",
    gap: 12,
    marginBottom: 36,
  },
  featureCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  featureTextCol: {
    flex: 1,
  },
  featureHeading: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  ctaSection: {
    width: "100%",
    gap: 12,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
