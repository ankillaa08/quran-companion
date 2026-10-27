/**
 * Potential Mistake Review Screen
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useRecitationStore } from "../../src/store/useRecitationStore";
import { MistakeCard } from "../../src/components/MistakeCard";

export default function MistakesReviewScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];

  const { mistakes } = useRecitationStore();
  const [activeMistakes, setActiveMistakes] = useState(
    mistakes.length > 0
      ? mistakes
      : [
          {
            surah_number: 1,
            ayah_number: 2,
            position: 3,
            mistake_type: "omission" as const,
            expected_word: "رب",
            expected_word_uthmani: "رَبِّ",
            confidence: 0.85,
          },
        ]
  );

  const dismissMistake = (idx: number) => {
    setActiveMistakes((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.gold }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Mistake Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Important Disclaimer Notice */}
        <View style={[styles.disclaimerBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.surfaceBorder }]}>
          <Text style={[styles.disclaimerTitle, { color: theme.gold }]}>⚠️ Memorization Check vs Tajweed</Text>
          <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
            Flags indicate potential omitted, repeated, or substituted words to help your Hifz retention. Accurate Tajweed, makharij (articulation), and vowel nuances require validated acoustic models and are not certified here.
          </Text>
        </View>

        {activeMistakes.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <Text style={{ fontSize: 32, marginBottom: 10 }}>🎉</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Pending Flags</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              All recitation differences have been reviewed or dismissed.
            </Text>
          </View>
        ) : (
          activeMistakes.map((m, idx) => (
            <MistakeCard
              key={`mistake-${idx}`}
              mistake={m}
              onDismiss={() => dismissMistake(idx)}
              onConfirm={() => {
                alert(`Practicing: ${m.expected_word_uthmani || m.expected_word}`);
                dismissMistake(idx);
              }}
            />
          ))
        )}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    paddingBottom: 40,
  },
  disclaimerBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 17,
  },
  emptyCard: {
    padding: 30,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: "center",
  },
});
