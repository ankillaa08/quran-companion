/**
 * Hifz Memorization Practice Screen (Masked Verse Testing)
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useRecitationStore } from "../../src/store/useRecitationStore";
import { WordHighlighter } from "../../src/components/WordHighlighter";
import { api } from "../../src/services/api";

export default function HifzScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];
  const { initSession } = useRecitationStore();

  const [surahNum, setSurahNum] = useState(112); // Default Surah Al-Ikhlas
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [revealedAyahs, setRevealedAyahs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadSurah(surahNum);
  }, [surahNum]);

  const loadSurah = async (sNum: number) => {
    try {
      const data = await api.getSurahDetails(sNum);
      if (data && data.ayahs) {
        setAyahs(data.ayahs);
        setRevealedAyahs({});
      }
    } catch {
      // Fallback
    }
  };

  const toggleReveal = (ayahNum: number) => {
    setRevealedAyahs((prev) => ({
      ...prev,
      [ayahNum]: !prev[ayahNum],
    }));
  };

  const startHifzRecitation = () => {
    initSession(surahNum, 1, ayahs.length, "memorize");
    router.push("/(tabs)/recite");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Hifz Memorization Mode</Text>
          <Text style={[styles.sub, { color: theme.textSecondary }]}>Test your recitation from memory</Text>
        </View>

        <TouchableOpacity
          style={[styles.testVoiceBtn, { backgroundColor: theme.gold }]}
          onPress={startHifzRecitation}
        >
          <Text style={styles.testVoiceText}>Test With AI 🎙️</Text>
        </TouchableOpacity>
      </View>

      {/* Surah Selector Pills */}
      <View style={styles.surahPillsRow}>
        {[
          { num: 1, name: "Al-Fatihah" },
          { num: 112, name: "Al-Ikhlas" },
          { num: 113, name: "Al-Falaq" },
          { num: 114, name: "An-Nas" },
          { num: 108, name: "Al-Kawthar" },
        ].map((s) => (
          <TouchableOpacity
            key={`pill-${s.num}`}
            onPress={() => setSurahNum(s.num)}
            style={[
              styles.surahPill,
              {
                backgroundColor: surahNum === s.num ? theme.primary : theme.surface,
                borderColor: surahNum === s.num ? theme.primaryLight : theme.surfaceBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.surahPillText,
                { color: surahNum === s.num ? "#FFFFFF" : theme.textSecondary },
              ]}
            >
              {s.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.guideBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.surfaceBorder }]}>
          <Text style={[styles.guideTitle, { color: theme.gold }]}>How Hifz Mode Works</Text>
          <Text style={[styles.guideText, { color: theme.textSecondary }]}>
            Upcoming words are blurred. Recite aloud, and the AI will verify each word before illuminating it, or tap the eye icon to reveal the expected ayah.
          </Text>
        </View>

        {ayahs.map((ayah) => {
          const isRevealed = !!revealedAyahs[ayah.ayah];
          return (
            <View
              key={`hifz-ayah-${ayah.ayah}`}
              style={[styles.ayahCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
            >
              <View style={styles.ayahTopRow}>
                <View style={[styles.badge, { backgroundColor: theme.primaryGlow }]}>
                  <Text style={[styles.badgeText, { color: theme.gold }]}>{ayah.ayah}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.revealBtn, { borderColor: theme.surfaceBorder }]}
                  onPress={() => toggleReveal(ayah.ayah)}
                >
                  <Text style={[styles.revealBtnText, { color: theme.gold }]}>
                    {isRevealed ? "Hide Verse 🙈" : "Reveal Verse 👁️"}
                  </Text>
                </TouchableOpacity>
              </View>

              <WordHighlighter
                words={ayah.words || []}
                currentWordIndex={0}
                isHifzMode={!isRevealed}
              />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  sub: {
    fontSize: 12,
    marginTop: 2,
  },
  testVoiceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  testVoiceText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#081510",
  },
  surahPillsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  surahPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  surahPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 40,
    gap: 12,
  },
  guideBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  guideText: {
    fontSize: 12,
    lineHeight: 17,
  },
  ayahCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  ayahTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  revealBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  revealBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
