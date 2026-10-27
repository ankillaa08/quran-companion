/**
 * Home Dashboard Screen
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useRecitationStore } from "../../src/store/useRecitationStore";
import { api } from "../../src/services/api";

export default function HomeScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];
  const initSession = useRecitationStore((s) => s.initSession);

  const [stats, setStats] = useState<any>({
    total_practice_minutes: 18.5,
    current_streak_days: 3,
    average_fluency_score: 96.2,
    total_sessions: 5,
  });
  const [revisions, setRevisions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [prog, rev] = await Promise.all([
        api.getProgress().catch(() => null),
        api.getRevisionPlan().catch(() => null),
      ]);
      if (prog) setStats(prog);
      if (rev && rev.scheduled_revisions) setRevisions(rev.scheduled_revisions);
    } catch {
      // Use fallback defaults
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const startRecitingSurah = (surahNum: number) => {
    initSession(surahNum, 1, 7, "recite");
    router.push("/(tabs)/recite");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.gold} />}
      >
        {/* Header Greeting */}
        <View style={styles.topHeader}>
          <View>
            <Text style={[styles.salamText, { color: theme.gold }]}>السَّلَامُ عَلَيْكُمْ</Text>
            <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>Welcome Back</Text>
          </View>
          <TouchableOpacity
            style={[styles.statusIconBtn, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
            onPress={() => router.push("/settings/status")}
          >
            <Text style={{ fontSize: 18 }}>⚡</Text>
          </TouchableOpacity>
        </View>

        {/* Streak & Weekly Progress Banner */}
        <View style={[styles.streakBanner, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <View style={styles.streakCol}>
            <Text style={styles.flameIcon}>🔥</Text>
            <View>
              <Text style={[styles.streakNumber, { color: theme.gold }]}>
                {stats.current_streak_days} Days
              </Text>
              <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Practice Streak</Text>
            </View>
          </View>
          <View style={[styles.verticalDivider, { backgroundColor: theme.divider }]} />
          <View style={styles.streakCol}>
            <Text style={styles.flameIcon}>⏱️</Text>
            <View>
              <Text style={[styles.streakNumber, { color: theme.wordMatched }]}>
                {stats.total_practice_minutes}m
              </Text>
              <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Recited Time</Text>
            </View>
          </View>
          <View style={[styles.verticalDivider, { backgroundColor: theme.divider }]} />
          <View style={styles.streakCol}>
            <Text style={styles.flameIcon}>🎯</Text>
            <View>
              <Text style={[styles.streakNumber, { color: theme.primaryLight }]}>
                {stats.average_fluency_score}%
              </Text>
              <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Fluency</Text>
            </View>
          </View>
        </View>

        {/* Quick Start Recitation Card */}
        <View style={[styles.quickStartCard, { backgroundColor: theme.primary }]}>
          <View style={styles.quickStartLeft}>
            <Text style={styles.quickStartSurah}>Surah Al-Fatihah</Text>
            <Text style={styles.quickStartSub}>7 Ayahs • Ready for AI Listening</Text>
            <TouchableOpacity
              style={[styles.startListeningBtn, { backgroundColor: theme.gold }]}
              onPress={() => startRecitingSurah(1)}
            >
              <Text style={styles.startListeningText}>Start Reciting 🎙️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.calligraphyBg}>الفاتحة</Text>
        </View>

        {/* Spaced Repetition Due Today */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's Revision Targets</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/progress")}>
            <Text style={[styles.viewAllText, { color: theme.gold }]}>View Plan →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.revisionList}>
          {(revisions.length > 0 ? revisions.slice(0, 2) : [
            { surah_number: 1, surah_name_en: "Al-Fatihah", surah_name_ar: "الفاتحة", target_ayah_range: "1 - 7" },
            { surah_number: 112, surah_name_en: "Al-Ikhlas", surah_name_ar: "الإخلاص", target_ayah_range: "1 - 4" },
          ]).map((item, idx) => (
            <TouchableOpacity
              key={`rev-${idx}`}
              style={[styles.revisionCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
              onPress={() => startRecitingSurah(item.surah_number)}
            >
              <View style={[styles.surahNumBadge, { backgroundColor: theme.primaryGlow }]}>
                <Text style={[styles.surahNumText, { color: theme.gold }]}>{item.surah_number}</Text>
              </View>
              <View style={styles.revisionTextCol}>
                <Text style={[styles.revSurahName, { color: theme.textPrimary }]}>{item.surah_name_en}</Text>
                <Text style={[styles.revAyahRange, { color: theme.textSecondary }]}>Ayahs {item.target_ayah_range}</Text>
              </View>
              <Text style={[styles.revArabicName, { color: theme.textArabic }]}>{item.surah_name_ar}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Tools Row */}
        <View style={styles.toolsRow}>
          <TouchableOpacity
            style={[styles.toolCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
            onPress={() => router.push("/(tabs)/hifz")}
          >
            <Text style={styles.toolIcon}>🧠</Text>
            <Text style={[styles.toolTitle, { color: theme.textPrimary }]}>Hifz Test</Text>
            <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>Recite with hidden words</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
            onPress={() => router.push("/(tabs)/reader")}
          >
            <Text style={styles.toolIcon}>📖</Text>
            <Text style={[styles.toolTitle, { color: theme.textPrimary }]}>Read Quran</Text>
            <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>Browse all 114 Surahs</Text>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  salamText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  statusIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  streakBanner: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  streakCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flameIcon: {
    fontSize: 20,
  },
  streakNumber: {
    fontSize: 15,
    fontWeight: "700",
  },
  streakLabel: {
    fontSize: 11,
  },
  verticalDivider: {
    width: 1,
    height: 32,
  },
  quickStartCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    marginBottom: 24,
  },
  quickStartLeft: {
    flex: 1,
    zIndex: 2,
  },
  quickStartSurah: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  quickStartSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
  },
  startListeningBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  startListeningText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#081510",
  },
  calligraphyBg: {
    fontSize: 60,
    color: "rgba(255, 255, 255, 0.12)",
    fontWeight: "800",
    position: "absolute",
    right: 10,
    bottom: -10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  revisionList: {
    gap: 10,
    marginBottom: 24,
  },
  revisionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  surahNumBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  surahNumText: {
    fontSize: 14,
    fontWeight: "700",
  },
  revisionTextCol: {
    flex: 1,
  },
  revSurahName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  revAyahRange: {
    fontSize: 12,
  },
  revArabicName: {
    fontSize: 20,
    fontWeight: "700",
  },
  toolsRow: {
    flexDirection: "row",
    gap: 12,
  },
  toolCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  toolDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
});
