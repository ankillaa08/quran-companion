/**
 * Dedicated Recitation Session History Screen
 */
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { api } from "../../src/services/api";

export default function RecitationHistoryScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch {
      // Fallback sample sessions
      setSessions([
        { id: "1", surah_number: 1, ayah_start: 1, ayah_end: 7, duration_seconds: 45, fluency_score: 95.0, total_mistakes: 1, created_at: new Date().toISOString() },
        { id: "2", surah_number: 112, ayah_start: 1, ayah_end: 4, duration_seconds: 28, fluency_score: 100.0, total_mistakes: 0, created_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.gold }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Recitation History</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSessions} tintColor={theme.gold} />}
        renderItem={({ item }) => (
          <View style={[styles.sessionCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.surahTitle, { color: theme.textPrimary }]}>
                  Surah {item.surah_number}
                </Text>
                <Text style={[styles.ayahRange, { color: theme.textSecondary }]}>
                  Ayahs {item.ayah_start} to {item.ayah_end} • {item.duration_seconds}s
                </Text>
              </View>

              <View style={[styles.fluencyBadge, { backgroundColor: theme.primaryGlow }]}>
                <Text style={[styles.fluencyText, { color: theme.wordMatched }]}>
                  {item.fluency_score}%
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={[styles.mistakesText, { color: item.total_mistakes > 0 ? theme.wordMistake : theme.wordMatched }]}>
                {item.total_mistakes === 0 ? "Flawless Recitation ✨" : `${item.total_mistakes} flagged difference(s)`}
              </Text>
              <Text style={[styles.dateText, { color: theme.textMuted }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      />
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
  listContent: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  sessionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  surahTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  ayahRange: {
    fontSize: 12,
  },
  fluencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fluencyText: {
    fontSize: 13,
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 10,
  },
  mistakesText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 11,
  },
});
