/**
 * Recitation Session Summary Screen
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useRecitationStore } from "../../src/store/useRecitationStore";

export default function SessionSummaryScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];

  const {
    surahNumber,
    ayahStart,
    currentAyahNumber,
    matchedPositions,
    mistakes,
    resetSession,
  } = useRecitationStore();

  const totalWords = Math.max(matchedPositions.length, 1);
  const mistakesCount = mistakes.length;
  const fluencyScore = Math.max(0, Math.min(100, Math.round(100 - mistakesCount * 5)));

  const handleFinish = () => {
    resetSession();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Celebration Badge */}
        <View style={styles.topBadgeSection}>
          <View style={[styles.trophyCircle, { backgroundColor: theme.primaryGlow, borderColor: theme.gold }]}>
            <Text style={{ fontSize: 36 }}>✨</Text>
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Session Complete!</Text>
          <Text style={[styles.sub, { color: theme.textSecondary }]}>
            May Allah accept your Quran recitation and effort.
          </Text>
        </View>

        {/* Fluency Score Card */}
        <View style={[styles.scoreCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>RECITATION FLUENCY</Text>
          <Text style={[styles.scoreVal, { color: theme.wordMatched }]}>{fluencyScore}%</Text>
          <Text style={[styles.scoreNotice, { color: theme.textMuted }]}>
            Calculated based on word-level sequence alignment & potential omissions/substitutions.
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricBox, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <Text style={[styles.metricVal, { color: theme.gold }]}>Surah {surahNumber}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Ayahs {ayahStart} to {currentAyahNumber}
            </Text>
          </View>

          <View style={[styles.metricBox, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <Text style={[styles.metricVal, { color: theme.textPrimary }]}>{totalWords}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Words Matched</Text>
          </View>

          <View style={[styles.metricBox, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <Text style={[styles.metricVal, { color: mistakesCount > 0 ? theme.wordMistake : theme.wordMatched }]}>
              {mistakesCount}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Check Flags</Text>
          </View>

          <View style={[styles.metricBox, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <Text style={[styles.metricVal, { color: theme.primaryLight }]}>+15 XP</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Hifz Progress</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          {mistakesCount > 0 && (
            <TouchableOpacity
              style={[styles.reviewBtn, { backgroundColor: theme.surface, borderColor: theme.wordMistake }]}
              onPress={() => router.push("/recitation/mistakes")}
            >
              <Text style={[styles.reviewBtnText, { color: theme.wordMistake }]}>
                Review {mistakesCount} Flagged Words 🔍
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={handleFinish}
          >
            <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
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
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: "center",
  },
  topBadgeSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    textAlign: "center",
  },
  scoreCard: {
    width: "100%",
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scoreVal: {
    fontSize: 48,
    fontWeight: "900",
    marginBottom: 6,
  },
  scoreNotice: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
  metricsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 26,
  },
  metricBox: {
    width: "48%",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  metricVal: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
  },
  actionsSection: {
    width: "100%",
    gap: 12,
  },
  reviewBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
