/**
 * Interactive Onboarding Flow Screen
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../src/theme/colors";
import { useSettingsStore } from "../src/store/useSettingsStore";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "🎙️",
    title: "Real-Time AI Recitation",
    desc: "Recite freely. The AI listens continuously, identifies your active Ayah, and highlights words in emerald green with minimal delay.",
  },
  {
    icon: "🔍",
    title: "Memorization Safeguards",
    desc: "Detect potential omissions, repeated phrases, or word substitutions to strengthen your Hifz retention.",
  },
  {
    icon: "🧠",
    title: "Test Your Hifz Mode",
    desc: "Mask upcoming words to test your recall from memory. Words reveal automatically as you recite them correctly.",
  },
  {
    icon: "🛡️",
    title: "Sacred Privacy Guarantee",
    desc: "We never store raw audio by default. Recitation is processed transiently in volatile RAM and immediately discarded.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace("/(tabs)");
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
          <Text style={[styles.skipText, { color: theme.gold }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: theme.surface, borderColor: theme.gold }]}>
          <Text style={{ fontSize: 50 }}>{slide.icon}</Text>
        </View>

        <Text style={[styles.slideTitle, { color: theme.textPrimary }]}>{slide.title}</Text>
        <Text style={[styles.slideDesc, { color: theme.textSecondary }]}>{slide.desc}</Text>

        {/* Indicator dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={`dot-${idx}`}
              style={[
                styles.dot,
                {
                  backgroundColor: currentSlide === idx ? theme.gold : theme.divider,
                  width: currentSlide === idx ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: theme.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>
            {currentSlide === SLIDES.length - 1 ? "Get Started" : "Continue →"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },
  slideDesc: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 36,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  nextBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
