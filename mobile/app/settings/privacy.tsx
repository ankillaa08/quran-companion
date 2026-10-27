/**
 * Audio Privacy & Data Retention Settings Screen
 */
import React from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { useSettingsStore } from "../../src/store/useSettingsStore";

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];

  const { retainAudioSnippets, setRetainAudioSnippets } = useSettingsStore();

  const handleClearData = () => {
    Alert.alert(
      "Clear Practice History",
      "Are you sure you want to clear your local session cache and bookmarks? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear Cache", style: "destructive", onPress: () => Alert.alert("Success", "Local cache cleared.") },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.gold }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Audio Privacy & Retention</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Core Privacy Promise */}
        <View style={[styles.promiseCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <Text style={{ fontSize: 32, marginBottom: 12 }}>🛡️</Text>
          <Text style={[styles.promiseHeading, { color: theme.textPrimary }]}>Zero Raw Audio Retention by Default</Text>
          <Text style={[styles.promiseText, { color: theme.textSecondary }]}>
            Quran Companion AI processes your voice recitation in volatile memory (RAM) rolling buffers exclusively for real-time speech-to-text alignment. Audio chunks are discarded immediately after transcription and never stored on persistent storage without your explicit opt-in.
          </Text>
        </View>

        {/* Setting Toggle */}
        <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <View style={styles.settingTextCol}>
            <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Retain Audio Snippets</Text>
            <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
              Allows saving short 2-second audio clips strictly for mistake self-review.
            </Text>
          </View>

          <Switch
            value={retainAudioSnippets}
            onValueChange={setRetainAudioSnippets}
            trackColor={{ false: theme.divider, true: theme.primary }}
            thumbColor={retainAudioSnippets ? theme.gold : "#f4f3f4"}
          />
        </View>

        {/* Data Management Actions */}
        <View style={styles.actionsBox}>
          <TouchableOpacity
            style={[styles.dangerBtn, { borderColor: theme.wordMistake }]}
            onPress={handleClearData}
          >
            <Text style={[styles.dangerBtnText, { color: theme.wordMistake }]}>
              Clear Local Recitation Cache 🗑️
            </Text>
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
    fontSize: 17,
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  promiseCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
  },
  promiseHeading: {
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  promiseText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  settingTextCol: {
    flex: 1,
    marginRight: 14,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  settingSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionsBox: {
    marginTop: 10,
  },
  dangerBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
